from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.api.deps import get_current_active_user
from app.services.file_processing.excel_parser import ExcelParser
from app.services.file_processing.pdf_parser import PDFParser
from app.services.reports.pdf_generator import PDFReportGenerator
from app.services.reports.excel_generator import ExcelReportGenerator
from app.services.financial.calculator import FinancialCalculator
from app.services.financial.credit_scorer import CreditScorer
from app.services.financial.recommendation_engine import RecommendationEngine
from app.services.ai.swot_generator import SWOTGenerator
from app.services.file_processing.file_merger import FileMerger
from app.models.user import User
from app.models.company import Company
from app.models.financial_statement import FinancialStatement
from app.models.analysis import AnalysisResult, ApplicationStatus, PaymentBehavior
from app.schemas.analysis import AnalysisResponse, AnalysisUpdateStatus
import tempfile
import os
import logging
from typing import List

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Credit Analysis"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_and_analyze(
    file: UploadFile = File(...),
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload Excel/PDF financial statement and perform complete credit analysis
    """
    
    # Validate file type
    allowed_extensions = ['.xlsx', '.xls', '.pdf']
    if not any(file.filename.lower().endswith(ext) for ext in allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel (.xlsx, .xls) and PDF files are supported"
        )
    
    # Determine file type and save temporarily
    file_ext = '.pdf' if file.filename.lower().endswith('.pdf') else '.xlsx'
    with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        # Step 1: Parse file (Excel or PDF)
        logger.info(f"Parsing file: {file.filename}")
        if file_ext == '.pdf':
            parser = PDFParser(tmp_path)
        else:
            parser = ExcelParser(tmp_path)
        
        extracted_data = parser.extract_all()
        
        company_info = extracted_data['company_info']
        balance_sheet = extracted_data['balance_sheet']
        income_statement = extracted_data['income_statement']
        validation_errors = extracted_data['validation_errors']
        
        # Check if any data was extracted
        if not balance_sheet or not income_statement:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract financial data from the provided file. Please ensure it follows the required format."
            )
            
        # Get latest year data
        years = list(balance_sheet.keys())
        if not years:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No financial years found in the document. Please provide a standard balance sheet."
            )
            
        latest_year = max(years)
        latest_balance = balance_sheet[latest_year]
        latest_income = income_statement.get(latest_year)
        
        if not latest_income:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Income statement data missing for year {latest_year}."
            )
        
        # Step 2: Create company record
        company = Company(
            name=company_info.get('name', 'Unknown Company'),
            industry=company_info.get('industry'),
            years_in_business=company_info.get('years_in_business'),
            created_by=current_user.id
        )
        db.add(company)
        db.flush()  # Get company ID
        
        # Step 3: Save financial statements
        for year in balance_sheet.keys():
            bs_data = balance_sheet[year]
            is_data = income_statement.get(year, {})
            
            financial_stmt = FinancialStatement(
                company_id=company.id,
                year=year,
                **bs_data,
                **is_data
            )
            db.add(financial_stmt)
        
        # Step 4: Calculate financial ratios
        logger.info("Calculating financial ratios")
        ratios = FinancialCalculator.calculate_all_ratios(
            latest_balance,
            latest_income
        )
        
        # Step 5: Credit scoring
        logger.info("Calculating credit score")
        credit_score = CreditScorer.calculate_full_score(
            ratios,
            bureau_score=75,
            revenue_growth=0,
            profit_growth=0
        )
        
        # Step 6: SWOT Analysis
        logger.info("Generating SWOT analysis")
        swot_gen = SWOTGenerator()
        swot = swot_gen.generate_swot(company_info, ratios, language)
        
        # Step 7: Generate Recommendation
        logger.info("Generating recommendation")
        profit_to_loan = ratios.get('profit_to_loan_ratio', latest_income.get('net_profit', 0) / 1000000)
        recommendation = RecommendationEngine.generate_recommendation(
            credit_score['total_score'],
            credit_score['category'],
            profit_to_loan,
            ratios,
            language
        )
        
        # Step 8: Save analysis result
        # ... logic continued ...
        analysis = AnalysisResult(
            company_id=company.id,
            current_ratio=ratios.get('current_ratio'),
            debt_to_assets=ratios.get('debt_to_assets'),
            leverage_ratio=ratios.get('leverage_ratio'),
            roe=ratios.get('roe'),
            roa=ratios.get('roa'),
            profit_margin=ratios.get('profit_margin'),
            ebitda_margin=ratios.get('ebitda_margin'),
            interest_coverage=ratios.get('interest_coverage'),
            asset_turnover=ratios.get('asset_turnover'),
            dso=ratios.get('dso'),
            dio=ratios.get('dio'),
            dpo=ratios.get('dpo'),
            cash_conversion_cycle=ratios.get('cash_conversion_cycle'),
            credit_history_score=credit_score['breakdown']['credit_history'],
            solvency_score=credit_score['breakdown']['solvency'],
            profitability_score=credit_score['breakdown']['profitability'],
            total_credit_score=credit_score['total_score'],
            credit_category=credit_score['category'],
            swot_analysis=swot,
            recommendation=recommendation['decision'],
            recommendation_justification=recommendation['justification'],
            conditions=recommendation.get('conditions'),
            language=language,
            analyzed_by=current_user.id
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "message": "Analysis completed successfully",
            "company_id": company.id,
            "analysis_id": analysis.id,
            "company_name": company.name,
            "credit_score": credit_score['total_score'],
            "credit_category": credit_score['category'],
            "recommendation": recommendation['decision']
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during analysis: {str(e)}"
        )
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.post("/upload-split", status_code=status.HTTP_201_CREATED)
async def upload_split_files(
    files: List[UploadFile] = File(...),
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload multiple financial files (e.g. Balance Sheet and Income Statement separately)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
        
    temp_paths = []
    try:
        # Save all files temporarily
        for file in files:
            ext = os.path.splitext(file.filename)[1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                contents = await file.read()
                tmp.write(contents)
                temp_paths.append(tmp.name)
        
        # Merge data
        logger.info(f"Merging {len(temp_paths)} files for {current_user.email}")
        extracted_data = FileMerger.merge_files(temp_paths)
        
        # Following logic is identical to single upload - we should ideally refactor
        # but for now we'll duplicate or call a shared helper if we had one.
        # To keep it simple and 100% ready, I'll implement the analysis flow here too
        
        company_info = extracted_data['company_info']
        balance_sheet = extracted_data['balance_sheet']
        income_statement = extracted_data['income_statement']
        
        if not balance_sheet or not income_statement:
            raise HTTPException(
                status_code=422,
                detail="Could not extract complete financial data from the combined files."
            )
            
        years = list(balance_sheet.keys())
        latest_year = max(years)
        latest_balance = balance_sheet[latest_year]
        latest_income = income_statement.get(latest_year)
        
        if not latest_income:
            raise HTTPException(status_code=422, detail=f"Income statement missing for {latest_year}")
            
        # Create company
        company = Company(
            name=company_info.get('name', 'Unknown Company'),
            industry=company_info.get('industry'),
            years_in_business=company_info.get('years_in_business'),
            created_by=current_user.id
        )
        db.add(company)
        db.flush()
        
        # Save statements
        for year in balance_sheet.keys():
            stmt = FinancialStatement(
                company_id=company.id,
                year=year,
                **balance_sheet[year],
                **income_statement.get(year, {})
            )
            db.add(stmt)
            
        # Ratios, Scorer, SWOT, Recommendation (Reuse existing logic)
        ratios = FinancialCalculator.calculate_all_ratios(latest_balance, latest_income)
        credit_score = CreditScorer.calculate_full_score(ratios)
        swot = SWOTGenerator().generate_swot(company_info, ratios, language)
        recommendation = RecommendationEngine.generate_recommendation(
            credit_score['total_score'], credit_score['category'], 
            ratios.get('profit_to_loan_ratio', 1.0), ratios, language
        )
        
        # Save Analysis
        analysis = AnalysisResult(
            company_id=company.id,
            total_credit_score=credit_score['total_score'],
            credit_category=credit_score['category'],
            swot_analysis=swot,
            recommendation=recommendation['decision'],
            recommendation_justification=recommendation['justification'],
            current_ratio=ratios.get('current_ratio'),
            roe=ratios.get('roe'),
            roa=ratios.get('roa'),
            debt_to_assets=ratios.get('debt_to_assets'),
            profit_margin=ratios.get('profit_margin'),
            language=language,
            analyzed_by=current_user.id
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return {
            "analysis_id": analysis.id,
            "company_name": company.name,
            "message": "Split analysis complete"
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Split upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        for p in temp_paths:
            if os.path.exists(p): os.unlink(p)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analysis results by ID"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    return {
        **analysis.__dict__,
        "company_name": company.name if company else "Unknown",
        "company_industry": company.industry if company else "N/A",
        "years_in_business": company.years_in_business if company else 0,
        "justification": analysis.recommendation_justification
    }

@router.get("/")
def list_analyses(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all analyses"""
    analyses = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()
    results = []
    for analysis in analyses:
        company = db.query(Company).filter(Company.id == analysis.company_id).first()
        results.append({
            "id": analysis.id,
            "company_name": company.name if company else "Unknown",
            "credit_score": float(analysis.total_credit_score) if analysis.total_credit_score else 0,
            "category": analysis.credit_category,
            "recommendation": analysis.recommendation.value if analysis.recommendation else None,
            "created_at": analysis.created_at,
            "application_status": analysis.application_status.value if analysis.application_status else "UNDER_REVIEW",
            "payment_behavior": analysis.payment_behavior.value if analysis.payment_behavior else "NA"
        })
    return {"analyses": results, "total": len(results)}

