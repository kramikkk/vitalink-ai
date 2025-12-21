"""
Script to generate training data from existing metrics in the database.
This extracts heart_rate and motion_intensity from the metrics table.
"""
import sys
import os
import pandas as pd

# Add parent directory to path to import database modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
from models_db import Metrics

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(BASE_DIR, "training_data.csv")


def generate_training_data(min_samples=100):
    """
    Extract training data from the metrics table.

    Args:
        min_samples: Minimum number of samples needed for training

    Returns:
        Number of samples extracted
    """
    db = SessionLocal()

    try:
        # Query all metrics
        metrics = db.query(Metrics).all()

        if len(metrics) < min_samples:
            print(f"Warning: Only {len(metrics)} samples found. Recommended minimum: {min_samples}")
            if len(metrics) < 10:
                raise ValueError("Not enough data to train. Need at least 10 samples.")

        # Extract data into DataFrame
        data = {
            "heart_rate": [m.heart_rate for m in metrics],
            "motion_intensity": [m.motion_intensity for m in metrics]
        }

        df = pd.DataFrame(data)

        # Remove any invalid values (NaN, inf, etc.)
        df = df.apply(pd.to_numeric, errors="coerce").dropna()

        # Filter out obviously invalid values
        df = df[
            (df["heart_rate"] >= 20) & (df["heart_rate"] <= 255) &  # Valid BPM range
            (df["motion_intensity"] >= 0) & (df["motion_intensity"] <= 100)  # Valid motion range
        ]

        if len(df) < 10:
            raise ValueError(f"After filtering, only {len(df)} valid samples remain. Need at least 10.")

        # Save to CSV
        df.to_csv(OUTPUT_PATH, index=False)

        print(f"✓ Training data generated successfully!")
        print(f"  - Total samples: {len(df)}")
        print(f"  - Output file: {OUTPUT_PATH}")
        print(f"\nData statistics:")
        print(df.describe())

        return len(df)

    finally:
        db.close()


if __name__ == "__main__":
    try:
        count = generate_training_data()
        print(f"\n✓ Successfully generated {count} training samples")
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)
