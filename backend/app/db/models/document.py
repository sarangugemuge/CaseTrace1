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
    description = Column(String, nullable=True)
    notes = Column(String, nullable=True)

    # Storage & Integrity Metadata
    storage_key = Column(String, nullable=True, index=True)
    storage_bucket = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True, default=0)
    mime_type = Column(String, nullable=True, default="application/octet-stream")
    original_filename = Column(String, nullable=True)

    # Evidence Verification & Approval Workflow
    uploader_id = Column(String, nullable=True, index=True)
    uploader_role = Column(String, nullable=True)
    verification_status = Column(String, default="PENDING_VERIFICATION", index=True)
    verified_by = Column(String, nullable=True)
    verifier_id = Column(String, nullable=True)
    verifier_role = Column(String, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    approval_justification = Column(String, nullable=True)
    rejection_reason = Column(String, nullable=True)
    approved_hash = Column(String, nullable=True)
    approved_version = Column(Integer, nullable=True)
    chain_of_custody = Column(JSON, nullable=True, default=list)

    __table_args__ = (
        Index("idx_docs_case_sensitivity", "case_id", "sensitivity"),
        Index("idx_docs_storage_key", "storage_key"),
        Index("idx_docs_verification_status", "verification_status"),
    )
