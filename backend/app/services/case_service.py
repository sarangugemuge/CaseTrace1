from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.schemas.case import CaseCreate, CaseUpdate
from backend.app.services.access_control import evaluate_access

class CaseService:
    def __init__(self, db: Session):
        self.case_repo = CaseRepository(db)
        self.user_repo = UserRepository(db)

    def list_cases_for_user(self, user: UserModel) -> List[CaseModel]:
        all_cases = self.case_repo.list_all()
        user_assigned = user.assigned_case_ids or []
        
        authorized_cases = []
        for c in all_cases:
            decision = evaluate_access(
                user_role=user.role,
                user_assigned_cases=user_assigned,
                user_id=user.id,
                case_id=c.case_id,
                case_assigned_users=c.assigned_users or []
            )
            if decision["allowed"]:
                authorized_cases.append(c)
        return authorized_cases

    def get_case_by_id(self, case_id: str, user: UserModel) -> tuple[Optional[CaseModel], dict]:
        case_obj = self.case_repo.get_by_id(case_id)
        if not case_obj:
            return None, {"allowed": False, "reason": f"Case {case_id} not found."}

        user_assigned = user.assigned_case_ids or []
        decision = evaluate_access(
            user_role=user.role,
            user_assigned_cases=user_assigned,
            user_id=user.id,
            case_id=case_obj.case_id,
            case_assigned_users=case_obj.assigned_users or []
        )
        return case_obj, decision

    def create_case(self, case_in: CaseCreate, creator: UserModel) -> CaseModel:
        db_case = CaseModel(**case_in.model_dump())
        return self.case_repo.create(db_case)

    def update_case(self, case_id: str, case_update: CaseUpdate) -> Optional[CaseModel]:
        case_obj = self.case_repo.get_by_id(case_id)
        if not case_obj:
            return None
        return self.case_repo.update(case_obj, case_update.model_dump(exclude_unset=True))
