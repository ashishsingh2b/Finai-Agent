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

    # Years
    years = [2021, 2022, 2023]
    header_row = 12
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
        ("TOTAL DEL ACTIVO", "total_assets"),
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

# 1. Excellent (Grade A)
excellent = {
    'bg': {
        'cash': 500000, 'accounts_receivable': 200000, 'inventory': 100000,
        'current_assets': 800000, 'fixed_assets': 1200000, 'total_assets': 2000000,
        'current_liabilities': 100000, 'total_liabilities': 300000, 'shareholder_equity': 1700000
    },
    'er': {
        'revenue': 3000000, 'cost_of_goods_sold': 1800000, 'gross_profit': 1200000,
        'ebitda': 800000, 'net_profit': 500000
    }
}

# 2. Solid (Grade B)
solid = {
    'bg': {
        'cash': 200000, 'accounts_receivable': 300000, 'inventory': 200000,
        'current_assets': 700000, 'fixed_assets': 800000, 'total_assets': 1500000,
        'current_liabilities': 250000, 'total_liabilities': 600000, 'shareholder_equity': 900000
    },
    'er': {
        'revenue': 2000000, 'cost_of_goods_sold': 1300000, 'gross_profit': 700000,
        'ebitda': 400000, 'net_profit': 200000
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

# 4. High Risk (Grade E)
high_risk = {
    'bg': {
        'cash': 10000, 'accounts_receivable': 500000, 'inventory': 400000,
        'current_assets': 910000, 'fixed_assets': 100000, 'total_assets': 1010000,
        'current_liabilities': 800000, 'total_liabilities': 950000, 'shareholder_equity': 60000
    },
    'er': {
        'revenue': 800000, 'cost_of_goods_sold': 750000, 'gross_profit': 50000,
        'ebitda': -20000, 'net_profit': -50000
    }
}

if __name__ == '__main__':
    create_demo_excel("Demo_Excellent_SA.xlsx", "CORPORATIVO EXCELENCIA SA", excellent)
    create_demo_excel("Demo_Solid_SME.xlsx", "PYME SOLIDA DE MEXICO", solid)
    # create_demo_excel("Demo_Borderline_Corp.xlsx", "CONSTRUCTORA LIMITADA", average) (Optional)
    
    # --- Perfect Final Demo ---
    perfect_metadata = {
        'industry': 'Technology / SaaS',
        'years_in_business': 8,
        'requested_amount': 2500000,
        'loan_term': 24,
        'interest_rate': 0.125, # 12.5%
        'credit_type': 'Amortized'
    }
    create_demo_excel("Demo_Perfect_Case.xlsx", "TECH INNOVATIONS SA", excellent, metadata=perfect_metadata)
