from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    industry = Column(String)
    years_in_business = Column(Integer)
    fiscal_status = Column(String)
    top_clients = Column(Text)  # JSON string or comma-separated
    
    # Relationships
    financial_statements = relationship("FinancialStatement", back_populates="company", cascade="all, delete-orphan")
    analyses = relationship("AnalysisResult", back_populates="company", cascade="all, delete-orphan")
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<Company {self.name}>"
