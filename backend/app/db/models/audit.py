from sqlalchemy import Column, String, DateTime, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    event_id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(String, nullable=False, index=True)
    user_name = Column(String, nullable=False)
    role = Column(String, nullable=False, index=True)
    case_id = Column(String, nullable=True, index=True)
    document_id = Column(String, nullable=True)
    action = Column(String, nullable=False, index=True)
    purpose = Column(String, nullable=True)
    result = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    description = Column(String, nullable=False)
    ip_address = Column(String, nullable=True, default="10.240.12.84")
    __table_args__ = (
        Index("idx_audit_case_time", "case_id", "timestamp"),
    )
