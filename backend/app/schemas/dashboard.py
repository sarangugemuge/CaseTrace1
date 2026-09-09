from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class DashboardActivityItem(BaseModel):
    event_id: str
    timestamp: datetime
    action: str
    case_id: Optional[str] = None
    case_number: Optional[str] = None
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    user_name: Optional[str] = None
    role: Optional[str] = None
    result: Optional[str] = "SUCCESS"
    risk_level: Optional[str] = "LOW"
    description: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)

class DashboardStatsResponse(BaseModel):
    active_cases: int
    critical_cases: int
    total_evidence_items: int
    pending_verification: int
    integrity_alerts: int
    total_authorized_cases: int
    user_role: str
    user_name: str
    recent_activity: List[DashboardActivityItem]

    model_config = ConfigDict(from_attributes=True)
