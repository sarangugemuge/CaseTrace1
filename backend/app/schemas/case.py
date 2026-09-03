from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class CaseBase(BaseModel):
    case_id: str
    case_number: str
    title: str
    description: str
    status: str
    priority: str
    classification: str
    department: str
    lead_investigator: str
    assigned_users: List[str] = []
    incident_date: str
    case_stage: str
    victims: List[str] = []
    suspects: List[str] = []
    evidence_count: int = 0
    document_count: int = 0
    blockchain_anchor_id: str

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    case_stage: Optional[str] = None

class CaseResponse(CaseBase):
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
