from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class DocumentVersionSchema(BaseModel):
    version_number: int
    uploaded_at: str
    uploaded_by: str
    sha256_hash: str
    file_size: str
    change_summary: str

class ChainOfCustodyEntrySchema(BaseModel):
    event: str
    actor: str
    actor_role: str
    actor_id: Optional[str] = None
    timestamp: str
    document_version: int
    sha256: Optional[str] = None
    justification: Optional[str] = None
    details: Optional[str] = None

class DocumentApprovalRequest(BaseModel):
    decision: str  # "VERIFIED" | "REJECTED"
    justification: Optional[str] = None
    rejection_reason: Optional[str] = None

class DocumentApprovalResponse(BaseModel):
    document_id: str
    case_id: str
    verification_status: str
    verified_by: str
    verifier_id: str
    verifier_role: str
    verified_at: str
    decision: str
    justification: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_hash: Optional[str] = None
    approved_version: Optional[int] = None
    audit_event_id: Optional[str] = None

class DocumentBase(BaseModel):
    id: str
    case_id: str
    name: str
    type: str
    category: str
    sensitivity: str
    version: int
    version_history: List[Any] = []
    uploaded_by: str
    uploader_id: Optional[str] = None
    uploader_role: Optional[str] = None
    uploaded_at: Optional[datetime] = None
    sha256_hash: str
    blockchain_record_id: str
    allowed_roles: List[str] = []
    allowed_purposes: List[str] = []
    integrity_status: str = "VERIFIED"
    verification_status: str = "PENDING_VERIFICATION"
    verified_by: Optional[str] = None
    verifier_id: Optional[str] = None
    verifier_role: Optional[str] = None
    verified_at: Optional[datetime] = None
    approval_justification: Optional[str] = None
    rejection_reason: Optional[str] = None
    approved_hash: Optional[str] = None
    approved_version: Optional[int] = None
    chain_of_custody: List[Any] = []
    storage_key: Optional[str] = None
    storage_bucket: Optional[str] = None
    file_size: Optional[int] = 0
    mime_type: Optional[str] = "application/octet-stream"
    original_filename: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class DocumentMetadataUpdate(BaseModel):
    category: Optional[str] = None
    sensitivity: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None

class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)

class DocumentVerificationResult(BaseModel):
    document_id: str
    name: str
    status: str  # "VERIFIED" | "TAMPERED" | "NOT_FOUND" | "VERIFICATION_ERROR"
    stored_hash: str
    computed_hash: Optional[str] = None
    original_hash: Optional[str] = None
    current_hash: Optional[str] = None
    verification_result: str = "INTEGRITY VERIFIED"  # "INTEGRITY VERIFIED" | "INTEGRITY MISMATCH"
    match: bool
    details: str
