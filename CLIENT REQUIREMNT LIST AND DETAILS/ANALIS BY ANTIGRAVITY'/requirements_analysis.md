# Requirements Analysis - AI Credit Analysis System

## 📋 Project Overview

**Client**: Moskalti Capital (Financial Company)  
**Purpose**: AI-powered credit analysis system for SME loan evaluation  
**Budget**: $140 USD  
**Timeline**: 2 weeks (10 working days)  
**Languages**: Spanish & English

---

## 🎯 Core Objective

Automate the credit analysis process for small and medium-sized businesses by analyzing their financial statements and generating comprehensive credit recommendations.

---

## ⚠️ CRITICAL SCOPE DISCREPANCY IDENTIFIED

### Conflicting Requirements:


**Mid-Project Change (Jan 12, 2026)**:
> "We have decided to remove the part related to extracting information from a PDF and transferring it into an Excel file."  
> **Scope**: Excel upload only

**Latest Requirement (Jan 16, 2026 - Project Summary)**:
> "Necesito desarrollar un agente de inteligencia artificial capaz de recibir directamente el PDF..."  
> **Scope**: PDF upload with OCR + Excel generation

### 🔴 NEEDS IMMEDIATE CLARIFICATION
The client must confirm whether:
- **Option A**: Excel-only input (as per Jan 12 agreement)
- **Option B**: PDF input with extraction + Excel output (as per latest summary)

This significantly impacts development effort and timeline.

---

## 📊 Required Outputs (All Scenarios)

1. **Detailed PDF Report** - Executive summary with analysis
2. **Interactive Web Dashboard** - Real-time visualization with charts
3. **Editable Excel File** - All figures, ratios, and projections
4. **Credit Recommendation** - Approve / Approve with Conditions / Reject

---

## 🔍 Analysis Requirements

### Financial Analysis
- [ ] 3-year financial statement analysis
- [ ] Key financial ratios calculation:
  - **Liquidity**: Current ratio, quick ratio, cash ratio
  - **ROE**: Return on equity
  - **Debt/Assets**: Leverage ratio
  - **Interest Coverage**: Debt service capacity
- [ ] Revenue & profit trend analysis
- [ ] Cash flow evaluation

### Credit Analysis
- [ ] Risk assessment scoring
- [ ] Payment capacity evaluation
- [ ] Credit scoring algorithm
- [ ] Historical payment behavior analysis

### SWOT Analysis
- **✅ Strengths**: Stable cash flow, industry experience
- **⚠️ Weaknesses**: High debt, customer concentration
- **🌟 Opportunities**: Market expansion, new contracts
- **🚨 Threats**: Tax risk, market volatility

### Recommendation Engine
- **Approve** - Low risk, strong financials
- **Approve with Conditions** - Moderate risk, acceptable with terms
- **Reject** - High risk, poor repayment capacity

---

## 🎨 UI/UX Requirements (from mockup)

### Dashboard Sections
1. **Header**
   - Company name ("TECNOSA S.A. de C.V.")
   - Credit risk indicator (RED/YELLOW/GREEN)
   - Payment history status

2. **Left Sidebar - General Information**
   - Industry
   - Years in business
   - Top clients
   - Fiscal status
   - Document links (Tax Certificate, Financial Statements, etc.)

3. **Center - Financial Indicators**
   - Liquidity: 1.5 (Adequate)
   - ROE: 12.4% (Profitable)
   - Debt/Assets: 55% (Moderate)
   - Interest Coverage: 3.2x (Acceptable)

4. **Right - Financial Charts**
   - Revenue & profit trend (bar chart)
   - Debt/Equity pie chart

5. **SWOT Analysis Section**
   - Color-coded quadrants
   - Bullet points for each category

6. **Evaluation & Recommendation Section**
   - Conclusion with justification
   - Conditions (if applicable)
   - Terms and collateral requirements

---

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Data Processing**: pandas, NumPy
- **AI/ML**: LangChain, GPT-4 (for text analysis)
- **PDF Generation**: ReportLab / WeasyPrint
- **Excel Processing**: openpyxl, xlsxwriter
- **Database**: PostgreSQL
- **OCR** (if PDF extraction needed): Tesseract, pdfplumber, PyMuPDF

### Frontend
- **Framework**: React.js with TypeScript
- **Charts**: Plotly.js, Chart.js, Recharts
- **UI Library**: Material-UI or Tailwind CSS
- **State Management**: React Context API or Redux

### DevOps
- **Containerization**: Docker
- **Deployment**: Docker Compose
- **Web Server**: Nginx

---

## ✅ Acceptance Criteria

1. **Data Accuracy**: ≥ 98% extraction accuracy (if PDF processing)
2. **Report Consistency**: All outputs (PDF, web, Excel) must show identical figures
3. **Justified Recommendations**: Credit decisions backed by quantitative & qualitative analysis
4. **Multi-language**: Full Spanish & English support
5. **Performance**: Analysis completion within 30 seconds
6. **Reproducibility**: Consistent results for same input data

---

## 📦 Deliverables

- ✅ Fully functional web application
- ✅ Backend API with all endpoints
- ✅ Frontend dashboard
- ✅ PDF report generator
- ✅ Excel export functionality
- ✅ Docker deployment package
- ✅ User documentation (Spanish & English)
- ✅ Technical documentation
- ✅ Source code with comments

---

## 🚨 Risks & Considerations

1. **PDF Extraction Complexity** (if required)
   - Variable PDF formats
   - OCR accuracy for scanned documents
   - Spanish/English text recognition

2. **Credit Scoring Algorithm**
   - Need client's existing scoring criteria
   - Risk thresholds configuration
   - Industry-specific adjustments

3. **Timeline Pressure**
   - 10 working days for full implementation
   - Scope creep if PDF extraction added back

4. **Budget Constraints**
   - $140 USD is tight for this scope
   - May need to use open-source tools exclusively

---

## ❓ Questions for Client Clarification

1. **CRITICAL**: Confirm final input format (PDF vs Excel)?
2. What are your current credit scoring criteria and thresholds?
3. Do you have sample financial statements for testing?
4. What specific financial ratios are most important to you?
5. Are there industry-specific considerations?
6. Hosting preference (cloud vs on-premise)?
7. Expected concurrent users?
8. Any existing systems to integrate with?

