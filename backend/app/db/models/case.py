from sqlalchemy import Column, String, Text, JSON, DateTime, Integer, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class CaseModel(Base):
    __tablename__ = "cases"

    case_id = Column(String, primary_key=True, index=True)
    case_number = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, default="ACTIVE", index=True)
    priority = Column(String, default="HIGH")
    classification = Column(String, default="CONFIDENTIAL", index=True)
    department = Column(String, nullable=False)
    lead_investigator = Column(String, nullable=False)
    assigned_users = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    incident_date = Column(String, nullable=False)
    case_stage = Column(String, nullable=False)
    victims = Column(JSON, nullable=True, default=list)
    suspects = Column(JSON, nullable=True, default=list)
    evidence_count = Column(Integer, default=0)
    document_count = Column(Integer, default=0)
    blockchain_anchor_id = Column(String, nullable=False)

__table_args__ = (
    Index("idx_cases_status_stage", "status", "case_stage"),
)
