# Project Structure - AI Credit Analysis System

## 📁 Directory Layout

```
moskalti-credit-analysis/
│
├── backend/                          # Python FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── config.py                # Environment configuration
│   │   │
│   │   ├── models/                  # Database models
│   │   │   ├── __init__.py
│   │   │   ├── company.py           # CompanyProfile model
│   │   │   ├── financial.py         # FinancialStatement model
│   │   │   └── analysis.py          # AnalysisResult model
│   │   │
│   │   ├── schemas/                 # Pydantic schemas (API contracts)
│   │   │   ├── __init__.py
│   │   │   ├── company.py
│   │   │   ├── financial.py
│   │   │   └── analysis.py
│   │   │
│   │   ├── api/                     # API routes
│   │   │   ├── __init__.py
│   │   │   ├── routes.py            # All API endpoints
│   │   │   └── deps.py              # Dependencies (DB session, auth)
│   │   │
│   │   ├── services/                # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── file_processor.py    # Excel/PDF parsing
│   │   │   ├── pdf_extractor.py     # PDF extraction + OCR
│   │   │   ├── financial_calculator.py  # Ratio calculations
│   │   │   ├── credit_scorer.py     # Scoring algorithm
│   │   │   ├── swot_generator.py    # SWOT analysis AI
│   │   │   ├── recommendation_engine.py  # Final decision logic
│   │   │   ├── report_generator.py  # PDF/Excel/JSON exports
│   │   │   └── ai_service.py        # LangChain + GPT-4 integration
│   │   │
│   │   ├── i18n/                    # Internationalization
│   │   │   ├── translations.json    # ES/EN text mappings
│   │   │   └── translator.py        # Translation helper
│   │   │
│   │   └── utils/                   # Utility functions
│   │       ├── database.py          # DB connection
│   │       ├── validators.py        # Data validation
│   │       └── helpers.py
│   │
│   ├── tests/                       # Backend tests
│   │   ├── unit/
│   │   │   ├── test_financial_calculator.py
│   │   │   ├── test_credit_scorer.py
│   │   │   ├── test_file_processor.py
│   │   │   └── test_swot_generator.py
│   │   └── integration/
│   │       └── test_api_routes.py
│   │
│   ├── requirements.txt             # Python dependencies
│   ├── alembic.ini                  # Database migrations config
│   └── .env.example
│
├── frontend/                        # React TypeScript frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── App.tsx                  # Main app component
│   │   ├── index.tsx
│   │   ├── index.css
│   │   │
│   │   ├── components/              # React components
│   │   │   ├── UploadPage.tsx       # File upload interface
│   │   │   ├── ProcessingView.tsx   # Progress indicator
│   │   │   ├── Dashboard.tsx        # Main credit analysis view
│   │   │   ├── Sidebar.tsx          # Company info sidebar
│   │   │   ├── FinancialIndicators.tsx  # Ratio cards
│   │   │   ├── FinancialCharts.tsx  # Trend/pie charts
│   │   │   ├── SWOTAnalysis.tsx     # SWOT matrix
│   │   │   ├── Recommendation.tsx   # Credit decision display
│   │   │   ├── ReportsPage.tsx      # Download center
│   │   │   └── LanguageToggle.tsx   # ES/EN switcher
│   │   │
│   │   ├── services/                # API communication
│   │   │   └── api.ts               # Axios API client
│   │   │
│   │   ├── hooks/                   # Custom React hooks
│   │   │   └── useAnalysis.ts
│   │   │
│   │   ├── types/                   # TypeScript interfaces
│   │   │   └── index.ts
│   │   │
│   │   └── i18n/                    # Frontend translations
│   │       ├── es.json
│   │       ├── en.json
│   │       └── config.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── database/
│   ├── init.sql                     # Initial schema
│   └── migrations/                  # Alembic migrations
│
├── docs/
│   ├── USER_GUIDE_EN.md             # User documentation (English)
│   ├── USER_GUIDE_ES.md             # User documentation (Spanish)
│   ├── TECHNICAL_DOCS.md            # Developer documentation
│   └── API_REFERENCE.md             # API endpoint docs
│
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
│
├── tests/
│   └── sample_data/                 # Test files
│       ├── sample_financials.xlsx
│       ├── sample_statements.pdf
│       └── expected_results.json
│
├── .gitignore
├── docker-compose.yml               # Multi-service orchestration
├── README.md                        # Project overview
└── LICENSE
```

