from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.db.models.document import DocumentModel
from backend.app.db.models.case import CaseModel
from backend.app.db.models.user import UserModel
from backend.app.schemas.document import DocumentResponse
from backend.app.dependencies.auth import get_current_user
from backend.app.services.access_control import evaluate_access

router = APIRouter()

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_case_documents(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    case_obj = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found.")

    # Check Case Level Access
    user_assigned_cases = current_user.assigned_case_ids or []
    case_decision = evaluate_access(
        user_role=current_user.role,
        user_assigned_cases=user_assigned_cases,
        user_id=current_user.id,
        case_id=case_id,
        case_assigned_users=case_obj.assigned_users or []
    )
    if not case_decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=case_decision["reason"])

    docs = db.query(DocumentModel).filter(DocumentModel.case_id == case_id).all()
    
    # Filter documents by sensitivity role clearance
    accessible_docs = []
    for d in docs:
        doc_decision = evaluate_access(
            user_role=current_user.role,
            user_assigned_cases=user_assigned_cases,
            user_id=current_user.id,
            case_id=case_id,
            case_assigned_users=case_obj.assigned_users or [],
            document_sensitivity=d.sensitivity,
            action="VIEW"
        )
        # If sensitivity level is allowed (even if purpose is required later), display doc in directory
        if doc_decision["policy_id"] != "POL-SENSITIVITY-RESTRICTED-01":
            accessible_docs.append(d)

    return [DocumentResponse.model_validate(d) for d in accessible_docs]

@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: str,
    action: str = Query("VIEW"),
    purpose: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    doc = db.query(DocumentModel).filter(DocumentModel.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found.")

    case_obj = db.query(CaseModel).filter(CaseModel.case_id == doc.case_id).first()
    user_assigned_cases = current_user.assigned_case_ids or []
    
    decision = evaluate_access(
        user_role=current_user.role,
        user_assigned_cases=user_assigned_cases,
        user_id=current_user.id,
        case_id=doc.case_id,
        case_assigned_users=case_obj.assigned_users if case_obj else [],
        document_sensitivity=doc.sensitivity,
        action=action,
        purpose=purpose
    )

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    return DocumentResponse.model_validate(doc)
