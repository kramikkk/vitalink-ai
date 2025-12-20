from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from database import get_db
from models_db import User
from models import UserLogin, Token, UserRole
from utils.auth_utils import hash_password, verify_password, create_access_token, get_current_user, require_role

router = APIRouter(tags=["Authentication"])


class SignupRequest(BaseModel):
    full_name: str
    username: str
    student_id: str  # Required for students
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup(user: SignupRequest, db: Session = Depends(get_db)):
   
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    # Password strength validation
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    existing_student_id = db.query(User).filter(User.student_id == user.student_id).first()
    if existing_student_id:
        raise HTTPException(status_code=400, detail="Student ID already registered")

    hashed_pw = hash_password(user.password)

    new_user = User(
        full_name=user.full_name,
        username=user.username,
        student_id=user.student_id,
        email=user.email,
        password=hashed_pw,
        role="student"  # Default role for signup
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create user")

    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {"access_token": access_token, "token_type": "bearer", "role": new_user.role}


@router.post("/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    if not verify_password(user_credentials.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer", "role": user.role}


@router.get("/me", response_model=dict)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "student_id": current_user.student_id,
        "admin_id": current_user.admin_id,
        "email": current_user.email,
        "phone": current_user.phone,
        "emergency_contact": current_user.emergency_contact,
        "avatar_url": current_user.avatar_url,
        "role": current_user.role,
    }

class AdminSignupRequest(BaseModel):
    full_name: str
    username: str
    admin_id: str  # Admin ID instead of student ID
    email: EmailStr
    password: str
    confirm_password: str


@router.post("/admin/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def admin_signup(
    user: AdminSignupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.SUPER_ADMIN]))
):
    """
    Register a new admin user. Only super admins can create admin accounts.
    """
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    existing_username = db.query(User).filter(User.username == user.username).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    existing_admin_id = db.query(User).filter(User.admin_id == user.admin_id).first()
    if existing_admin_id:
        raise HTTPException(status_code=400, detail="Admin ID already registered")

    hashed_pw = hash_password(user.password)

    new_admin = User(
        full_name=user.full_name,
        username=user.username,
        admin_id=user.admin_id,
        email=user.email,
        password=hashed_pw,
        role="admin"
    )

    try:
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to create admin user")

    access_token = create_access_token(data={"sub": str(new_admin.id)})

    return {"access_token": access_token, "token_type": "bearer", "role": new_admin.role}


class ProfileUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    student_id: str | None = None
    admin_id: str | None = None
    phone: str | None = None
    emergency_contact: str | None = None
    avatar_url: str | None = None
    password: str | None = None


class AdminUserUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None
    email: EmailStr | None = None
    student_id: str | None = None
    phone: str | None = None
    emergency_contact: str | None = None
    avatar_url: str | None = None
    password: str | None = None


@router.put("/me/update")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Allows updating own profile. Admins/super admins can update all fields, students can only update limited fields.
    """
    # Check for unique constraints before updating
    if data.email is not None:
        existing_email = db.query(User).filter(
            User.email == data.email,
            User.id != current_user.id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = data.email
    
    if data.username is not None:
        existing_username = db.query(User).filter(
            User.username == data.username,
            User.id != current_user.id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        current_user.username = data.username
    
    if data.student_id is not None:
        existing_student_id = db.query(User).filter(
            User.student_id == data.student_id,
            User.id != current_user.id
        ).first()
        if existing_student_id:
            raise HTTPException(status_code=400, detail="Student ID already in use")
        current_user.student_id = data.student_id
    
    if data.admin_id is not None:
        existing_admin_id = db.query(User).filter(
            User.admin_id == data.admin_id,
            User.id != current_user.id
        ).first()
        if existing_admin_id:
            raise HTTPException(status_code=400, detail="Admin ID already in use")
        current_user.admin_id = data.admin_id
    
    # Update other fields
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    if data.emergency_contact is not None:
        current_user.emergency_contact = data.emergency_contact
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.password is not None:
        if len(data.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        current_user.password = hash_password(data.password)

    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully"}


@router.get("/students", response_model=list)
def get_all_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """
    Get all students. Only accessible by admins and super admins.
    """
    students = db.query(User).filter(User.role == "student").all()
    
    return [
        {
            "id": student.id,
            "full_name": student.full_name,
            "username": student.username,
            "student_id": student.student_id,
            "email": student.email,
            "avatar_url": student.avatar_url,
            "phone": student.phone,
            "emergency_contact": student.emergency_contact,
        }
        for student in students
    ]


@router.put("/users/{user_id}/update")
def update_user_profile(
    user_id: int,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
):
    """
    Allows admins/super admins to update any user's profile.
    """
    user_to_update = db.query(User).filter(User.id == user_id).first()
    if not user_to_update:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check for unique constraints before updating
    if data.email is not None:
        existing_email = db.query(User).filter(
            User.email == data.email, 
            User.id != user_id
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")
        user_to_update.email = data.email
    
    if data.username is not None:
        existing_username = db.query(User).filter(
            User.username == data.username,
            User.id != user_id
        ).first()
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already taken")
        user_to_update.username = data.username
    
    if data.student_id is not None:
        existing_student_id = db.query(User).filter(
            User.student_id == data.student_id,
            User.id != user_id
        ).first()
        if existing_student_id:
            raise HTTPException(status_code=400, detail="Student ID already in use")
        user_to_update.student_id = data.student_id
    
    # Update other fields
    if data.full_name is not None:
        user_to_update.full_name = data.full_name
    if data.phone is not None:
        user_to_update.phone = data.phone
    if data.emergency_contact is not None:
        user_to_update.emergency_contact = data.emergency_contact
    if data.avatar_url is not None:
        user_to_update.avatar_url = data.avatar_url
    if data.password is not None:
        if len(data.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        user_to_update.password = hash_password(data.password)

    db.commit()
    db.refresh(user_to_update)

    return {"message": "User profile updated successfully"}
