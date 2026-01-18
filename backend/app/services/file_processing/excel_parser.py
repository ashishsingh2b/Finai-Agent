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
    
    def extract_balance_sheet(self, sheet_name='BG', years_columns=None):
        """
        Extract balance sheet data from BG sheet
        Matches structure: Columns B-G for years 2021-2026
        Rows based on Excel template analysis
        """
        if years_columns is None:
            years_columns = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
        
        try:
            ws = self.workbook[sheet_name]
            balance_sheet_data = {}
            
            # Cell mappings based on EXCEL_TEMPLATE_COMPLETE_ANALYSIS.md
            cell_mappings = {
                'cash': 11,  # Row 11: Efectivo
                'accounts_receivable': 12,  # Row 12: Clientes
                'inventory': 13,  # Row 13: Inventario
                'current_assets': 21,  # Row 21: Total activo circulante
                'fixed_assets': 23,  # Row 23: Activo Fijo
                'total_assets': 31,  # Row 31: Total del activo
                'accounts_payable': 33,  # Row 33: Proveedores (approximate)
                'current_liabilities': 42,  # Row 42: Total pasivo circulante
                'long_term_liabilities': 46,  # Row 46: Total pasivo largo plazo
                'total_liabilities': 54,  # Row 54: Total del pasivo
                'shareholder_equity': 62,  # Row 62: Total capital contable
            }
            
            for year_col, year in years_columns.items():
                year_data = {}
                for field, row in cell_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = float(cell_value) if cell_value else 0.0
                
                logger.info(f"Extracted {year} balance sheet: Assets={year_data.get('total_assets')}, Equity={year_data.get('shareholder_equity')}")
                balance_sheet_data[year] = year_data
            
            return balance_sheet_data
        except Exception as e:
            logger.error(f"Failed to extract balance sheet: {e}")
            return {}
    
    def extract_income_statement(self, sheet_name='ER', years_columns=None):
        """
        Extract income statement data from ER sheet
        """
        if years_columns is None:
            years_columns = {'B': 2021, 'C': 2022, 'D': 2023, 'E': 2024, 'F': 2025, 'G': 2026}
        
        try:
            ws = self.workbook[sheet_name]
            income_statement_data = {}
            
            # Cell mappings based on Excel template analysis
            cell_mappings = {
                'revenue': 10,  # Row 10: Ingresos
                'cost_of_goods_sold': 12,  # Row 12: Costo de Ventas
                'gross_profit': 14,  # Row 14: Utilidad Bruta
                'operating_expenses': 16,  # Row 16: Gastos de operación
                'ebitda': 21,  # Row 21: EBITDA
                'interest_expense': 27,  # Row 27: Gastos financieros (approximate)
                'net_profit': 36,  # Row 36: Utilidad Neta (adjust based on actual template)
            }
            
            for year_col, year in years_columns.items():
                year_data = {}
                for field, row in cell_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = float(cell_value) if cell_value else 0.0
                
                logger.info(f"Extracted {year} income: Revenue={year_data.get('revenue')}, Net Profit={year_data.get('net_profit')}")
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
