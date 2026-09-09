from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.models.audit import AuditLogModel
from backend.app.db.models.access_record import AccessRecordModel

class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_all_logs(self) -> List[AuditLogModel]:
        return self.db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()

    def list_logs_by_case(self, case_id: str, order: str = "asc") -> List[AuditLogModel]:
        q = self.db.query(AuditLogModel).filter(AuditLogModel.case_id == case_id)
        if order.lower() == "desc":
            return q.order_by(AuditLogModel.timestamp.desc()).all()
        return q.order_by(AuditLogModel.timestamp.asc()).all()

    def create_log(self, log_entry: AuditLogModel) -> AuditLogModel:
        self.db.add(log_entry)
        self.db.commit()
        self.db.refresh(log_entry)
        return log_entry

    def create_access_record(self, access_record: AccessRecordModel) -> AccessRecordModel:
        self.db.add(access_record)
        self.db.commit()
        self.db.refresh(access_record)
        return access_record

    def list_access_records_by_user(self, user_id: str) -> List[AccessRecordModel]:
        return self.db.query(AccessRecordModel).filter(AccessRecordModel.user_id == user_id).order_by(AccessRecordModel.timestamp.desc()).all()
