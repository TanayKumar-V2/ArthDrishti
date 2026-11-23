"""
Data and Feature Drift Detector
Computes Kolmogorov-Smirnov test statistics and Population Stability Index (PSI)
to detect distribution shifts between baseline training data and live production inference requests.
"""
from typing import Dict, List, Any
import numpy as np
from scipy import stats


def calculate_psi(expected: np.ndarray, actual: np.ndarray, num_buckets: int = 10) -> float:
    """
    Compute Population Stability Index (PSI) between expected (baseline)
    and actual (production) continuous distributions.
    
    PSI Rule of Thumb:
      PSI < 0.1: No significant distribution change
      0.1 <= PSI <= 0.2: Moderate shift (monitor closely)
      PSI > 0.2: Significant drift (retraining triggered)
    """
    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    # Determine quantile bins based on expected distribution
    percentiles = np.linspace(0, 100, num_buckets + 1)
    bins = np.percentile(expected, percentiles)
    bins[0] = -np.inf
    bins[-1] = np.inf

    expected_counts, _ = np.histogram(expected, bins=bins)
    actual_counts, _ = np.histogram(actual, bins=bins)

    # Add epsilon to prevent division by zero or log(0)
    eps = 1e-4
    expected_pct = (expected_counts + eps) / (np.sum(expected_counts) + eps * num_buckets)
    actual_pct = (actual_counts + eps) / (np.sum(actual_counts) + eps * num_buckets)

    psi_val = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return float(np.round(psi_val, 4))


def detect_feature_drift(
    baseline_data: Dict[str, List[float]],
    current_data: Dict[str, List[float]],
    psi_threshold: float = 0.20,
    ks_alpha: float = 0.05
) -> Dict[str, Any]:
    """
    Evaluate feature-level distribution drift across numeric features.
    
    Args:
        baseline_data: Dict mapping feature_name -> list of baseline training values
        current_data: Dict mapping feature_name -> list of recent inference values
        psi_threshold: PSI threshold triggering drift alert
        ks_alpha: Significance level for KS 2-sample test
    """
    drifted_features = []
    feature_metrics = {}

    for feature_name, base_vals in baseline_data.items():
        curr_vals = current_data.get(feature_name, [])
        if not base_vals or not curr_vals:
            continue

        base_arr = np.array(base_vals, dtype=float)
        curr_arr = np.array(curr_vals, dtype=float)

        # KS 2-Sample Test
        ks_stat, ks_p_val = stats.ks_2samp(base_arr, curr_arr)
        
        # PSI Calculation
        psi_score = calculate_psi(base_arr, curr_arr)

        is_drifted = (psi_score >= psi_threshold) or (ks_p_val < ks_alpha)
        if is_drifted:
            drifted_features.append(feature_name)

        feature_metrics[feature_name] = {
            "ks_statistic": float(round(ks_stat, 4)),
            "ks_p_value": float(round(ks_p_val, 4)),
            "psi_score": psi_score,
            "drift_detected": is_drifted,
        }

    overall_drift = len(drifted_features) > 0
    mean_psi = float(np.mean([m["psi_score"] for m in feature_metrics.values()])) if feature_metrics else 0.0

    return {
        "drift_detected": overall_drift,
        "mean_psi": round(mean_psi, 4),
        "total_features_evaluated": len(feature_metrics),
        "drifted_features": drifted_features,
        "recommended_action": "retrain_recommended" if overall_drift else "model_healthy",
        "feature_metrics": feature_metrics
    }
