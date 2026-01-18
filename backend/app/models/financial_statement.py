from sqlalchemy import Column, Integer, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base

class FinancialStatement(Base):
    __tablename__ = "financial_statements"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    year = Column(Integer, nullable=False)
    
    # Balance Sheet - Assets
    cash = Column(Numeric(15, 2), default=0)
    accounts_receivable = Column(Numeric(15, 2), default=0)
    inventory = Column(Numeric(15, 2), default=0)
    current_assets = Column(Numeric(15, 2), default=0)
    fixed_assets = Column(Numeric(15, 2), default=0)
    total_assets = Column(Numeric(15, 2), default=0)
    
    # Balance Sheet - Liabilities
    accounts_payable = Column(Numeric(15, 2), default=0)
    current_liabilities = Column(Numeric(15, 2), default=0)
    long_term_liabilities = Column(Numeric(15, 2), default=0)
    total_liabilities = Column(Numeric(15, 2), default=0)
    
    # Balance Sheet - Equity
    shareholder_equity = Column(Numeric(15, 2), default=0)
    
    # Income Statement
    revenue = Column(Numeric(15, 2), default=0)
    cost_of_goods_sold = Column(Numeric(15, 2), default=0)
    gross_profit = Column(Numeric(15, 2), default=0)
    operating_expenses = Column(Numeric(15, 2), default=0)
    ebitda = Column(Numeric(15, 2), default=0)
    interest_expense = Column(Numeric(15, 2), default=0)
    net_profit = Column(Numeric(15, 2), default=0)
    
    # Relationships
    company = relationship("Company", back_populates="financial_statements")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<FinancialStatement Company:{self.company_id} Year:{self.year}>"
