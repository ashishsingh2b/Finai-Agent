from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import logging
from typing import Dict, Any
from pydantic import BaseModel, EmailStr

from app.utils.database import get_db
from app.utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token, UserUpdate
from app.api.deps import get_current_active_user
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# In-memory token storage (Production recommendation: Redis or DB table)
reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new system user.
    Checks for email uniqueness and hashes passwords before persistence.
    """
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login.
    Validates credentials and returns a JWT access token.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Retrieve clinical data for the currently authenticated user.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update profile information for the authenticated user.
    Handles optional field updates for name and password.
    """
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiate password recovery flow.
    Generates a secure token and dispatches a recovery email if the user exists.
    """
    logger.info(f"Password reset requested for: {request.email}")
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Security: Obfuscate user existence
        logger.warning(f"Reset requested for unknown email: {request.email}")
        return {"message": "Recovery instructions sent if the account exists."}
    
    # Generate 1-hour secure reset token
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        'email': request.email,
        'expires': datetime.now() + timedelta(hours=1)
    }
    
    try:
        email_service = EmailService()
        # Note: In production, the reset_url should be fetched from environment config
        reset_url = "http://localhost:5173/reset-password"
        
        success = email_service.send_password_reset_email(
            to_email=request.email,
            reset_token=reset_token,
            reset_url=reset_url
        )
        
        if success:
            return {"message": "Recovery instructions sent if the account exists."}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Email delivery services temporarily unavailable."
            )
    except Exception as e:
        logger.error(f"Critical failure in forgot_password flow: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal error occurred during processing."
        )

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Finalize password recovery using a valid secure token.
    Updates the hashed password and invalidates the single-use token.
    """
    if request.token not in reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is invalid or has already been used."
        )
    
    token_data = reset_tokens[request.token]
    
    if datetime.now() > token_data['expires']:
        del reset_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recovery token has expired."
        )
    
    user = db.query(User).filter(User.email == token_data['email']).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account no longer exists."
        )
    
    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    db.commit()
    
    # Invalidate token after successful reset
    del reset_tokens[request.token]
    
    logger.info(f"Successful password reset for: {token_data['email']}")
    return {"message": "Password updated successfully."}

