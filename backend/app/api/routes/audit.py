from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.audit import AuditResponse, AuditCreate
from backend.app.dependencies.auth import get_current_user
from backend.app.services.audit_service import AuditService

router = APIRouter()

@router.get("/audit", response_model=List[AuditResponse])
def get_all_audit_logs(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role not in ["Senior Officer", "Auditor / Security", "Admin", "Prosecutor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Role not authorized to access global audit stream."
        )
    service = AuditService(db)
    logs = service.list_all_logs()
    return [AuditResponse.model_validate(l) for l in logs]

@router.get("/cases/{case_id}/audit", response_model=List[AuditResponse])
def get_case_audit_logs(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = AuditService(db)
    logs = service.list_case_logs(case_id)
    return [AuditResponse.model_validate(l) for l in logs]

@router.post("/audit", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
def create_audit_entry(
    audit_in: AuditCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = AuditService(db)
    created = service.create_log(current_user, audit_in)
    return AuditResponse.model_validate(created)
