import io
import pytest

def test_rbac_case_creation(client):
    # 1. Case Creation: Senior Officer (Allowed 201)
    payload_so = {
        "case_number": "CASE-2026-9001",
        "title": "Senior Officer Authorized Investigation",
        "description": "Valid case creation by Senior Officer",
        "department": "Special Investigations",
        "incident_date": "2026-03-01",
        "priority": "HIGH",
        "classification": "SECRET",
        "lead_investigator": "Cmdr. Robert Vance"
    }
    res_so = client.post("/api/cases", json=payload_so, headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"})
    assert res_so.status_code == 201

    # 2. Case Creation: Admin (Allowed 201)
    payload_admin = {
        "case_number": "CASE-2026-9002",
        "title": "Admin Created Case Passport",
        "description": "Valid case creation by Admin",
        "department": "Information Security",
        "incident_date": "2026-03-02",
        "priority": "CRITICAL",
        "classification": "TOP_SECRET",
        "lead_investigator": "Elena Rostova"
    }
    res_admin = client.post("/api/cases", json=payload_admin, headers={"X-User-Role": "Admin", "X-User-Id": "usr-007"})
    assert res_admin.status_code == 201

    # 3. Case Creation: Investigating Officer (Allowed 201)
    payload_io = {
        "case_number": "CASE-2026-9003",
        "title": "Investigating Officer Incident Intake",
        "description": "Investigating Officer authorized case creation",
        "incident_date": "2026-03-03",
        "priority": "MEDIUM",
        "classification": "CONFIDENTIAL",
        "department": "Financial Crimes",
        "lead_investigator": "Insp. Sarah Jenkins"
    }
    res_io = client.post("/api/cases", json=payload_io, headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_io.status_code == 201

    # 4. Case Creation: Forensic Officer (Denied 403)
    payload_fo = {
        "case_number": "CASE-2026-9004",
        "title": "Unauthorized Case Creation Attempt",
        "description": "Forensic Officer attempted case creation",
        "incident_date": "2026-03-04",
        "priority": "LOW",
        "classification": "RESTRICTED",
        "department": "Digital Forensics Lab",
        "lead_investigator": "Dr. Alex Mercer"
    }
    res_fo = client.post("/api/cases", json=payload_fo, headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"})
    assert res_fo.status_code == 403

    # 5. Case Creation: Court User (Denied 403)
    res_court = client.post("/api/cases", json=payload_fo, headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_court.status_code == 403


def test_rbac_case_viewing(client):
    # 1. Investigating Officer accessing assigned case CASE-2026-8942 (Allowed 200)
    res_assigned = client.get("/api/cases/CASE-2026-8942", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_assigned.status_code == 200
    assert res_assigned.json()["case_id"] == "CASE-2026-8942"

    # 2. Investigating Officer accessing unassigned case CASE-2026-4410 (Denied 403)
    res_unassigned_io = client.get("/api/cases/CASE-2026-4410", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_unassigned_io.status_code == 403
    assert "not assigned" in res_unassigned_io.json()["detail"].lower()

    # 3. Court User accessing unassigned case CASE-2026-1105 (Denied 403)
    res_unassigned_court = client.get("/api/cases/CASE-2026-1105", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_unassigned_court.status_code == 403

    # 4. Senior Officer cross-department viewing case (Allowed 200)
    res_so = client.get("/api/cases/CASE-2026-1105", headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"})
    assert res_so.status_code == 200


def test_rbac_document_upload(client):
    file_bytes = b"Authoritative sample evidence file content."

    # 1. Investigating Officer uploading to assigned case CASE-2026-8942 (Allowed 201)
    res_upload_io = client.post(
        "/api/cases/CASE-2026-8942/documents/upload",
        files={"file": ("investigation_notes.pdf", io.BytesIO(file_bytes), "application/pdf")},
        data={"category": "INVESTIGATION_REPORT", "sensitivity": "CONFIDENTIAL", "purpose": "CASE_FILING"},
        headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"}
    )
    assert res_upload_io.status_code == 201

    # 2. Court User uploading document (Denied 403)
    res_upload_court = client.post(
        "/api/cases/CASE-2026-8942/documents/upload",
        files={"file": ("unauthorized_court_upload.pdf", io.BytesIO(file_bytes), "application/pdf")},
        data={"category": "COURT_FILING", "sensitivity": "PUBLIC", "purpose": "SUBMISSION"},
        headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    )
    assert res_upload_court.status_code == 403
    assert "not authorized to upload documents" in res_upload_court.json()["detail"]

    # 3. Auditor / Security uploading document (Denied 403 - Read-only oversight)
    res_upload_auditor = client.post(
        "/api/cases/CASE-2026-8942/documents/upload",
        files={"file": ("auditor_memo.pdf", io.BytesIO(file_bytes), "application/pdf")},
        data={"category": "INVESTIGATION_REPORT", "sensitivity": "INTERNAL", "purpose": "AUDIT"},
        headers={"X-User-Role": "Auditor / Security", "X-User-Id": "usr-006"}
    )
    assert res_upload_auditor.status_code == 403
    assert "not authorized to upload documents" in res_upload_auditor.json()["detail"]

    # 4. Investigating Officer uploading to UNASSIGNED case CASE-2026-4410 (Denied 403)
    res_upload_unassigned = client.post(
        "/api/cases/CASE-2026-4410/documents/upload",
        files={"file": ("unassigned_upload.pdf", io.BytesIO(file_bytes), "application/pdf")},
        data={"category": "INVESTIGATION_REPORT", "sensitivity": "CONFIDENTIAL", "purpose": "CASE_FILING"},
        headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"}
    )
    assert res_upload_unassigned.status_code == 403


def test_rbac_evidence_and_document_access(client):
    # Seed documents in CASE-2026-8942:
    # doc-101: PUBLIC (FIR)
    # doc-102: CONFIDENTIAL (Financial Audit)
    # doc-103: FORENSIC (Memory Dump)

    # 1. Court User accessing PUBLIC document doc-101 (Allowed 200)
    res_public = client.get("/api/documents/doc-101?purpose=JUDICIAL_REVIEW", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_public.status_code == 200

    # 2. Court User accessing CONFIDENTIAL document doc-102 (Denied 403)
    res_confidential = client.get("/api/documents/doc-102?purpose=JUDICIAL_REVIEW", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_confidential.status_code == 403
    assert "not authorized to access 'CONFIDENTIAL'" in res_confidential.json()["detail"]

    # 3. Court User accessing FORENSIC document doc-103 (Denied 403)
    res_forensic = client.get("/api/documents/doc-103?purpose=JUDICIAL_REVIEW", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_forensic.status_code == 403


def test_rbac_evidence_verification(client):
    # 1. Forensic Officer verifying FORENSIC artifact doc-103 (Allowed 200)
    res_fo = client.post("/api/documents/doc-103/verify", headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"})
    assert res_fo.status_code == 200
    assert res_fo.json()["verification_result"] in ["INTEGRITY VERIFIED", "INTEGRITY MISMATCH"]

    # 2. Court User attempting to verify FORENSIC artifact doc-103 (Denied 403)
    res_court_fo = client.post("/api/documents/doc-103/verify", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_court_fo.status_code == 403
    assert "Clearance Denied" in res_court_fo.json()["detail"]

    # 3. Court User verifying PUBLIC document doc-101 (Allowed 200)
    res_court_pub = client.post("/api/documents/doc-101/verify", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_court_pub.status_code == 200


def test_rbac_audit_stream_access(client):
    # 1. Global audit stream: Auditor / Security (Allowed 200)
    res_audit_auditor = client.get("/api/audit", headers={"X-User-Role": "Auditor / Security", "X-User-Id": "usr-006"})
    assert res_audit_auditor.status_code == 200

    # 2. Global audit stream: Senior Officer (Allowed 200)
    res_audit_so = client.get("/api/audit", headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"})
    assert res_audit_so.status_code == 200

    # 3. Global audit stream: Investigating Officer (Denied 403)
    res_audit_io = client.get("/api/audit", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_audit_io.status_code == 403
    assert "Role not authorized to access global audit stream" in res_audit_io.json()["detail"]

    # 4. Global audit stream: Court User (Denied 403)
    res_audit_court = client.get("/api/audit", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_audit_court.status_code == 403

    # 5. Case-level audit stream: Investigating Officer on assigned case (Allowed 200)
    res_case_audit = client.get("/api/cases/CASE-2026-8942/audit", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_case_audit.status_code == 200

    # 6. Case-level audit stream: Investigating Officer on UNASSIGNED case (Denied 403)
    res_unassigned_audit = client.get("/api/cases/CASE-2026-4410/audit", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_unassigned_audit.status_code == 403


def test_rbac_administrative_operations(client):
    # 1. Investigating Officer attempting to delete a document (Denied 403)
    res_del_io = client.delete("/api/documents/doc-101", headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"})
    assert res_del_io.status_code == 403
    assert "Only Senior Officers and Admins are authorized to delete" in res_del_io.json()["detail"]

    # 2. Court User attempting to delete a document (Denied 403)
    res_del_court = client.delete("/api/documents/doc-101", headers={"X-User-Role": "Court User", "X-User-Id": "usr-005"})
    assert res_del_court.status_code == 403

    # 3. Investigating Officer attempting to update UNASSIGNED case properties (Denied 403)
    res_upd_io = client.put(
        "/api/cases/CASE-2026-4410",
        json={"title": "Unauthorized Title Tamper Attempt"},
        headers={"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"}
    )
    assert res_upd_io.status_code == 403
    assert "not authorized to edit case" in res_upd_io.json()["detail"]

    # 4. Forensic Officer attempting to update case properties (Denied 403)
    res_upd_fo = client.put(
        "/api/cases/CASE-2026-8942",
        json={"title": "Unauthorized Forensic Title Tamper Attempt"},
        headers={"X-User-Role": "Forensic Officer", "X-User-Id": "usr-003"}
    )
    assert res_upd_fo.status_code == 403

    # 5. Senior Officer updating case properties (Allowed 200)
    res_upd_so = client.put(
        "/api/cases/CASE-2026-8942",
        json={"title": "Operation DarkLedge: Authoritative Financial Investigation"},
        headers={"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    )
    assert res_upd_so.status_code == 200
    assert res_upd_so.json()["title"] == "Operation DarkLedge: Authoritative Financial Investigation"
