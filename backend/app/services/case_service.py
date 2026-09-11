import hashlib
import uuid
from sqlalchemy.orm import Session
from typing import List, Optional, Tuple, Dict, Any
from backend.app.repositories.case_repository import CaseRepository
from backend.app.repositories.user_repository import UserRepository
from backend.app.db.models.user import UserModel
from backend.app.db.models.case import CaseModel
from backend.app.schemas.case import CaseCreate, CaseUpdate
from backend.app.services.access_control import evaluate_access

class CaseService:
    def __init__(self, db: Session):
        self.db = db
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

    def get_case_by_id(self, case_id: str, user: UserModel) -> Tuple[Optional[CaseModel], dict]:
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
        case_data = case_in.model_dump()
        if not case_data.get("case_id"):
            case_data["case_id"] = case_data["case_number"]
        if not case_data.get("blockchain_anchor_id"):
            token = f"{case_data['case_number']}-{case_data['incident_date']}-{uuid.uuid4().hex}"
            case_data["blockchain_anchor_id"] = f"0x{hashlib.sha256(token.encode()).hexdigest()}"

        assigned = list(case_data.get("assigned_users") or [])
        if creator.id and creator.id not in assigned:
            assigned.append(creator.id)
        case_data["assigned_users"] = assigned

        db_case = CaseModel(**case_data)
        return self.case_repo.create(db_case)

    def update_case(
        self, case_id: str, case_update: CaseUpdate, user: UserModel
    ) -> Tuple[Optional[CaseModel], Dict[str, Any]]:
        case_obj = self.case_repo.get_by_id(case_id)
        if not case_obj:
            return None, {"allowed": False, "reason": f"Case {case_id} not found."}

        # Role-based case editing permissions (Req 17 & 41)
        user_assigned = user.assigned_case_ids or []
        case_assigned = case_obj.assigned_users or []
        is_assigned = (case_id in user_assigned) or (user.id in case_assigned)

        can_edit = (
            user.role in ["Senior Officer", "Admin"] or
            (user.role == "Investigating Officer" and is_assigned)
        )

        if not can_edit:
            return None, {
                "allowed": False,
                "reason": f"Clearance Denied: Role '{user.role}' is not authorized to edit case {case_id}."
            }

        update_dict = case_update.model_dump(exclude_unset=True)
        changes = []
        for field, new_val in update_dict.items():
            old_val = getattr(case_obj, field, None)
            if old_val != new_val:
                changes.append({
                    "field": field,
                    "previous_value": str(old_val),
                    "new_value": str(new_val)
                })

        updated_case = self.case_repo.update(case_obj, update_dict)
        return updated_case, {"allowed": True, "changes": changes}
