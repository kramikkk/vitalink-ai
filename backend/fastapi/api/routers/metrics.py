from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database import get_db, engine
from models_db import User, Metrics, Device
from utils.auth_utils import get_current_user
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel
from ai_model.model import predict
from routers.alerts import generate_alert_if_needed

router = APIRouter(prefix="/metrics", tags=["Metrics"])


# Pydantic model for sensor data from ESP32
class SensorDataRequest(BaseModel):
    device_id: str
    heart_rate: float
    motion_intensity: float

@router.post("/sensor-data")
def receive_sensor_data(data: SensorDataRequest, db: Session = Depends(get_db)):
    """
    ESP32 sends sensor data (BPM and motion intensity) to this endpoint.
    The device must be paired to a user.
    """
    # Find the device and verify it's paired
    device = db.query(Device).filter(Device.device_id == data.device_id).first()
    
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    if not device.paired or device.user_id is None:
        raise HTTPException(status_code=403, detail="Device not paired to any user")

    # Run AI prediction on incoming sensor data
    prediction_result = predict(data.heart_rate, data.motion_intensity)

    # Create new metrics entry with AI predictions
    new_metric = Metrics(
        user_id=device.user_id,
        heart_rate=data.heart_rate,
        motion_intensity=data.motion_intensity,
        prediction=prediction_result["prediction"],
        anomaly_score=prediction_result["anomaly_score"],
        confidence_normal=prediction_result["confidence_normal"],
        confidence_anomaly=prediction_result["confidence_anomaly"],
        timestamp=datetime.now(timezone.utc)
    )

    db.add(new_metric)
    db.commit()
    db.refresh(new_metric)

    # Generate AI-driven alerts if abnormal readings detected
    generate_alert_if_needed(
        db=db,
        user_id=device.user_id,
        heart_rate=data.heart_rate,
        motion_intensity=data.motion_intensity,
        prediction=prediction_result["prediction"],
        anomaly_score=prediction_result["anomaly_score"],
        confidence_anomaly=prediction_result["confidence_anomaly"]
    )

    return {
        "message": "Sensor data received",
        "metric_id": new_metric.id,
        "user_id": device.user_id,
        "prediction": prediction_result["prediction"],
        "anomaly_score": prediction_result["anomaly_score"],
        "confidence_anomaly": prediction_result["confidence_anomaly"]
    }

@router.get("/latest")
def get_latest_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Use the Metrics table with user_id filter instead of per-user tables
    try:
        results = db.query(Metrics).filter(
            Metrics.user_id == current_user.id
        ).order_by(Metrics.id.desc()).limit(3).all()

        if not results:
            # Return empty array instead of 404 when no data
            return []

        return [{
            "id": m.id,
            "heart_rate": m.heart_rate,
            "motion_intensity": m.motion_intensity,
            "prediction": m.prediction,
            "anomaly_score": m.anomaly_score,
            "confidence_normal": m.confidence_normal,
            "confidence_anomaly": m.confidence_anomaly,
            "timestamp": m.timestamp.isoformat() if m.timestamp else None
        } for m in results]

    except Exception as e:
        print(f"Error in get_latest_metrics: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/summary")
def get_heart_rate_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    period: str = Query("daily", description="Period to group summary by", enum=["daily", "weekly", "monthly"]),
    days: int = Query(None, description="Number of past days to include in summary")
):
    # Use ORM instead of raw SQL for security
    query = db.query(Metrics).filter(Metrics.user_id == current_user.id)
    
    if days is not None:
        if days <= 0:
            raise HTTPException(status_code=400, detail="Days must be a positive integer")
        start_date = datetime.now(timezone.utc) - timedelta(days=days)
        query = query.filter(Metrics.timestamp >= start_date)
    
    results = query.all()
    
    if not results:
        raise HTTPException(status_code=404, detail="No heart rate data available for this period")
    
    # Group results in Python rather than SQL for simplicity and security
    from collections import defaultdict
    import statistics
    
    grouped = defaultdict(list)
    for metric in results:
        if period == "daily":
            key = metric.timestamp.strftime("%Y-%m-%d")
        elif period == "weekly":
            key = metric.timestamp.strftime("%Y-W%U")
        else:  # monthly
            key = metric.timestamp.strftime("%Y-%m")
        grouped[key].append(metric.heart_rate)
    
    summary_list = []
    for period_key in sorted(grouped.keys(), reverse=True):
        values = grouped[period_key]
        summary_list.append({
            "period": period_key,
            "count": len(values),
            "average": round(statistics.mean(values), 2),
            "min": min(values),
            "max": max(values),
            "std_dev": round(statistics.stdev(values), 2) if len(values) > 1 else 0.0
        })
    
    return summary_list

