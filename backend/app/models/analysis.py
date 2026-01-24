from sqlalchemy import Column, Integer, String, Numeric, JSON, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base
import enum

class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RecommendationType(str, enum.Enum):
    APPROVE = "APPROVE"
    APPROVE_WITH_CONDITIONS = "APPROVE_WITH_CONDITIONS"
    REJECT = "REJECT"

class ApplicationStatus(str, enum.Enum):
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class PaymentBehavior(str, enum.Enum):
    ON_TIME = "ON_TIME"
    DELINQUENT = "DELINQUENT"
    NA = "NA"

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Loan details
    requested_loan_amount = Column(Numeric(15, 2))
    approved_amount = Column(Numeric(15, 2))
    loan_term_months = Column(Integer)
    collateral_type = Column(Integer)  # 1-5
    credit_type = Column(String(20))   # 'NEW', 'RENEWED'
    
    # Financial Ratios
    current_ratio = Column(Numeric(10, 4))
    debt_to_assets = Column(Numeric(10, 4))
    leverage_ratio = Column(Numeric(10, 4))
    roe = Column(Numeric(10, 4))
    roa = Column(Numeric(10, 4))
    profit_margin = Column(Numeric(10, 4))
    ebitda_margin = Column(Numeric(10, 4))
    interest_coverage = Column(Numeric(10, 4))
    asset_turnover = Column(Numeric(10, 4))
    sales_trend = Column(Numeric(10, 4))
    net_income_coverage = Column(Numeric(10, 4))
    
    # Cycle ratios
    dso = Column(Numeric(10, 4))  # Days Sales Outstanding
    dio = Column(Numeric(10, 4))  # Days Inventory Outstanding
    dpo = Column(Numeric(10, 4))  # Days Payable Outstanding
    cash_conversion_cycle = Column(Numeric(10, 4))
    
    # Credit Scoring (40-30-30 model)
    credit_history_score = Column(Numeric(5, 2))
    solvency_score = Column(Numeric(5, 2))
    profitability_score = Column(Numeric(5, 2))
    total_credit_score = Column(Numeric(5, 2))
    credit_category = Column(String(1))  # A, B, C, D, E
    
    # Risk Assessment
    risk_level = Column(SQLEnum(RiskLevel, native_enum=False))
    profit_to_loan_ratio = Column(Numeric(10, 4))
    
    # SWOT Analysis (JSON)
    swot_analysis = Column(JSON)
    
    # Recommendation
    recommendation = Column(SQLEnum(RecommendationType, native_enum=False))
    recommendation_justification = Column(JSON)  # Array of reasons
    conditions = Column(JSON)  # Array of conditions if CONDITIONAL
    
    # Manual Status Tracking
    application_status = Column(SQLEnum(ApplicationStatus, native_enum=False), default=ApplicationStatus.UNDER_REVIEW)
    payment_behavior = Column(SQLEnum(PaymentBehavior, native_enum=False), default=PaymentBehavior.NA)
    
    # Interest Rate
    applicable_interest_rate = Column(Numeric(5, 4))
    tiie_rate_used = Column(Numeric(5, 4))
    
    # Language
    language = Column(String(2), default='es')  # 'es' or 'en'
    
    # Relationships
    company = relationship("Company", back_populates="analyses")
    
    analyzed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AnalysisResult Company:{self.company_id} Score:{self.total_credit_score} Category:{self.credit_category}>"
