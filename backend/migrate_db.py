from app.utils.database import engine
from sqlalchemy import text

def migrate():
    columns_to_add = [
        ("approved_amount", "NUMERIC(15, 2)"),
        ("credit_type", "VARCHAR(20)"),
        ("sales_trend", "NUMERIC(10, 4)"),
        ("net_income_coverage", "NUMERIC(10, 4)")
    ]
                
    with engine.connect() as conn:
        for col_name, col_type in columns_to_add:
            try:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE analysis_results ADD COLUMN {col_name} {col_type}"))
                conn.commit()
                print(f"Successfully added {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")

if __name__ == "__main__":
    migrate()
