#!/usr/bin/env python3
"""
Test script to generate various alerts for testing purposes.
This script simulates different sensor readings that trigger alerts.
"""

import sys
from database import SessionLocal
from models_db import Alert, User
from routers.alerts import generate_alert_if_needed
from datetime import datetime, timezone, timedelta

def clear_alerts(db, user_id):
    """Clear all existing alerts for the user"""
    deleted = db.query(Alert).filter(Alert.user_id == user_id).delete()
    db.commit()
    return deleted

def generate_test_alerts(user_id: int, clear_existing: bool = False):
    """Generate a variety of test alerts"""
    db = SessionLocal()

    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            print(f"❌ User with ID {user_id} not found")
            return

        print(f"Generating test alerts for: {user.username} (ID: {user.id})")
        print("=" * 70)

        if clear_existing:
            deleted = clear_alerts(db, user_id)
            print(f"🗑️  Cleared {deleted} existing alerts\n")

        # Test scenarios
        scenarios = [
            {
                "name": "Critical High Heart Rate",
                "heart_rate": 160,
                "motion_intensity": 45,
                "prediction": "NORMAL",
                "anomaly_score": 0.1,
                "confidence_anomaly": 15,
                "expected": "HIGH_HEART_RATE (CRITICAL)"
            },
            {
                "name": "High Heart Rate",
                "heart_rate": 130,
                "motion_intensity": 50,
                "prediction": "NORMAL",
                "anomaly_score": 0.2,
                "confidence_anomaly": 20,
                "expected": "HIGH_HEART_RATE (HIGH)"
            },
            {
                "name": "High Activity",
                "heart_rate": 95,
                "motion_intensity": 85,
                "prediction": "NORMAL",
                "anomaly_score": 0.15,
                "confidence_anomaly": 12,
                "expected": "HIGH_ACTIVITY (HIGH)"
            },
            {
                "name": "Very High Activity",
                "heart_rate": 100,
                "motion_intensity": 95,
                "prediction": "NORMAL",
                "anomaly_score": 0.18,
                "confidence_anomaly": 18,
                "expected": "HIGH_ACTIVITY (HIGH)"
            },
            {
                "name": "Critical AI Anomaly (High Stress)",
                "heart_rate": 110,
                "motion_intensity": 55,
                "prediction": "ANOMALY",
                "anomaly_score": 0.9,
                "confidence_anomaly": 85,
                "expected": "AI_ANOMALY (CRITICAL)"
            },
            {
                "name": "High AI Anomaly (Moderate Stress)",
                "heart_rate": 105,
                "motion_intensity": 40,
                "prediction": "ANOMALY",
                "anomaly_score": 0.7,
                "confidence_anomaly": 65,
                "expected": "AI_ANOMALY (HIGH)"
            },
            {
                "name": "Medium AI Anomaly (Mild Stress)",
                "heart_rate": 98,
                "motion_intensity": 35,
                "prediction": "ANOMALY",
                "anomaly_score": 0.5,
                "confidence_anomaly": 50,
                "expected": "AI_ANOMALY (MEDIUM)"
            },
            {
                "name": "Multiple Alerts - HR + Activity",
                "heart_rate": 140,
                "motion_intensity": 88,
                "prediction": "NORMAL",
                "anomaly_score": 0.2,
                "confidence_anomaly": 20,
                "expected": "HIGH_HEART_RATE + HIGH_ACTIVITY"
            },
            {
                "name": "Multiple Alerts - All Three",
                "heart_rate": 155,
                "motion_intensity": 90,
                "prediction": "ANOMALY",
                "anomaly_score": 0.85,
                "confidence_anomaly": 82,
                "expected": "HIGH_HEART_RATE + HIGH_ACTIVITY + AI_ANOMALY"
            },
            {
                "name": "Normal - No Alert",
                "heart_rate": 75,
                "motion_intensity": 30,
                "prediction": "NORMAL",
                "anomaly_score": 0.1,
                "confidence_anomaly": 8,
                "expected": "No alerts"
            },
        ]

        for i, scenario in enumerate(scenarios, 1):
            print(f"\n{i}. {scenario['name']}")
            print(f"   HR: {scenario['heart_rate']} BPM")
            print(f"   Activity: {scenario['motion_intensity']}%")
            print(f"   Prediction: {scenario['prediction']}")
            if scenario['prediction'] == "ANOMALY":
                print(f"   Anomaly Score: {scenario['anomaly_score']}")
                print(f"   Confidence: {scenario['confidence_anomaly']}%")
            print(f"   Expected: {scenario['expected']}")

            # Generate alert
            generate_alert_if_needed(
                db=db,
                user_id=user_id,
                heart_rate=scenario['heart_rate'],
                motion_intensity=scenario['motion_intensity'],
                prediction=scenario['prediction'],
                anomaly_score=scenario['anomaly_score'],
                confidence_anomaly=scenario['confidence_anomaly']
            )
            print("   ✅ Generated")

        # Show summary
        print("\n" + "=" * 70)
        print("SUMMARY")
        print("=" * 70)

        alerts = db.query(Alert).filter(Alert.user_id == user_id).order_by(Alert.created_at.desc()).all()

        # Count by type
        type_counts = {}
        severity_counts = {}
        for alert in alerts:
            type_counts[alert.alert_type] = type_counts.get(alert.alert_type, 0) + 1
            severity_counts[alert.severity] = severity_counts.get(alert.severity, 0) + 1

        print(f"\nTotal alerts created: {len(alerts)}")
        print(f"\nBy Type:")
        for alert_type, count in sorted(type_counts.items()):
            print(f"  {alert_type}: {count}")

        print(f"\nBy Severity:")
        for severity, count in sorted(severity_counts.items()):
            print(f"  {severity}: {count}")

        print(f"\n{'=' * 70}")
        print("All Alerts:")
        print("=" * 70)

        for alert in alerts:
            print(f"\n📢 {alert.alert_type} - {alert.severity}")
            print(f"   {alert.title}")
            print(f"   {alert.message}")
            if alert.heart_rate:
                print(f"   HR: {alert.heart_rate} BPM")
            if alert.motion_intensity:
                print(f"   Activity: {alert.motion_intensity}%")
            if alert.stress_level:
                print(f"   Stress: {alert.stress_level}%")
            if alert.anomaly_score:
                print(f"   Anomaly Score: {alert.anomaly_score:.2f}")
            print(f"   Created: {alert.created_at}")
            print(f"   Read: {'Yes' if alert.is_read else 'No'}")

        print(f"\n{'=' * 70}")
        print("✅ Test alerts generated successfully!")
        print(f"\nYou can now:")
        print(f"1. View alerts in the frontend at http://localhost:3000")
        print(f"2. Test 'Mark as Read' functionality")
        print(f"3. Test 'Mark All as Read' functionality")
        print(f"4. Test alert filtering (Unread Only / All Alerts)")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


def main():
    """Main entry point"""
    print("\n" + "=" * 70)
    print("ALERT GENERATION TEST SCRIPT")
    print("=" * 70)

    # Get user ID from command line or use first user
    db = SessionLocal()
    try:
        if len(sys.argv) > 1:
            user_id = int(sys.argv[1])
        else:
            user = db.query(User).first()
            if not user:
                print("❌ No users found. Please create a user first.")
                return
            user_id = user.id
            print(f"Using first user: {user.username} (ID: {user_id})")
    finally:
        db.close()

    # Ask whether to clear existing alerts
    clear = input("\nClear existing alerts before generating new ones? (y/N): ").strip().lower()
    clear_existing = clear == 'y'

    print()
    generate_test_alerts(user_id, clear_existing)
    print()


if __name__ == "__main__":
    main()
