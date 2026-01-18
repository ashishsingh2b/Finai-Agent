# Backend Development Plan - Moskalti Capital AI Credit Analysis System

**Project**: AI-Powered Credit Analysis Platform  
**Phase**: Backend Development  
**Duration**: 5-6 days  
**Stack**: Python, FastAPI, PostgreSQL, Docker

---

## 🎯 Backend Development Goals

Build a robust, scalable backend API that:
- ✅ Handles Excel/PDF file uploads
- ✅ Extracts and validates financial data
- ✅ Calculates all 18+ financial ratios (matching Excel template)
- ✅ Implements the 40-30-30 credit scoring model
- ✅ Generates SWOT analysis using AI
- ✅ Provides credit recommendations
- ✅ Exports reports (PDF, Excel, JSON)
- ✅ Supports multi-language (Spanish/English)
- ✅ Includes authentication & authorization

---

## 📋 Phase 1: Project Setup & Authentication (Day 1)

### 1.1 Initialize Project Structure

```bash
mkdir moskalti-credit-analysis
cd moskalti-credit-analysis

# Backend structure
mkdir backend
cd backend
mkdir -p app/{api,models,schemas,services,utils,i18n,tests}
mkdir -p app/api/{routes,deps}
mkdir -p app/services/{file_processing,financial,ai,reports}
mkdir -p app/tests/{unit,integration}
```

### 1.2 Setup Virtual Environment & Dependencies

**Create `requirements.txt`**:
```txt
# Core framework
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.25
psycopg2-binary==2.9.9
alembic==1.13.1

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-dotenv==1.0.0
bcrypt==4.1.2

# File processing
openpyxl==3.1.2
pandas==2.1.4
numpy==1.26.3
pdfplumber==0.10.3
pytesseract==0.3.10  # OCR (if PDF extraction needed)
PyPDF2==3.0.1

# AI/ML
langchain==0.1.0
openai==1.10.0
langchain-openai==0.0.5

# Reports
reportlab==4.0.9
weasyprint==60.2
xlsxwriter==3.1.9

# Utilities
pydantic==2.5.3
email-validator==2.1.0
```

**Install dependencies**:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 1.3 Environment Configuration

**Create `.env`**:
```env
# Application
APP_NAME=Moskalti Credit Analysis
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production

# Database
DATABASE_URL=postgresql://moskalti_user:password@localhost:5432/moskalti_credit

# JWT Authentication
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key

# File Upload
MAX_UPLOAD_SIZE_MB=50
ALLOWED_EXTENSIONS=xlsx,xls,pdf

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# TIIE API (if auto-fetch)
TIIE_API_URL=https://www.banxico.org.mx/SieAPIRest/service/v1/
BANXICO_API_TOKEN=your-banxico-token
```

### 1.4 Database Configuration

**Create `app/utils/database.py`**:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 1.5 Authentication System

**Create `app/models/user.py`**:
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.utils.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default="analyst")  # analyst, manager, admin
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

**Create `app/schemas/user.py`**:
```python
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "analyst"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
```

**Create `app/utils/security.py`**:
```python
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

**Create `app/api/deps.py`** (Authentication dependency):
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.utils.security import verify_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user
```

**Create `app/api/routes/auth.py`**:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from app.utils.database import get_db
from app.utils.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
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
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user
```

**✅ Day 1 Deliverable**: Authentication system with user registration, login, and JWT tokens

---

## 📋 Phase 2: Database Models & Schemas (Day 2)

### 2.1 Company Profile Model

**Create `app/models/company.py`**:
```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
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
    top_clients = Column(String)  # JSON string
    
    # Relationships
    financial_statements = relationship("FinancialStatement", back_populates="company")
    analyses = relationship("AnalysisResult", back_populates="company")
    
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
```

### 2.2 Financial Statement Model

**Create `app/models/financial.py`**:
```python
from sqlalchemy import Column, Integer, String, Numeric, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.utils.database import Base

