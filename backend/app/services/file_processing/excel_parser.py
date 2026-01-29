import openpyxl
from typing import Dict, List, Any
import logging
from .normalization import normalize_label, is_match, normalize_number
from ..ai.ai_extractor import AIExtractor

logger = logging.getLogger(__name__)

class ExcelParser:
    """
    Parser service for financial statements in Excel format.
    Specifically tuned for the Moskalti Capital credit template.
    Implements dynamic keyword matching and AI-driven fallback for unstructured sheets.
    """
    
    def __init__(self, file_path: str):
        self.file_path = file_path
        try:
            # Load with data_only=False to ensure we read literals if formulas are broken
            self.workbook = openpyxl.load_workbook(file_path, data_only=False)
        except Exception as e:
            logger.error(f"Failed to load workbook: {e}")
            raise
    
    def extract_company_info(self, sheet_name='BG'):
        """
        Extract company metadata (Name, Industry, Loan Terms) from the BG sheet.
        Searches for specific Spanish and English labels in the header section.
        """
        try:
            ws = self.workbook[sheet_name]
            
            # Default state
            info = {
                'name': "Unknown Company",
                'industry': "General Trading",
                'years_in_business': 5,
                'requested_amount': 0,
                'loan_term': 12,
                'interest_rate': 0.1125, # Base TIIE ref
                'credit_type': 'revolving'
            }

            # Scan first 15 rows for key-value pairs
            for row in range(1, 15):
                cell_val = str(ws[f'A{row}'].value or "").strip()
                val_cell = ws[f'B{row}'].value
                
                if not cell_val: continue
                
                lower_val = cell_val.lower()
                
                if "prospecto:" in lower_val:
                    info['name'] = cell_val.split(":")[1].strip()
                elif "industry:" in lower_val or "industria:" in lower_val:
                    info['industry'] = str(val_cell).strip() if val_cell else "General"
                elif "years in business:" in lower_val or "años en negocio:" in lower_val:
                    info['years_in_business'] = int(val_cell) if val_cell else 5
                elif "requested amount:" in lower_val or "monto solicitado:" in lower_val:
                    info['requested_amount'] = float(val_cell) if val_cell else 0
                elif "loan term:" in lower_val or "plazo:" in lower_val:
                    info['loan_term'] = int(val_cell) if val_cell else 12
                elif "interest rate:" in lower_val or "tasa de interés:" in lower_val:
                    info['interest_rate'] = float(val_cell) if val_cell else 0.1125
                elif "credit type:" in lower_val or "tipo de crédito:" in lower_val:
                    info['credit_type'] = str(val_cell).strip()
                elif "collateral type:" in lower_val or "tipo de garantía:" in lower_val:
                    try: info['collateral_type'] = int(val_cell)
                    except: info['collateral_type'] = 2

            return info
        except Exception as e:
            logger.error(f"Failed to extract company info: {e}")
            return {'name': 'Unknown Company', 'industry': 'Error', 'years_in_business': 0}
    
    def _find_years_columns(self, ws):
        """Identify columns representing specific financial years (20XX)."""
        years_cols = {}
        for row in range(1, 21):
            for col in range(1, 15):
                val = ws.cell(row=row, column=col).value
                if val and isinstance(val, (int, float)) and 2000 <= int(val) <= 2100:
                    years_cols[openpyxl.utils.get_column_letter(col)] = int(val)
        return years_cols

    def _find_row_by_keywords(self, ws, keywords: List[str]):
        """Find the row index containing specific financial keywords in Column A."""
        normalized_keywords = [normalize_label(k) for k in keywords]
        for row in range(1, 150):
            raw_val = str(ws[f'A{row}'].value or "").strip()
            if not raw_val: continue
                
            cell_val = normalize_label(raw_val)
            if not cell_val: continue
                
            if any(k in cell_val for k in normalized_keywords) or any(cell_val in k for k in normalized_keywords):
                return row
        return None

    def extract_balance_sheet(self, sheet_name='BG'):
        """Extract multi-year balance sheet data using dynamic row/column mapping."""
        try:
            ws = self.workbook[sheet_name]
            years_cols = self._find_years_columns(ws)
            if not years_cols:
                years_cols = {'B': 2021, 'C': 2022, 'D': 2023}
            
            balance_sheet_data = {}
            keyword_mappings = {
                'cash': ['efectivo', 'caja', 'disponibilidades', 'cash', 'bancos'],
                'accounts_receivable': ['clientes', 'cuentas por cobrar', 'accounts receivable'],
                'inventory': ['inventarios', 'almacen', 'inventory', 'stocks'],
                'current_assets': ['activo circulante', 'total current assets', 'total activo circulante'],
                'fixed_assets': ['activo fijo', 'property plant and equipment', 'fixed assets'],
                'total_assets': ['total del activo', 'activo total', 'total assets'],
                'current_liabilities': ['pasivo circulante', 'total current liabilities', 'short term liabilities'],
                'total_liabilities': ['total del pasivo', 'pasivo total', 'total liabilities'],
                'shareholder_equity': ['total capital contable', 'patrimonio neto', 'equity'],
            }
            
            row_mappings = {}
            for field, ks in keyword_mappings.items():
                row = self._find_row_by_keywords(ws, ks)
                if row: row_mappings[field] = row
            
            for year_col, year in years_cols.items():
                year_data = {}
                for field, row in row_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = normalize_number(str(cell_value))
                balance_sheet_data[year] = year_data
            
            return balance_sheet_data
        except Exception as e:
            logger.error(f"Failed to extract balance sheet: {e}")
            return {}

    def extract_income_statement(self, sheet_name='ER'):
        """Extract multi-year income statement data using keyword resolution."""
        try:
            ws = self.workbook[sheet_name]
            years_cols = self._find_years_columns(ws)
            income_statement_data = {}
            
            keyword_mappings = {
                'revenue': ['ingresos', 'ventas netas', 'revenue', 'sales'],
                'cost_of_goods_sold': ['costo de ventas', 'cogs', 'cost of goods sold'],
                'gross_profit': ['utilidad bruta', 'gross profit', 'gross margin'],
                'ebitda': ['ebitda', 'uafida', 'utilidad operativa'],
                'net_profit': ['utilidad neta', 'resultado neto', 'net profit'],
            }
            
            row_mappings = {}
            for field, ks in keyword_mappings.items():
                row = self._find_row_by_keywords(ws, ks)
                if row: row_mappings[field] = row

            for year_col, year in years_cols.items():
                year_data = {}
                for field, row in row_mappings.items():
                    cell_value = ws[f'{year_col}{row}'].value
                    year_data[field] = normalize_number(str(cell_value))
                income_statement_data[year] = year_data
            
            return income_statement_data
        except Exception as e:
            logger.error(f"Failed to extract income statement: {e}")
            return {}
    
    def validate_data(self, balance_sheet_data: Dict, income_statement_data: Dict):
        """Cross-validate extracted data points for accounting integrity."""
        errors = []
        for year, bs in balance_sheet_data.items():
            total_liab_equity = bs.get('total_liabilities', 0) + bs.get('shareholder_equity', 0)
            difference = abs(bs.get('total_assets', 0) - total_liab_equity)
            if difference > 0.01:
                errors.append({
                    'year': year,
                    'error': 'Balance sheet equation mismatch',
                    'details': f"Assets: {bs.get('total_assets')}, Liab+Equity: {total_liab_equity}"
                })
        return errors
    
    def extract_all(self):
        """Orchestrat the Excel extraction with automated AI reasoning fallback."""
        balance_sheet = {}
        income_statement = {}
        company_info = {}
        needs_ai = False

        try:
            company_info = self.extract_company_info()
            balance_sheet = self.extract_balance_sheet()
            income_statement = self.extract_income_statement()
            
            # Identify missing indicators
            years = sorted(list(balance_sheet.keys()), reverse=True)
            latest_year = years[0] if years else None
            
            if not latest_year:
                needs_ai = True
            else:
                latest_bs = balance_sheet.get(latest_year, {})
                latest_is = income_statement.get(latest_year, {})
                
                critical_zeros = [
                    latest_bs.get('total_assets', 0) == 0,
                    latest_is.get('revenue', 0) == 0,
                    latest_bs.get('shareholder_equity', 0) == 0,
                    latest_bs.get('total_liabilities', 0) == 0
                ]
                if any(critical_zeros): needs_ai = True
        except Exception as e:
            logger.error(f"Traditional Excel extraction crashed: {e}. Falling back to AI.")
            needs_ai = True
        
        if needs_ai:
            logger.info("Triggering AI reasoning fallback for Excel data extraction...")
            try:
                # Text dump for AI analysis
                text_dump = []
                for sheet_name in self.workbook.sheetnames[:5]:
                    ws = self.workbook[sheet_name]
                    text_dump.append(f"--- Sheet: {sheet_name} ---")
                    for row in ws.iter_rows(max_row=100, values_only=True):
                        row_vals = [str(c) if c is not None else "" for c in row if c is not None]
                        if any(row_vals): text_dump.append("\t".join(row_vals))
                
                full_text = "\n".join(text_dump)
                ai_data = AIExtractor().extract_financials(full_text)
                
                # Merge AI data into missing fields
                for year, ai_bs in ai_data.get('balance_sheet', {}).items():
                    if year not in balance_sheet: balance_sheet[year] = ai_bs
                    else:
                        for field, val in ai_bs.items():
                            if balance_sheet[year].get(field, 0) == 0:
                                balance_sheet[year][field] = val

                for year, ai_is in ai_data.get('income_statement', {}).items():
                    if year not in income_statement: income_statement[year] = ai_is
                    else:
                        for field, val in ai_is.items():
                            if income_statement[year].get(field, 0) == 0:
                                income_statement[year][field] = val
            except Exception as e:
                logger.error(f"AI Fallback failed: {e}")

        validation_errors = self.validate_data(balance_sheet, income_statement)
        return {
            'company_info': company_info or {'name': 'Unknown'},
            'balance_sheet': balance_sheet,
            'income_statement': income_statement,
            'validation_errors': validation_errors
        }
 
