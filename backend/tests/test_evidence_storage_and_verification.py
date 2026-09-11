import io
import hashlib
import pytest
from unittest.mock import patch, MagicMock
from backend.app.services.storage_service import storage_service

def test_evidence_upload_metadata_and_pending_verification(client):
    """Scenario 1 & 6: Uploaded evidence receives PENDING_VERIFICATION and all required metadata."""
    payload = b"SEIZED_DIGITAL_MEDIA_HARD_DRIVE_SECTOR_0"
    computed_hash = hashlib.sha256(payload).hexdigest()

    with patch.object(storage_service, "upload_object", return_value=True):
        res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("seized_media.raw", io.BytesIO(payload), "application/octet-stream")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert res.status_code == 201
        data = res.json()

        assert data["name"] == "seized_media.raw"
        assert data["sha256_hash"] == computed_hash
        assert data["file_size"] == len(payload)
        assert data["verification_status"] == "PENDING_VERIFICATION"
        assert data["uploader_id"] == "usr-002"
        assert data["uploader_role"] == "Investigating Officer"
        assert len(data["chain_of_custody"]) >= 1
        assert data["chain_of_custody"][0]["event"] == "EVIDENCE_UPLOADED"

def test_senior_officer_approval_and_hash_lock(client):
    """Scenario 7 & 12: Senior Investigating Officer approves evidence with justification and locks hash."""
    payload = b"CRITICAL_FORENSIC_MEMORY_DUMP_E01"
    computed_hash = hashlib.sha256(payload).hexdigest()

    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("memory_dump.e01", io.BytesIO(payload), "application/octet-stream")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    # Senior Officer (different officer from uploader) approves
    review_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
        json={"decision": "VERIFIED", "justification": "Primary seizure verified by senior supervisory review."}
    )
    assert review_res.status_code == 200
    rev_data = review_res.json()
    assert rev_data["verification_status"] == "VERIFIED"
    assert rev_data["verified_by"] in ["Cmdr. Robert Vance", "Vikramaditya Rao"]
    assert rev_data["approved_hash"] == computed_hash
    assert rev_data["approved_version"] == 1
    assert rev_data["justification"] == "Primary seizure verified by senior supervisory review."

    # Inspect document to verify status and custody
    get_res = client.get(
        f"/api/documents/{doc_id}?action=VIEW&purpose=INVESTIGATION",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert get_res.status_code == 200
    doc_data = get_res.json()
    assert doc_data["verification_status"] == "VERIFIED"
    custody_events = [c["event"] for c in doc_data["chain_of_custody"]]
    assert "EVIDENCE_VERIFIED" in custody_events

def test_admin_approval(client):
    """Scenario 8: System Administrator can approve evidence."""
    payload = b"ADMIN_VERIFIED_EXHIBIT"
    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("admin_exhibit.pdf", io.BytesIO(payload), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    review_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Admin", "X-User-Id": "usr-007"},
        json={"decision": "VERIFIED", "justification": "Administrative forensic compliance validation passed."}
    )
    assert review_res.status_code == 200
    assert review_res.json()["verification_status"] == "VERIFIED"

def test_uploader_cannot_approve_own_evidence(client):
    """Scenario 9: Strict separation of duties - an officer cannot approve their own submission."""
    payload = b"INVESTIGATOR_SELF_EVIDENCE"
    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
            files={"file": ("self_evidence.pdf", io.BytesIO(payload), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    # The Senior Officer who uploaded it attempts to approve it
    review_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
        json={"decision": "VERIFIED", "justification": "Self verification attempt"}
    )
    assert review_res.status_code == 403
    assert "Separation of duties violation" in review_res.json()["detail"]

def test_unauthorized_role_cannot_approve(client):
    """Scenario 10: Roles like Investigating Officer or Court User cannot review/approve."""
    payload = b"UNAUTHORIZED_APPROVAL_CHECK"
    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
            files={"file": ("role_check.pdf", io.BytesIO(payload), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    # Investigating Officer attempt
    io_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
        json={"decision": "VERIFIED", "justification": "IO approval attempt"}
    )
    assert io_res.status_code == 403
    assert "not authorized to review or approve evidence" in io_res.json()["detail"]

    # Court User attempt
    court_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"},
        json={"decision": "VERIFIED", "justification": "Court user approval attempt"}
    )
    assert court_res.status_code == 403

def test_rejection_requires_reason(client):
    """Scenario 11: Rejecting evidence requires a justification or reason."""
    payload = b"REJECTION_TEST_PAYLOAD"
    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("reject_test.pdf", io.BytesIO(payload), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    # Reject without reason
    no_reason_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
        json={"decision": "REJECTED", "rejection_reason": ""}
    )
    assert no_reason_res.status_code == 400
    assert "Rejection reason is required" in no_reason_res.json()["detail"]

    # Reject with valid reason
    reject_res = client.post(
        f"/api/documents/{doc_id}/review",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
        json={"decision": "REJECTED", "rejection_reason": "Seizure memo missing required panchnama witnesses."}
    )
    assert reject_res.status_code == 200
    assert reject_res.json()["verification_status"] == "REJECTED"
    assert reject_res.json()["rejection_reason"] == "Seizure memo missing required panchnama witnesses."

def test_versioning_resets_verification_status(client):
    """Scenario 13: A new version resets an approved document to PENDING_VERIFICATION."""
    v1_payload = b"ORIGINAL_EVIDENCE_V1"
    v2_payload = b"UPDATED_EVIDENCE_V2_ENHANCED"

    with patch.object(storage_service, "upload_object", return_value=True):
        # 1. Upload v1
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("cctv_footage.mp4", io.BytesIO(v1_payload), "video/mp4")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

        # 2. Senior Officer approves v1
        review_res = client.post(
            f"/api/documents/{doc_id}/review",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
            json={"decision": "VERIFIED", "justification": "Approved original CCTV ingestion."}
        )
        assert review_res.status_code == 200
        assert review_res.json()["verification_status"] == "VERIFIED"

        # 3. New version uploaded (v2)
        v2_res = client.post(
            f"/api/documents/{doc_id}/versions",
            headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"},
            files={"file": ("cctv_footage_enhanced.mp4", io.BytesIO(v2_payload), "video/mp4")},
            data={"change_reason": "Brightness and contrast enhancement applied"}
        )
        assert v2_res.status_code == 201
        v2_data = v2_res.json()

        # Previous approval must NOT remain valid for v2!
        assert v2_data["version"] == 2
        assert v2_data["verification_status"] == "PENDING_VERIFICATION"
        assert v2_data["approved_hash"] is None
        assert v2_data["approved_version"] is None

def test_hash_mismatch_detection_without_silent_overwrite(client):
    """Scenario 4 & 5: When storage binary does not match authoritative hash, flag mismatch without overwriting."""
    original_payload = b"GENUINE_EVIDENCE_BINARY"
    original_hash = hashlib.sha256(original_payload).hexdigest()
    tampered_payload = b"TAMPERED_MODIFIED_BINARY"

    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"},
            files={"file": ("ledger_export.csv", io.BytesIO(original_payload), "text/csv")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    # When verified, storage returns tampered bytes
    with patch.object(storage_service, "object_exists", return_value=True), \
         patch.object(storage_service, "download_object", return_value=tampered_payload):
        v_res = client.post(
            f"/api/documents/{doc_id}/verify",
            headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"}
        )
        assert v_res.status_code == 200
        v_data = v_res.json()
        assert v_data["match"] is False
        assert v_data["status"] == "TAMPERED"
        assert v_data["verification_result"] == "INTEGRITY MISMATCH"
        assert v_data["stored_hash"] == original_hash  # Stored hash must NOT be overwritten!

    # Verify document in DB retains the original registered hash and is marked TAMPERED
    doc_res = client.get(
        f"/api/documents/{doc_id}?action=VIEW&purpose=INVESTIGATION",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert doc_res.status_code == 200
    doc_state = doc_res.json()
    assert doc_state["sha256_hash"] == original_hash
    assert doc_state["integrity_status"] == "TAMPERED"
    custody_events = [c["event"] for c in doc_state["chain_of_custody"]]
    assert "INTEGRITY_MISMATCH_DETECTED" in custody_events

def test_chain_of_custody_endpoint(client):
    """Scenario 15: Retrieve chronological chain of custody for evidence."""
    payload = b"CHAIN_OF_CUSTODY_TEST_DATA"
    with patch.object(storage_service, "upload_object", return_value=True):
        up_res = client.post(
            "/api/cases/CASE-2026-8942/documents/upload",
            headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"},
            files={"file": ("custody_doc.pdf", io.BytesIO(payload), "application/pdf")},
            data={"category": "EVIDENCE", "sensitivity": "CONFIDENTIAL", "purpose": "INVESTIGATION"}
        )
        assert up_res.status_code == 201
        doc_id = up_res.json()["id"]

    custody_res = client.get(
        f"/api/documents/{doc_id}/custody",
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert custody_res.status_code == 200
    custody = custody_res.json()
    assert len(custody) >= 1
    assert custody[0]["event"] == "EVIDENCE_UPLOADED"
    assert custody[0]["actor"] in ["Insp. Sarah Jenkins", "Rajesh Kumar"]

def test_admin_storage_diagnostic_endpoint(client):
    """Scenario 14 & Part I: Admin can test storage connection safely without leaking secrets."""
    res = client.post(
        "/api/admin/storage/test",
        headers={"X-User-Role": "Admin", "X-User-Id": "usr-007"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["Connected", "Fallback"]
    assert data["provider"] in ["MinIO", "Local Fallback"]
    assert "bucket" in data
    assert "connection" in data["message"]
    # Ensure no secrets or endpoints are exposed
    assert "STORAGE_SECRET_KEY" not in str(data)
    assert "minioadmin" not in str(data)
