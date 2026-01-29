from sqlalchemy import Column, Integer, String, Numeric, JSON, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base
import enum

class RiskLevel(str, enum.Enum):
    """Qualitative risk categorization for the analysis."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class RecommendationType(str, enum.Enum):
    """Final automated decision type."""
    APPROVE = "APPROVE"
    APPROVE_WITH_CONDITIONS = "APPROVE_WITH_CONDITIONS"
    REJECT = "REJECT"

class ApplicationStatus(str, enum.Enum):
    """Manual lifecycle status of the credit application."""
    UNDER_REVIEW = "UNDER_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ValidationStatus(str, enum.Enum):
    """Integrity status of the extracted document data."""
    VALID = "VALID"
    WARNINGS = "WARNINGS"
    INVALID = "INVALID"

class PaymentBehavior(str, enum.Enum):
    """Historical/Current payment performance mapping."""
    ON_TIME = "ON_TIME"
    DELINQUENT = "DELINQUENT"
    NA = "NA"

class AnalysisResult(Base):
    """
    Core data model storing the complete 40-30-30 credit analysis.
    Persists structured financial ratios, AI-generated SWOT insights, 
    and the final algorithmic recommendation.
    """
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Loan specifics
    requested_loan_amount = Column(Numeric(15, 2))
    approved_amount = Column(Numeric(15, 2))
    loan_term_months = Column(Integer)
    collateral_type = Column(Integer)  # Coded 1-5 (Prime to Weak)
    credit_type = Column(String(20))   # e.g., 'NEW', 'RENEWAL'
    
    # Primary Financial Indicators
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
    
    # Operational Cycle Metrics
    dso = Column(Numeric(10, 4))  # Days Sales Outstanding (Receivables)
    dio = Column(Numeric(10, 4))  # Days Inventory Outstanding
    dpo = Column(Numeric(10, 4))  # Days Payable Outstanding
    cash_conversion_cycle = Column(Numeric(10, 4))
    
    # Credit Scoring Components (Reflecting the 40-30-30 model)
    credit_history_score = Column(Numeric(5, 2))  # 40% Weight
    solvency_score = Column(Numeric(5, 2))        # 30% Weight
    profitability_score = Column(Numeric(5, 2))   # 30% Weight
    total_credit_score = Column(Numeric(5, 2))    # 0-100 Aggregate
    credit_category = Column(String(1))           # Risk Band (A, B, C, D, E)
    
    # Risk and Decision Metrics
    risk_level = Column(SQLEnum(RiskLevel, native_enum=False))
    profit_to_loan_ratio = Column(Numeric(10, 4)) # Cobertura de Utilidad
    
    # Intelligent Insights
    swot_analysis = Column(JSON) # AI-generated matrix
    
    # Automated Logic Outputs
    recommendation = Column(SQLEnum(RecommendationType, native_enum=False))
    recommendation_justification = Column(JSON)  # Structured bullet points
    conditions = Column(JSON)                    # Required mitigants
    
    # Administrative Tracking
    application_status = Column(SQLEnum(ApplicationStatus, native_enum=False), default=ApplicationStatus.UNDER_REVIEW)
    payment_behavior = Column(SQLEnum(PaymentBehavior, native_enum=False), default=PaymentBehavior.NA)
    
    # Applied Financial Parameters
    applicable_interest_rate = Column(Numeric(5, 4)) # Risk-based spread
    tiie_rate_used = Column(Numeric(5, 4))           # Base benchmark (e.g., 0.1125)
    
    # Document Integrity
    validation_status = Column(SQLEnum(ValidationStatus, native_enum=False), default=ValidationStatus.VALID)
    validation_alerts = Column(JSON)  # Blocking or non-blocking warnings
    
    # Context Metadata
    language = Column(String(2), default='es') # Preferred report language
    
    # ORM Mappings
    company = relationship("Company", back_populates="analyses")
    analyzed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<AnalysisResult ID:{self.id} Category:{self.credit_category} Decision:{self.recommendation}>"
