from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.audit import AuditResponse, AuditCreate, AuditSummaryResponse
from backend.app.dependencies.auth import get_current_user
from backend.app.services.audit_service import AuditService

router = APIRouter()

@router.get("/audit/summary", response_model=AuditSummaryResponse)
def get_audit_summary(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    from backend.app.services.case_service import CaseService
    from backend.app.db.models.audit import AuditLogModel

    is_global_auditor = current_user.role in ["Senior Officer", "Auditor / Security", "Admin", "Prosecutor"]
    query = db.query(AuditLogModel)

    if not is_global_auditor:
        case_svc = CaseService(db)
        authorized_cases = case_svc.list_cases_for_user(current_user)
        authorized_case_ids = [c.case_id for c in authorized_cases]
        if not authorized_case_ids:
            return AuditSummaryResponse(
                total_recent_events=0,
                successful_accesses=0,
                denied_attempts=0,
                evidence_verification_events=0,
                high_risk_events=0
            )
        query = query.filter(AuditLogModel.case_id.in_(authorized_case_ids))

    all_logs = query.all()

    total_recent_events = len(all_logs)
    successful_accesses = sum(1 for l in all_logs if l.result == "SUCCESS")
    denied_attempts = sum(
        1 for l in all_logs 
        if l.result in ["DENIED", "BLOCKED", "TAMPER_ALERT"] or "DENIED" in (l.action or "")
    )
    evidence_verification_events = sum(
        1 for l in all_logs 
        if l.action in ["INTEGRITY_VERIFICATION", "DOCUMENT_VERIFIED", "INTEGRITY_CHECK"] or "VERIF" in (l.action or "")
    )
    high_risk_events = sum(
        1 for l in all_logs 
        if (l.risk_level or "").upper() in ["HIGH", "CRITICAL"]
    )

    return AuditSummaryResponse(
        total_recent_events=total_recent_events,
        successful_accesses=successful_accesses,
        denied_attempts=denied_attempts,
        evidence_verification_events=evidence_verification_events,
        high_risk_events=high_risk_events
    )

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
    from backend.app.services.case_service import CaseService
    case_svc = CaseService(db)
    case_obj, decision = case_svc.get_case_by_id(case_id, current_user)
    if not case_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case {case_id} not found."
        )
    if not decision["allowed"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Clearance Denied: {decision['reason']}"
        )

    service = AuditService(db)
    logs = service.list_case_logs(case_id, order="asc")
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
