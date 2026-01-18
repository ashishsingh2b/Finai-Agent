import openpyxl
from openpyxl.utils import get_column_letter
import json

# Load the Excel file
excel_path = r'D:\FREELANCERS\PAOLAG\CLIENT REQUIREMNT LIST AND DETAILS\Ejemplo para hacer un analisis.xlsx'
output_path = r'D:\FREELANCERS\PAOLAG\EXCEL_TEMPLATE_ANALYSIS.txt'

wb = openpyxl.load_workbook(excel_path, data_only=False)

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("="*100 + "\n")
    f.write("MOSKALTI CAPITAL - EXCEL TEMPLATE DEEP ANALYSIS\n")
    f.write("="*100 + "\n\n")
    
    f.write(f"File: {excel_path}\n")
    f.write(f"Total Sheets: {len(wb.sheetnames)}\n\n")
    
    # List all sheets
    f.write("SHEET NAMES:\n")
    f.write("-" * 100 + "\n")
    for i, sheet_name in enumerate(wb.sheetnames, 1):
        f.write(f"  {i}. {sheet_name}\n")
    
    f.write("\n" + "="*100 + "\n")
    
    # Analyze each sheet in detail
    for sheet_idx, sheet_name in enumerate(wb.sheetnames, 1):
        f.write(f"\n\n{'='*100}\n")
        f.write(f"SHEET {sheet_idx}: {sheet_name}\n")
        f.write('='*100 + "\n")
        
        ws = wb[sheet_name]
        
        # Basic info
        f.write(f"\nSheet Information:\n")
        f.write(f"  - Dimensions: {ws.dimensions}\n")
        f.write(f"  - Max Row: {ws.max_row}\n")
        f.write(f"  - Max Column: {ws.max_column} ({get_column_letter(ws.max_column)})\n")
        
        # Preview first 20 rows with all columns
        f.write(f"\n--- DATA PREVIEW (First 20 rows) ---\n")
        f.write("-" * 100 + "\n")
        
        for row_idx in range(1, min(21, ws.max_row + 1)):
            row_data = []
            for col_idx in range(1, min(15, ws.max_column + 1)):  # First 15 columns
                cell = ws.cell(row=row_idx, column=col_idx)
                value = cell.value
                
                # Indicate if it's a formula
                if value and isinstance(value, str) and value.startswith('='):
                    row_data.append(f"[FORMULA: {value[:30]}...]")
                elif value is not None:
                    row_data.append(str(value)[:30])
                else:
                    row_data.append("")
            
            if any(row_data):  # Only write non-empty rows
                f.write(f"Row {row_idx}: {' | '.join(row_data)}\n")
        
        # Collect all formulas
        f.write(f"\n\n--- FORMULAS ANALYSIS ---\n")
        f.write("-" * 100 + "\n")
        
        formulas = []
        for row in ws.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str) and cell.value.startswith('='):
                    formulas.append({
                        'cell': cell.coordinate,
                        'row': cell.row,
                        'col': cell.column,
                        'formula': cell.value
                    })
        
        f.write(f"Total Formula Cells: {len(formulas)}\n\n")
        
        if formulas:
            f.write("Sample Formulas (first 30):\n")
            for i, formula_info in enumerate(formulas[:30], 1):
                f.write(f"  {i}. Cell {formula_info['cell']} (R{formula_info['row']}C{formula_info['col']}): {formula_info['formula']}\n")
            
            # Identify formula patterns
            f.write(f"\n--- FORMULA PATTERNS ---\n")
            
            # Count different formula types
            sum_formulas = sum(1 for f in formulas if 'SUM(' in f['formula'].upper())
            if_formulas = sum(1 for f in formulas if 'IF(' in f['formula'].upper())
            vlookup_formulas = sum(1 for f in formulas if 'VLOOKUP(' in f['formula'].upper())
            average_formulas = sum(1 for f in formulas if 'AVERAGE(' in f['formula'].upper())
            
            f.write(f"  - SUM formulas: {sum_formulas}\n")
            f.write(f"  - IF formulas: {if_formulas}\n")
            f.write(f"  - VLOOKUP formulas: {vlookup_formulas}\n")
            f.write(f"  - AVERAGE formulas: {average_formulas}\n")
        
        # Find cells with specific text patterns (like headers)
        f.write(f"\n\n--- KEY TEXT PATTERNS ---\n")
        f.write("-" * 100 + "\n")
        
        keywords = ['ACTIVO', 'PASIVO', 'CAPITAL', 'VENTAS', 'UTILIDAD', 'TOTAL', 
                   'RATIO', 'ROE', 'ROA', 'LIQUIDITY', 'SOLVENCIA']
        
        for keyword in keywords:
            found_cells = []
            for row in ws.iter_rows():
                for cell in row:
                    if cell.value and isinstance(cell.value, str) and keyword in cell.value.upper():
                        found_cells.append(f"{cell.coordinate}: {cell.value}")
            
            if found_cells:
                f.write(f"\n'{keyword}' found in {len(found_cells)} cells:\n")
                for cell_info in found_cells[:5]:  # Show first 5
                    f.write(f"  - {cell_info}\n")
        
        f.write("\n" + "-" * 100 + "\n")
    
    f.write("\n\n" + "="*100 + "\n")
    f.write("ANALYSIS COMPLETE\n")
    f.write("="*100 + "\n")

print(f"Analysis saved to: {output_path}")
print("Done!")
