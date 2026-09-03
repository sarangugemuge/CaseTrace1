from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.database import get_db
from backend.app.db.models.case import CaseModel
from backend.app.db.models.user import UserModel
from backend.app.schemas.case import CaseResponse, CaseCreate, CaseUpdate
from backend.app.dependencies.auth import get_current_user
from backend.app.services.access_control import evaluate_access

router = APIRouter()

@router.get("/cases", response_model=List[CaseResponse])
def list_cases(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    all_cases = db.query(CaseModel).all()
    
    # Filter cases by access policy
    authorized_cases = []
    user_assigned_cases = current_user.assigned_case_ids or []
    
    for c in all_cases:
        decision = evaluate_access(
            user_role=current_user.role,
            user_assigned_cases=user_assigned_cases,
            user_id=current_user.id,
            case_id=c.case_id,
            case_assigned_users=c.assigned_users or []
        )
        if decision["allowed"]:
            authorized_cases.append(c)
            
    return [CaseResponse.model_validate(c) for c in authorized_cases]

@router.get("/cases/{case_id}", response_model=CaseResponse)
def get_case_by_id(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    c = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found.")

    user_assigned_cases = current_user.assigned_case_ids or []
    decision = evaluate_access(
        user_role=current_user.role,
        user_assigned_cases=user_assigned_cases,
        user_id=current_user.id,
        case_id=c.case_id,
        case_assigned_users=c.assigned_users or []
    )
    
    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    return CaseResponse.model_validate(c)

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

    db_case = CaseModel(**case_in.model_dump())
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return CaseResponse.model_validate(db_case)

@router.put("/cases/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    case_update: CaseUpdate,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    c = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found.")

    update_data = case_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(c, field, value)

    db.commit()
    db.refresh(c)
    return CaseResponse.model_validate(c)
