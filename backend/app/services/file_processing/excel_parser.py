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
        """Extract company name and basic info from BG sheet"""
        try:
            ws = self.workbook[sheet_name]
            company_name = ws['A5'].value  # "Prospecto: TA SOLUCIONES"
            
            if company_name and ":" in str(company_name):
                company_name = str(company_name).split(":")[1].strip()
            
            return {
                'name': company_name or "Unknown Company",
                'industry': '',  # To be filled manually or from other source
                'years_in_business': None,
            }
        except Exception as e:
            logger.error(f"Failed to extract company info: {e}")
            return {'name': 'Unknown Company', 'industry': '', 'years_in_business': None}
    
    def _find_years_columns(self, ws):
        """Find columns that correspond to years (20XX)"""
        years_cols = {}
        # Search first 10 rows for years
        for row in range(1, 11):
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
