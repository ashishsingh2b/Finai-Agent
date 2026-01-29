from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.utils.database import Base

class User(Base):
    """
    System User Profile.
    Stores identity, hashed credentials, and Role-Based Access Control (RBAC) levels.
    Roles mapping: analyst (default), manager, admin.
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Global Access Control
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    
    # Specific Functional Role
    role = Column(String, default="analyst")
    
    # Lifecycle Tracking
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.email} Role:{self.role}>"
 
