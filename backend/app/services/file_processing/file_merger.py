"""
Data Integration: Multi-source Financial Merger.
Aggregates dispersed financial data from various files (PDF/Excel) into a unified 
chronological structure for analysis.
"""
import logging
from typing import List, Dict
import os
from .excel_parser import ExcelParser
from .pdf_parser import PDFParser

logger = logging.getLogger(__name__)

class FileMerger:
    """
    Coordinator for multi-document parsing.
    Smartly merges overlapping data points, preferring precise extraction 
    over generic or zero values.
    """
    
    @staticmethod
    def merge_files(file_paths: List[str]) -> Dict:
        """
        Sequentially processes files and performs a deep-merge on identified 
        Balance Sheet and Income Statement objects.
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
                # Factory-like parser instantiation based on MIME type detection
                if ext in ['.xlsx', '.xls']:
                    parser = ExcelParser(path)
                elif ext == '.pdf':
                    parser = PDFParser(path)
                
                if parser:
                    data = parser.extract_all()
                    
                    # Consolidate Company Profile (Prioritizes specific names over defaults)
                    current_name = combined_data['company_info']['name']
                    incoming_name = data['company_info']['name']
                    if (current_name == 'Unknown Company' or len(incoming_name) > len(current_name)) and incoming_name != 'Unknown':
                        combined_data['company_info'] = data['company_info']
                    
                    # Merge Financial Statements across detected fiscal years
                    # Logic: Fill gaps and overwrite zeros with valid numerical data
                    for year, bs in data['balance_sheet'].items():
                        if year not in combined_data['balance_sheet']:
                            combined_data['balance_sheet'][year] = bs
                        else:
                            for field, val in bs.items():
                                if val != 0: combined_data['balance_sheet'][year][field] = val
                    
                    for year, is_data in data['income_statement'].items():
                        if year not in combined_data['income_statement']:
                            combined_data['income_statement'][year] = is_data
                        else:
                            for field, val in is_data.items():
                                if val != 0: combined_data['income_statement'][year][field] = val
                    
                    combined_data['validation_errors'].extend(data.get('validation_errors', []))
                    
            except Exception as e:
                logger.error(f"Post-processing merge error for {os.path.basename(path)}: {e}")
                combined_data['validation_errors'].append(f"Parsing interruption for {os.path.basename(path)}: {str(e)}")
        
        return combined_data
