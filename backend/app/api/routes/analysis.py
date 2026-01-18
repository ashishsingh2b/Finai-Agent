from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.api.deps import get_current_active_user
from app.services.file_processing.excel_parser import ExcelParser
from app.services.financial.calculator import FinancialCalculator
from app.services.financial.credit_scorer import CreditScorer
from app.services.financial.recommendation_engine import RecommendationEngine
from app.services.ai.swot_generator import SWOTGenerator
from app.models.user import User
from app.models.company import Company
from app.models.financial_statement import FinancialStatement
from app.models.analysis import AnalysisResult
from app.schemas.analysis import AnalysisResponse
import tempfile
import os
import logging

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
    Upload Excel financial statement and perform complete credit analysis
    """
    
    # Validate file type
    if not (file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only Excel files (.xlsx, .xls) are supported"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name
    
    try:
        # Step 1: Parse Excel file
        logger.info(f"Parsing Excel file: {file.filename}")
        parser = ExcelParser(tmp_path)
        extracted_data = parser.extract_all()
        
        company_info = extracted_data['company_info']
        balance_sheet = extracted_data['balance_sheet']
        income_statement = extracted_data['income_statement']
        validation_errors = extracted_data['validation_errors']
        
        # Check for validation errors
        if validation_errors:
            logger.warning(f"Validation errors found: {validation_errors}")
            # Continue anyway but log warnings
        
        # Get latest year data
        latest_year = max(balance_sheet.keys())
        latest_balance = balance_sheet[latest_year]
        latest_income = income_statement[latest_year]
        
        # Step 2: Create company record
        company = Company(
            name=company_info['name'],
            industry=company_info.get('industry'),
            years_in_business=company_info.get('years_in_business'),
            created_by=current_user.id
        )
        db.add(company)
        db.flush()  # Get company ID
        
        # Step 3: Save financial statements
        for year in balance_sheet.keys():
            financial_stmt = FinancialStatement(
                company_id=company.id,
                year=year,
                **balance_sheet[year],
                **income_statement[year]
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
            bureau_score=75,  # Default - would come from Bureau de Crédito API
            revenue_growth=0,  # Calculate from multi-year data
            profit_growth=0
        )
        
        # Step 6: SWOT Analysis
        logger.info("Generating SWOT analysis")
        swot_gen = SWOTGenerator()
        swot = swot_gen.generate_swot(company_info, ratios, language)
        
        # Step 7: Generate Recommendation
        logger.info("Generating recommendation")
        profit_to_loan = ratios.get('profit_to_loan_ratio', latest_income['net_profit'] / 1000000)  # Default loan 1M
        recommendation = RecommendationEngine.generate_recommendation(
            credit_score['total_score'],
            credit_score['category'],
            profit_to_loan,
            ratios,
            language
        )
        
        # Step 8: Save analysis result
        analysis = AnalysisResult(
            company_id=company.id,
            # Ratios
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
            # Credit score
            credit_history_score=credit_score['breakdown']['credit_history'],
            solvency_score=credit_score['breakdown']['solvency'],
            profitability_score=credit_score['breakdown']['profitability'],
            total_credit_score=credit_score['total_score'],
            credit_category=credit_score['category'],
            # SWOT & Recommendation
            swot_analysis=swot,
            recommendation=recommendation['decision'],
            recommendation_justification=recommendation['justification'],
            conditions=recommendation.get('conditions'),
            # Metadata
            language=language,
            analyzed_by=current_user.id
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        logger.info(f"Analysis complete for company: {company.name} (ID: {company.id})")
        
        return {
            "message": "Analysis completed successfully",
            "company_id": company.id,
            "analysis_id": analysis.id,
            "company_name": company.name,
            "credit_score": credit_score['total_score'],
            "credit_category": credit_score['category'],
            "recommendation": recommendation['decision']
        }
    
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )
    
    finally:
        # Clean up temporary file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

@router.get("/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get analysis results by ID"""
    
    analysis = db.query(AnalysisResult).filter(AnalysisResult.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Get company name
    company = db.query(Company).filter(Company.id == analysis.company_id).first()
    
    return {
        **analysis.__dict__,
        "company_name": company.name if company else "Unknown",
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
    
    analyses = db.query(AnalysisResult).offset(skip).limit(limit).all()
    
    results = []
    for analysis in analyses:
        company = db.query(Company).filter(Company.id == analysis.company_id).first()
        results.append({
            "id": analysis.id,
            "company_name": company.name if company else "Unknown",
            "credit_score": float(analysis.total_credit_score) if analysis.total_credit_score else 0,
            "category": analysis.credit_category,
            "recommendation": analysis.recommendation.value if analysis.recommendation else None,
            "created_at": analysis.created_at
        })
    
    return {"analyses": results, "total": len(results)}
