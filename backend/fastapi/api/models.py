from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    cellphone_number: str 
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    cellphone_number: Optional[str]

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str



class MetricsCreate(BaseModel):
    heart_rate: float
    activity_level: str
    timestamp: datetime
    prediction: str
    anomaly_score: float
    confidence_normal: float
    confidence_anomaly: float


class MetricsResponse(BaseModel):
    id: int
    heart_rate: float
    activity_level: str
    timestamp: datetime
    prediction: str
    anomaly_score: float
    confidence_normal: float
    confidence_anomaly: float

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    id: Optional[int] = None

