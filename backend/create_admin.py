import sys
import os

# Add the current directory to sys.path to resolve imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.utils.database import SessionLocal, engine, Base
from app.models.user import User
from app.utils.security import get_password_hash
import getpass

def create_admin():
    db = SessionLocal()
    
    print("--- Create Admin User ---")
    
    email = os.getenv("ADMIN_EMAIL")
    if not email:
        email = input("Enter admin email (default: admin@moskalti.com): ").strip() or "admin@moskalti.com"
    else:
        print(f"Using email from env: {email}")
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"\nUser {email} already exists!")
        choice = os.getenv("UPDATE_EXISTING", "").lower()
        if not choice:
             choice = input("Do you want to update this user to be an admin? (y/n): ").lower()
             
        if choice == 'y':
            existing_user.role = "admin"
            existing_user.is_superuser = True
            existing_user.is_active = True
            
            pwd = os.getenv("ADMIN_PASSWORD")
            if not pwd:
                pwd = getpass.getpass("Enter new password (leave empty to keep current): ").strip()
                
            if pwd:
                existing_user.hashed_password = get_password_hash(pwd)
                
            db.commit()
            print(f"User {email} updated to Admin successfully.")
        else:
            print("Operation cancelled.")
        db.close()
        return

    full_name = "Admin User"
    
    password = os.getenv("ADMIN_PASSWORD")
    if not password:
        password = getpass.getpass("Enter password (default: admin123): ").strip() or "admin123"
        confirm_password = getpass.getpass("Confirm password: ").strip() or "admin123"
        if password != confirm_password:
            print("Error: Passwords do not match.")
            return
    else:
        print("Using password from env")

    new_user = User(
        email=email,
        full_name=full_name,
        hashed_password=get_password_hash(password),
        role="admin",
        is_superuser=True,
        is_active=True
    )
    
    try:
        db.add(new_user)
        db.commit()
        print(f"\nSuccess! Admin user created.")
        print(f"Email: {email}")
        print(f"Role: admin")
    except Exception as e:
        print(f"Error creating user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
