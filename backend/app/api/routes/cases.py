from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.case import CaseResponse, CaseCreate, CaseUpdate
from backend.app.dependencies.auth import get_current_user
from backend.app.services.case_service import CaseService
from backend.app.services.audit_service import AuditService

router = APIRouter()

@router.get("/cases", response_model=List[CaseResponse])
def list_cases(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = CaseService(db)
    cases = service.list_cases_for_user(current_user)
    return [CaseResponse.model_validate(c) for c in cases]

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case_by_id(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = CaseService(db)
    audit_svc = AuditService(db)
    
    case_obj, decision = service.get_case_by_id(case_id, current_user)
    
    # Audit & access decision logging
    audit_svc.record_access_decision(
        user=current_user, case_id=case_id, document_id=None,
        action="VIEW_CASE", purpose="CASE_PASSPORT_VIEW", decision=decision
    )

    if not case_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found.")

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    return CaseResponse.model_validate(case_obj)

@router.post("/cases", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    if current_user.role not in ["Senior Officer", "Admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Senior Officers and Admins are authorized to create new cases."
        )

    service = CaseService(db)
    db_case = service.create_case(case_in, current_user)
    return CaseResponse.model_validate(db_case)

@router.put("/cases/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = CaseService(db)
    updated = service.update_case(case_id, case_update)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found.")
    return CaseResponse.model_validate(updated)
