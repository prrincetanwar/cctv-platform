from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.dependencies import get_current_user
from app.core.security import create_access_token, verify_password
from app.db.session_dependency import get_db
from app.models.user import User
from app.services.audit import record_audit
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.username == payload.username))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        record_audit(
            db,
            user_id=user.id if user else None,
            action="LOGIN_FAILURE",
            resource_type="AUTHENTICATION",
            resource_id=str(user.id) if user else None,
            description="Login failed",
            details={"username": payload.username},
        )
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    token = create_access_token(user.id, user.username, user.role)
    record_audit(
        db,
        user_id=user.id,
        action="LOGIN_SUCCESS",
        resource_type="AUTHENTICATION",
        resource_id=str(user.id),
        description="Login succeeded",
        details={"username": user.username},
    )
    db.commit()
    return LoginResponse(access_token=token, token_type="bearer", user=UserResponse.model_validate(user, from_attributes=True))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
