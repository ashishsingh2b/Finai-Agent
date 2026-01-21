import logging
from typing import List, Dict
import os
from .excel_parser import ExcelParser
from .pdf_parser import PDFParser

logger = logging.getLogger(__name__)

class FileMerger:
    """Service to merge financial data from multiple uploaded files"""
    
    @staticmethod
    def merge_files(file_paths: List[str]) -> Dict:
        """
        Processes multiple files and merges their data into a single structure.
        Expects files to be either Excel or PDF.
        """
        combined_data = {
            'company_info': {'name': 'Unknown Company'},
            'balance_sheet': {},
            'income_statement': {},
            'validation_errors': []
        }
        
        for path in file_paths:
            ext = os.path.splitext(path)[1].lower()
            parser = None
            
            try:
                if ext in ['.xlsx', '.xls']:
                    parser = ExcelParser(path)
                elif ext == '.pdf':
                    parser = PDFParser(path)
                
                if parser:
                    data = parser.extract_all()
                    
                    # Merge company info (prefer first non-unknown)
                    if combined_data['company_info']['name'] == 'Unknown Company' and data['company_info']['name'] != 'Unknown Company':
                        combined_data['company_info'] = data['company_info']
                    
                    # Merge balance sheet
                    for year, bs in data['balance_sheet'].items():
                        if year not in combined_data['balance_sheet']:
                            combined_data['balance_sheet'][year] = bs
                        else:
                            # Update existing year if new data has more fields filled
                            for field, val in bs.items():
                                if val != 0: combined_data['balance_sheet'][year][field] = val
                    
                    # Merge income statement
                    for year, is_data in data['income_statement'].items():
                        if year not in combined_data['income_statement']:
                            combined_data['income_statement'][year] = is_data
                        else:
                            for field, val in is_data.items():
                                if val != 0: combined_data['income_statement'][year][field] = val
                    
                    combined_data['validation_errors'].extend(data.get('validation_errors', []))
                    
            except Exception as e:
                logger.error(f"Error processing file {path} for merge: {e}")
                combined_data['validation_errors'].append(f"File {os.path.basename(path)} failed: {str(e)}")
        
        return combined_data
