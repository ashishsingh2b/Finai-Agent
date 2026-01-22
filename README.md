# Moskalti Capital - AI Credit Analysis System

AI-Powered Credit Analysis Platform for SME Loan Evaluation

## 🚀 Quick Start

### Option 1: Run Backend + Frontend Separately (Development)

**Backend**:
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run backend
uvicorn app.main:app --reload
```
Backend runs at: http://localhost:8000

**Frontend**:
```bash
cd frontend

# Install dependencies
npm install

# Run frontend
npm run dev
```
Frontend runs at: http://localhost:5173

### Option 2: Full Stack with Docker

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 8000

## 📁 Project Structure

```
FinAI Agent/
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   │   ├── file_processing/  # Excel/PDF parsing
│   │   │   ├── financial/        # Ratio calculations, scoring
│   │   │   └── ai/              # SWOT generation
│   │   ├── utils/       # Database, security
│   │   └── main.py      # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/             # React + TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   ├── store/       # Zustand state
│   │   └── types/       # TypeScript types
│   ├── package.json
│   └── vite.config.ts
└── docker-compose.yml
```

## 🔧 Backend API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user info

### Credit Analysis
- `POST /api/v1/analysis/upload` - Upload Excel file and analyze
- `GET /api/v1/analysis/{id}` - Get analysis results
- `GET /api/v1/analysis/` - List all analyses

## 📊 Features Implemented

### ✅ Backend (100% Complete)
- JWT Authentication & Role-based access.
- Advanced Financial Extraction (Excel/PDF + OCR).
- **40-30-30 Credit Scoring Model**: (History 40%, Solvency 30%, Profitability 30%).
- Real-time PDF/Excel report generation.
- GPT-4 Powered SWOT Analysis.

### ✅ Frontend (100% Complete)
- **Corporate UI**: Responsive design unified with `#11303B` Dark Navy brand colors.
- **Interactive Dashboard**: Real-time analysis status (Approved/Rejected/Review).
- **Analytics View**: Fixed sidebar hierarchy for rapid data scanning.
- **Charts**: Interactive Revenue vs Profit trends & Debt/Equity ratios.

## 📄 Extraction Guide
For details on how to format your files for the AI Agent, see [FINANCIAL_EXTRACTION_GUIDE.md](./FINANCIAL_EXTRACTION_GUIDE.md).

## 🔧 Environment Variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://moskalti_user:moskalti_password@localhost:5432/moskalti_credit
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here
```

## 🤝 Handover
**Developer**: Ashish Singh
**Client**: Paola G.
**Status**: PROJECT COMPLETED & DELIVERED
