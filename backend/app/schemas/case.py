from pydantic import BaseModel, ConfigDict, field_validator
from typing import List, Optional
from datetime import datetime

VALID_PRIORITIES = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
VALID_CLASSIFICATIONS = {"RESTRICTED", "CONFIDENTIAL", "SECRET", "TOP_SECRET"}
VALID_STATUSES = {"ACTIVE", "PENDING_REVIEW", "IN_COURT", "CLOSED", "ARCHIVED"}
VALID_STAGES = {
    "FIR_LODGED",
    "EVIDENCE_COLLECTION",
    "FORENSIC_ANALYSIS",
    "CHARGE_SHEET_PREPARED",
    "TRIALS_ONGOING",
    "VERDICT_RENDERED",
}

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
    assigned_users: Optional[List[str]] = []
    incident_date: str
    case_stage: str
    victims: Optional[List[str]] = []
    suspects: Optional[List[str]] = []
    evidence_count: int = 0
    document_count: int = 0
    blockchain_anchor_id: str

    @field_validator("assigned_users", "victims", "suspects", mode="before")
    @classmethod
    def ensure_list(cls, v):
        if v is None:
            return []
        return v

class CaseCreate(BaseModel):
    case_id: Optional[str] = None
    case_number: str
    title: str
    description: str
    status: Optional[str] = "ACTIVE"
    priority: str = "HIGH"
    classification: str = "CONFIDENTIAL"
    department: str
    lead_investigator: str
    assigned_users: List[str] = []
    incident_date: str
    case_stage: Optional[str] = "FIR_LODGED"
    victims: List[str] = []
    suspects: List[str] = []
    evidence_count: int = 0
    document_count: int = 0
    blockchain_anchor_id: Optional[str] = None

    @field_validator("case_number", "title", "department", "lead_investigator")
    @classmethod
    def validate_non_empty(cls, v: str, info) -> str:
        trimmed = (v or "").strip()
        if not trimmed:
            raise ValueError(f"Field '{info.field_name}' cannot be empty.")
        if info.field_name == "title" and len(trimmed) < 3:
            raise ValueError("Case title must be at least 3 characters long.")
        return trimmed

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v: str) -> str:
        val = (v or "").strip().upper()
        if val not in VALID_PRIORITIES:
            raise ValueError(f"Priority must be one of: {', '.join(sorted(VALID_PRIORITIES))}")
        return val

    @field_validator("classification")
    @classmethod
    def validate_classification(cls, v: str) -> str:
        val = (v or "").strip().upper()
        if val not in VALID_CLASSIFICATIONS:
            raise ValueError(f"Classification must be one of: {', '.join(sorted(VALID_CLASSIFICATIONS))}")
        return val

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> str:
        val = (v or "ACTIVE").strip().upper()
        if val not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {', '.join(sorted(VALID_STATUSES))}")
        return val

    @field_validator("case_stage")
    @classmethod
    def validate_stage(cls, v: Optional[str]) -> str:
        val = (v or "FIR_LODGED").strip().upper()
        if val not in VALID_STAGES:
            raise ValueError(f"Case stage must be one of: {', '.join(sorted(VALID_STAGES))}")
        return val

    @field_validator("incident_date")
    @classmethod
    def validate_incident_date(cls, v: str) -> str:
        val = (v or "").strip()
        try:
            parsed = datetime.strptime(val, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Incident date must be in valid YYYY-MM-DD format.")
        if parsed > datetime.now().date():
            raise ValueError("Incident date cannot be in the future.")
        return val

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
