from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.models.user import UserModel
from backend.app.schemas.user import UserResponse, Token, LoginRequest
from backend.app.core.security import verify_password, create_access_token
from backend.app.dependencies.auth import get_current_user

router = APIRouter()

@router.post("/auth/login", response_model=Token)
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.email == login_req.email).first()
    if not user:
        # Check by user ID or role name for demo convenience
        user = db.query(UserModel).filter((UserModel.id == login_req.email) | (UserModel.role == login_req.email)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or demo persona not found."
        )
    
    token = create_access_token(subject=user.id)
    return Token(access_token=token, user=UserResponse.model_validate(user))

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: UserModel = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)
