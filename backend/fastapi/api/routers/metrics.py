from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from database import get_db, engine
from models_db import User, Metrics
from utils.auth_utils import get_current_user
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/metrics", tags=["Metrics"])
@router.get("/latest")
def get_latest_metrics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Use the Metrics table with user_id filter instead of per-user tables
    try:
        results = db.query(Metrics).filter(
            Metrics.user_id == current_user.id
        ).order_by(Metrics.id.desc()).limit(3).all()

        if not results:
            raise HTTPException(status_code=404, detail="No data available")

        return [{
            "id": m.id,
            "heart_rate": m.heart_rate,
            "motion_intensity": m.motion_intensity,
            "prediction": m.prediction,
            "anomaly_score": m.anomaly_score,
            "confidence_normal": m.confidence_normal,
            "confidence_anomaly": m.confidence_anomaly,
            "timestamp": m.timestamp
        } for m in results]

    except Exception as e:
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