class FinancialStatement(Base):
    __tablename__ = "financial_statements"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    year = Column(Integer, nullable=False)
    
    # Balance Sheet - Assets
    cash = Column(Numeric(15, 2))
    accounts_receivable = Column(Numeric(15, 2))
    inventory = Column(Numeric(15, 2))
    current_assets = Column(Numeric(15, 2))
    fixed_assets = Column(Numeric(15, 2))
    total_assets = Column(Numeric(15, 2))
    
    # Balance Sheet - Liabilities
    accounts_payable = Column(Numeric(15, 2))
    current_liabilities = Column(Numeric(15, 2))
    long_term_liabilities = Column(Numeric(15, 2))
    total_liabilities = Column(Numeric(15, 2))
    
    # Balance Sheet - Equity
    shareholder_equity = Column(Numeric(15, 2))
    
    # Income Statement
    revenue = Column(Numeric(15, 2))
    cost_of_goods_sold = Column(Numeric(15, 2))
    gross_profit = Column(Numeric(15, 2))
    operating_expenses = Column(Numeric(15, 2))
    ebitda = Column(Numeric(15, 2))
    interest_expense = Column(Numeric(15, 2))
    net_profit = Column(Numeric(15, 2))
    
    # Relationships
    company = relationship("Company", back_populates="financial_statements")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### 2.3 Analysis Result Model

**Create `app/models/analysis.py`**:
```python
from sqlalchemy import Column, Integer, String, Numeric, JSON, ForeignKey, DateTime, Enum
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

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    # Loan details
    requested_loan_amount = Column(Numeric(15, 2))
    loan_term_months = Column(Integer)
    collateral_type = Column(Integer)  # 1-5
    
    # Financial Ratios
    current_ratio = Column(Numeric(10, 4))
    debt_to_assets = Column(Numeric(10, 4))
    leverage_ratio = Column(Numeric(10, 4))
    roe = Column(Numeric(10, 4))
    roa = Column(Numeric(10, 4))
    profit_margin = Column(Numeric(10, 4))
    interest_coverage = Column(Numeric(10, 4))
    
    # Credit Scoring
    credit_history_score = Column(Numeric(5, 2))
    solvency_score = Column(Numeric(5, 2))
    profitability_score = Column(Numeric(5, 2))
    total_credit_score = Column(Numeric(5, 2))
    credit_category = Column(String(1))  # A, B, C, D, E
    
    # Risk Assessment
    risk_level = Column(Enum(RiskLevel))
    profit_to_loan_ratio = Column(Numeric(10, 4))
    
    # SWOT Analysis (JSON)
    swot_analysis = Column(JSON)
    
    # Recommendation
    recommendation = Column(Enum(RecommendationType))
    recommendation_justification = Column(JSON)  # Array of reasons
    conditions = Column(JSON)  # Array of conditions if CONDITIONAL
    
    # Interest Rate
    applicable_interest_rate = Column(Numeric(5, 4))
    tiie_rate_used = Column(Numeric(5, 4))
    
    # Language
    language = Column(String(2), default='es')  # 'es' or 'en'
    
    # Relationships
    company = relationship("Company", back_populates="analyses")
    
    analyzed_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### 2.4 Initialize Database

**Create `alembic.ini`** (for migrations):
```bash
alembic init alembic
```

**Update `alembic/env.py`**:
```python
from app.utils.database import Base
from app.models.user import User
from app.models.company import Company
from app.models.financial import FinancialStatement
from app.models.analysis import AnalysisResult

target_metadata = Base.metadata
```

**Create first migration**:
```bash
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

**✅ Day 2 Deliverable**: Complete database schema with all models

---

## 📋 Phase 3: File Processing & Data Extraction (Day 3)

### 3.1 Excel File Processor

