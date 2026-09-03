from sqlalchemy import Column, String, Integer, DateTime, JSON, Text
from datetime import datetime, timezone
from backend.app.db.database import Base

class CaseModel(Base):
    __tablename__ = "cases"

    case_id = Column(String, primary_key=True, index=True)
    case_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String, index=True, default="ACTIVE")
    priority = Column(String, index=True, default="HIGH")
    classification = Column(String, index=True, default="TOP_SECRET")
    department = Column(String, nullable=False)
    lead_investigator = Column(String, nullable=False)
    assigned_users = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    incident_date = Column(String, nullable=False)
    case_stage = Column(String, nullable=False)
    victims = Column(JSON, default=list)
    suspects = Column(JSON, default=list)
    evidence_count = Column(Integer, default=0)
    document_count = Column(Integer, default=0)
    blockchain_anchor_id = Column(String, nullable=False)
