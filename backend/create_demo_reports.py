import openpyxl
from openpyxl.styles import Font, Alignment
import os

def create_demo_excel(filename, company_name, financial_profile, metadata=None):
    wb = openpyxl.Workbook()
    
    # --- BG Sheet (Balance General) ---
    ws_bg = wb.active
    ws_bg.title = "BG"
    
    # Metadata Headers (Rows 1-6)
    ws_bg['A1'] = "MOSKALTI CAPITAL"
    ws_bg['A1'].font = Font(bold=True, size=14)
    ws_bg['A2'] = "ANALISIS FINANCIERO"
    
    ws_bg['A4'] = f"Prospecto: {company_name}"
    ws_bg['A4'].font = Font(bold=True)
    
    if metadata:
        ws_bg['A5'] = f"Industry: {metadata.get('industry', '')}"
        ws_bg['B5'] = metadata.get('industry', '') # Dual column for safety
        
        ws_bg['A6'] = f"Years in Business: {metadata.get('years_in_business', '')}"
        ws_bg['B6'] = metadata.get('years_in_business', '')
        
        ws_bg['A7'] = f"Requested Amount: {metadata.get('requested_amount', '')}"
        ws_bg['B7'] = metadata.get('requested_amount', '')
        
        ws_bg['A8'] = f"Loan Term: {metadata.get('loan_term', '')}"
        ws_bg['B8'] = metadata.get('loan_term', '')
        
        ws_bg['A9'] = f"Interest Rate: {metadata.get('interest_rate', '')}"
        ws_bg['B9'] = metadata.get('interest_rate', '')
        
        ws_bg['A10'] = f"Credit Type: {metadata.get('credit_type', '')}"
        ws_bg['B10'] = metadata.get('credit_type', '')

        ws_bg['A11'] = f"Collateral Type: {metadata.get('collateral_type', '')}"
        ws_bg['B11'] = metadata.get('collateral_type', '')

    # Years
    years = [2021, 2022, 2023]
    header_row = 13 # Shifted down by 1 for collateral
    for i, year in enumerate(years):
        col = openpyxl.utils.get_column_letter(i + 2)
        ws_bg[f'{col}{header_row}'] = year
        ws_bg[f'{col}{header_row}'].font = Font(bold=True)
    
    # Rows
    rows = [
        ("EFECTIVO Y EQUIVALENTES", "cash"),
        ("CLIENTES", "accounts_receivable"),
        ("INVENTARIOS", "inventory"),
        ("TOTAL ACTIVO CIRCULANTE", "current_assets"),
        ("ACTIVO FIJO", "fixed_assets"),
        ("TOTAL ASSETS", "total_assets"),
        ("TOTAL PASIVO CIRCULANTE", "current_liabilities"),
        ("TOTAL DEL PASIVO", "total_liabilities"),
        ("TOTAL CAPITAL CONTABLE", "shareholder_equity")
    ]
    
    for idx, (label, key) in enumerate(rows):
        row_num = idx + header_row + 1
        ws_bg[f'A{row_num}'] = label
        for i, year in enumerate(years):
            col = openpyxl.utils.get_column_letter(i + 2)
            # Higher values for later years to show growth
            multiplier = 1 + (i * 0.1)
            val = financial_profile['bg'].get(key, 0) * multiplier
            ws_bg[f'{col}{row_num}'] = val

    # --- ER Sheet (Estado de Resultados) ---
    ws_er = wb.create_sheet("ER")
    ws_er['A5'] = f"Prospecto: {company_name}"
    
    # Years
    for i, year in enumerate(years):
        col = openpyxl.utils.get_column_letter(i + 2)
        ws_er[f'{col}7'] = year
        ws_er[f'{col}7'].font = Font(bold=True)
    
    # Increase Net Profit for Coverage Ratio > 2
    er_rows = [
        ("VENTAS NETAS", "revenue"),
        ("COSTO DE VENTAS", "cost_of_goods_sold"),
        ("UTILIDAD BRUTA", "gross_profit"),
        ("EBITDA", "ebitda"),
        ("UTILIDAD NETA", "net_profit")
    ]
    
    for idx, (label, key) in enumerate(er_rows):
        row_num = idx + 10
        ws_er[f'A{row_num}'] = label
        for i, year in enumerate(years):
            col = openpyxl.utils.get_column_letter(i + 2)
            multiplier = 1 + (i * 0.15) if key == 'revenue' else 1 + (i * 0.1)
            val = financial_profile['er'].get(key, 0) * multiplier
            ws_er[f'{col}{row_num}'] = val

    os.makedirs('demo_reports', exist_ok=True)
    wb.save(os.path.join('demo_reports', filename))
    print(f"Created: {filename}")

