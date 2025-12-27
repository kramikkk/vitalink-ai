"""
Script to create a super admin user directly in the database without signup.
Usage: python create_super_admin.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models_db import User, Base
from utils.auth_utils import hash_password
import getpass

def create_super_admin():
    """Create a new super admin user"""
    db: Session = SessionLocal()
    
    try:
        print("\n🔐 Create Super Admin User\n")
        
        # Get user details
        full_name = input("Full Name: ").strip()
        if not full_name:
            print("\n❌ Error: Full name is required.")
            return False
            
        username = input("Username: ").strip()
        if not username:
            print("\n❌ Error: Username is required.")
            return False
            
        email = input("Email: ").strip()
        if not email:
            print("\n❌ Error: Email is required.")
            return False
            
        admin_id = input("Admin ID: ").strip()
        if not admin_id:
            print("\n❌ Error: Admin ID is required.")
            return False
        
        # Check if email already exists
        existing_email = db.query(User).filter(User.email == email).first()
        if existing_email:
            print(f"\n❌ Error: Email '{email}' is already registered.")
            return False
        
        # Check if username already exists
        existing_username = db.query(User).filter(User.username == username).first()
        if existing_username:
            print(f"\n❌ Error: Username '{username}' is already taken.")
            return False
        
        # Check if admin_id already exists
        existing_admin_id = db.query(User).filter(User.admin_id == admin_id).first()
        if existing_admin_id:
            print(f"\n❌ Error: Admin ID '{admin_id}' is already registered.")
            return False
        
        # Get password securely
        password = getpass.getpass("Password (min 8 characters): ")
        confirm_password = getpass.getpass("Confirm Password: ")
        
        if password != confirm_password:
            print("\n❌ Error: Passwords do not match.")
            return False
        
        if len(password) < 8:
            print("\n❌ Error: Password must be at least 8 characters long.")
            return False
        
        # Create new super admin user
        hashed_password = hash_password(password)
        
        new_admin = User(
            full_name=full_name,
            username=username,
            email=email,
            password=hashed_password,
            admin_id=admin_id,
            role="super_admin"
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("\n✅ Success: Super Admin user created!")
        print(f"   User ID: {new_admin.id}")
        print(f"   Name: {new_admin.full_name}")
        print(f"   Username: {new_admin.username}")
        print(f"   Email: {new_admin.email}")
        print(f"   Admin ID: {new_admin.admin_id}")
        print(f"   Role: {new_admin.role}")
        print("\n🎉 You can now login with these credentials!\n")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        db.rollback()
        return False
        
    finally:
        db.close()


if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    create_super_admin()
