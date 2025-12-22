from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models_db import User, Alert
from utils.auth_utils import get_current_user
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/metrics", tags=["Alerts"])


def generate_alert_if_needed(db: Session, user_id: int, heart_rate: float, motion_intensity: float,
                              prediction: str, anomaly_score: float, confidence_anomaly: float):
    """
    Generate AI-driven alerts based on sensor data and predictions.
    Alerts are only created for: High Heart Rate, High Activity, and AI-detected Anomalies (stress/fatigue).
    """
    alerts_to_create = []

    # 1. AI Anomaly Detection Alert (covers stress and fatigue detection)
    if prediction == "ANOMALY" and confidence_anomaly >= 60:
        severity = "CRITICAL" if confidence_anomaly >= 80 else "HIGH"
        alerts_to_create.append({
            "alert_type": "AI_ANOMALY",
            "severity": severity,
            "title": "Abnormal Pattern Detected",
            "message": "AI detected abnormal health pattern. Early signs of stress or fatigue may be present.",
            "stress_level": confidence_anomaly,
            "anomaly_score": anomaly_score
        })

    # 2. High Heart Rate Alert
    if heart_rate > 100:
        severity = "CRITICAL" if heart_rate > 120 else "HIGH"
        alerts_to_create.append({
            "alert_type": "HIGH_HEART_RATE",
            "severity": severity,
            "title": "Elevated Heart Rate",
            "message": "Your heart rate is elevated. Monitor your condition and rest if necessary.",
            "heart_rate": heart_rate
        })

    # 3. High Activity Level Alert
    if motion_intensity > 80:
        severity = "HIGH"
        alerts_to_create.append({
            "alert_type": "HIGH_ACTIVITY",
            "severity": severity,
            "title": "High Activity Detected",
            "message": "Your activity level is very high. Take breaks to avoid overexertion.",
            "motion_intensity": motion_intensity
        })

    # Create alerts in database (avoid duplicates within last 5 minutes)
    for alert_data in alerts_to_create:
        # Check if similar alert exists in last 5 minutes
        recent_similar = db.query(Alert).filter(
            Alert.user_id == user_id,
            Alert.alert_type == alert_data["alert_type"],
            Alert.created_at >= datetime.now(timezone.utc) - timedelta(minutes=5)
        ).first()

        if not recent_similar:
            new_alert = Alert(
                user_id=user_id,
                alert_type=alert_data["alert_type"],
                severity=alert_data["severity"],
                title=alert_data["title"],
                message=alert_data["message"],
                heart_rate=alert_data.get("heart_rate", heart_rate),
                motion_intensity=alert_data.get("motion_intensity", motion_intensity),
                stress_level=alert_data.get("stress_level", confidence_anomaly),
                anomaly_score=alert_data.get("anomaly_score", anomaly_score)
            )
            db.add(new_alert)

    db.commit()


@router.get("/alerts")
def get_user_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get alerts for the current user (student view).
    Returns all alerts ordered by creation date.
    """
    alerts = db.query(Alert).filter(
        Alert.user_id == current_user.id
    ).order_by(Alert.created_at.desc()).limit(50).all()

    return [{
        "id": a.id,
        "alert_type": a.alert_type,
        "severity": a.severity,
        "title": a.title,
        "message": a.message,
        "heart_rate": a.heart_rate,
        "motion_intensity": a.motion_intensity,
        "stress_level": a.stress_level,
        "anomaly_score": a.anomaly_score,
        "is_read": a.is_read,
        "created_at": a.created_at.isoformat(),
        "read_at": a.read_at.isoformat() if a.read_at else None
    } for a in alerts]


@router.put("/alerts/{alert_id}/mark-read")
def mark_alert_read(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark an alert as read.
    """
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.user_id == current_user.id
    ).first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    if not alert.is_read:
        alert.is_read = True
        alert.read_at = datetime.now(timezone.utc)
        db.commit()

    return {"message": "Alert marked as read"}


@router.put("/alerts/mark-all-read")
def mark_all_alerts_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all unread alerts as read for the current user.
    """
    updated_count = db.query(Alert).filter(
        Alert.user_id == current_user.id,
        Alert.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.now(timezone.utc)
    })

    db.commit()

    return {"message": f"Marked {updated_count} alerts as read", "count": updated_count}


@router.get("/student/{student_id}/alerts")
def get_student_alerts(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get alerts for a specific student. Admin/Super Admin only.
    """
    # Check if current user is admin or super admin
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only admins can access student alerts")

    # Verify the student exists
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    alerts = db.query(Alert).filter(
        Alert.user_id == student_id
    ).order_by(Alert.created_at.desc()).limit(50).all()

    return [{
        "id": a.id,
        "alert_type": a.alert_type,
        "severity": a.severity,
        "title": a.title,
        "message": a.message,
        "heart_rate": a.heart_rate,
        "motion_intensity": a.motion_intensity,
        "stress_level": a.stress_level,
        "anomaly_score": a.anomaly_score,
        "is_read": a.is_read,
        "created_at": a.created_at.isoformat(),
        "read_at": a.read_at.isoformat() if a.read_at else None
    } for a in alerts]