---

## 📋 File Descriptions

### Backend Core Files

#### `backend/app/main.py`
- FastAPI application initialization
- CORS configuration for frontend
- API router registration
- Database connection on startup
- Multi-language middleware

#### `backend/app/services/financial_calculator.py`
```python
class FinancialCalculator:
    def calculate_liquidity_ratio(statements) -> float
    def calculate_roe(statements) -> float
    def calculate_debt_to_assets(statements) -> float
    def calculate_interest_coverage(statements) -> float
    def calculate_all_ratios(statements) -> Dict[str, Any]
    def calculate_trends(statements) -> Dict[str, Any]
```

#### `backend/app/services/credit_scorer.py`
```python
class CreditScorer:
    def score_financial_health(ratios) -> int
    def score_growth_trajectory(trends) -> int
    def calculate_total_score(company_data) -> int
    def determine_risk_level(score) -> RiskLevel
    def generate_recommendation(score, risk) -> Recommendation
```

#### `backend/app/services/swot_generator.py`
```python
class SWOTGenerator:
    def identify_strengths(ratios, trends) -> List[str]
    def identify_weaknesses(ratios, trends) -> List[str]
    def identify_opportunities(ai_service, context) -> List[str]
    def identify_threats(ai_service, context) -> List[str]
    def generate_swot(company_data) -> SWOTAnalysis
```

### Frontend Core Files

