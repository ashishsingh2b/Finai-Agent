"""
Database Infrastructure: Session Management and Engine Configuration.
Provides the SQLAlchemy engine and dependency injection for FastAPI database sessions.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

# URI fetched from environment; defaults to standard local development container
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://moskalti_user:moskalti_password@localhost:5432/moskalti_credit")

# Initialize engine with pool health checking to prevent stale connections
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)

# Local session constructor with managed transactional integrity
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Primary base for model declaration
Base = declarative_base()

def get_db():
    """
    FastAPI Dependency Injector for DB sessions.
    Ensures safe session closure after request finalization.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
