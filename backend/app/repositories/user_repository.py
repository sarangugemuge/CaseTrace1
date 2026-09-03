from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.db.models.user import UserModel

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.email == email).first()

    def get_by_role(self, role: str) -> Optional[UserModel]:
        return self.db.query(UserModel).filter(UserModel.role == role).first()

    def list_all(self) -> List[UserModel]:
        return self.db.query(UserModel).all()

    def create(self, user: UserModel) -> UserModel:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
