from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.models.case import CaseModel

class CaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, case_id: str) -> Optional[CaseModel]:
        return self.db.query(CaseModel).filter(CaseModel.case_id == case_id).first()

    def get_by_number(self, case_number: str) -> Optional[CaseModel]:
        return self.db.query(CaseModel).filter(CaseModel.case_number == case_number).first()

    def list_all(self) -> List[CaseModel]:
        return self.db.query(CaseModel).order_by(CaseModel.created_at.desc()).all()

    def create(self, case: CaseModel) -> CaseModel:
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    def update(self, case: CaseModel, update_data: dict) -> CaseModel:
        for field, value in update_data.items():
            if hasattr(case, field) and value is not None:
                setattr(case, field, value)
        self.db.commit()
        self.db.refresh(case)
        return case
