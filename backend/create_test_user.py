from app.utils.database import SessionLocal
from app.models.user import User
from app.utils.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    email = "test_persist@gmail.com"
    password = "password123"
    
    # Delete if exists
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        db.delete(existing)
        db.commit()
    
    user = User(
        email=email,
        full_name="Test Persist",
        hashed_password=get_password_hash(password),
        role="admin",
        is_active=True
    )
    db.add(user)
    db.commit()
    print(f"User {email} created successfully.")
    db.close()

if __name__ == '__main__':
    create_test_user()
