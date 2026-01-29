from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.api.deps import get_current_active_user
from app.services.file_processing.excel_parser import ExcelParser
from app.services.file_processing.pdf_parser import PDFParser
from app.services.reports.pdf_generator import PDFReportGenerator
from app.services.reports.excel_generator import ExcelReportGenerator
from app.services.reports.bulk_excel_generator import BulkExcelReportGenerator
from app.services.reports.bulk_pdf_generator import BulkPDFReportGenerator
from app.services.financial.calculator import FinancialCalculator
from app.services.financial.credit_scorer import CreditScorer
from app.services.financial.recommendation_engine import RecommendationEngine
from app.services.financial.validation_service import FinancialValidationService
from app.services.ai.swot_generator import SWOTGenerator
from app.services.file_processing.file_merger import FileMerger
from app.services.file_processing.file_manager import FileManager
from app.models.user import User
from app.models.company import Company
from app.models.financial_statement import FinancialStatement
from app.models.analysis import AnalysisResult, ApplicationStatus, PaymentBehavior, ValidationStatus
from app.schemas.analysis import AnalysisResponse, AnalysisUpdateStatus
import tempfile
import os
import logging
from typing import List
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analysis", tags=["Credit Analysis"])

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_and_analyze(
    file: UploadFile = File(...),
    loan_amount: float = Form(0),
    loan_term: int = Form(12),
    credit_type: str = Form("NEW"),
    credit_score: int = Form(75),
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
    
    # Determine file type and save using FileManager
    file_ext = '.pdf' if file.filename.lower().endswith('.pdf') else '.xlsx'
    
    try:
        # Save file to permanent storage
        tmp_path = FileManager.save_upload(file)
        logger.info(f"File stored properly at: {tmp_path}")
        
        # Initialize appropriate parser based on extension
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
            error_msg = "Could not extract financial data from the provided file. Please ensure it follows the required format."
            logger.error(f"Upload 422 Error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_msg
            )

        # Step 1.5: Mandatory Validations
        final_loan_amount = company_info.get('requested_amount', 0) if company_info.get('requested_amount', 0) > 0 else loan_amount
        final_loan_term = company_info.get('loan_term', 0) if company_info.get('loan_term', 0) > 0 else loan_term
        final_credit_type = company_info.get('credit_type') if company_info.get('credit_type') else credit_type
        
        # Log parsed values for debugging
        logger.info(f"Parsed Info - Amount: {final_loan_amount}, Term: {final_loan_term}, Type: {final_credit_type}")

        is_valid, validation_alerts = FinancialValidationService.validate(
            balance_sheet, 
            income_statement,
            final_loan_amount,
            final_loan_term,
            final_credit_type
        )

        if not is_valid:
            logger.warning(f"Mandatory validation failed for {file.filename}: {validation_alerts}")
            logger.error(f"Upload 422 Error: Mandatory validation failed")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={
                    "message": "Mandatory financial validations failed.",
                    "alerts": [a for a in validation_alerts if a['level'] == 'BLOCKING']
                }
            )
            
        # Get latest year data
        years = list(balance_sheet.keys())
        if not years:
            error_msg = "No financial years found in the document. Please provide a standard balance sheet."
            logger.error(f"Upload 422 Error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_msg
            )
            
        latest_year = max(years)
        latest_balance = balance_sheet[latest_year]
        latest_income = income_statement.get(latest_year)
        
        # Validate that we actually have enough data to calculate ratios
        if latest_balance.get('total_assets', 0) == 0:
            error_msg = "Could not find 'Total Assets' in the document. Please ensure your balance sheet is clearly readable."
            logger.error(f"Upload 422 Error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_msg
            )

        if not latest_income or latest_income.get('revenue', 0) == 0:
            error_msg = f"Income statement data (Revenue/Sales) missing or zero for year {latest_year}. Please provide a complete profit and loss statement."
            logger.error(f"Upload 422 Error: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=error_msg
            )
        
        # Entity Management: Identify or create Company
        # Use extracted metadata if available, fallback to filename if unknown
        company_name = company_info.get('name', 'Unknown Company')
        if company_name == 'Unknown Company':
            # Clean filename (remove extension) as fallback
            company_name = os.path.splitext(file.filename)[0].replace('_', ' ').replace('-', ' ').title()

        industry = company_info.get('industry')
        years_in_business = company_info.get('years_in_business')
        
        company = db.query(Company).filter(Company.name == company_name, Company.created_by == current_user.id).first()
        if not company:
            company = Company(
                name=company_name,
                industry=industry,
                years_in_business=years_in_business,
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

        # Merge file metadata with API params (File takes precedence if API params are defaults)
        file_amount = company_info.get('requested_amount', 0)
        file_term = company_info.get('loan_term', 0)
        file_rate = company_info.get('interest_rate', 0)
        file_collateral = company_info.get('collateral_type', 2)
        file_type = company_info.get('credit_type')

        final_loan_amount = loan_amount if loan_amount > 0 else file_amount
        final_loan_term = loan_term if loan_term > 0 else file_term
        final_credit_type = credit_type if credit_type else file_type
        
        # Step 5: Credit scoring
        logger.info("Calculating credit score")
        credit_score_result = CreditScorer.calculate_full_score(
            ratios,
            bureau_score=credit_score,
            revenue_growth=0,
            profit_growth=0
        )
        
        # Step 6: SWOT Analysis
        logger.info("Generating SWOT analysis")
        swot_gen = SWOTGenerator()
        swot = swot_gen.generate_swot(company_info, ratios, language)
        
        # Step 7: Calculate Multi-Year Metrics
        logger.info("Calculating multi-year metrics")
        sales_trend = 0.0
        sorted_years = sorted(income_statement.keys())
        if len(sorted_years) >= 2:
            current_rev = income_statement[sorted_years[-1]].get('revenue', 0)
            prev_rev = income_statement[sorted_years[-2]].get('revenue', 0)
            sales_trend = FinancialCalculator.calculate_sales_trend(current_rev, prev_rev)
        
        net_income_coverage = FinancialCalculator.calculate_net_income_coverage(
            latest_income.get('net_profit', 0),
            final_loan_amount if final_loan_amount > 0 else 1000000 # Fallback
        )

        # Step 8: Generate Recommendation
        logger.info("Generating recommendation")
        profit_to_loan = ratios.get('profit_to_loan_ratio', latest_income.get('net_profit', 0) / (final_loan_amount if final_loan_amount > 0 else 1000000))
        recommendation = RecommendationEngine.generate_recommendation(
            credit_score_result['total_score'],
            credit_score_result['category'],
            profit_to_loan,
            ratios,
            language
        )
        
        # Step 9: Save analysis result
        # Calculate approved amount logic
        approved_amt = final_loan_amount * 0.8
        if credit_score_result['category'] == 'A':
            approved_amt = final_loan_amount # 100% approval for A grade
            
        if recommendation['decision'] == 'REJECT':
            approved_amt = 0 # No amount authorized if rejected
            
        # Calculate calculated interest rate (Spread only, TIIE is separate field)
        spread_matrix = {
            'A': {1: 10.0, 2: 12.0, 3: 16.0, 4: 22.0, 5: 30.0},
            'B': {1: 12.5, 2: 14.5, 3: 18.5, 4: 24.5, 5: 32.5},
            'C': {1: 17.5, 2: 19.5, 3: 23.5, 4: 29.5, 5: 37.5}, 
            'D': {1: 25.0, 2: 27.0, 3: 31.0, 4: 37.0, 5: 45.0},
            'E': {1: 35.0, 2: 37.0, 3: 41.0, 4: 47.0, 5: 55.0}
        }
        
        category = credit_score_result['category']
        # Default to collateral quality 2 (Standard Secured) if not specified
        current_collateral = file_collateral if file_collateral in [1, 2, 3, 4, 5] else 2
        spread = spread_matrix.get(category, spread_matrix['C']).get(current_collateral, 12.0)
        calculated_spread = spread / 100.0 # Convert to decimal (e.g. 0.12)
            
        analysis = AnalysisResult(
            company_id=company.id,
            requested_loan_amount=final_loan_amount,
            approved_amount=approved_amt, 
            loan_term_months=final_loan_term,
            credit_type=final_credit_type,
            collateral_type=file_collateral,
            applicable_interest_rate=calculated_spread, 
            tiie_rate_used=0.1125, # Synchronized 11.25% TIIE
            
            # Solvency & Liquidity
            current_ratio=ratios.get('current_ratio'),
            debt_to_assets=ratios.get('debt_to_assets'),
            leverage_ratio=ratios.get('leverage_ratio'),
            interest_coverage=ratios.get('interest_coverage'),
            
            # Profitability
            roe=ratios.get('roe'),
            roa=ratios.get('roa'),
            profit_margin=ratios.get('profit_margin'),
            ebitda_margin=ratios.get('ebitda_margin'),
            asset_turnover=ratios.get('asset_turnover'),
            
            # Trends & Coverage
            sales_trend=sales_trend,
            net_income_coverage=net_income_coverage,
            profit_to_loan_ratio=profit_to_loan,
            
            # Cycles
            dso=ratios.get('dso'),
            dio=ratios.get('dio'),
            dpo=ratios.get('dpo'),
            cash_conversion_cycle=ratios.get('cash_conversion_cycle'),
            
            # Scoring (using breakdown keys from CreditScorer)
            credit_history_score=credit_score_result['breakdown']['credit_history'],
            solvency_score=credit_score_result['breakdown']['solvency'],
            profitability_score=credit_score_result['breakdown']['profitability'],
            total_credit_score=credit_score_result['total_score'],
            credit_category=credit_score_result['category'],
            risk_level=RecommendationEngine.generate_recommendation(credit_score_result['total_score'], credit_score_result['category'], profit_to_loan, ratios, language).get('risk_level', 'MEDIUM'),
            
            # SWOT & Recommendations
            swot_analysis=swot,
            recommendation=recommendation['decision'],
            recommendation_justification=recommendation['justification'],
            conditions=recommendation.get('conditions'),
            
            validation_status=ValidationStatus.VALID if is_valid else ValidationStatus.WARNINGS,
            validation_alerts=validation_alerts,
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
            "credit_score": credit_score_result['total_score'],
            "credit_category": credit_score_result['category'],
            "recommendation": recommendation['decision']
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        db.rollback()
        # Provide a more user-friendly message for common parsing/subscript errors
        error_msg = str(e)
        if "subscriptable" in error_msg.lower():
            error_msg = "Data structure mismatch in analysis engine. Please ensure your files contain valid financial figures."
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis engine error: {error_msg}"
        )
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.post("/upload-split", status_code=status.HTTP_201_CREATED)
async def upload_split_files(
    files: List[UploadFile] = File(...),
    loan_amount: float = Form(0),
    loan_term: int = Form(12),
    credit_type: str = Form("NEW"),
    credit_score: int = Form(75),
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
                detail="Across all uploaded files, we couldn't find a complete financial statement. Please ensure your documents include both a Balance Sheet and an Income Statement."
            )
            
        years = sorted(balance_sheet.keys())
        latest_year = years[-1]
        
        if balance_sheet[latest_year].get('total_assets', 0) == 0:
            raise HTTPException(
                status_code=422,
                detail=f"In the consolidated data for {latest_year}, 'Total Assets' is missing. Please check if your documents are readable or clearly labeled."
            )

        if latest_year not in income_statement or income_statement[latest_year].get('revenue', 0) == 0:
            raise HTTPException(
                status_code=422,
                detail=f"Consolidated Income Statement data (Revenue) is missing for {latest_year}. Please ensure your profit and loss statements are uploaded."
            )

        latest_balance = balance_sheet[latest_year]
        latest_income = income_statement[latest_year]
            
        # Merge file metadata with API params
        file_amount = company_info.get('requested_amount', 0)
        file_term = company_info.get('loan_term', 0)
        file_rate = company_info.get('interest_rate', 0)
        file_type = company_info.get('credit_type')

        final_loan_amount = loan_amount if loan_amount > 0 else file_amount
        final_loan_term = loan_term if loan_term > 0 else file_term
        final_credit_type = credit_type if credit_type else file_type

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
        credit_score_result = CreditScorer.calculate_full_score(ratios, bureau_score=credit_score)
        swot = SWOTGenerator().generate_swot(company_info, ratios, language)
        recommendation = RecommendationEngine.generate_recommendation(
            credit_score_result['total_score'], credit_score_result['category'], 
            ratios.get('profit_to_loan_ratio', 1.0), ratios, language
        )
        
        # Save Analysis
        # Calculate approved amount logic
        approved_amt = final_loan_amount * 0.8
        if credit_score_result['category'] == 'A':
            approved_amt = final_loan_amount
            
        analysis = AnalysisResult(
            company_id=company.id,
            requested_loan_amount=final_loan_amount,
            approved_amount=approved_amt,
            loan_term_months=final_loan_term,
            credit_type=final_credit_type,
            applicable_interest_rate=file_rate,
            tiie_rate_used=0.1125,
            total_credit_score=credit_score_result['total_score'],
            credit_category=credit_score_result['category'],
            credit_history_score=credit_score_result['breakdown']['credit_history'],
            solvency_score=credit_score_result['breakdown']['solvency'],
            profitability_score=credit_score_result['breakdown']['profitability'],
            swot_analysis=swot,
            recommendation=recommendation['decision'],
            recommendation_justification=recommendation['justification'],
            conditions=recommendation.get('conditions'),
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
        logger.error(f"Split upload failed: {e}", exc_info=True)
        error_msg = str(e)
        if "subscriptable" in error_msg.lower():
            error_msg = "Data structure mismatch during file merging. Please check if your documents follow the standard financial format."
            
        raise HTTPException(
            status_code=500, 
            detail=f"Merge analysis error: {error_msg}"
        )
    finally:
        for p in temp_paths:
            if os.path.exists(p): os.unlink(p)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analysis results by ID, optionally translated on-the-fly"""
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    analyst = db.query(User).filter(User.id == analysis.analyzed_by).first()

    # Re-derive swot and recommendations if requested language differs from stored language
    swot = analysis.swot_analysis
    recommendation_justification = analysis.recommendation_justification
    conditions = analysis.conditions

    if language != analysis.language:
        logger.info(f"Re-deriving localized content for analysis {analysis_id} (requested: {language}, stored: {analysis.language})")
        ratios = {
            'current_ratio': float(analysis.current_ratio) if analysis.current_ratio else 0,
            'debt_to_assets': float(analysis.debt_to_assets) if analysis.debt_to_assets else 0,
            'leverage_ratio': float(analysis.leverage_ratio) if analysis.leverage_ratio else 0,
            'roe': float(analysis.roe) if analysis.roe else 0,
            'roa': float(analysis.roa) if analysis.roa else 0,
            'profit_margin': float(analysis.profit_margin) if analysis.profit_margin else 0,
            'interest_coverage': float(analysis.interest_coverage) if analysis.interest_coverage else 0,
            'ebitda_margin': float(analysis.ebitda_margin) if analysis.ebitda_margin else 0,
            'profit_to_loan_ratio': float(analysis.profit_to_loan_ratio) if analysis.profit_to_loan_ratio else 1.0
        }
        
        company_info = {
            'name': company.name if company else 'Company',
            'industry': company.industry if company else 'General',
            'years_in_business': company.years_in_business
        }

        # Use SWOTGenerator._generate_rule_based_swot to avoid expensive/slow LLM calls during GET
        # or use SWOTGenerator.generate_swot if you want the full AI experience (user might prefer fast retrieval)
        swot_gen = SWOTGenerator()
        swot = swot_gen.generate_swot(company_info, ratios, language)

        rec_engine = RecommendationEngine()
        rec_data = rec_engine.generate_recommendation(
            float(analysis.total_credit_score) if analysis.total_credit_score else 0,
            analysis.credit_category,
            ratios['profit_to_loan_ratio'],
            ratios,
            language
        )
        recommendation_justification = rec_data['justification']
        conditions = rec_data.get('conditions')

    return {
        **analysis.__dict__,
        "company_name": company.name if company else "Unknown",
        "company_industry": company.industry if company else "N/A",
        "years_in_business": company.years_in_business if company else 0,
        "analyzed_by_name": analyst.full_name if analyst else "System Neural Engine",
        "swot_analysis": swot,
        "justification": recommendation_justification,
        "conditions": conditions
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
            "payment_behavior": analysis.payment_behavior.value if analysis.payment_behavior else "NA",
            "credit_amount": float(analysis.approved_amount) if analysis.approved_amount else 0,
            "requested_amount": float(analysis.requested_loan_amount) if analysis.requested_loan_amount else 0,
        })
    return {"analyses": results, "total": len(results)}

@router.post("/{analysis_id}/status", response_model=AnalysisResponse)
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
    
    logger.info(f"Updating analysis {analysis_id} with status: {status_update.application_status}, behavior: {status_update.payment_behavior}")
    
    if status_update.application_status:
        try:
            analysis.application_status = ApplicationStatus(status_update.application_status)
            logger.info(f"Set application_status to {analysis.application_status}")
        except ValueError:
            logger.error(f"Invalid application status: {status_update.application_status}")
            raise HTTPException(status_code=400, detail=f"Invalid application status: {status_update.application_status}")
            
    if status_update.payment_behavior:
        try:
            analysis.payment_behavior = PaymentBehavior(status_update.payment_behavior)
            logger.info(f"Set payment_behavior to {analysis.payment_behavior}")
        except ValueError:
            logger.error(f"Invalid payment behavior: {status_update.payment_behavior}")
            raise HTTPException(status_code=400, detail=f"Invalid payment behavior: {status_update.payment_behavior}")
            
    db.commit()
    db.refresh(analysis)
    logger.info(f"Committed changes for analysis {analysis_id}. Final status: {analysis.application_status}")
    
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
        'collateral_type': analysis.collateral_type if analysis.collateral_type else 2,
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
        'analyzed_by': current_user.full_name
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
        'long_term_debt': float(stmt.long_term_liabilities) if stmt.long_term_liabilities else 0,
        'total_liabilities': float(stmt.total_liabilities) if stmt.total_liabilities else 0,
        'shareholder_equity': float(stmt.shareholder_equity) if stmt.shareholder_equity else 0,
        'revenue': float(stmt.revenue) if stmt.revenue else 0,
        'cost_of_goods_sold': float(stmt.cost_of_goods_sold) if stmt.cost_of_goods_sold else 0,
        'gross_profit': float(stmt.gross_profit) if stmt.gross_profit else 0,
        'operating_expenses': float(stmt.operating_expenses) if stmt.operating_expenses else 0,
        'operating_income': float(stmt.gross_profit - stmt.operating_expenses) if (stmt.gross_profit is not None and stmt.operating_expenses is not None) else 0,
        'interest_expense': float(stmt.interest_expense) if stmt.interest_expense else 0,
        'tax_expense': 0, # Not in current model
        'net_profit': float(stmt.net_profit) if stmt.net_profit else 0,
        'ebitda': float(stmt.ebitda) if stmt.ebitda else 0
    } for stmt in statements]
    
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        generator = ExcelReportGenerator(language=language)
        generator.generate(analysis_data, company_data, financial_statements_data, tmp.name)
        return FileResponse(tmp.name, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=f"credit_analysis_{company.name}_{analysis_id}.xlsx")
@router.get("/export/bulk")
async def export_all_analyses(
    format: str = "excel",
    language: str = "es",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Fetch all analyses for the user (or all if admin, but here we stick to analyzed_by or all for simplicity based on project current state)
    analyses = db.query(AnalysisResult).all()
    
    data = []
    for analysis in analyses:
        company = db.query(Company).filter(Company.id == analysis.company_id).first()
        data.append({
            'id': analysis.id,
            'company_name': company.name if company else 'Unknown',
            'date': analysis.created_at.strftime('%Y-%m-%d') if analysis.created_at else 'N/A',
            'credit_score': float(analysis.total_credit_score) if analysis.total_credit_score else 0,
            'category': analysis.credit_category,
            'status': analysis.application_status.value if analysis.application_status else 'UNDER_REVIEW',
            'requested_amount': float(analysis.requested_loan_amount) if analysis.requested_loan_amount else 0,
            'approved_amount': float(analysis.approved_amount) if analysis.approved_amount else 0
        })
    
    if format == 'pdf':
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            generator = BulkPDFReportGenerator(language=language)
            generator.generate(data, tmp.name)
            return FileResponse(tmp.name, media_type='application/pdf', filename=f"all_credit_analyses_{datetime.now().strftime('%Y%m%d')}.pdf")
    else:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
            generator = BulkExcelReportGenerator(language=language)
            generator.generate(data, tmp.name)
            return FileResponse(tmp.name, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename=f"all_credit_analyses_{datetime.now().strftime('%Y%m%d')}.xlsx")
