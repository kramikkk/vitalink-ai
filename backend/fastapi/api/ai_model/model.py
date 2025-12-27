import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "training_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.joblib")

# Cache loaded models to avoid reloading from disk on every prediction
_cached_model = None
_cached_scaler = None

def clear_model_cache():
    """Clear cached model and scaler to force reload from disk."""
    global _cached_model, _cached_scaler
    _cached_model = None
    _cached_scaler = None


def train_model():
    """
    Train the Isolation Forest model using training data.
    Returns success message or raises error if training data is missing.
    """
    # Clear cache since we're retraining
    clear_model_cache()

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"training_data.csv is missing at {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    df = df.apply(pd.to_numeric, errors="coerce").dropna()

    if len(df) < 10:
        raise ValueError("Not enough training data. Need at least 10 samples.")

    X = df[["heart_rate", "motion_intensity"]]

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train Isolation Forest
    # Lower contamination to 0.01 since our training data is all normal
    # This makes the model more lenient and gives lower stress scores for normal data
    model = IsolationForest(
        n_estimators=200,
        contamination=0.01,  # Changed from 0.05 - expect only 1% outliers in clean training data
        random_state=42
    )
    model.fit(X_scaled)

    # Save model and scaler
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)

    return {
        "message": "Model trained successfully",
        "training_samples": len(df),
        "model_path": MODEL_PATH,
        "scaler_path": SCALER_PATH
    }


def predict(heart_rate: float, motion_intensity: float):
    """
    Make prediction on sensor data using trained Isolation Forest model.

    Returns dict with keys matching database schema:
    - prediction: "NORMAL" or "ANOMALY"
    - anomaly_score: Raw anomaly score from model
    - confidence_normal: Confidence percentage for normal state (0-100)
    - confidence_anomaly: Confidence percentage for anomaly state (0-100)
    """
    # Don't run AI if heart rate is 0 or invalid (finger not detected)
    # Valid heart rate range is 20-255 BPM
    if heart_rate < 20 or heart_rate > 255:
        return {
            "prediction": "NORMAL",
            "anomaly_score": 0.0,
            "confidence_normal": 100.0,
            "confidence_anomaly": 0.0
        }

    # Check if model exists, return defaults if not trained
    if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
        return {
            "prediction": "NORMAL",
            "anomaly_score": 0.0,
            "confidence_normal": 100.0,
            "confidence_anomaly": 0.0
        }

    try:
        # Load model and scaler from cache or disk
        global _cached_model, _cached_scaler

        if _cached_model is None or _cached_scaler is None:
            _cached_model = joblib.load(MODEL_PATH)
            _cached_scaler = joblib.load(SCALER_PATH)

        model = _cached_model
        scaler = _cached_scaler

        # Prepare data with feature names to match training data
        data = pd.DataFrame([[heart_rate, motion_intensity]], columns=["heart_rate", "motion_intensity"])
        scaled = scaler.transform(data)

        # Make prediction
        pred = model.predict(scaled)[0]
        score = model.decision_function(scaled)[0]

        # Convert prediction to status
        status = "NORMAL" if pred == 1 else "ANOMALY"

        # Convert anomaly score to confidence percentages (0-100)
        # Isolation Forest: positive score = normal, negative score = anomaly
        # Our model's actual range is roughly +0.15 (very normal) to -0.05 (anomaly)
        # Map: +0.15 -> 0% stress, -0.05 -> 100% stress
        # Using wider range for better sensitivity: +0.2 to -0.1
        min_score = -0.1  # High anomaly = 100% stress
        max_score = 0.2   # Very normal = 0% stress

        # Normalize score to 0-100 range (inverted: higher score = lower stress)
        confidence_anomaly = max(0, min(100, ((max_score - score) / (max_score - min_score)) * 100))
        confidence_normal = 100 - confidence_anomaly

        return {
            "prediction": status,
            "anomaly_score": float(round(float(score), 4)),
            "confidence_normal": float(round(float(confidence_normal), 2)),
            "confidence_anomaly": float(round(float(confidence_anomaly), 2))
        }

    except Exception as e:
        print(f"Error in prediction: {e}")
        # Return defaults on error
        return {
            "prediction": "NORMAL",
            "anomaly_score": 0.0,
            "confidence_normal": 100.0,
            "confidence_anomaly": 0.0
        }


def is_model_trained():
    """Check if the model has been trained and files exist."""
    return os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH)


if __name__ == "__main__":
    print(train_model())
