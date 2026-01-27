from app.utils.database import engine
from sqlalchemy import text

def migrate():
    columns_to_add = [
        ("approved_amount", "NUMERIC(15, 2)"),
        ("credit_type", "VARCHAR(20)"),
        ("sales_trend", "NUMERIC(10, 4)"),
        ("net_income_coverage", "NUMERIC(10, 4)"),
        ("application_status", "VARCHAR(50) DEFAULT 'UNDER_REVIEW'"),
        ("payment_behavior", "VARCHAR(50) DEFAULT 'NA'"),
        ("validation_status", "VARCHAR(20) DEFAULT 'VALID'"),
        ("validation_alerts", "JSONB")
    ]
                
    for col_name, col_type in columns_to_add:
        with engine.connect() as conn:
            try:
                print(f"Adding column {col_name}...")
                conn.execute(text(f"ALTER TABLE analysis_results ADD COLUMN IF NOT EXISTS {col_name} {col_type}"))
                conn.commit()
                print(f"Successfully checked/added {col_name}")
            except Exception as e:
                print(f"Error adding {col_name}: {e}")

if __name__ == "__main__":
    migrate()
