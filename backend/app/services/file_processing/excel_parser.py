import openpyxl
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)

class ExcelParser:
    """Parse Moskalti Capital Excel template"""
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        try:
            # Load with data_only=False to read both direct values and formulas
            # This is better for files with direct values like our demo
            self.workbook = openpyxl.load_workbook(file_path, data_only=False)
        except Exception as e:
            logger.error(f"Failed to load workbook: {e}")
            raise
    
    def extract_company_info(self, sheet_name='BG'):
        """Extract company name and extended metadata from BG sheet"""
        try:
            ws = self.workbook[sheet_name]
            
            # Default values
            info = {
                'name': "Unknown Company",
                'industry': "General Trading",
                'years_in_business': 5,
                'requested_amount': 0,
                'loan_term': 12,
                'interest_rate': 0.055, # Default 5.5%
                'credit_type': 'revolving'
            }

            # Search first 10 rows for metadata keys
            for row in range(1, 15):
                cell_val = str(ws[f'A{row}'].value or "").strip()
                val_cell = ws[f'B{row}'].value
                
                if not cell_val: continue
                
                lower_val = cell_val.lower()
                
                # Company Name
                if "prospecto:" in lower_val:
                    info['name'] = cell_val.split(":")[1].strip()
                
                # Industry
                elif "industry:" in lower_val or "industria:" in lower_val:
                    info['industry'] = str(val_cell).strip() if val_cell else "General"
                    
                # Years in Business
                elif "years in business:" in lower_val or "años en negocio:" in lower_val:
                    info['years_in_business'] = int(val_cell) if val_cell else 5
                    
                # Requested Amount
                elif "requested amount:" in lower_val or "monto solicitado:" in lower_val:
                    info['requested_amount'] = float(val_cell) if val_cell else 0
                    
                # Loan Term
                elif "loan term:" in lower_val or "plazo:" in lower_val:
                    info['loan_term'] = int(val_cell) if val_cell else 12
                    
                # Interest Rate
                elif "interest rate:" in lower_val or "tasa de interés:" in lower_val:
                    info['interest_rate'] = float(val_cell) if val_cell else 0.055
                    
                # Credit Type
                elif "credit type:" in lower_val or "tipo de crédito:" in lower_val:
                    info['credit_type'] = str(val_cell).strip().lower()

            return info
        except Exception as e:
            logger.error(f"Failed to extract company info: {e}")
            return {'name': 'Unknown Company', 'industry': 'Error', 'years_in_business': 0}
    
    def _find_years_columns(self, ws):
        """Find columns that correspond to years (20XX)"""
        years_cols = {}
        # Search first 20 rows for years (increased to accommodate metadata)
        for row in range(1, 21):
            for col in range(1, 15): # A to N
                val = ws.cell(row=row, column=col).value
                if val and isinstance(val, (int, float)) and 2000 <= int(val) <= 2100:
                    years_cols[openpyxl.utils.get_column_letter(col)] = int(val)
        return years_cols

    def _find_row_by_keywords(self, ws, keywords: List[str]):
        """Find a row number that contains any of the keywords in column A"""
        for row in range(1, 100):
            cell_val = str(ws[f'A{row}'].value or "").lower()
            if any(k.lower() in cell_val for k in keywords):
                return row
        return None

    def extract_balance_sheet(self, sheet_name='BG'):
        """Extract balance sheet data dynamically"""
        try:
            ws = self.workbook[sheet_name]
            years_cols = self._find_years_columns(ws)
            if not years_cols:
                years_cols = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
            
            balance_sheet_data = {}
            
            # Map fields to keyword lists
            keyword_mappings = {
                'cash': ['efectivo', 'caja', 'disponibilidades', 'efectivo y equivalentes'],
                'accounts_receivable': ['clientes', 'cuentas por cobrar'],
                'inventory': ['inventarios', 'mercancías'],
                'current_assets': ['total activo circulante', 'total activo corriente', 'suma activo circulante'],
                'fixed_assets': ['activo fijo', 'propiedades planta'],
                'total_assets': ['total del activo', 'suma del activo', 'activo total'],
                'current_liabilities': ['total pasivo circulante', 'pasivo a corto plazo', 'suma pasivo circulante'],
                'total_liabilities': ['total del pasivo', 'suma del pasivo', 'pasivo total'],
                'shareholder_equity': ['total capital contable', 'patrimonio neto', 'capital social'],
            }
            
            row_mappings = {}
            for field, ks in keyword_mappings.items():
                row = self._find_row_by_keywords(ws, ks)
                if row: row_mappings[field] = row

            for year_col, year in years_cols.items():
                year_data = {}
                for field, row in row_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = float(cell_value) if cell_value and isinstance(cell_value, (int, float)) else 0.0
                balance_sheet_data[year] = year_data
            
            return balance_sheet_data
        except Exception as e:
            logger.error(f"Failed to extract balance sheet: {e}")
            return {}

    def extract_income_statement(self, sheet_name='ER'):
        """Extract income statement data dynamically"""
        try:
            ws = self.workbook[sheet_name]
            years_cols = self._find_years_columns(ws)
            if not years_cols:
                years_cols = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
            
            income_statement_data = {}
            
            keyword_mappings = {
                'revenue': ['ingresos', 'ventas netas'],
                'cost_of_goods_sold': ['costo de ventas'],
                'gross_profit': ['utilidad bruta'],
                'ebitda': ['ebitda', 'uafida'],
                'net_profit': ['utilidad neta', 'resultado neto'],
            }
            
            row_mappings = {}
            for field, ks in keyword_mappings.items():
                row = self._find_row_by_keywords(ws, ks)
                if row: row_mappings[field] = row

            for year_col, year in years_cols.items():
                year_data = {}
                for field, row in row_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = float(cell_value) if cell_value and isinstance(cell_value, (int, float)) else 0.0
                income_statement_data[year] = year_data
            
            return income_statement_data
        except Exception as e:
            logger.error(f"Failed to extract income statement: {e}")
            return {}
    
    def validate_data(self, balance_sheet_data: Dict, income_statement_data: Dict):
        """
        Validate extracted data
        - Check Assets = Liabilities + Equity
        - Check for missing critical fields
        """
        errors = []
        
        for year, bs in balance_sheet_data.items():
            # Balance sheet equation
            total_liab_equity = bs['total_liabilities'] + bs['shareholder_equity']
            difference = abs(bs['total_assets'] - total_liab_equity)
            
            if difference > 0.01:  # Allow small rounding errors
                errors.append({
                    'year': year,
                    'error': 'Balance sheet equation mismatch',
                    'details': f"Assets: {bs['total_assets']}, Liab+Equity: {total_liab_equity}, Diff: {difference}"
                })
        
        # Check for zero/missing revenue
        for year, is_data in income_statement_data.items():
            if is_data['revenue'] <= 0:
                errors.append({
                    'year': year,
                    'error': 'Revenue is zero or negative',
                    'details': f"Revenue: {is_data['revenue']}"
                })
        
        return errors
    
    def extract_all(self):
        """Extract all data from Excel file"""
        company_info = self.extract_company_info()
        balance_sheet = self.extract_balance_sheet()
        income_statement = self.extract_income_statement()
        
        validation_errors = self.validate_data(balance_sheet, income_statement)
        
        return {
            'company_info': company_info,
            'balance_sheet': balance_sheet,
            'income_statement': income_statement,
            'validation_errors': validation_errors
        }