#### `frontend/src/components/Dashboard.tsx`
Main dashboard component matching the [reference mockup](file:///d:/FREELANCERS/PAOLAG/CLIENT%20REQUIREMNT%20LIST%20AND%20DETAILS/Screenshot%202026-01-16%20232241.png).

**Props Structure**:
```typescript
interface DashboardProps {
  companyId: string;
}

interface AnalysisData {
  company: CompanyProfile;
  financials: FinancialIndicators;
  charts: ChartData;
  swot: SWOTAnalysis;
  recommendation: CreditRecommendation;
}
```

#### `frontend/src/components/FinancialCharts.tsx`
Interactive charts using Recharts library.

**Charts**:
- Revenue & Profit Trend (Bar Chart)
- Debt/Equity Structure (Pie Chart)

---

## 🛠️ Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | FastAPI | High-performance async API |
| **ORM** | SQLAlchemy | Database abstraction |
| **Database** | PostgreSQL | Data persistence |
| **AI** | LangChain + GPT-4 | SWOT & text generation |
| **PDF Processing** | pdfplumber + Tesseract | Extraction + OCR |
| **Excel** | pandas + openpyxl | Read/write Excel files |
| **PDF Reports** | ReportLab | Generate PDF reports |
| **Frontend** | React + TypeScript | Interactive UI |
| **Charts** | Recharts + Chart.js | Data visualization |
| **i18n** | react-i18next | Multi-language support |
| **Deployment** | Docker + Docker Compose | Containerization |

---

## 🚀 Development Workflow

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd moskalti-credit-analysis

# Set up environment variables
cp backend/.env.example backend/.env
# Edit .env with your OPENAI_API_KEY, DB credentials

# Start with Docker (easiest)
docker-compose up --build
```

### Backend Development
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Backend will be at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### Frontend Development
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be at http://localhost:3000
```

### Running Tests
```bash
# Backend tests
cd backend
pytest tests/ -v --cov=app

# Frontend tests
cd frontend
npm run test
```

---

## 🎯 Key Implementation Decisions

### 1. Dual-Input Support
**Decision**: Support both Excel and PDF inputs  
**Rationale**: Reconciles conflicting requirements, provides maximum flexibility  
**Impact**: +2-3 days development time

### 2. AI-Powered SWOT Analysis
**Decision**: Use GPT-4 via LangChain for qualitative insights  
**Rationale**: Goes beyond simple rule-based generation, provides contextual analysis  
**Impact**: Requires OpenAI API key ($0.03 per analysis estimated)

### 3. PostgreSQL over SQLite
**Decision**: Use PostgreSQL as database  
**Rationale**: Production-ready, better concurrent access, JSON field support  
**Impact**: Slightly more complex deployment, but more robust

### 4. TypeScript for Frontend
**Decision**: Use TypeScript instead of JavaScript  
**Rationale**: Type safety reduces bugs, better IDE support  
**Impact**: Slightly steeper learning curve, but cleaner code

### 5. Monorepo Structure
**Decision**: Single repository with backend + frontend  
**Rationale**: Easier deployment, shared types, simplified CI/CD  
**Impact**: Larger repository size, but better organization

---

## 📊 Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant FileProcessor
    participant Calculator
    participant AI
    participant DB
    participant ReportGen

    User->>Frontend: Upload Excel/PDF
    Frontend->>API: POST /api/v1/upload
    API->>FileProcessor: Parse file
    
    alt PDF Upload
        FileProcessor->>FileProcessor: Extract with OCR
    else Excel Upload
        FileProcessor->>FileProcessor: Parse spreadsheet
    end
    
    FileProcessor->>DB: Save company profile
    FileProcessor->>Calculator: Calculate ratios
    Calculator->>DB: Save financial data
    Calculator->>AI: Generate SWOT
    AI-->>Calculator: Return SWOT analysis
    Calculator->>DB: Save analysis results
    
    API-->>Frontend: Return analysis ID
    Frontend->>API: GET /api/v1/analysis/:id
    API->>DB: Fetch analysis
    DB-->>API: Return data
    API-->>Frontend: Return JSON
    Frontend->>Frontend: Render dashboard
    
    User->>Frontend: Download PDF report
    Frontend->>API: GET /api/v1/report/pdf/:id
    API->>ReportGen: Generate PDF
    ReportGen->>DB: Fetch data
    DB-->>ReportGen: Return data
    ReportGen-->>API: PDF file
    API-->>Frontend: PDF download
    Frontend-->>User: Download complete
```

---

## 🔄 Next Steps After Approval

1. **Set up repository** on GitHub/GitLab
2. **Initialize backend** with FastAPI boilerplate
3. **Initialize frontend** with Vite + React + TypeScript
4. **Configure Docker** for development environment
5. **Implement core services** (calculator, scorer, SWOT)
6. **Build dashboard UI** matching reference mockup
7. **Integration testing** with sample data
8. **Deploy** and share staging link with client

---

## ⏱️ Estimated Timeline

| Phase | Duration | Completion |
|-------|----------|------------|
| Setup & Infrastructure | 1 day | Day 1 |
| Backend Core Services | 3 days | Day 4 |
| Report Generation | 1 day | Day 5 |
| Frontend UI Development | 3 days | Day 8 |
| Integration & Testing | 1.5 days | Day 9-10 |
| Deployment & Documentation | 0.5 days | Day 10 |

**Total**: 10 working days (2 weeks)  
**Contingency**: +2-3 days if PDF OCR proves complex

---

## 📝 Environment Variables Needed

```env
# Backend (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/credit_analysis
OPENAI_API_KEY=sk-...
SECRET_KEY=your-secret-key-here
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:3000

# Frontend (.env)
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=Moskalti Credit Analysis
```

---

This structure provides a clear roadmap for implementation while maintaining flexibility for adjustments during development. 🚀
