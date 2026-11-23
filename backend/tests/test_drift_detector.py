"""
Unit tests for MLOps feature drift detection & PSI calculation.
"""
import numpy as np
from app.ml.monitoring.drift_detector import calculate_psi, detect_feature_drift


def test_calculate_psi_identical_distributions():
    data = np.random.normal(50, 10, 500)
    psi = calculate_psi(data, data)
    assert psi < 0.05, f"Identical distributions should have near-zero PSI, got {psi}"


def test_calculate_psi_shifted_distributions():
    base = np.random.normal(50, 5, 500)
    shifted = np.random.normal(75, 15, 500)
    psi = calculate_psi(base, shifted)
    assert psi > 0.20, f"Significantly shifted distributions should trigger PSI > 0.2, got {psi}"


def test_detect_feature_drift():
    np.random.seed(42)
    baseline = {
        "income": np.random.normal(50000, 5000, 200).tolist(),
        "debt_ratio": np.random.uniform(0.1, 0.4, 200).tolist()
    }
    # Current has shifted income but stable debt_ratio
    current = {
        "income": np.random.normal(90000, 10000, 200).tolist(),
        "debt_ratio": np.random.uniform(0.1, 0.4, 200).tolist()
    }
    result = detect_feature_drift(baseline, current, psi_threshold=0.20)
    assert result["drift_detected"] is True
    assert "income" in result["drifted_features"]
    assert result["recommended_action"] == "retrain_recommended"
