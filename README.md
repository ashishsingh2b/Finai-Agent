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

### ✅ Backend (Complete)
- JWT Authentication
- User registration & login
- Excel file parsing (matching Moskalti template)
- Financial ratio calculations (18+ ratios)
- 40-30-30 credit scoring model
- AI-powered SWOT analysis (GPT-4 + fallback)
- Credit recommendation engine (Approve/Conditional/Reject)
- PostgreSQL database
- Docker support

### ✅ Frontend (Complete)
- React + TypeScript
- Beautiful login UI
- File upload interface with drag-and-drop
- Interactive dashboard
- Financial indicators display (color-coded)
- SWOT visualization (quadrant format)
- Recommendation display
- Recent analyses list
- Responsive design

## 🧪 Testing

### Test Authentication
```bash
# Register a user
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@moskalti.com",
    "full_name": "Test User",
    "password": "password123",
    "role": "analyst"
  }'

# Login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@moskalti.com&password=password123"
```

### Test Analysis
Use the Swagger UI at http://localhost:8000/docs to:
1. Login and get token
2. Upload an Excel file (use `Ejemplo para hacer un analisis.xlsx`)
3. View analysis results

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=postgresql://moskalti_user:moskalti_password@localhost:5432/moskalti_credit
JWT_SECRET_KEY=your-secret-key-here
OPENAI_API_KEY=your-openai-key-here  # Optional - fallback to rule-based SWOT
```

##Development Status

**Current**: Backend core complete (Day 1-5 of plan)
**Next**: Frontend development
**Timeline**: On track for 10-12 day delivery

## 🤝 Contributing

This is a client project for Moskalti Capital.

**Developer**: Ashish Singh
**Client**: Paola G.
**Project**: AI Credit Analysis System
