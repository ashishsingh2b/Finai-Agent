"""
Moskalti Credit Analysis API - Enterprise Entry Point.
FastAPI application orchestrating authentication, credit analysis, and user management.
Implements robust CORS policies and custom logging middleware for auditability.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, analysis, users
from app.utils.database import engine, Base
import os
from dotenv import load_dotenv
import logging

# Initialize consolidated logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Idempotent database schema generation
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Moskalti Credit Analysis API",
    version="1.0.0",
    description="AI-Powered Credit Analysis System for SME Loan Evaluation"
)

# Cross-Origin Resource Sharing (CORS) Configuration
# Dynamically allows any localhost or 127.0.0.1 origin with any port for development flexibility
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    """Global request/response logging middleware for API audit trails."""
    origin = request.headers.get("origin")
    method = request.method
    path = request.url.path
    
    logger.info(f"API CALL: {method} {path} | Origin: {origin}")
    response = await call_next(request)
    logger.info(f"API RESPONSE: {path} | Status: {response.status_code}")
    
    return response

# Standardized Routing Implementation
app.include_router(auth.router, prefix="/api/v1", tags=["Authentication"])
app.include_router(analysis.router, prefix="/api/v1", tags=["Credit Analysis"])
app.include_router(users.router, prefix="/api/v1/users", tags=["User Management"])

@app.get("/")
def root():
    """Service discovery root."""
    return {
        "message": "Moskalti Credit Analysis API v1.0",
        "status": "operational",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Infrastructure health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # Enforce standard development port 8000
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

