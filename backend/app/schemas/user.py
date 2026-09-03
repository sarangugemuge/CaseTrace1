from pydantic import BaseModel, EmailStr, ConfigDict
from typing import List, Optional

class UserBase(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    department: str
    designation: str
    avatar: str
    assigned_case_ids: List[str] = []
    status: str = "ACTIVE"

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
