from sqlalchemy import Column, String, Integer, JSON, DateTime, ForeignKey, Index
from datetime import datetime, timezone
from backend.app.db.database import Base

class DocumentModel(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    sensitivity = Column(String, nullable=False, index=True)
    version = Column(Integer, default=1)
    version_history = Column(JSON, nullable=True, default=list)
    uploaded_by = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    sha256_hash = Column(String, nullable=False, index=True)
    blockchain_record_id = Column(String, nullable=False)
    allowed_roles = Column(JSON, nullable=True, default=list)
    allowed_purposes = Column(JSON, nullable=True, default=list)
    integrity_status = Column(String, default="VERIFIED")

__table_args__ = (
    Index("idx_docs_case_sensitivity", "case_id", "sensitivity"),
)
