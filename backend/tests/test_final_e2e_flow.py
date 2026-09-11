import hashlib
import io
import pytest

def test_complete_15_step_e2e_scenario(client):
    # Step 1: User enters CaseTrace (Health & System Readiness)
    health_res = client.get("/api/health")
    assert health_res.status_code == 200
    assert health_res.json()["status"] == "ok"

    # Step 2: User selects/uses an appropriate demo role
    senior_officer_headers = {
        "X-User-Role": "Senior Officer",
        "X-User-Id": "usr-001"
    }

    # Step 3: User views dashboard (real stats & activity)
    stats_res = client.get("/api/dashboard/stats", headers=senior_officer_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert "active_cases" in stats
    assert "total_evidence_items" in stats
    assert "critical_cases" in stats
    assert "pending_verification" in stats
    initial_cases = stats["active_cases"]

    activity_res = client.get("/api/dashboard/activity", headers=senior_officer_headers)
    assert activity_res.status_code == 200
    assert isinstance(activity_res.json(), list)

    # Step 4: User creates a new case
    case_payload = {
        "case_number": "CASE-2026-7788",
        "title": "Operation Sovereign Shield Interception",
        "description": "Critical infrastructure cyber intrusion and unauthorized exfiltration attempts.",
        "department": "Cyber Warfare & Infrastructure Protection",
        "incident_date": "2026-06-15",
        "priority": "CRITICAL",
        "classification": "CONFIDENTIAL",
        "lead_investigator": "Cmdr. Robert Vance"
    }
    create_case_res = client.post("/api/cases", json=case_payload, headers=senior_officer_headers)
    assert create_case_res.status_code == 201
    created_case = create_case_res.json()
    case_id = created_case["case_id"]
    assert created_case["case_number"] == "CASE-2026-7788"
    assert created_case["blockchain_anchor_id"].startswith("0x")

    # Step 5 & 6: User registers evidence & uploads a document payload
    raw_payload_bytes = b"CONFIDENTIAL_TELEMETRY_LOG_PAYLOAD_EVIDENCE_SAMPLE_BYTES_2026"
    expected_sha256 = hashlib.sha256(raw_payload_bytes).hexdigest()

    file_obj = io.BytesIO(raw_payload_bytes)
    files = {"file": ("intrusion_telemetry_dump.log", file_obj, "text/plain")}
    data = {
        "category": "EVIDENCE",
        "sensitivity": "CONFIDENTIAL",
        "purpose": "FORENSIC_ANALYSIS",
        "evidence_id": "EV-7788-001"
    }

    upload_res = client.post(
        f"/api/cases/{case_id}/documents/upload",
        files=files,
        data=data,
        headers=senior_officer_headers
    )
    assert upload_res.status_code == 201
    uploaded_doc = upload_res.json()
    document_id = uploaded_doc["id"]
    assert uploaded_doc["case_id"] == case_id
    assert uploaded_doc["name"] == "intrusion_telemetry_dump.log"

    # Step 7: System generates & records SHA-256 integrity information
    assert uploaded_doc["sha256_hash"].lower() == expected_sha256.lower()
    assert uploaded_doc["blockchain_record_id"].startswith("blk-")

    # Step 8: Evidence appears in the Case Passport
    case_docs_res = client.get(f"/api/cases/{case_id}/documents", headers=senior_officer_headers)
    assert case_docs_res.status_code == 200
    docs_list = case_docs_res.json()
    assert any(d["id"] == document_id for d in docs_list)

    # Step 9 & 10: User verifies the document & verification result is displayed
    verify_res = client.post(
        f"/api/documents/{document_id}/verify",
        headers=senior_officer_headers
    )
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["match"] is True
    assert verify_data["status"] == "VERIFIED"
    assert verify_data["verification_result"] == "INTEGRITY VERIFIED"
    assert verify_data["stored_hash"].lower() == expected_sha256.lower()
    assert verify_data["computed_hash"].lower() == expected_sha256.lower()

    # Step 11: Chain of custody records the events chronologically
    custody_res = client.get(f"/api/cases/{case_id}/audit", headers=senior_officer_headers)
    assert custody_res.status_code == 200
    custody_events = custody_res.json()
    actions = [e["action"] for e in custody_events]
    assert "CASE_CREATED" in actions
    assert "DOCUMENT_UPLOAD" in actions
    assert "INTEGRITY_VERIFICATION" in actions

    # Step 12: Audit log records the action immutably
    audit_res = client.get("/api/audit", headers=senior_officer_headers)
    assert audit_res.status_code == 200
    all_audit_logs = audit_res.json()
    recent_doc_events = [
        l for l in all_audit_logs
        if l.get("document_id") == document_id or l.get("case_id") == case_id
    ]
    assert len(recent_doc_events) >= 3

    # Step 13: Relevant notification appears with deep link
    notif_res = client.get("/api/notifications", headers=senior_officer_headers)
    assert notif_res.status_code == 200
    notif_data = notif_res.json()
    assert "notifications" in notif_data
    notifications = notif_data["notifications"]
    assert len(notifications) > 0
    assert all("target_url" in n and n["target_url"].startswith("/dashboard") for n in notifications)

    # Step 14: Global search finds case, document, evidence ID, and SHA-256 hash
    # By case number
    search_case = client.get("/api/search?q=CASE-2026-7788", headers=senior_officer_headers)
    assert search_case.status_code == 200
    case_results = search_case.json()["cases"]
    assert any(c["case_number"] == "CASE-2026-7788" for c in case_results)

    # By evidence ID
    search_ev = client.get("/api/search?q=EV-7788-001", headers=senior_officer_headers)
    assert search_ev.status_code == 200
    ev_results = search_ev.json()["evidence"]
    assert any("7788" in e["evidence_id"] for e in ev_results)

    # By partial SHA-256 hash
    partial_hash = expected_sha256[:12]
    search_hash = client.get(f"/api/search?q={partial_hash}", headers=senior_officer_headers)
    assert search_hash.status_code == 200
    hash_results = search_hash.json()["hashes"]
    assert len(hash_results) > 0

    # Step 15: Role restrictions prevent unauthorized actions
    court_user_headers = {
        "X-User-Role": "Court User",
        "X-User-Id": "usr-005"
    }

    # Court User cannot create cases (HTTP 403)
    unauth_case_res = client.post("/api/cases", json={
        "case_number": "CASE-2026-9999",
        "title": "Unauthorized Case Creation",
        "description": "Court user trying to initialize a case.",
        "department": "Judicial Liaison",
        "incident_date": "2026-01-01",
        "priority": "LOW",
        "classification": "RESTRICTED",
        "lead_investigator": "Judge Miller"
    }, headers=court_user_headers)
    assert unauth_case_res.status_code == 403
    assert "authorized" in unauth_case_res.json()["detail"].lower()

    # Court User cannot verify confidential evidence (HTTP 403)
    unauth_verify_res = client.post(
        f"/api/documents/{document_id}/verify",
        headers=court_user_headers
    )
    assert unauth_verify_res.status_code == 403
    assert "Clearance Denied" in unauth_verify_res.json()["detail"]
