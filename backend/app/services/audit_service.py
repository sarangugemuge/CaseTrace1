import uuid
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.repositories.audit_repository import AuditRepository
from backend.app.db.models.audit import AuditLogModel
from backend.app.db.models.access_record import AccessRecordModel
from backend.app.db.models.user import UserModel
from backend.app.schemas.audit import AuditCreate

class AuditService:
    def __init__(self, db: Session):
        self.audit_repo = AuditRepository(db)

    def list_all_logs(self) -> List[AuditLogModel]:
        return self.audit_repo.list_all_logs()

    def list_case_logs(self, case_id: str, order: str = "asc") -> List[AuditLogModel]:
        return self.audit_repo.list_logs_by_case(case_id, order=order)

    def create_log(self, user: UserModel, audit_in: AuditCreate) -> AuditLogModel:
        log_entry = AuditLogModel(
            event_id=f"evt-{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            user_name=user.name,
            role=user.role,
            case_id=audit_in.case_id,
            document_id=audit_in.document_id,
            action=audit_in.action,
            purpose=audit_in.purpose,
            result=audit_in.result,
            risk_level=audit_in.risk_level,
            description=audit_in.description,
            ip_address="10.240.12.84"
        )
        return self.audit_repo.create_log(log_entry)

    def record_access_decision(
        self, user: UserModel, case_id: Optional[str], document_id: Optional[str],
        action: str, purpose: Optional[str], decision: dict
    ) -> AccessRecordModel:
        rec = AccessRecordModel(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            user_id=user.id,
            user_role=user.role,
            case_id=case_id,
            document_id=document_id,
            action=action,
            purpose=purpose,
            decision="ALLOWED" if decision.get("allowed") else "DENIED",
            policy_id=decision.get("policy_id", "POL-DEFAULT"),
            risk_level=decision.get("risk_level", "LOW"),
            reason=decision.get("reason", "Decision recorded")
        )
        return self.audit_repo.create_access_record(rec)
