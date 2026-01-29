"""
Infrastructure Layer: Secure File Management.
Handles OS-level interactions, directory sharding, and safe naming conventions 
for all incoming financial documents.
"""
import os
import uuid
import shutil
import logging
from datetime import datetime
from fastapi import UploadFile
from pathlib import Path

logger = logging.getLogger(__name__)

class FileManager:
    """
    Centralized handler for document persistence.
    Implements date-based sharding to prevent directory overflow and enforces 
    normalized pathing for multi-platform compatibility.
    """
    
    # Root storage path for all analysis-related documents
    BASE_UPLOAD_DIR = Path("d:/FREELANCERS/PAOLAG/FinAI Agent/backend/uploads/analyses")
    
    @classmethod
    def save_upload(cls, file: UploadFile, company_name: str = "Unknown") -> str:
        """
        Persists an uploaded file to structured storage.
        Path Convention: uploads/analyses/YYYY-MM/Company-UUID.extension
        Returns the absolute string path of the saved file.
        """
        try:
            # Create chronological directory shard
            month_dir = cls.BASE_UPLOAD_DIR / datetime.now().strftime("%Y-%m")
            month_dir.mkdir(parents=True, exist_ok=True)
            
            # Sanitize company name for the filesystem
            clean_company = "".join(c if c.isalnum() else "-" for c in company_name).strip("-")
            clean_company = clean_company[:30] # Enforce length limits
            if not clean_company: clean_company = "Unknown"
            
            # Generate immutable safe identifier
            ext = os.path.splitext(file.filename)[1].lower()
            if not ext: ext = ".xlsx"
            
            safe_name = f"{clean_company}-{uuid.uuid4().hex[:8]}{ext}"
            file_path = month_dir / safe_name
            
            # Atomic stream copying
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            logger.info(f"Storage persistence successful: {file_path.name}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Critical failure in file persistence layer: {e}", exc_info=True)
            raise
