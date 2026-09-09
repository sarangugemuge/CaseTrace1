from pydantic import BaseModel
from typing import Optional, List

class NotificationItem(BaseModel):
    id: str
    type: str  # "VERIFICATION_REQUIRED" | "RESTRICTED_ACCESS" | "INTEGRITY_MISMATCH" | "CASE_UPDATE" | "VERIFICATION_SUCCESS" | "CASE_ASSIGNMENT"
    title: str
    message: str
    case_id: Optional[str] = None
    case_number: Optional[str] = None
    document_id: Optional[str] = None
    timestamp: str
    severity: str  # "INFO" | "WARNING" | "CRITICAL" | "SUCCESS"
    target_url: str
    read: bool = False

class NotificationsResponse(BaseModel):
    total: int
    unread_count: int
    notifications: List[NotificationItem]
