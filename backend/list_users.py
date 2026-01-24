from app.utils.database import engine
from sqlalchemy import text

def list_users():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT email FROM users"))
        for r in res:
            print(r[0])

if __name__ == '__main__':
    list_users()
