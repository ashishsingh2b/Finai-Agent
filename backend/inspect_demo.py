import pandas as pd

def inspect_excel(path):
    print(f"Inspecting: {path}")
    xls = pd.ExcelFile(path)
    print(f"Sheets: {xls.sheet_names}")
    for sheet in xls.sheet_names:
        df = pd.read_excel(path, sheet_name=sheet)
        print(f"\n--- {sheet} ---")
        print(df.head(10))

if __name__ == '__main__':
    inspect_excel('demo_financials.xlsx')
