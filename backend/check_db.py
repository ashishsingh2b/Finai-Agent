from app.utils.database import SessionLocal
from app.models.analysis import AnalysisResult
from app.models.company import Company

def check_latest_analysis():
    db = SessionLocal()
    try:
        analysis = db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).first()
        if not analysis:
            print("No analysis found.")
            return
            
        company = db.query(Company).filter(Company.id == analysis.company_id).first()
        print(f"Analysis for Company: {company.name if company else 'Unknown'}")
        print(f"Requested Amount: {analysis.requested_loan_amount}")
        print(f"ROE: {analysis.roe}")
        print(f"Leverage: {analysis.leverage_ratio}")
        print(f"Sales Trend: {analysis.sales_trend}")
        print(f"Net Income Coverage (stored): {analysis.net_income_coverage}")
        
    finally:
        db.close()

if __name__ == "__main__":
    check_latest_analysis()
