from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.document import DocumentResponse, DocumentVerificationResult
from backend.app.dependencies.auth import get_current_user
from backend.app.services.document_service import DocumentService

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
    doc, decision = service.get_document_by_id(document_id, current_user, action=action, purpose=purpose)

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found.")

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    return DocumentResponse.model_validate(doc)

@router.post("/cases/{case_id}/documents/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_case_document(
    case_id: str,
    file: UploadFile = File(...),
    category: str = Form("EVIDENCE"),
    sensitivity: str = Form("CONFIDENTIAL"),
    purpose: str = Form("INVESTIGATION"),
    evidence_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload an empty file (0 bytes)."
        )
    if len(content) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds maximum allowed limit of 50MB."
        )

    service = DocumentService(db)
    doc, decision = service.upload_document(
        case_id=case_id,
        filename=file.filename or "uploaded_file.dat",
        content=content,
        mime_type=file.content_type or "application/octet-stream",
        category=category,
        sensitivity=sensitivity,
        user=current_user,
        purpose=purpose,
        evidence_id=evidence_id
    )

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    if not doc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Document upload processing failed.")

    return DocumentResponse.model_validate(doc)

@router.get("/documents/{document_id}/download")
def download_case_document(
    document_id: str,
    purpose: Optional[str] = Query("INVESTIGATION"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = DocumentService(db)
    content, doc, decision = service.download_document(document_id, current_user, purpose=purpose)

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document {document_id} not found.")

    if not decision["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision["reason"])

    if content is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Document content unavailable.")

    return Response(
        content=content,
        media_type=doc.mime_type or "application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{doc.name}"',
            "X-SHA256-Hash": doc.sha256_hash
        }
    )

@router.post("/documents/{document_id}/verify", response_model=DocumentVerificationResult)
def verify_document_integrity(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = DocumentService(db)
    result = service.verify_document_integrity(document_id, current_user)
    return DocumentVerificationResult(**result)

@router.delete("/documents/{document_id}")
def delete_case_document(
    document_id: str,
    purpose: Optional[str] = Query("ADMINISTRATIVE"),
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    service = DocumentService(db)
    success, res = service.delete_document(document_id, current_user, purpose=purpose)

    if not res["allowed"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=res["reason"])

    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=res["reason"])

    return {"status": "success", "message": res["reason"]}
