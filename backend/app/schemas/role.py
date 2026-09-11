from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    role_key: str
    description: Optional[str] = None
    permissions: List[str] = []
    is_active: bool = True
    is_system: bool = False

class RoleCreate(BaseModel):
    name: str
    role_key: str
    description: Optional[str] = None
    permissions: List[str] = []

class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[List[str]] = None
    is_active: Optional[bool] = None

class RoleResponse(RoleBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SystemConfigResponse(BaseModel):
    storage_backend: str
    storage_bucket: str
    storage_endpoint: str
    db_dialect: str
    db_status: str
    sha256_enforcement: str
    max_upload_size_mb: int
    audit_retention_days: int
    active_sessions_count: int

class SystemConfigUpdate(BaseModel):
    sha256_enforcement: Optional[str] = None
    max_upload_size_mb: Optional[int] = None
    audit_retention_days: Optional[int] = None
