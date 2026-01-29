from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    """Schema for new user registration and administrative account creation."""
    email: EmailStr
    full_name: str
    password: str
    role: str = "analyst"

class UserLogin(BaseModel):
    """Schema for secure login credential submission."""
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    """Schema for partial profile or password updates."""
    full_name: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    """Public schema for user information retrieval (sensitive fields excluded)."""
    id: int
    email: str
    full_name: str
    is_active: bool
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    """OAuth2 compatible Bearer token response."""
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """Decoded JWT payload data."""
    email: Optional[str] = None