**Create `app/services/file_processing/excel_parser.py`**:
```python
import openpyxl
import pandas as pd
from typing import Dict, List, Any

class ExcelParser:
    def __init__(self, file_path: str):
        self.file_path = file_path
        self.workbook = openpyxl.load_workbook(file_path, data_only=False)
    
    def extract_balance_sheet(self, sheet_name='BG', years_columns=None):
        """
        Extract balance sheet data from BG sheet
        Matches structure: Columns B-G for years 2021-2026
        """
        if years_columns is None:
            years_columns = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
        
        ws = self.workbook[sheet_name]
        balance_sheet_data = {}
        
        # Define cell mappings based on Excel template analysis
        cell_mappings = {
            'cash': 11,  # Row 11: Efectivo
            'accounts_receivable': 12,  # Row 12: Clientes
            'inventory': 13,  # Row 13: Inventario
            'current_assets': 21,  # Row 21: Total activo circulante
            'fixed_assets': 23,  # Row 23: Activo Fijo
            'total_assets': 31,  # Row 31: Total del activo
            'accounts_payable': 33,  # Row 33: Proveedores
            'current_liabilities': 42,  # Row 42: Total pasivo circulante
            'long_term_liabilities': 46,  # Row 46: Total pasivo largo plazo
            'total_liabilities': 54,  # Row 54: Total del pasivo
            'shareholder_equity': 62,  # Row 62: Total capital contable
        }
        
        for year_col, year in years_columns.items():
            year_data = {}
            for field, row in cell_mappings.items():
                cell_value = ws[f'{year_col}{row}'].value
                year_data[field] = float(cell_value) if cell_value else 0.0
            
            balance_sheet_data[year] = year_data
        
        return balance_sheet_data
    
    def extract_income_statement(self, sheet_name='ER', years_columns=None):
        """
        Extract income statement data from ER sheet
        """
        if years_columns is None:
            years_columns = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
        
        ws = self.workbook[sheet_name]
        income_statement_data = {}
        
        cell_mappings = {
            'revenue': 10,  # Row 10: Ingresos
            'cost_of_goods_sold': 12,  # Row 12: Costo de Ventas
            'gross_profit': 14,  # Row 14: Utilidad Bruta
            'operating_expenses': 16,  # Row 16: Gastos de operación
            'ebitda': 21,  # Row 21: EBITDA (Utilidad antes de productos financieros)
            'interest_expense': 27,  # Row 27: Gastos financieros
            'net_profit': 37,  # Row 37: Utilidad Neta (adjust based on actual template)
        }
        
        for year_col, year in years_columns.items():
            year_data = {}
            for field, row in cell_mappings.items():
                cell_value = ws[f'{year_col}{row}'].value
                year_data[field] = float(cell_value) if cell_value else 0.0
            
            income_statement_data[year] = year_data
        
        return income_statement_data
    
    def extract_company_info(self, sheet_name='BG'):
        """Extract company name and basic info"""
        ws = self.workbook[sheet_name]
        company_name = ws['A5'].value  # "Prospecto: TA SOLUCIONES"
        
        if company_name and ":" in company_name:
            company_name = company_name.split(":")[1].strip()
        
        return {
            'name': company_name,
            'industry': '',  # To be filled manually or from other source
            'years_in_business': None,
        }
    
    def validate_data(self, balance_sheet_data: Dict, income_statement_data: Dict):
        """
        Validate extracted data
        - Check Assets = Liabilities + Equity
        - Check for missing critical fields
        """
        errors = []
        
        for year, bs in balance_sheet_data.items():
            # Balance sheet equation
            total_liab_equity = bs['total_liabilities'] + bs['shareholder_equity']
            if abs(bs['total_assets'] - total_liab_equity) > 0.01:  # Allow small rounding errors
                errors.append(f"Year {year}: Assets != Liabilities + Equity")
        
        return errors
```

### 3.2 PDF File Processor (if implemented)

**Create `app/services/file_processing/pdf_extractor.py`**:
```python
import pdfplumber
import re
from typing import Dict, List

class PDFExtractor:
    def __init__(self, file_path: str):
        self.file_path = file_path
    
    def extract_tables(self):
        """Extract tables from PDF using pdfplumber"""
        with pdfplumber.open(self.file_path) as pdf:
            tables = []
            for page in pdf.pages:
                page_tables = page.extract_tables()
                tables.extend(page_tables)
            return tables
    
    def identify_financial_statements(self, tables: List):
        """
        Identify which tables are balance sheet vs income statement
        Based on keywords like "ACTIVO", "PASIVO", "INGRESOS", etc.
        """
        # Implementation based on actual PDF structure
        # This is a placeholder
        pass
    
    def extract_balance_sheet_from_pdf(self):
        """Extract balance sheet from PDF"""
        # OCR + pattern matching logic
        # This would be complex and require actual PDF samples
        pass
```

**✅ Day 3 Deliverable**: Excel parsing working perfectly, PDF extraction (basic if needed)

---

## 📋 Phase 4: Financial Calculations Engine (Day 4)

