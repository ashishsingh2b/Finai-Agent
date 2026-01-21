"""
PDF Parser Service for Financial Statements
Extracts data from both native and scanned PDFs using pdfplumber and OCR
"""
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import re
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class PDFParser:
    """Parse PDF financial statements and extract structured data"""
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text_content = ""
        self.tables = []
        
    def extract_all(self) -> Dict:
        """
        Main extraction method - tries native PDF extraction first,
        falls back to OCR if needed
        """
        try:
            # Try native PDF extraction
            success = self._extract_from_native_pdf()
            
            if not success or not self.text_content:
                logger.warning("Native PDF extraction failed or empty, trying OCR")
                self._extract_with_ocr()
            
            # Parse extracted content
            company_info = self._extract_company_info()
            balance_sheet = self._extract_balance_sheet()
            income_statement = self._extract_income_statement()
            
            return {
                'company_info': company_info,
                'balance_sheet': balance_sheet,
                'income_statement': income_statement,
                'validation_errors': self._validate_extraction()
            }
            
        except Exception as e:
            logger.error(f"PDF extraction failed: {str(e)}", exc_info=True)
            raise
    
    def _extract_from_native_pdf(self) -> bool:
        """Extract text and tables from native PDF using pdfplumber"""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                # Extract text from all pages
                text_parts = []
                for page in pdf.pages:
                    text_parts.append(page.extract_text() or "")
                    
                    # Extract tables
                    tables = page.extract_tables()
                    if tables:
                        self.tables.extend(tables)
                
                self.text_content = "\n".join(text_parts)
                return len(self.text_content.strip()) > 100  # Minimum viable content
                
        except Exception as e:
            logger.error(f"Native PDF extraction error: {str(e)}")
            return False
    
    def _extract_with_ocr(self):
        """Extract text from scanned PDF using OCR (pytesseract)"""
        try:
            # Convert PDF pages to images
            images = convert_from_path(self.pdf_path, dpi=300)
            
            text_parts = []
            for i, image in enumerate(images):
                logger.info(f"OCR processing page {i + 1}/{len(images)}")
                
                # Apply OCR
                text = pytesseract.image_to_string(image, lang='spa+eng')
                text_parts.append(text)
            
            self.text_content = "\n".join(text_parts)
            logger.info(f"OCR extracted {len(self.text_content)} characters")
            
        except Exception as e:
            logger.error(f"OCR extraction error: {str(e)}")
            raise
    
    def _extract_company_info(self) -> Dict:
        """Extract company information from PDF text"""
        info = {
            'name': 'Unknown Company',
            'industry': None,
            'years_in_business': None,
            'top_clients': None,
            'fiscal_status': 'En Cumplimiento'
        }
        
        # Try to find company name (usually at top of document)
        lines = self.text_content.split('\n')[:10]
        for line in lines:
            line = line.strip()
            if len(line) > 5 and len(line) < 100:
                # Likely company name if it's reasonably sized
                if not any(keyword in line.lower() for keyword in ['balance', 'estado', 'financial', 'page']):
                    info['name'] = line
                    break
        
        # Extract years mentioned (for years_in_business calculation)
        years = re.findall(r'\b(20\d{2})\b', self.text_content)
        if years:
            unique_years = sorted(set(int(y) for y in years))
            if len(unique_years) >= 2:
                info['years_in_business'] = unique_years[-1] - unique_years[0] + 1
        
        # Look for clients
        match = re.search(r'(?:principales clientes|clientes clave).*?:(.*?)(?:\n|$)', self.text_content, re.IGNORECASE)
        if match:
            info['top_clients'] = match.group(1).strip()
            
        return info
    
    def _extract_balance_sheet(self) -> Dict[int, Dict]:
        """Extract balance sheet data by year"""
        balance_data = {}
        
        # Find years mentioned in document
        years = sorted(set(int(y) for y in re.findall(r'\b(20\d{2})\b', self.text_content)))
        
        # For each year, try to extract balance sheet items
        for year in years[-3:]:  # Last 3 years
            balance_data[year] = self._extract_balance_sheet_for_year(year)
        
        return balance_data
    
    def _extract_balance_sheet_for_year(self, year: int) -> Dict:
        """Extract balance sheet items for a specific year"""
        data = {
            'current_assets': 0,
            'cash': 0,
            'accounts_receivable': 0,
            'inventory': 0,
            'fixed_assets': 0,
            'total_assets': 0,
            'current_liabilities': 0,
            'accounts_payable': 0,
            'long_term_debt': 0,
            'total_liabilities': 0,
            'shareholder_equity': 0
        }
        
        # Try to extract from tables first
        if self.tables:
            data = self._extract_from_tables(year, 'balance')
        
        # Fallback: Try pattern matching in text
        if data['total_assets'] == 0:
            data = self._extract_from_text_patterns(year, 'balance')
        
        return data
    
    def _extract_income_statement(self) -> Dict[int, Dict]:
        """Extract income statement data by year"""
        income_data = {}
        
        years = sorted(set(int(y) for y in re.findall(r'\b(20\d{2})\b', self.text_content)))
        
        for year in years[-3:]:
            income_data[year] = self._extract_income_for_year(year)
        
        return income_data
    
    def _extract_income_for_year(self, year: int) -> Dict:
        """Extract income statement for specific year"""
        data = {
            'revenue': 0,
            'cost_of_goods_sold': 0,
            'gross_profit': 0,
            'operating_expenses': 0,
            'operating_income': 0,
            'interest_expense': 0,
            'tax_expense': 0,
            'net_profit': 0,
            'ebitda': 0
        }
        
        if self.tables:
            data = self._extract_from_tables(year, 'income')
        
        if data['revenue'] == 0:
            data = self._extract_from_text_patterns(year, 'income')
        
        return data
    
    def _extract_from_tables(self, year: int, statement_type: str) -> Dict:
        """Extract financial data from detected tables"""
        # Search for columns matching the year and rows matching financial terms
        # This is a basic implementation of table row/column matching
        data = {}
        
        target_keywords = {
            'balance': {
                'total_assets': ['total activo', 'total de activos', 'suma del activo', 'suma de activos'],
                'current_assets': ['activo circulante', 'activo corriente'],
                'cash': ['efectivo', 'caja y bancos', 'disponibilidades', 'efectivo y equivalentes'],
                'current_liabilities': ['pasivo circulante', 'pasivo corriente', 'pasivo a corto plazo'],
                'total_liabilities': ['total pasivo', 'total de pasivos', 'suma del pasivo', 'pasivo total'],
                'shareholder_equity': ['capital contable', 'patrimonio', 'capital social', 'total capital'],
            },
            'income': {
                'revenue': ['ingresos', 'ventas netas', 'ingresos por ventas', 'ventas totales'],
                'gross_profit': ['utilidad bruta', 'margen bruto', 'beneficio bruto'],
                'ebitda': ['ebitda', 'uafida', 'utilidad de operación'],
                'net_profit': ['utilidad neta', 'resultado del ejercicio', 'utilidad del ejercicio', 'ejercicio neto']
            }
        }
        
        keywords = target_keywords.get(statement_type, {})
        found_data = {}
        
        for table in self.tables:
            # Look for year in headers
            year_col = -1
            for row in table:
                for idx, cell in enumerate(row):
                    if str(year) in str(cell or ""):
                        year_col = idx
                        break
                if year_col != -1: break
            
            if year_col == -1: continue
            
            # Find rows
            for row in table:
                row_text = str(row[0] or "").lower()
                for field, markers in keywords.items():
                    if any(m in row_text for m in markers):
                        try:
                            # Clean number
                            val_str = str(row[year_col] or "0").replace(',', '').replace('$', '').strip()
                            # Handle parenthesis (negative)
                            if '(' in val_str: val_str = '-' + val_str.replace('(', '').replace(')', '')
                            found_data[field] = float(val_str)
                        except:
                            continue
                            
        return found_data

    def _extract_from_text_patterns(self, year: int, statement_type: str) -> Dict:
        """Extract data using regex patterns (fallback method)"""
        found_data = {}
        
        patterns = {
            'revenue': [r'ingresos.*?(\d[\d,.]*)', r'ventas.*?(\d[\d,.]*)'],
            'total_assets': [r'total activo.*?(\d[\d,.]*)', r'total de activos.*?(\d[\d,.]*)'],
            'net_profit': [r'utilidad neta.*?(\d[\d,.]*)', r'resultado del ejercicio.*?(\d[\d,.]*)']
        }
        
        # Search in text segment near where year appears
        year_pos = self.text_content.find(str(year))
        if year_pos != -1:
            snippet = self.text_content[max(0, year_pos-1000):year_pos+2000]
            for field, regex_list in patterns.items():
                for regex in regex_list:
                    match = re.search(regex, snippet, re.IGNORECASE)
                    if match:
                        try:
                            val = float(match.group(1).replace(',', ''))
                            found_data[field] = val
                            break
                        except: continue
        
        return found_data
    
    def _validate_extraction(self) -> List[str]:
        """Validate extracted data and return list of issues"""
        errors = []
        
        if len(self.text_content) < 100:
            errors.append("Minimal text extracted from PDF")
        
        # Add more validation rules
        # - Check if key financial terms are present
        # - Validate number formats
        # - Check for consistency across years
        
        return errors
