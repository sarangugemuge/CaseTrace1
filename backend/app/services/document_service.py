from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.repositories.document_repository import DocumentRepository
from backend.app.repositories.case_repository import CaseRepository
from backend.app.db.models.user import UserModel
from backend.app.db.models.document import DocumentModel
from backend.app.services.access_control import evaluate_access

class DocumentService:
    def __init__(self, db: Session):
        self.doc_repo = DocumentRepository(db)
        self.case_repo = CaseRepository(db)

    def get_case_documents(self, case_id: str, user: UserModel) -> List[DocumentModel]:
        case_obj = self.case_repo.get_by_id(case_id)
        if not case_obj:
            return []

        user_assigned = user.assigned_case_ids or []
        docs = self.doc_repo.list_by_case(case_id)
        
        accessible_docs = []
        for d in docs:
            decision = evaluate_access(
                user_role=user.role,
                user_assigned_cases=user_assigned,
                user_id=user.id,
                case_id=case_id,
                case_assigned_users=case_obj.assigned_users or [],
                document_sensitivity=d.sensitivity,
                action="VIEW"
            )
            if decision["policy_id"] != "POL-SENSITIVITY-RESTRICTED-01":
                accessible_docs.append(d)
        return accessible_docs

    def get_document_by_id(self, document_id: str, user: UserModel, action: str = "VIEW", purpose: Optional[str] = None) -> tuple[Optional[DocumentModel], dict]:
        doc = self.doc_repo.get_by_id(document_id)
        if not doc:
            return None, {"allowed": False, "reason": f"Document {document_id} not found."}

        case_obj = self.case_repo.get_by_id(doc.case_id)
        user_assigned = user.assigned_case_ids or []

        decision = evaluate_access(
            user_role=user.role,
            user_assigned_cases=user_assigned,
            user_id=user.id,
            case_id=doc.case_id,
            case_assigned_users=case_obj.assigned_users if case_obj else [],
            document_sensitivity=doc.sensitivity,
            action=action,
            purpose=purpose
        )
        return doc, decision