### 4.1 Financial Calculator Service

**Create `app/services/financial/calculator.py`**:
```python
from typing import Dict, List
import numpy as np

class FinancialCalculator:
    @staticmethod
    def calculate_current_ratio(current_assets: float, current_liabilities: float) -> float:
        """Activo Circulante / Pasivo a Corto Plazo"""
        if current_liabilities == 0:
            return 0.0
        return current_assets / current_liabilities
    
    @staticmethod
    def calculate_debt_to_assets(total_liabilities: float, total_assets: float) -> float:
        """Deuda Total / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return total_liabilities / total_assets
    
    @staticmethod
    def calculate_leverage(total_liabilities: float, equity: float) -> float:
        """Apalancamiento"""
        if equity == 0:
            return 0.0
        return total_liabilities / equity
    
    @staticmethod
    def calculate_fixed_asset_ratio(fixed_assets: float, total_assets: float) -> float:
        """Activos Fijos / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return fixed_assets / total_assets
    
    @staticmethod
    def calculate_dso(accounts_receivable: float, annual_sales: float) -> float:
        """Days Sales Outstanding"""
        if annual_sales == 0:
            return 0.0
        return (accounts_receivable / annual_sales) * 360
    
    @staticmethod
    def calculate_dio(inventory: float, cogs: float) -> float:
        """Days Inventory Outstanding"""
        if cogs == 0:
            return 0.0
        return (inventory / cogs) * 360
    
    @staticmethod
    def calculate_dpo(accounts_payable: float, cogs: float) -> float:
        """Days Payable Outstanding"""
        if cogs == 0:
            return 0.0
        return (accounts_payable / cogs) * 360
    
    @staticmethod
    def calculate_cash_conversion_cycle(dso: float, dio: float, dpo: float) -> float:
        """Ciclo Financiero"""
        return dso + dio - dpo
    
    @staticmethod
    def calculate_profit_margin(net_profit: float, revenue: float) -> float:
        """Margen Utilidad"""
        if revenue == 0:
            return 0.0
        return (net_profit / revenue) * 100
    
    @staticmethod
    def calculate_ebitda_margin(ebitda: float, revenue: float) -> float:
        """Margen UAFIR"""
        if revenue == 0:
            return 0.0
        return (ebitda / revenue) * 100
    
    @staticmethod
    def calculate_roa(net_profit: float, total_assets: float) -> float:
        """ROA"""
        if total_assets == 0:
            return 0.0
        return (net_profit / total_assets) * 100
    
    @staticmethod
    def calculate_roe(net_profit: float, equity: float) -> float:
        """ROE"""
        if equity == 0:
            return 0.0
        return (net_profit / equity) * 100
    
    @staticmethod
    def calculate_asset_turnover(revenue: float, total_assets: float) -> float:
        """Ventas / Activos Totales"""
        if total_assets == 0:
            return 0.0
        return revenue / total_assets
    
    @staticmethod
    def calculate_3year_average_profit(profits: List[float]) -> float:
        """Promedio últimos 3 años"""
        return np.mean(profits) if len(profits) >= 3 else 0.0
    
    @staticmethod
    def calculate_profit_to_loan_ratio(avg_profit: float, loan_amount: float) -> float:
        """Margen de utilidad / Préstamo"""
        if loan_amount == 0:
            return 0.0
        return avg_profit / loan_amount
    
    @staticmethod
    def calculate_all_ratios(balance_sheet: Dict, income_statement: Dict, loan_amount: float = None) -> Dict:
        """Calculate all ratios at once"""
        ratios = {
            # Solvency
            'current_ratio': FinancialCalculator.calculate_current_ratio(
                balance_sheet['current_assets'], balance_sheet['current_liabilities']
            ),
            'debt_to_assets': FinancialCalculator.calculate_debt_to_assets(
                balance_sheet['total_liabilities'], balance_sheet['total_assets']
            ),
            'leverage_ratio': FinancialCalculator.calculate_leverage(
                balance_sheet['total_liabilities'], balance_sheet['shareholder_equity']
            ),
            'fixed_asset_ratio': FinancialCalculator.calculate_fixed_asset_ratio(
                balance_sheet['fixed_assets'], balance_sheet['total_assets']
            ),
            
            # Cycle
            'dso': FinancialCalculator.calculate_dso(
                balance_sheet['accounts_receivable'], income_statement['revenue']
            ),
            'dio': FinancialCalculator.calculate_dio(
                balance_sheet['inventory'], income_statement['cost_of_goods_sold']
            ),
            'dpo': FinancialCalculator.calculate_dpo(
                balance_sheet['accounts_payable'], income_statement['cost_of_goods_sold']
            ),
            
            # Profitability
            'profit_margin': FinancialCalculator.calculate_profit_margin(
                income_statement['net_profit'], income_statement['revenue']
            ),
            'ebitda_margin': FinancialCalculator.calculate_ebitda_margin(
                income_statement['ebitda'], income_statement['revenue']
            ),
            'roa': FinancialCalculator.calculate_roa(
                income_statement['net_profit'], balance_sheet['total_assets']
            ),
            'roe': FinancialCalculator.calculate_roe(
                income_statement['net_profit'], balance_sheet['shareholder_equity']
            ),
            'asset_turnover': FinancialCalculator.calculate_asset_turnover(
                income_statement['revenue'], balance_sheet['total_assets']
            ),
        }
        
        # Cash conversion cycle
        ratios['cash_conversion_cycle'] = FinancialCalculator.calculate_cash_conversion_cycle(
            ratios['dso'], ratios['dio'], ratios['dpo']
        )
        
        return ratios
```