@router.patch("/{analysis_id}/status", response_model=AnalysisResponse)
def update_analysis_status(
    analysis_id: int,
    status_update: AnalysisUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update analysis application status and payment behavior"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    if status_update.application_status:
        try:
            analysis.application_status = ApplicationStatus(status_update.application_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid application status: {status_update.application_status}")
            
    if status_update.payment_behavior:
        try:
            analysis.payment_behavior = PaymentBehavior(status_update.payment_behavior)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid payment behavior: {status_update.payment_behavior}")
            
    db.commit()
    db.refresh(analysis)
    
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    return {
        **analysis.__dict__,
        "company_name": company.name if company else "Unknown",
        "company_industry": company.industry if company else "N/A",
        "years_in_business": company.years_in_business if company else 0,
        "justification": analysis.recommendation_justification
    }

@router.get("/{analysis_id}/export/pdf")
async def export_pdf(
    analysis_id: int,
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    
    analysis_data = {
        'company_name': company.name if company else 'Unknown',
        'total_credit_score': float(analysis.total_credit_score) if analysis.total_credit_score else 0,
        'credit_category': analysis.credit_category,
        'credit_history_score': float(analysis.credit_history_score) if analysis.credit_history_score else 0,
        'solvency_score': float(analysis.solvency_score) if analysis.solvency_score else 0,
        'profitability_score': float(analysis.profitability_score) if analysis.profitability_score else 0,
        'current_ratio': float(analysis.current_ratio) if analysis.current_ratio else 0,
        'debt_to_assets': float(analysis.debt_to_assets) if analysis.debt_to_assets else 0,
        'roe': float(analysis.roe) if analysis.roe else 0,
        'roa': float(analysis.roa) if analysis.roa else 0,
        'profit_margin': float(analysis.profit_margin) if analysis.profit_margin else 0,
        'interest_coverage': float(analysis.interest_coverage) if analysis.interest_coverage else 0,
        'swot_analysis': analysis.swot_analysis,
        'recommendation': analysis.recommendation.value if analysis.recommendation else 'PENDING',
        'recommendation_justification': analysis.recommendation_justification,
        'conditions': analysis.conditions
    }
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
        generator = PDFReportGenerator(language=language)
        generator.generate(analysis_data, tmp.name)
        return FileResponse(tmp.name, media_type='application/pdf', filename=f"credit_analysis_{company.name}_{analysis_id}.pdf")

@router.get("/{analysis_id}/export/excel")
async def export_excel(
    analysis_id: int,
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    statements = db.query(FinancialStatement).filter(FinancialStatement.company_id == analysis.company_id).all()
    
    company_data = {
        'name': company.name if company else 'Unknown',
        'industry': company.industry if company else 'N/A',
        'years_in_business': company.years_in_business if company else 0,
        'analyzed_by': current_user.username
    }
    
    analysis_data = {
        'total_credit_score': float(analysis.total_credit_score) if analysis.total_credit_score else 0,
        'credit_category': analysis.credit_category,
        'credit_history_score': float(analysis.credit_history_score) if analysis.credit_history_score else 0,
        'solvency_score': float(analysis.solvency_score) if analysis.solvency_score else 0,
        'profitability_score': float(analysis.profitability_score) if analysis.profitability_score else 0,
        'current_ratio': float(analysis.current_ratio) if analysis.current_ratio else 0,
        'debt_to_assets': float(analysis.debt_to_assets) if analysis.debt_to_assets else 0,
        'leverage_ratio': float(analysis.leverage_ratio) if analysis.leverage_ratio else 0,
        'roe': float(analysis.roe) if analysis.roe else 0,
        'roa': float(analysis.roa) if analysis.roa else 0,
        'profit_margin': float(analysis.profit_margin) if analysis.profit_margin else 0,
        'ebitda_margin': float(analysis.ebitda_margin) if analysis.ebitda_margin else 0,
        'interest_coverage': float(analysis.interest_coverage) if analysis.interest_coverage else 0,
        'asset_turnover': float(analysis.asset_turnover) if analysis.asset_turnover else 0,
        'swot_analysis': analysis.swot_analysis,
        'recommendation': analysis.recommendation.value if analysis.recommendation else 'PENDING',
        'recommendation_justification': analysis.recommendation_justification,
        'conditions': analysis.conditions
    }
    
    financial_statements_data = [{
        'year': stmt.year,
        'current_assets': float(stmt.current_assets) if stmt.current_assets else 0,
        'cash': float(stmt.cash) if stmt.cash else 0,
        'accounts_receivable': float(stmt.accounts_receivable) if stmt.accounts_receivable else 0,
        'inventory': float(stmt.inventory) if stmt.inventory else 0,
        'fixed_assets': float(stmt.fixed_assets) if stmt.fixed_assets else 0,
        'total_assets': float(stmt.total_assets) if stmt.total_assets else 0,
        'current_liabilities': float(stmt.current_liabilities) if stmt.current_liabilities else 0,
        'accounts_payable': float(stmt.accounts_payable) if stmt.accounts_payable else 0,
        'long_term_debt': float(stmt.long_term_debt) if stmt.long_term_debt else 0,
        'total_liabilities': float(stmt.total_liabilities) if stmt.total_liabilities else 0,
        'shareholder_equity': float(stmt.shareholder_equity) if stmt.shareholder_equity else 0,
        'revenue': float(stmt.revenue) if stmt.revenue else 0,
        'cost_of_goods_sold': float(stmt.cost_of_goods_sold) if stmt.cost_of_goods_sold else 0,
        'gross_profit': float(stmt.gross_profit) if stmt.gross_profit else 0,
        'operating_expenses': float(stmt.operating_expenses) if stmt.operating_expenses else 0,
        'operating_income': float(stmt.operating_income) if stmt.operating_income else 0,
        'interest_expense': float(stmt.interest_expense) if stmt.interest_expense else 0,
        'tax_expense': float(stmt.tax_expense) if stmt.tax_expense else 0,
        'net_profit': float(stmt.net_profit) if stmt.net_profit else 0,
        'ebitda': float(stmt.ebitda) if stmt.ebitda else 0
    } for stmt in statements]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        generator = ExcelReportGenerator(language=language)
        generator.generate(analysis_data, company_data, financial_statements_data, tmp.name)
        return FileResponse(tmp.name, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=f"credit_analysis_{company.name}_{analysis_id}.xlsx")
