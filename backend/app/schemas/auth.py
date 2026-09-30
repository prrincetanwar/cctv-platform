from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1, max_length=200)

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
