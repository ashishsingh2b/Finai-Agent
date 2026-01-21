from pydantic import BaseModel
from typing import Optional, List, Dict

class CompanyCreate(BaseModel):
    name: str
    industry: Optional[str] = None
    years_in_business: Optional[int] = None

class CompanyResponse(BaseModel):
    id: int
    name: str
    industry: Optional[str] = None
    
    class Config:
        from_attributes = True

class FinancialStatementCreate(BaseModel):
    year: int
    cash: float = 0
    accounts_receivable: float = 0
    inventory: float = 0
    current_assets: float = 0
    fixed_assets: float = 0
    total_assets: float = 0
    accounts_payable: float = 0
    current_liabilities: float = 0
    long_term_liabilities: float = 0
    total_liabilities: float = 0
    shareholder_equity: float = 0
    revenue: float = 0
    cost_of_goods_sold: float = 0
    gross_profit: float = 0
    operating_expenses: float = 0
    ebitda: float = 0
    interest_expense: float = 0
    net_profit: float = 0

class AnalysisResponse(BaseModel):
    id: int
    company_id: int
    company_name: str
    credit_category: str
    total_credit_score: float
    recommendation: str
    swot_analysis: Optional[Dict] = None
    justification: Optional[List[str]] = None
    conditions: Optional[List[str]] = None
    
    application_status: str
    payment_behavior: str
    
    # Financial ratios
    current_ratio: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    debt_to_assets: Optional[float] = None
    profit_margin: Optional[float] = None
    
    # Company detail fallbacks/merges
    company_industry: Optional[str] = None
    years_in_business: Optional[int] = None
    top_clients: Optional[str] = None
    fiscal_status: Optional[str] = None
    
    class Config:
        from_attributes = True

class AnalysisUpdateStatus(BaseModel):
    application_status: Optional[str] = None
    payment_behavior: Optional[str] = None
