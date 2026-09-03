from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.db.models.audit import AuditLogModel
from backend.app.db.models.user import UserModel
from backend.app.schemas.audit import AuditResponse, AuditCreate
from backend.app.dependencies.auth import get_current_user

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
    logs = db.query(AuditLogModel).order_by(AuditLogModel.timestamp.desc()).all()
    return [AuditResponse.model_validate(l) for l in logs]

@router.get("/cases/{case_id}/audit", response_model=List[AuditResponse])
def get_case_audit_logs(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    logs = db.query(AuditLogModel).filter(AuditLogModel.case_id == case_id).order_by(AuditLogModel.timestamp.desc()).all()
    return [AuditResponse.model_validate(l) for l in logs]

@router.post("/audit", response_model=AuditResponse, status_code=status.HTTP_201_CREATED)
def create_audit_entry(
    audit_in: AuditCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    import uuid
    db_audit = AuditLogModel(
        event_id=f"evt-{uuid.uuid4().hex[:8]}",
        user_id=current_user.id,
        user_name=current_user.name,
        role=current_user.role,
        case_id=audit_in.case_id,
        document_id=audit_in.document_id,
        action=audit_in.action,
        purpose=audit_in.purpose,
        result=audit_in.result,
        risk_level=audit_in.risk_level,
        description=audit_in.description,
        ip_address="10.240.12.84"
    )
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return AuditResponse.model_validate(db_audit)
