from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AuditBase(BaseModel):
    event_id: str
    user_id: str
    user_name: str
    role: str
    case_id: Optional[str] = None
    document_id: Optional[str] = None
    action: str
    purpose: Optional[str] = None
    result: str
    risk_level: str
    description: str
    ip_address: Optional[str] = "10.240.12.84"

class AuditCreate(BaseModel):
    case_id: Optional[str] = None
    document_id: Optional[str] = None
    action: str
    purpose: Optional[str] = None
    result: str
    risk_level: str
    description: str

class AuditResponse(AuditBase):
    timestamp: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
