from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from database import get_db
from models_db import User
from models import UserRole
import os
from dotenv import load_dotenv
from typing import List

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here-replace-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "600"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plain password securely using bcrypt."""
    if len(password.encode("utf-8")) > 72:
        password = password[:72]  
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plain password against its hashed version."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token with expiration and a user identifier (sub)."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})

    if "sub" not in to_encode and "id" in to_encode:
        to_encode["sub"] = str(to_encode["id"])

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired",
        headers={"WWW-Authenticate": "Bearer"}
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def require_role(allowed_roles: List[UserRole]):
    """
    Dependency to require specific user roles.
    Usage: current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN]))
    """
    def role_checker(current_user: User = Depends(get_current_user)):
        # Convert string role to UserRole for comparison
        user_role_str = current_user.role if isinstance(current_user.role, str) else current_user.role.value
        allowed_role_values = [role.value for role in allowed_roles]
        
        if user_role_str not in allowed_role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_role_values}"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(get_current_user)):
    """
    Dependency to require admin or super_admin role.
    Shortcut for require_role([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    """
    user_role_str = current_user.role if isinstance(current_user.role, str) else current_user.role.value
    
    if user_role_str not in [UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin or Super Admin role required."
        )
    return current_user
