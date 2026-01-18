# Moskalti Credit Analysis - Backend

AI-Powered Credit Analysis System for SME Loan Evaluation

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Set up Database
Make sure PostgreSQL is installed and running, then create the database:
```bash
createdb moskalti_credit
```

### 5. Run the Application
```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Or using Python directly
python -m app.main
```

The API will be available at: http://localhost:8000
API Documentation: http://localhost:8000/docs

## Project Structure
```
backend/
├── app/
│   ├── api/              # API routes
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   └── main.py          # FastAPI app
├── tests/                # Unit tests
├── requirements.txt      # Dependencies
└── .env                 # Configuration
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/register` - Register new user
- POST `/api/v1/auth/login` - Login and get token
- GET `/api/v1/auth/me` - Get current user

### Analysis (Coming soon)
- POST `/api/v1/analysis/upload` - Upload financial statement
- GET `/api/v1/analysis/{id}` - Get analysis results
- GET `/api/v1/analysis/report/{id}/pdf` - Download PDF report
- GET `/api/v1/analysis/report/{id}/excel` - Download Excel report

## Development

### Run Tests
```bash
pytest tests/ -v --cov=app
```

### Database Migrations (Alembic - Optional)
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## Environment Variables

See `.env.example` for all required configuration variables.
