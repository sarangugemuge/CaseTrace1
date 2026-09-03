from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.models.document import DocumentModel

class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, document_id: str) -> Optional[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.id == document_id).first()

    def list_by_case(self, case_id: str) -> List[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.case_id == case_id).all()

    def get_by_hash(self, sha256_hash: str) -> Optional[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.sha256_hash == sha256_hash).first()

    def create(self, document: DocumentModel) -> DocumentModel:
        self.db.add(document)
        self.db.commit()
        self.db.refresh(document)
        return document
