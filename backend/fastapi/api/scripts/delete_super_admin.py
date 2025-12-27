"""
Script to delete a super admin user directly from the database.
Usage: python delete_super_admin.py
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models_db import User, Base

def delete_super_admin():
    """Delete a super admin user"""
    db: Session = SessionLocal()
    
    try:
        print("\n🗑️  Delete Super Admin User\n")
        
        # Get all super admins
        super_admins = db.query(User).filter(User.role == "super_admin").all()
        
        if not super_admins:
            print("❌ No super admin users found in the database.\n")
            return False
        
        # Display all super admins
        print("Available Super Admin Users:\n")
        for idx, admin in enumerate(super_admins, 1):
            print(f"{idx}. {admin.full_name}")
            print(f"   Email: {admin.email}")
            print(f"   Username: {admin.username}")
            print(f"   Admin ID: {admin.admin_id}")
            print(f"   User ID: {admin.id}")
            print()
        
        # Get user selection
        while True:
            try:
                selection = input(f"Select user to delete (1-{len(super_admins)}) or 'q' to quit: ").strip()
                
                if selection.lower() == 'q':
                    print("\n❌ Deletion cancelled.\n")
                    return False
                
                selection_num = int(selection)
                if 1 <= selection_num <= len(super_admins):
                    break
                else:
                    print(f"❌ Please enter a number between 1 and {len(super_admins)}")
            except ValueError:
                print("❌ Invalid input. Please enter a number or 'q' to quit.")
        
        selected_admin = super_admins[selection_num - 1]
        
        # Confirm deletion
        print(f"\n⚠️  WARNING: You are about to delete:")
        print(f"   Name: {selected_admin.full_name}")
        print(f"   Email: {selected_admin.email}")
        print(f"   Username: {selected_admin.username}")
        print(f"   Admin ID: {selected_admin.admin_id}")
        print(f"   Role: {selected_admin.role}")
        
        confirmation = input("\nType 'DELETE' to confirm: ").strip()
        
        if confirmation != "DELETE":
            print("\n❌ Deletion cancelled.\n")
            return False
        
        # Delete the user
        db.delete(selected_admin)
        db.commit()
        
        print("\n✅ Success: Super Admin user deleted!")
        print(f"   {selected_admin.full_name} ({selected_admin.email}) has been removed from the database.\n")
        
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
    
    delete_super_admin()