@router.get("/history")
def get_metrics_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_time: str = Query(None, description="Start time in ISO format"),
    end_time: str = Query(None, description="End time in ISO format"),
    limit: int = Query(1000, description="Maximum number of records to return")
):
    """
    Get metrics history for the current user within a time range.
    Used by the frontend chart to display live and historical data.
    """
    query = db.query(Metrics).filter(Metrics.user_id == current_user.id)
    
    # Apply time range filters if provided
    if start_time:
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            query = query.filter(Metrics.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_time format. Use ISO format.")
    
    if end_time:
        try:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            query = query.filter(Metrics.timestamp <= end_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_time format. Use ISO format.")
    
    # Order by timestamp and apply limit
    results = query.order_by(Metrics.timestamp.asc()).limit(limit).all()
    
    return [{
        "id": m.id,
        "heart_rate": m.heart_rate,
        "motion_intensity": m.motion_intensity,
        "prediction": m.prediction,
        "anomaly_score": m.anomaly_score,
        "confidence_normal": m.confidence_normal,
        "confidence_anomaly": m.confidence_anomaly,
        "timestamp": m.timestamp.isoformat()
    } for m in results]


# Admin-only endpoints for monitoring students
@router.get("/student/{student_id}/latest")
def get_student_latest_metrics(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get latest metrics for a specific student. Admin/Super Admin only.
    """
    # Check if current user is admin or super admin
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only admins can access student metrics")
    
    # Verify the student exists and is a student
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.role != "student":
        raise HTTPException(status_code=400, detail="User is not a student")
    
    # Get latest metrics for the student
    results = db.query(Metrics).filter(
        Metrics.user_id == student_id
    ).order_by(Metrics.id.desc()).limit(3).all()
    
    if not results:
        return []
    
    return [{
        "id": m.id,
        "heart_rate": m.heart_rate,
        "motion_intensity": m.motion_intensity,
        "prediction": m.prediction,
        "anomaly_score": m.anomaly_score,
        "confidence_normal": m.confidence_normal,
        "confidence_anomaly": m.confidence_anomaly,
        "timestamp": m.timestamp.isoformat() if m.timestamp else None
    } for m in results]


@router.get("/student/{student_id}/history")
def get_student_metrics_history(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    start_time: str = Query(None, description="Start time in ISO format"),
    end_time: str = Query(None, description="End time in ISO format"),
    limit: int = Query(1000, description="Maximum number of records to return")
):
    """
    Get metrics history for a specific student. Admin/Super Admin only.
    """
    # Check if current user is admin or super admin
    if current_user.role not in ["admin", "super_admin"]:
        raise HTTPException(status_code=403, detail="Only admins can access student metrics")
    
    # Verify the student exists and is a student
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if student.role != "student":
        raise HTTPException(status_code=400, detail="User is not a student")
    
    # Build query for student metrics
    query = db.query(Metrics).filter(Metrics.user_id == student_id)
    
    # Apply time range filters if provided
    if start_time:
        try:
            start_dt = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            query = query.filter(Metrics.timestamp >= start_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid start_time format. Use ISO format.")
    
    if end_time:
        try:
            end_dt = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            query = query.filter(Metrics.timestamp <= end_dt)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid end_time format. Use ISO format.")
    
    # Order by timestamp and apply limit
    results = query.order_by(Metrics.timestamp.asc()).limit(limit).all()
    
    return [{
        "id": m.id,
        "heart_rate": m.heart_rate,
        "motion_intensity": m.motion_intensity,
        "prediction": m.prediction,
        "anomaly_score": m.anomaly_score,
        "confidence_normal": m.confidence_normal,
        "confidence_anomaly": m.confidence_anomaly,
        "timestamp": m.timestamp.isoformat()
    } for m in results]
