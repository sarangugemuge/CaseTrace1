from sqlalchemy import Column, String, Integer, DateTime, JSON, ForeignKey
from datetime import datetime, timezone
from backend.app.db.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    sensitivity = Column(String, index=True, nullable=False) # PUBLIC, INTERNAL, CONFIDENTIAL, TOP_SECRET, FORENSIC
    version = Column(Integer, default=1)
    version_history = Column(JSON, default=list)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sha256_hash = Column(String, index=True, nullable=False)
    blockchain_record_id = Column(String, nullable=False)
    allowed_roles = Column(JSON, default=list)
    allowed_purposes = Column(JSON, default=list)
    integrity_status = Column(String, default="VERIFIED")
