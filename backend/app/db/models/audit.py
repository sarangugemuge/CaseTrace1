from sqlalchemy import Column, String, DateTime
from datetime import datetime, timezone
from backend.app.db.database import Base

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    event_id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    user_id = Column(String, index=True, nullable=False)
    user_name = Column(String, nullable=False)
    role = Column(String, index=True, nullable=False)
    case_id = Column(String, index=True, nullable=True)
    document_id = Column(String, index=True, nullable=True)
    action = Column(String, index=True, nullable=False)
    purpose = Column(String, nullable=True)
    result = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    description = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
