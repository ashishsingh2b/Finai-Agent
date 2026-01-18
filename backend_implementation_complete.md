# Backend Implementation Plan - Missing Features

## Overview
Implementing the 4 critical missing features to complete the FinAI Agent backend as per client requirements.

## Priority 1: PDF Upload & Processing (CRITICAL)

### Tasks
- [ ] Install OCR dependencies (pytesseract, Pillow)
- [ ] Create PDF parser service (`pdf_parser.py`)
- [ ] Implement text extraction from native PDFs (pdfplumber)
- [ ] Implement OCR for scanned PDFs (pytesseract)
- [ ] Add table detection and extraction
- [ ] Create data normalization layer
- [ ] Update analysis route to accept PDF files
- [ ] Add validation for PDF accuracy (≥98% requirement)

### Files to Create/Modify
- `backend/app/services/file_processing/pdf_parser.py` (NEW)
- `backend/app/api/routes/analysis.py` (MODIFY - add PDF support)
- `backend/requirements.txt` (MODIFY - add pytesseract, Pillow)

## Priority 2: PDF Report Generation (CRITICAL)

### Tasks
- [ ] Create PDF report generator service
- [ ] Design professional report template
- [ ] Implement company header section
- [ ] Implement financial ratios table
- [ ] Implement SWOT matrix visualization
- [ ] Implement credit score breakdown (pie chart)
- [ ] Implement recommendation section
- [ ] Add bilingual support (ES/EN)
- [ ] Create export endpoint `/analysis/{id}/export/pdf`
- [ ] Add company logo integration

### Files to Create/Modify
- `backend/app/services/reports/pdf_generator.py` (NEW)
- `backend/app/services/reports/__init__.py` (NEW)
- `backend/app/api/routes/analysis.py` (MODIFY - add export endpoint)

## Priority 3: Excel Export (CRITICAL)

### Tasks
- [ ] Create Excel export service
- [ ] Implement multi-sheet workbook structure
- [ ] Sheet 1: Company Information
- [ ] Sheet 2: Balance Sheet (3 years)
- [ ] Sheet 3: Income Statement (3 years)
- [ ] Sheet 4: Financial Ratios
- [ ] Sheet 5: SWOT Analysis
- [ ] Sheet 6: Credit Score Breakdown
- [ ] Sheet 7: Recommendation
- [ ] Add formatting (colors, borders, formulas)
- [ ] Create export endpoint `/analysis/{id}/export/excel`

### Files to Create/Modify
- `backend/app/services/reports/excel_generator.py` (NEW)
- `backend/app/api/routes/analysis.py` (MODIFY - add export endpoint)

## Priority 4: Split File Upload (HIGH)

### Tasks
- [ ] Create multi-file upload endpoint
- [ ] Accept 3 separate files (Balance Sheet, P&L, Cash Flow)
- [ ] Implement file merging logic
- [ ] Add cross-file validation
- [ ] Update frontend to support multi-file upload

### Files to Create/Modify
- `backend/app/api/routes/analysis.py` (MODIFY - add split upload endpoint)
- `backend/app/services/file_processing/file_merger.py` (NEW)

## Optional Enhancements

### Background Processing (Celery + Redis)
- [ ] Install Celery and Redis
- [ ] Create Celery tasks for analysis
- [ ] Implement progress tracking
- [ ] Add WebSocket for real-time updates
- [ ] Create notification system

### Environment Fixes
- [ ] Fix duplicate DATABASE_URL in .env
- [ ] Generate secure SECRET_KEY and JWT_SECRET_KEY
- [ ] Add production environment variables

## Estimated Timeline
- PDF Processing: 2-3 days
- PDF Report Generation: 3-4 days
- Excel Export: 1-2 days
- Split File Upload: 1 day
- **Total: 7-10 days**

## Dependencies Needed
```
# Add to requirements.txt
pytesseract==0.3.10
Pillow==10.2.0
pdf2image==1.17.0
matplotlib==3.8.2
```

## Client Requirements Checklist
- [ ] OpenAI API Key (for AI SWOT)
- [ ] Production database credentials
- [ ] Company logo file
- [ ] Production domain URL
- [ ] SMTP credentials (optional)
- [ ] Banxico API token (optional)