# --- Financial Profiles ---

# 1. Excellent (Grade A - Solid Coverage)
excellent = {
    'bg': {
        'cash': 800000, 'accounts_receivable': 400000, 'inventory': 200000,
        'current_assets': 1400000, 'fixed_assets': 2000000, 'total_assets': 3400000,
        'current_liabilities': 300000, 'total_liabilities': 600000, 'shareholder_equity': 2800000
    },
    'er': {
        'revenue': 12000000, 'cost_of_goods_sold': 5000000, 'gross_profit': 7000000,
        'ebitda': 5500000, 'net_profit': 4500000
    }
}

# 2. Good (Grade B - Moderate)
good = {
    'bg': {
        'cash': 300000, 'accounts_receivable': 300000, 'inventory': 200000,
        'current_assets': 800000, 'fixed_assets': 1000000, 'total_assets': 1800000,
        'current_liabilities': 400000, 'total_liabilities': 900000, 'shareholder_equity': 900000
    },
    'er': {
        'revenue': 2500000, 'cost_of_goods_sold': 1500000, 'gross_profit': 1000000,
        'ebitda': 500000, 'net_profit': 300000
    }
}

# 3. Average/Conditional (Grade C)
average = {
    'bg': {
        'cash': 150000, 'accounts_receivable': 400000, 'inventory': 350000,
        'current_assets': 900000, 'fixed_assets': 400000, 'total_assets': 1300000,
        'current_liabilities': 300000, 'total_liabilities': 600000, 'shareholder_equity': 700000
    },
    'er': {
        'revenue': 1800000, 'cost_of_goods_sold': 1200000, 'gross_profit': 600000,
        'ebitda': 250000, 'net_profit': 120000
    }
}

# 3. Risky (Grade D/E - Low Coverage)
risky = {
    'bg': {
        'cash': 50000, 'accounts_receivable': 100000, 'inventory': 400000,
        'current_assets': 550000, 'fixed_assets': 200000, 'total_assets': 750000,
        'current_liabilities': 600000, 'total_liabilities': 700000, 'shareholder_equity': 50000
    },
    'er': {
        'revenue': 1200000, 'cost_of_goods_sold': 1100000, 'gross_profit': 100000,
        'ebitda': 20000, 'net_profit': 10000
    }
}

if __name__ == '__main__':
    # Scenario 1: Grade A + Collateral 1 (Mortgage) -> Best Rate
    meta_a = {
        'industry': 'Technology', 'years_in_business': 10,
        'requested_amount': 2000000, 'loan_term': 36, 
        'interest_rate': 0.125, 'credit_type': 'Amortized',
        'collateral_type': 1
    }
    create_demo_excel("Case_1_GradeA_Collateral1.xlsx", "TECH LEADERS SA", excellent, meta_a)

    # Scenario 2: Grade B + Collateral 2 (Pledge) -> Standard
    meta_b = {
        'industry': 'Manufacturing', 'years_in_business': 5,
        'requested_amount': 1000000, 'loan_term': 24, 
        'interest_rate': 0.145, 'credit_type': 'New',
        'collateral_type': 2
    }
    create_demo_excel("Case_2_GradeB_Collateral2.xlsx", "FABRICA NORTE SA", good, meta_b)

    # Scenario 3: Grade D + Collateral 4 (Unsecured/Low) -> High Rate
    meta_d = {
        'industry': 'Retail', 'years_in_business': 2,
        'requested_amount': 500000, 'loan_term': 12, 
        'interest_rate': 0.25, 'credit_type': 'Working Capital',
        'collateral_type': 4
    }
    create_demo_excel("Case_3_GradeD_Collateral4.xlsx", "TIENDAS REGIONALES", risky, meta_d)

    # Scenario 4: Grade C + Collateral 3 (Mixed/Equipment) -> Moderate Rate
    meta_c = {
        'industry': 'Logistics', 'years_in_business': 4,
        'requested_amount': 750000, 'loan_term': 18, 
        'interest_rate': 0.185, 'credit_type': 'Equipment',
        'collateral_type': 3
    }
    create_demo_excel("Case_4_GradeC_Collateral3.xlsx", "LOGISTICA VELOZ SA", average, meta_c)