**✅ Day 4 Deliverable**: All financial ratio calculations implemented and tested

---

## 📋 Phase 5: Credit Scoring & AI Services (Day 5)

### 5.1 Credit Scoring Engine

**Create `app/services/financial/credit_scorer.py`**:
```python
# Implementation based on the formulas in FINANCIAL_FORMULAS_REFERENCE.md
# 40-30-30 weighted model
# (See previous documentation for complete implementation)
```

### 5.2 SWOT Generator with AI

**Create `app/services/ai/swot_generator.py`**:
```python
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os

class SWOTGenerator:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.7,
            api_key=os.getenv("OPENAI_API_KEY")
        )
    
    def generate_swot(self, company_data: dict, ratios: dict, language='es'):
        """Generate SWOT analysis using GPT-4"""
        
        template = """
        You are a financial analyst for Moskalti Capital, a Mexican SOFOM specializing in SME loans.
        
        Company: {company_name}
        Industry: {industry}
        
        Financial Ratios:
        - Current Ratio: {current_ratio}
        - ROE: {roe}%
        - Debt-to-Assets: {debt_to_assets}%
        - Profit Margin: {profit_margin}%
        - Revenue Growth: {revenue_growth}%
        
        Generate a SWOT analysis in {language} (Spanish or English). Format as JSON:
        {{
            "strengths": ["point 1", "point 2", ...],
            "weaknesses": ["point 1", "point 2", ...],
            "opportunities": ["point 1", "point 2", ...],
            "threats": ["point 1", "point 2", ...]
        }}
        
        Each category should have 2-4 points. Be specific and data-driven.
        """
        
        prompt = ChatPromptTemplate.from_template(template)
        chain = prompt | self.llm
        
        response = chain.invoke({
            "company_name": company_data['name'],
            "industry": company_data['industry'],
            "current_ratio": ratios['current_ratio'],
            "roe": ratios['roe'],
            "debt_to_assets": ratios['debt_to_assets'] * 100,
            "profit_margin": ratios['profit_margin'],
            "revenue_growth": company_data.get('revenue_growth', 0),
            "language": "Spanish" if language == 'es' else "English"
        })
        
        return response.content
```

**✅ Day 5 Deliverable**: Credit scoring and AI-powered SWOT generation

---

## 📋 Phase 6: Report Generation & API Endpoints (Day 6)

### 6.1 PDF Report Generator

