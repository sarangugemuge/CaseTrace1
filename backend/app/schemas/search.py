from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class SearchCaseItem(BaseModel):
    case_id: str
    case_number: str
    title: str
    status: str
    priority: Optional[str] = None
    classification: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SearchDocumentItem(BaseModel):
    id: str
    name: str
    case_id: str
    case_number: Optional[str] = None
    sensitivity: Optional[str] = None
    type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SearchEvidenceItem(BaseModel):
    evidence_id: str
    name: str
    case_id: str
    case_number: Optional[str] = None
    verification_status: str
    sha256_hash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class SearchHashItem(BaseModel):
    hash: str
    match_type: str  # "DOCUMENT" | "EVIDENCE" | "CASE_ANCHOR"
    item_name: str
    case_id: str
    case_number: Optional[str] = None
    verification_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class GlobalSearchResponse(BaseModel):
    query: str
    total_results: int
    cases: List[SearchCaseItem]
    documents: List[SearchDocumentItem]
    evidence: List[SearchEvidenceItem]
    hashes: List[SearchHashItem]

    model_config = ConfigDict(from_attributes=True)
