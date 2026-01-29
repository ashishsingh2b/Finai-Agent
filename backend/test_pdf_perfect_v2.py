from app.services.reports.pdf_generator import PDFReportGenerator
import os

def test_pdf_perfection_v2():
    analysis_data = {
        'company_name': 'Test Company SA',
        'total_credit_score': 75.0,
        'credit_category': 'B',
        'collateral_type': 2,
        'credit_history_score': 75.0, # 75 * 0.4 = 30.0
        'solvency_score': 100.0,     # 100 * 0.3 = 30.0
        'profitability_score': 50.0, # 50 * 0.3 = 15.0
        'current_ratio': 1.8,
        'debt_to_assets': 0.4,
        'roe': 15.5,
        'roa': 8.2,
        'profit_margin': 12.0,
        'interest_coverage': 4.5,
        'leverage_ratio': 0.3,
        'sales_trend': 10.5,
        'net_income_coverage': 2.5,
        'swot_analysis': {
            'strengths': ['Solid cash flow', 'Experienced management'],
            'weaknesses': ['Competitive market'],
            'opportunities': ['Expansion into new regions'],
            'threats': ['Regulatory changes']
        },
        'recommendation': 'APPROVE',
        'recommendation_justification': ['Low risk profile', 'High solvency'],
        'conditions': ['Quarterly financial review'],
        'requested_loan_amount': 1000000,
        'approved_amount': 1000000,
        'loan_term_months': 24,
        'credit_type': 'Amortized'
    }
    
    generator = PDFReportGenerator(language='en')
    output_path = "perfected_report_v2.pdf"
    
    try:
        generator.generate(analysis_data, output_path)
        print(f"Success! PDF generated at {os.path.abspath(output_path)}")
    except Exception as e:
        print(f"Error generating PDF: {e}")

if __name__ == "__main__":
    test_pdf_perfection_v2()