**Create `app/services/reports/pdf_generator.py`**:
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class PDFReportGenerator:
    def generate_executive_report(self, analysis_data: dict, output_path: str):
        """Generate PDF executive report"""
        doc = SimpleDocTemplate(output_path, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()
        
        # Title
        title = Paragraph(f"Credit Analysis - {analysis_data['company_name']}", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Credit Recommendation
        recommendation = analysis_data['recommendation']
        rec_text = f"<b>Recommendation:</b> {recommendation}"
        story.append(Paragraph(rec_text, styles['Heading2']))
        
        # Financial Ratios Table
        # SWOT Analysis
        # Conditions (if applicable)
        
        doc.build(story)
        return output_path
```

### 6.2 Main API Endpoints

**Create `app/api/routes/analysis.py`**:
```python
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.api.deps import get_current_active_user
from app.services.file_processing.excel_parser import ExcelParser
from app.services.financial.calculator import FinancialCalculator
from app.services.financial.credit_scorer import CreditScorer
from app.services.ai.swot_generator import SWOTGenerator
from app.models.user import User
from app.models.company import Company
from app.models.analysis import AnalysisResult
import tempfile
import os

router = APIRouter(prefix="/analysis", tags=["Credit Analysis"])

@router.post("/upload")
async def upload_financial_statement(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload Excel file and trigger analysis"""
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        # Parse Excel
        parser = ExcelParser(tmp_path)
        company_info = parser.extract_company_info()
        balance_sheet = parser.extract_balance_sheet()
        income_statement = parser.extract_income_statement()
        
        # Validate
        errors = parser.validate_data(balance_sheet, income_statement)
        if errors:
            raise HTTPException(status_code=400, detail=f"Data validation failed: {errors}")
        
        # Create company record
        company = Company(
            name=company_info['name'],
            industry=company_info.get('industry'),
            created_by=current_user.id
        )
        db.add(company)
        db.commit()
        db.refresh(company)
        
        # Calculate ratios
        latest_year = max(balance_sheet.keys())
        ratios = FinancialCalculator.calculate_all_ratios(
            balance_sheet[latest_year],
            income_statement[latest_year]
        )
        
        # Credit scoring
        scorer = CreditScorer()
        credit_score = scorer.calculate_total_score(ratios)
        
        # SWOT analysis
        swot_gen = SWOTGenerator()
        swot = swot_gen.generate_swot(company_info, ratios)
        
        # Save analysis
        analysis = AnalysisResult(
            company_id=company.id,
            total_credit_score=credit_score['total_score'],
            credit_category=credit_score['category'],
            swot_analysis=swot,
            **ratios,
            analyzed_by=current_user.id
        )
        db.add(analysis)
        db.commit()
        
        return {"message": "Analysis complete", "company_id": company.id, "analysis_id": analysis.id}
    
    finally:
        os.unlink(tmp_path)

@router.get("/report/{analysis_id}/pdf")
async def download_pdf_report(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Download PDF report"""
    # Implementation
    pass
```

**Create `app/main.py`** (FastAPI application):
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, analysis
from app.utils.database import engine, Base
import os

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Moskalti Credit Analysis API",
    version="1.0.0",
    description="AI-Powered Credit Analysis System"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Moskalti Credit Analysis API v1.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

**✅ Day 6 Deliverable**: Complete backend API ready for frontend integration

---

## 🧪 Testing Strategy

**Create `app/tests/test_calculator.py`**:
```python
import pytest
from app.services.financial.calculator import FinancialCalculator

def test_current_ratio():
    ratio = FinancialCalculator.calculate_current_ratio(100000, 50000)
    assert ratio == 2.0

def test_roe():
    roe = FinancialCalculator.calculate_roe(10000, 50000)
    assert roe == 20.0
```

**Run tests**:
```bash
pytest app/tests/ -v --cov=app
```

---

## 📦 Docker Deployment

**Create `Dockerfile`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `docker-compose.yml`**:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: moskalti_credit
      POSTGRES_USER: moskalti_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql://moskalti_user:${DB_PASSWORD}@db:5432/moskalti_credit
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    volumes:
      - ./backend:/app

volumes:
  postgres_data:
```

---

## ✅ Backend Development Checklist

- [ ] Day 1: Authentication & project setup
- [ ] Day 2: Database models & migrations
- [ ] Day 3: File processing (Excel parsing)
- [ ] Day 4: Financial calculations engine
- [ ] Day 5: Credit scoring & AI services
- [ ] Day 6: Report generation & API endpoints
- [ ] Testing & documentation
- [ ] Docker deployment

**Estimated Duration**: 5-6 days  
**Confidence Level**: High (all formulas documented, Excel template analyzed)

---

**Next**: Frontend Development Plan
