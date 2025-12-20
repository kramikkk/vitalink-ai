#!/usr/bin/env python3
"""
Real-time monitor for ESP32 sensor data
Watches the database for new metrics entries
"""

import time
from database import SessionLocal
from models_db import Metrics
from datetime import datetime

def monitor_metrics():
    db = SessionLocal()
    last_id = 0
    
    print("=== VitaLink AI - Real-time Metrics Monitor ===")
    print("Waiting for ESP32 to send data...")
    print("(Press Ctrl+C to stop)\n")
    
    try:
        while True:
            # Get latest metrics
            latest = db.query(Metrics).order_by(Metrics.id.desc()).first()
            
            if latest and latest.id > last_id:
                last_id = latest.id
                now = datetime.now().strftime("%H:%M:%S")
                print(f"[{now}] ✓ Data received!")
                print(f"  Heart Rate: {latest.heart_rate} BPM")
                print(f"  Motion: {latest.motion_intensity}%")
                print(f"  User ID: {latest.user_id}")
                print(f"  Metric ID: {latest.id}")
                print()
            
            time.sleep(1)  # Check every second
            
    except KeyboardInterrupt:
        print("\n\nMonitoring stopped.")
    finally:
        db.close()

if __name__ == "__main__":
    monitor_metrics()
