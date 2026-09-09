from sqlalchemy import Column, String, DateTime, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class AccessRecordModel(Base):
    __tablename__ = "access_records"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    user_role = Column(String, nullable=False)
    case_id = Column(String, nullable=True, index=True)
    document_id = Column(String, nullable=True, index=True)
    action = Column(String, nullable=False)
    purpose = Column(String, nullable=True)
    decision = Column(String, nullable=False)  # "ALLOWED" | "DENIED" | "PURPOSE_REQUIRED"
    policy_id = Column(String, nullable=False)
    risk_level = Column(String, nullable=False)
    reason = Column(String, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    __table_args__ = (
        Index("idx_access_records_user_case", "user_id", "case_id"),
    )
