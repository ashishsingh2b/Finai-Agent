import logging
import os
import sys

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add current directory to path to import app modules
sys.path.append(os.getcwd())

from app.services.file_processing.excel_parser import ExcelParser

def test_parser(filename):
    file_path = os.path.join('demo_reports', filename)
    print(f"Testing parser on: {file_path}")
    
    if not os.path.exists(file_path):
        print("File not found!")
        return

    try:
        parser = ExcelParser(file_path)
        data = parser.extract_all()
        
        # We can't easily get row_mappings from here unless we modify the parser
        # Let's just print the whole balance sheet data for the first year
        bs = data.get('balance_sheet', {})
        print(f"\nBS Keys Found: {len(bs)}")
        if bs:
            first_year = list(bs.keys())[0]
            print(f"Data for {first_year}:")
            for k, v in bs[first_year].items():
                print(f"  {k}: {v}")
            
            if bs[first_year].get('total_assets', 0) > 0:
                print("\nSUCCESS: Total Assets found.")
            else:
                print("\nFAILURE: Total Assets is 0 or missing.")
        else:
            print("\nFAILURE: No Balance Sheet data extracted.")

    except Exception as e:
        print(f"Parser Exception: {e}")

if __name__ == "__main__":
    test_parser("Case_3_GradeD_Collateral4.xlsx")
