from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, analysis, users
from app.utils.database import engine, Base
import os
from dotenv import load_dotenv

load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Moskalti Credit Analysis API",
    version="1.0.0",
    description="AI-Powered Credit Analysis System for SME Loan Evaluation"
)

# CORS Configuration
# Use regex to allow any localhost or 127.0.0.1 origin with any port
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom Logging Middleware to debug CORS/API calls
@app.middleware("http")
async def log_requests(request, call_next):
    origin = request.headers.get("origin")
    method = request.method
    path = request.url.path
    print(f"DEBUG_API: {method} {path} | Origin: {origin}")
    response = await call_next(request)
    print(f"DEBUG_API: Response {response.status_code}")
    return response

# Include routers
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Credit Analysis"])
app.include_router(users.router, prefix="/api/v1/users", tags=["User Management"])

@app.get("/")
def root():
    return {
        "message": "Moskalti Credit Analysis API v1.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
