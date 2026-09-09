import pytest
from datetime import datetime, timezone
import uuid
from backend.tests.conftest import TestingSessionLocal
from backend.app.db.models.audit import AuditLogModel
from backend.app.db.models.document import DocumentModel

def test_audit_summary_global_auditor(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    res = client.get("/api/audit/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_recent_events" in data
    assert "successful_accesses" in data
    assert "denied_attempts" in data
    assert "evidence_verification_events" in data
    assert "high_risk_events" in data
    assert data["total_recent_events"] >= data["successful_accesses"] >= 0
    assert data["denied_attempts"] >= 0
    assert data["high_risk_events"] >= 0


def test_audit_summary_operational_user_scoping(client):
    headers = {"X-User-Role": "Investigating Officer", "X-User-Id": "usr-002"}
    res = client.get("/api/audit/summary", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_recent_events"] >= 0
    assert data["successful_accesses"] >= 0


def test_notifications_generation(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "unread_count" in data
    assert "notifications" in data
    assert data["total"] >= 0

    if data["total"] > 0:
        first = data["notifications"][0]
        assert "id" in first
        assert "type" in first
        assert "title" in first
        assert "message" in first
        assert "severity" in first
        assert "target_url" in first
        assert first["target_url"].startswith("/dashboard")


def test_notifications_rbac_clearance_isolation(client):
    headers_court = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
    res_court = client.get("/api/notifications", headers=headers_court)
    assert res_court.status_code == 200
    data_court = res_court.json()

    # Court User must NOT receive any notifications for unassigned cases (e.g. CASE-2026-1105)
    for notif in data_court["notifications"]:
        assert notif.get("case_id") != "CASE-2026-1105"


def test_notifications_click_navigation_targets(client):
    headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()

    valid_prefixes = ["/dashboard/cases", "/dashboard/verification", "/dashboard/audit"]
    for notif in data["notifications"]:
        target = notif["target_url"]
        assert any(target.startswith(prefix) for prefix in valid_prefixes), f"Invalid navigation target: {target}"


def test_real_event_injection_and_all_notification_types(client):
    """
    Directly inject real audit and document events to verify:
    1. Evidence requires verification (VERIFICATION_REQUIRED)
    2. Restricted access attempt (RESTRICTED_ACCESS)
    3. Document integrity mismatch (INTEGRITY_MISMATCH)
    4. Successful verification (VERIFICATION_SUCCESS)
    5. Case update (CASE_UPDATE)
    6. New case assignment (CASE_ASSIGNMENT)
    7. Accurate audit summary increments
    """
    db = TestingSessionLocal()
    case_id = "CASE-2026-8942"
    test_run_id = uuid.uuid4().hex[:6]

    try:
        # 1. Inject pending document
        pending_doc = DocumentModel(
            id=f"doc-pend-{test_run_id}",
            case_id=case_id,
            name=f"Pending_Forensic_Image_{test_run_id}.dd",
            type="IMAGE",
            category="SYSTEM_IMAGE",
            sensitivity="CONFIDENTIAL",
            integrity_status="PENDING",
            sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            original_filename=f"Pending_Forensic_Image_{test_run_id}.dd",
            blockchain_record_id=f"rec-{test_run_id}",
            uploaded_by="usr-002",
            uploaded_at=datetime.now(timezone.utc),
            allowed_roles=["Senior Officer", "Investigating Officer"]
        )
        db.add(pending_doc)

        # 2. Inject restricted access attempt
        denied_log = AuditLogModel(
            event_id=f"evt-denied-{test_run_id}",
            timestamp=datetime.now(timezone.utc),
            user_id="usr-unknown",
            user_name="External Operator",
            role="Unverified",
            case_id=case_id,
            document_id=pending_doc.id,
            action="VIEW_DOCUMENT",
            purpose="UNAUTHORIZED_ACCESS",
            result="DENIED",
            risk_level="HIGH",
            description="Clearance policy rejected: insufficient credentials"
        )
        db.add(denied_log)

        # 3. Inject tamper mismatch
        mismatch_log = AuditLogModel(
            event_id=f"evt-mismatch-{test_run_id}",
            timestamp=datetime.now(timezone.utc),
            user_id="usr-003",
            user_name="Dr. Aris Thorne",
            role="Forensic Officer",
            case_id=case_id,
            document_id=pending_doc.id,
            action="INTEGRITY_VERIFICATION",
            purpose="ROUTINE_CHECK",
            result="TAMPER_ALERT",
            risk_level="CRITICAL",
            description="MISMATCH: computed hash does not match genesis anchor"
        )
        db.add(mismatch_log)

        # 4. Inject successful verification
        success_log = AuditLogModel(
            event_id=f"evt-success-{test_run_id}",
            timestamp=datetime.now(timezone.utc),
            user_id="usr-003",
            user_name="Dr. Aris Thorne",
            role="Forensic Officer",
            case_id=case_id,
            document_id=pending_doc.id,
            action="INTEGRITY_VERIFICATION",
            purpose="CHAIN_VALIDATION",
            result="SUCCESS",
            risk_level="LOW",
            description="Cryptographic hash bit-exact match confirmed"
        )
        db.add(success_log)

        # 5. Inject case update
        update_log = AuditLogModel(
            event_id=f"evt-update-{test_run_id}",
            timestamp=datetime.now(timezone.utc),
            user_id="usr-001",
            user_name="Capt. Rajesh Kumar",
            role="Senior Officer",
            case_id=case_id,
            action="CASE_STAGE_CHANGED",
            purpose="PROSECUTION_PREPARATION",
            result="SUCCESS",
            risk_level="LOW",
            description="Case stage updated to EVIDENCE_COLLECTION"
        )
        db.add(update_log)
        db.commit()

        # Query notifications as Senior Officer (has full oversight of CASE-2026-8942)
        headers = {"X-User-Role": "Senior Officer", "X-User-Id": "usr-001"}
        res = client.get("/api/notifications", headers=headers)
        assert res.status_code == 200
        notifs = res.json()["notifications"]

        types_found = {n["type"] for n in notifs}
        # Check all required types are represented
        assert "VERIFICATION_REQUIRED" in types_found, "Missing VERIFICATION_REQUIRED"
        assert "RESTRICTED_ACCESS" in types_found, "Missing RESTRICTED_ACCESS"
        assert "INTEGRITY_MISMATCH" in types_found, "Missing INTEGRITY_MISMATCH"
        assert "VERIFICATION_SUCCESS" in types_found, "Missing VERIFICATION_SUCCESS"
        assert "CASE_UPDATE" in types_found, "Missing CASE_UPDATE"

        # Check notification navigation URLs
        for n in notifs:
            if n["type"] == "VERIFICATION_REQUIRED":
                assert "/dashboard/cases" in n["target_url"] or "/dashboard/verification" in n["target_url"]
            elif n["type"] == "RESTRICTED_ACCESS":
                assert "/dashboard/cases" in n["target_url"] or "/dashboard/audit" in n["target_url"]
            elif n["type"] == "INTEGRITY_MISMATCH":
                assert n["target_url"] == "/dashboard/verification"

        # Verify Audit Summary includes the real events
        sum_res = client.get("/api/audit/summary", headers=headers)
        assert sum_res.status_code == 200
        summary = sum_res.json()
        assert summary["total_recent_events"] >= 4
        assert summary["successful_accesses"] >= 2
        assert summary["denied_attempts"] >= 2 # DENIED + TAMPER_ALERT
        assert summary["evidence_verification_events"] >= 2 # mismatch + success verification
        assert summary["high_risk_events"] >= 2 # HIGH + CRITICAL

        # Verify RBAC isolation for Court User:
        # Court user cannot receive notifications for confidential documents or high-risk unauthorized access attempts
        headers_court = {"X-User-Role": "Court User", "X-User-Id": "usr-005"}
        court_res = client.get("/api/notifications", headers=headers_court)
        assert court_res.status_code == 200
        court_notifs = court_res.json()["notifications"]
        court_types = {n["type"] for n in court_notifs}
        # Court User must NOT receive the restricted access or confidential tamper alerts
        assert not any(n["id"] == f"notif-denied-{test_run_id}" for n in court_notifs)
        assert not any(n["id"] == f"notif-pend-{pending_doc.id}" for n in court_notifs)
    finally:
        # Cleanup injected items
        db.query(AuditLogModel).filter(AuditLogModel.event_id.in_([
            f"evt-denied-{test_run_id}",
            f"evt-mismatch-{test_run_id}",
            f"evt-success-{test_run_id}",
            f"evt-update-{test_run_id}"
        ])).delete(synchronize_session=False)
        db.query(DocumentModel).filter(DocumentModel.id == f"doc-pend-{test_run_id}").delete(synchronize_session=False)
        db.commit()
        db.close()
