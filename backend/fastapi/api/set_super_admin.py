"""
Script to set a user as super admin in the database.
Usage: python set_super_admin.py <user_email>
"""

import sys
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models_db import User, Base

def set_super_admin(email: str):
    """Set a user as super admin by email"""
    db: Session = SessionLocal()
    
    try:
        # Find user by email
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ Error: User with email '{email}' not found.")
            return False
        
        # Update user role to super admin
        user.role = "super_admin"
        db.commit()
        
        print(f"✅ Success: User '{user.full_name}' ({user.email}) is now a Super Admin!")
        print(f"   User ID: {user.id}")
        print(f"   Username: {user.username}")
        if user.student_id:
            print(f"   Student ID: {user.student_id}")
        if user.admin_id:
            print(f"   Admin ID: {user.admin_id}")
        print(f"   Role: {user.role}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        db.rollback()
        return False
        
    finally:
        db.close()


def list_all_users():
    """List all users in the database"""
    db: Session = SessionLocal()
    
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in the database.")
            return
        
        print(f"\n📋 Total users: {len(users)}\n")
        print(f"{'ID':<5} {'Name':<25} {'Email':<30} {'ID Type':<15} {'Role':<15}")
        print("-" * 95)
        
        for user in users:
            id_type = f"Student: {user.student_id}" if user.student_id else f"Admin: {user.admin_id}" if user.admin_id else "N/A"
            print(f"{user.id:<5} {user.full_name:<25} {user.email:<30} {id_type:<15} {user.role:<15}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        
    finally:
        db.close()


if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Set super admin:  python set_super_admin.py <user_email>")
        print("  List all users:   python set_super_admin.py --list")
        sys.exit(1)
    
    if sys.argv[1] == "--list":
        list_all_users()
    else:
        email = sys.argv[1]
        set_super_admin(email)
