"""
PDF Parser Service for Financial Statements.
Extracts data from both native and scanned PDFs using pdfplumber and OCR (Tesseract).
Implements a 3-layered parsing defense: Native -> OCR -> AI Fallback.
"""
import pdfplumber
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import re
from typing import Dict, List, Tuple
import logging
from .normalization import normalize_label, is_match, normalize_number
from ..ai.ai_extractor import AIExtractor

logger = logging.getLogger(__name__)

class PDFParser:
    """
    Robust PDF Parser for financial documents.
    Handles native text extraction and scanned images via Tesseract OCR.
    Integrates AI Reasoning as a final fallback for unstructured or complex documents.
    """
    
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.text_content = ""
        self.tables = []
        
    def extract_all(self) -> Dict:
        """
        Orchestrate the extraction pipeline.
        1. Attempt Native PDF parsing.
        2. Fallback to OCR for scanned documents.
        3. Trigger AI Refinement if critical financial indicators (Assets/Revenue) are missing.
        """
        balance_sheet = {}
        income_statement = {}
        company_info = {}
        needs_ai = False

        try:
            # Phase 1: Native Extraction
            success = self._extract_from_native_pdf()
            
            # Phase 2: OCR Fallback
            if not success or not self.text_content:
                logger.warning("Native PDF extraction failed or empty, trying OCR")
                self._extract_with_ocr()
            
            # Phase 3: Qualitative Extraction from raw text
            company_info = self._extract_company_info()
            balance_sheet = self._extract_balance_sheet()
            income_statement = self._extract_income_statement()
            
            # Evaluate Extraction Health
            years = sorted(list(balance_sheet.keys()), reverse=True)
            latest_year = years[0] if years else None
            
            if not latest_year:
                needs_ai = True
            else:
                latest_bs = balance_sheet.get(latest_year, {})
                latest_is = income_statement.get(latest_year, {})
                
                # Verify critical data presence
                critical_fields = [
                    latest_bs.get('total_assets', 0) == 0,
                    latest_is.get('revenue', 0) == 0,
                    latest_bs.get('shareholder_equity', 0) == 0,
                    latest_bs.get('total_liabilities', 0) == 0
                ]
                
                if any(critical_fields):
                    needs_ai = True
        except Exception as e:
            logger.error(f"Traditional PDF extraction crashed: {e}. Falling back to AI.")
            needs_ai = True
            
        # Phase 4: AI Enrichment
        if needs_ai:
            logger.info("Triggering AI reasoning fallback for PDF data extraction...")
            try:
                ai_data = AIExtractor().extract_financials(self.text_content)
                
                # Intelligent Merge (Fill missing values without overwriting established data)
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
                logger.error(f"AI PDF Fallback failed: {e}")

        return {
            'company_info': company_info or {'name': 'Unknown'},
            'balance_sheet': balance_sheet,
            'income_statement': income_statement,
            'validation_errors': self._validate_extraction()
        }
    
    def _extract_from_native_pdf(self) -> bool:
        """Parse native PDF objects using pdfplumber."""
        try:
            with pdfplumber.open(self.pdf_path) as pdf:
                text_parts = []
                for page in pdf.pages:
                    text_parts.append(page.extract_text() or "")
                    
                    tables = page.extract_tables()
                    if tables:
                        self.tables.extend(tables)
                
                self.text_content = "\n".join(text_parts)
                return len(self.text_content.strip()) > 100
                
        except Exception as e:
            logger.error(f"Native PDF extraction error: {str(e)}")
            return False
    
    def _extract_with_ocr(self):
        """Process scanned PDF pages into text using Tesseract OCR."""
        try:
            images = convert_from_path(self.pdf_path, dpi=300)
            text_parts = []
            for i, image in enumerate(images):
                logger.info(f"OCR processing page {i + 1}/{len(images)}")
                text = pytesseract.image_to_string(image, lang='spa+eng')
                text_parts.append(text)
            
            self.text_content = "\n".join(text_parts)
            logger.info(f"OCR extracted {len(self.text_content)} characters")
        except Exception as e:
            logger.error(f"OCR extraction error: {str(e)}")
            raise
    
    def _extract_company_info(self) -> Dict:
        """Extract metadata (Name, Industry, Clients) from document headers."""
        info = {
            'name': 'Unknown Company',
            'industry': None,
            'years_in_business': None,
            'top_clients': None,
            'fiscal_status': 'En Cumplimiento'
        }
        
        # Identify company name in the first 10 lines
        lines = self.text_content.split('\n')[:10]
        for line in lines:
            line = line.strip()
            if len(line) > 5 and len(line) < 100:
                if not any(keyword in line.lower() for keyword in ['balance', 'estado', 'financial', 'page']):
                    info['name'] = line
                    break
        
        # Extract operational longevity from mentioned dates
        years = re.findall(r'\b(20\d{2})\b', self.text_content)
        if years:
            unique_years = sorted(set(int(y) for y in years))
            if len(unique_years) >= 2:
                info['years_in_business'] = unique_years[-1] - unique_years[0] + 1
        
        return info
    
    def _extract_balance_sheet(self) -> Dict[int, Dict]:
        """Aggregate balance sheet metrics across all identified years."""
        balance_data = {}
        years = sorted(set(int(y) for y in re.findall(r'\b(20\d{2})\b', self.text_content)))
        
        for year in years[-3:]:
            balance_data[year] = self._extract_balance_sheet_for_year(year)
        
        return balance_data
    
    def _extract_balance_sheet_for_year(self, year: int) -> Dict:
        """Extract year-specific balance sheet items using table and regex analysis."""
        data = {
            'current_assets': 0, 'cash': 0, 'accounts_receivable': 0,
            'inventory': 0, 'fixed_assets': 0, 'total_assets': 0,
            'current_liabilities': 0, 'accounts_payable': 0,
            'long_term_debt': 0, 'total_liabilities': 0,
            'shareholder_equity': 0
        }
        
        if self.tables:
            data = self._extract_from_tables(year, 'balance')
        
        if data.get('total_assets', 0) == 0:
            data = self._extract_from_text_patterns(year, 'balance')
        
        return data
    
    def _extract_income_statement(self) -> Dict[int, Dict]:
        """Aggregate income statement metrics across all identified years."""
        income_data = {}
        years = sorted(set(int(y) for y in re.findall(r'\b(20\d{2})\b', self.text_content)))
        
        for year in years[-3:]:
            income_data[year] = self._extract_income_for_year(year)
        
        return income_data
    
    def _extract_income_for_year(self, year: int) -> Dict:
        """Extract year-specific income metrics using multi-layered parsing."""
        data = {
            'revenue': 0, 'cost_of_goods_sold': 0, 'gross_profit': 0,
            'operating_expenses': 0, 'operating_income': 0,
            'interest_expense': 0, 'tax_expense': 0,
            'net_profit': 0, 'ebitda': 0
        }
        
        if self.tables:
            data = self._extract_from_tables(year, 'income')
        if data.get('revenue', 0) == 0:
            data = self._extract_from_text_patterns(year, 'income')
        
        return data
    
    def _extract_from_tables(self, year: int, statement_type: str) -> Dict:
        """Extract data points from PDF tables using keyword/year grid matching."""
        target_keywords = {
            'balance': {
                'total_assets': ['total activo', 'total de activos', 'suma del activo', 'suma de activos', 'activo total', 'total assets', 'sum of assets', 'suma de activo', 'assets total'],
                'current_assets': ['activo circulante', 'activo corriente', 'total activo circulante', 'current assets', 'total current assets', 'activos a corto plazo', 'suma activo circulante'],
                'cash': ['efectivo', 'caja y bancos', 'disponibilidades', 'efectivo y equivalentes', 'cash', 'cash and equivalents', 'bancos', 'tesoreria', 'disponible', 'fondos'],
                'current_liabilities': ['pasivo circulante', 'pasivo corriente', 'pasivo a corto plazo', 'current liabilities', 'short term liabilities', 'pasivos de corto plazo', 'total pasivo circulante'],
                'total_liabilities': ['total pasivo', 'total de pasivos', 'suma del pasivo', 'pasivo total', 'total liabilities', 'pasivo total y capital', 'suma de pasivos'],
                'shareholder_equity': ['capital contable', 'patrimonio', 'capital social', 'total capital', 'equity', 'shareholder equity', 'patrimonio neto', 'total capital contable'],
            },
            'income': {
                'revenue': ['ingresos', 'ventas netas', 'ingresos por ventas', 'ventas totales', 'revenue', 'sales', 'turnover', 'facturacion', 'ingresos globales', 'total revenue'],
                'gross_profit': ['utilidad bruta', 'margen bruto', 'beneficio bruto', 'gross profit', 'gross margin', 'resultado bruto'],
                'ebitda': ['ebitda', 'uafida', 'utilidad de operacion', 'operating profit', 'utilidad operativa', 'utilidad antes de impuestos'],
                'net_profit': ['utilidad neta', 'resultado del ejercicio', 'utilidad del ejercicio', 'ejercicio neto', 'net profit', 'net income', 'beneficio neto', 'resultado neto']
            }
        }
        
        keywords = target_keywords.get(statement_type, {})
        found_data = {}
        
        for table in self.tables:
            year_col = -1
            for row in table:
                for idx, cell in enumerate(row):
                    if str(year) in str(cell or ""):
                        year_col = idx
                        break
                if year_col != -1: break
            
            if year_col == -1: continue
            
            for row in table:
                row_text = normalize_label(str(row[0] or ""))
                for field, markers in keywords.items():
                    normalized_markers = [normalize_label(m) for m in markers]
                    if any(m in row_text for m in normalized_markers) or any(row_text in m for m in normalized_markers):
                        try:
                            found_data[field] = normalize_number(str(row[year_col]))
                        except: continue
                            
        return found_data

    def _extract_from_text_patterns(self, year: int, statement_type: str) -> Dict:
        """Fallback regex pattern matching for unstructured text segments."""
        found_data = {}
        patterns = {
            'revenue': [r'(?:ingresos totales|ventas netas|ingresos|ventas|revenue|sales|turnover).*?(\d[\d,.]*)'],
            'total_assets': [r'(?:total activo|activo total|suma del activo|total assets|sum of assets).*?(\d[\d,.]*)'],
            'net_profit': [r'(?:utilidad neta|resultado neto|utilidad del ejercicio|net profit|net income|beneficio neto).*?(\d[\d,.]*)'],
            'ebitda': [r'(?:ebitda|uafida|utilidad operativa|utilidad de operacion|operating profit).*?(\d[\d,.]*)'],
            'current_assets': [r'(?:total activo circulante|activo corriente|current assets|activos a corto plazo).*?(\d[\d,.]*)'],
            'total_liabilities': [r'(?:total pasivo|pasivo total|suma del pasivo|total liabilities).*?(\d[\d,.]*)']
        }
        
        year_pos = self.text_content.find(str(year))
        if year_pos != -1:
            snippet = self.text_content[max(0, year_pos-1000):year_pos+2000]
            for field, regex_list in patterns.items():
                for regex in regex_list:
                    match = re.search(regex, snippet, re.IGNORECASE)
                    if match:
                        try:
                            found_data[field] = normalize_number(match.group(1))
                            break
                        except: continue
        
        return found_data
    
    def _validate_extraction(self) -> List[str]:
        """Basic integrity check for the extracted raw content."""
        errors = []
        if len(self.text_content) < 100:
            errors.append("Minimal text extracted from PDF")
        return errors
 
