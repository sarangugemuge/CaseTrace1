import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.db.database import get_db, verify_db_connection
from backend.app.db.models.user import UserModel
from backend.app.db.models.role import RoleModel
from backend.app.schemas.role import (
    RoleResponse,
    RoleCreate,
    RoleUpdate,
    SystemConfigResponse,
    SystemConfigUpdate
)
from backend.app.dependencies.auth import get_current_user
from backend.app.services.storage_service import storage_service
from backend.app.services.audit_service import AuditService
from backend.app.schemas.audit import AuditCreate
from backend.app.core.config import settings

router = APIRouter(prefix="/admin", tags=["Admin & System Configuration"])

# Runtime system configuration state
_SYSTEM_CONFIG = {
    "sha256_enforcement": "STRICT_AUTHENTIC",
    "max_upload_size_mb": 50,
    "audit_retention_days": 365
}

def require_admin_user(current_user: UserModel = Depends(get_current_user)) -> UserModel:
    if current_user.role != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Administrative privileges required. Only System Administrator can access this resource."
        )
    return current_user

@router.get("/roles", response_model=List[RoleResponse])
def list_roles(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    roles = db.query(RoleModel).order_by(RoleModel.is_system.desc(), RoleModel.name.asc()).all()
    return [RoleResponse.model_validate(r) for r in roles]

@router.post("/roles", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    existing = db.query(RoleModel).filter(
        (RoleModel.role_key == role_in.role_key) | (RoleModel.name == role_in.name)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role with key '{role_in.role_key}' or name '{role_in.name}' already exists."
        )

    role_obj = RoleModel(
        id=f"role-{uuid.uuid4().hex[:8]}",
        name=role_in.name,
        role_key=role_in.role_key,
        description=role_in.description,
        permissions=role_in.permissions,
        is_active=True,
        is_system=False
    )
    db.add(role_obj)
    db.commit()
    db.refresh(role_obj)

    audit_svc = AuditService(db)
    audit_svc.create_log(current_user, AuditCreate(
        action="ROLE_CREATED",
        purpose="ADMINISTRATIVE",
        result="SUCCESS",
        risk_level="LOW",
        description=f"Admin {current_user.name} created role '{role_obj.name}' with {len(role_obj.permissions)} permissions."
    ))

    return RoleResponse.model_validate(role_obj)

@router.put("/roles/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: str,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    role_obj = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found."
        )

    changes = []
    if role_in.name is not None and role_in.name != role_obj.name:
        changes.append(f"name: '{role_obj.name}' -> '{role_in.name}'")
        role_obj.name = role_in.name
    if role_in.description is not None:
        role_obj.description = role_in.description
    if role_in.permissions is not None:
        changes.append(f"permissions: {len(role_obj.permissions)} -> {len(role_in.permissions)}")
        role_obj.permissions = role_in.permissions
    if role_in.is_active is not None and role_in.is_active != role_obj.is_active:
        changes.append(f"is_active: {role_obj.is_active} -> {role_in.is_active}")
        role_obj.is_active = role_in.is_active

    db.add(role_obj)
    db.commit()
    db.refresh(role_obj)

    audit_svc = AuditService(db)
    audit_svc.create_log(current_user, AuditCreate(
        action="ROLE_UPDATED",
        purpose="ADMINISTRATIVE",
        result="SUCCESS",
        risk_level="LOW",
        description=f"Admin {current_user.name} updated role '{role_obj.name}': {', '.join(changes) if changes else 'no structural changes'}"
    ))

    return RoleResponse.model_validate(role_obj)

@router.delete("/roles/{role_id}")
def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    role_obj = db.query(RoleModel).filter(RoleModel.id == role_id).first()
    if not role_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found."
        )

    if role_obj.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete built-in system role '{role_obj.name}'."
        )

    role_name = role_obj.name
    db.delete(role_obj)
    db.commit()

    audit_svc = AuditService(db)
    audit_svc.create_log(current_user, AuditCreate(
        action="ROLE_DELETED",
        purpose="ADMINISTRATIVE",
        result="SUCCESS",
        risk_level="MEDIUM",
        description=f"Admin {current_user.name} deleted custom role '{role_name}'."
    ))

    return {"status": "success", "message": f"Role '{role_name}' deleted successfully."}

@router.get("/config", response_model=SystemConfigResponse)
def get_system_config(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    db_info = verify_db_connection()
    backend_type = "MinIO S3 Object Storage" if storage_service.client is not None else "Resilient Local Object Store (Fallback)"

    return SystemConfigResponse(
        storage_backend=backend_type,
        storage_bucket=storage_service.bucket,
        storage_endpoint=settings.STORAGE_ENDPOINT,
        db_dialect=db_info.get("dialect", "sqlite"),
        db_status=db_info.get("status", "connected"),
        sha256_enforcement=_SYSTEM_CONFIG["sha256_enforcement"],
        max_upload_size_mb=_SYSTEM_CONFIG["max_upload_size_mb"],
        audit_retention_days=_SYSTEM_CONFIG["audit_retention_days"],
        active_sessions_count=len(db.query(UserModel).all())
    )

@router.put("/config", response_model=SystemConfigResponse)
def update_system_config(
    config_in: SystemConfigUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(require_admin_user)
):
    changes = []
    if config_in.sha256_enforcement is not None:
        _SYSTEM_CONFIG["sha256_enforcement"] = config_in.sha256_enforcement
        changes.append(f"sha256_enforcement={config_in.sha256_enforcement}")
    if config_in.max_upload_size_mb is not None:
        _SYSTEM_CONFIG["max_upload_size_mb"] = config_in.max_upload_size_mb
        changes.append(f"max_upload_size_mb={config_in.max_upload_size_mb}")
    if config_in.audit_retention_days is not None:
        _SYSTEM_CONFIG["audit_retention_days"] = config_in.audit_retention_days
        changes.append(f"audit_retention_days={config_in.audit_retention_days}")

    audit_svc = AuditService(db)
    audit_svc.create_log(current_user, AuditCreate(
        action="SYSTEM_CONFIG_UPDATED",
        purpose="ADMINISTRATIVE",
        result="SUCCESS",
        risk_level="MEDIUM",
        description=f"Admin {current_user.name} updated system config: {', '.join(changes)}"
    ))

    return get_system_config(db=db, current_user=current_user)
