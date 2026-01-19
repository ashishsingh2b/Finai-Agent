from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

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

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
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
    """Login and get access token"""
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
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user info"""
    return current_user

@router.put("/me", response_model=UserResponse)
def update_user_me(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update current user info"""
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name

    if user_update.password is not None:
        current_user.hashed_password = get_password_hash(user_update.password)
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    return current_user

# Password Reset
from app.services.email_service import EmailService
from pydantic import BaseModel, EmailStr
import secrets
from datetime import datetime, timedelta as td
import logging

logger = logging.getLogger(__name__)

# Store reset tokens temporarily (in production, use Redis or database)
reset_tokens = {}

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    '''Request password reset email'''
    logger.info(f"Password reset requested for: {request.email}")
    
    user = db.query(User).filter(User.email == request.email).first()
    
    if not user:
        # Don't reveal if email exists
        logger.warning(f"Password reset requested for non-existent email: {request.email}")
        return {"message": "If the email exists, a reset link has been sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_tokens[reset_token] = {
        'email': request.email,
        'expires': datetime.now() + td(hours=1)
    }
    
    logger.info(f"Generated reset token for: {request.email}")
    
    # Send email
    try:
        email_service = EmailService()
        reset_url = "http://localhost:5173/reset-password"  # Frontend URL
        
        success = email_service.send_password_reset_email(
            to_email=request.email,
            reset_token=reset_token,
            reset_url=reset_url
        )
        
        if success:
            logger.info(f"Password reset email sent successfully to: {request.email}")
            return {"message": "If the email exists, a reset link has been sent"}
        else:
            logger.error(f"Failed to send password reset email to: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send email. Please try again later."
            )
    except Exception as e:
        logger.error(f"Error sending password reset email: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}"
        )

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    '''Reset password with token'''
    logger.info(f"Password reset attempt with token")
    
    if request.token not in reset_tokens:
        logger.warning("Invalid or expired reset token used")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    token_data = reset_tokens[request.token]
    
    # Check expiration
    if datetime.now() > token_data['expires']:
        del reset_tokens[request.token]
        logger.warning(f"Expired reset token used for: {token_data['email']}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    
    # Update password
    user = db.query(User).filter(User.email == token_data['email']).first()
    if not user:
        logger.error(f"User not found for email: {token_data['email']}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.hashed_password = get_password_hash(request.new_password)
    db.add(user)
    db.commit()
    
    # Remove used token
    del reset_tokens[request.token]
    
    logger.info(f"Password reset successful for: {token_data['email']}")
    return {"message": "Password reset successful"}
