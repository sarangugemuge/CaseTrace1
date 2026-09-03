from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class DocumentVersionSchema(BaseModel):
    version_number: int
    uploaded_at: str
    uploaded_by: str
    sha256_hash: str
    file_size: str
    change_summary: str

class DocumentBase(BaseModel):
    id: str
    case_id: str
    name: str
    type: str
    category: str
    sensitivity: str
    version: int
    version_history: List[DocumentVersionSchema] = []
    uploaded_by: str
    uploaded_at: Optional[datetime] = None
    sha256_hash: str
    blockchain_record_id: str
    allowed_roles: List[str] = []
    allowed_purposes: List[str] = []
    integrity_status: str = "VERIFIED"

class DocumentResponse(DocumentBase):
    model_config = ConfigDict(from_attributes=True)
