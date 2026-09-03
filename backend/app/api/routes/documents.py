from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.document import DocumentResponse
from backend.app.dependencies.auth import get_current_user
from backend.app.services.document_service import DocumentService
from backend.app.services.audit_service import AuditService

router = APIRouter()

@router.get("/cases/{case_id}/documents", response_model=List[DocumentResponse])
def get_case_documents(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = DocumentService(db)
    docs = service.get_case_documents(case_id, current_user)
    return [DocumentResponse.model_validate(d) for d in docs]

@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: str,
    action: str = Query("VIEW"),
    purpose: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = DocumentService(db)
    audit_svc = AuditService(db)

    doc, decision = service.get_document_by_id(document_id, current_user, action=action, purpose=purpose)

    # Record access decision into database
    audit_svc.record_access_decision(
        user=current_user, case_id=doc.case_id if doc else None, document_id=document_id,
        action=action, purpose=purpose, decision=decision
    )

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found.")

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    return DocumentResponse.model_validate(doc)
