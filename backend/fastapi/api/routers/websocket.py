from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from database import SessionLocal
from models_db import Device, Metrics
from datetime import datetime, timezone, timedelta
from routers.alerts import generate_alert_if_needed
from ai_model.model import predict
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Philippine timezone (UTC+8)
PH_TZ = timezone(timedelta(hours=8))


@router.websocket("/ws/sensors")
async def websocket_sensor_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time sensor data from ESP32 devices.
    """
    await websocket.accept()
    logger.info("WebSocket connection accepted")

    try:
        while True:
            # Receive data from ESP32
            data = await websocket.receive_text()
            logger.info(f"WebSocket received: {data}")

            try:
                payload = json.loads(data)
                device_id = payload.get("device_id")
                heart_rate = payload.get("heart_rate", 0)
                motion_intensity = payload.get("motion_intensity", 0)

                # Get database session
                db = SessionLocal()

                try:
                    # Verify device exists and is paired
                    device = db.query(Device).filter(Device.device_id == device_id).first()
                    if not device or not device.paired or not device.user_id:
                        logger.warning(f"Device {device_id} not paired, skipping")
                        await websocket.send_text(json.dumps({
                            "status": "error",
                            "message": "Device not paired"
                        }))
                        continue

                    # Run AI prediction on incoming sensor data (same as HTTP endpoint)
                    result = predict(heart_rate, motion_intensity)

                    # Save to database
                    new_metric = Metrics(
                        user_id=device.user_id,
                        heart_rate=heart_rate,
                        motion_intensity=motion_intensity,
                        timestamp=datetime.now(PH_TZ),
                        prediction=result["prediction"],
                        anomaly_score=result["anomaly_score"],
                        confidence_normal=result["confidence_normal"],
                        confidence_anomaly=result["confidence_anomaly"]
                    )
                    db.add(new_metric)
                    db.commit()
                    db.refresh(new_metric)

                    logger.info(f"✓ Saved metric {new_metric.id} for user {device.user_id}")

                    # Generate AI-driven alerts if abnormal readings detected
                    generate_alert_if_needed(
                        db=db,
                        user_id=device.user_id,
                        heart_rate=heart_rate,
                        motion_intensity=motion_intensity,
                        prediction=result["prediction"],
                        anomaly_score=result["anomaly_score"],
                        confidence_anomaly=result["confidence_anomaly"],
                        timestamp=new_metric.timestamp
                    )

                    # Send response back to device
                    response = {
                        "status": "success",
                        "metric_id": new_metric.id,
                        "prediction": result["prediction"],
                        "stress_level": int(result["confidence_anomaly"]),  # Stress level is confidence_anomaly as integer
                        "anomaly_score": result["anomaly_score"],
                        "confidence_anomaly": result["confidence_anomaly"]
                    }

                    await websocket.send_text(json.dumps(response))
                    logger.info(f"✓ Sent response: Stress={int(result['confidence_anomaly'])}%")

                except Exception as e:
                    logger.error(f"Error processing WebSocket message: {str(e)}")
                    db.rollback()
                    await websocket.send_text(json.dumps({
                        "status": "error",
                        "message": str(e)
                    }))
                finally:
                    db.close()

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON in WebSocket message: {data}")
                await websocket.send_text(json.dumps({
                    "status": "error",
                    "message": "Invalid JSON format"
                }))

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
