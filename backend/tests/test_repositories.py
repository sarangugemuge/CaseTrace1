from backend.app.repositories.user_repository import UserRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.repositories.audit_repository import AuditRepository
from backend.app.db.models.access_record import AccessRecordModel
from backend.tests.conftest import TestingSessionLocal
import uuid

def test_user_repository_get(client):
    db = TestingSessionLocal()
    try:
        repo = UserRepository(db)
        u = repo.get_by_id("usr-001")
        assert u is not None
        assert u.role == "Senior Officer"
    finally:
        db.close()

def test_case_repository_list(client):
    db = TestingSessionLocal()
    try:
        repo = CaseRepository(db)
        cases = repo.list_all()
        assert len(cases) >= 3
    finally:
        db.close()

def test_document_repository_list(client):
    db = TestingSessionLocal()
    try:
        repo = DocumentRepository(db)
        docs = repo.list_by_case("CASE-2026-8942")
        assert len(docs) >= 1
    finally:
        db.close()

def test_audit_repository_access_record(client):
    db = TestingSessionLocal()
    try:
        repo = AuditRepository(db)
        rec = AccessRecordModel(
            id=f"rec-test-{uuid.uuid4().hex[:6]}",
            user_id="usr-001",
            user_role="Senior Officer",
            case_id="CASE-2026-8942",
            document_id="doc-101",
            action="VIEW",
            purpose="TEST",
            decision="ALLOWED",
            policy_id="POL-SENIOR-FULL-01",
            risk_level="LOW",
            reason="Test decision"
        )
        saved = repo.create_access_record(rec)
        assert saved.id == rec.id
    finally:
        db.close()
