from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

metadata = Base.metadata

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    student_id = Column(String, unique=True, index=True, nullable=True)  # Only for students
    admin_id = Column(String, unique=True, index=True, nullable=True)  # Only for admins
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student")
    phone = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    metrics = relationship("Metrics", back_populates="user", cascade="all, delete-orphan")


class Metrics(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)


    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    heart_rate = Column(Float, nullable=False)
    motion_intensity = Column(Float, nullable=False)
    prediction = Column(String, nullable=False)         
    anomaly_score = Column(Float, nullable=False)
    confidence_normal = Column(Float, nullable=False)
    confidence_anomaly = Column(Float, nullable=False)

    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="metrics")

