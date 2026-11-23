import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple, List, Optional
from datetime import datetime

from app.core.config import settings


class ModelRegistryManager:
    """In-memory model registry loaded once at app startup."""
    _instance = None

    def __init__(self):
        self.credit_risk_bundle: Optional[Dict[str, Any]] = None
        self.fraud_detector_bundle: Optional[Dict[str, Any]] = None
        self.segmentation_bundle: Optional[Dict[str, Any]] = None
        self.models_dir = settings.MODELS_DIR

    @classmethod
    def get_instance(cls) -> "ModelRegistryManager":
        if cls._instance is None:
            cls._instance = ModelRegistryManager()
            cls._instance.load_all_models()
        return cls._instance

    def load_all_models(self):
        """Load all model bundles from disk or train baselines if missing."""
        os.makedirs(self.models_dir, exist_ok=True)
        credit_path = os.path.join(self.models_dir, "credit_risk_v1.pkl")
        fraud_path = os.path.join(self.models_dir, "fraud_detector_v1.pkl")
        seg_path = os.path.join(self.models_dir, "customer_segmentation_v1.pkl")

        # If any bundle is missing, run training pipeline
        if not (os.path.exists(credit_path) and os.path.exists(fraud_path) and os.path.exists(seg_path)):
            from app.ml.training.train_all import train_all_models
            train_all_models(output_dir=self.models_dir)

        self.credit_risk_bundle = joblib.load(credit_path)
        self.fraud_detector_bundle = joblib.load(fraud_path)
        self.segmentation_bundle = joblib.load(seg_path)

    def predict_credit_risk(self, features: Dict[str, Any]) -> Tuple[float, str, str]:
        """
        Predict default probability and risk band from engineered features.
        Returns: (default_probability, risk_band, model_version)
        """
        bundle = self.credit_risk_bundle
        model = bundle["model"]
        scaler = bundle["scaler"]
        feature_names = bundle["feature_names"]

        # Build feature vector
        vector = []
        for name in feature_names:
            val = float(features.get(name, 0.0))
            vector.append(val)

        X = np.array([vector])
        X_scaled = scaler.transform(X)

        # Predict probability of default (Class 1)
        prob = float(model.predict_proba(X_scaled)[0, 1])

        # Assign risk tier band
        if prob < 0.15:
            risk_band = "Low"
        elif prob < 0.35:
            risk_band = "Medium"
        elif prob < 0.65:
            risk_band = "High"
        else:
            risk_band = "Severe"

        return round(prob, 4), risk_band, bundle["model_version"]

    def predict_fraud_score(
        self,
        amount: float,
        txn_date: datetime,
        category: str,
        user_avg_amount: float
    ) -> Tuple[float, str, List[str], str]:
        """
        Unsupervised anomaly detection on single transaction.
        Returns: (anomaly_score, risk_level, reasons, model_version)
        """
        bundle = self.fraud_detector_bundle
        model = bundle["model"]
        scaler = bundle["scaler"]

        amount = float(amount)
        ratio = round(amount / user_avg_amount, 2) if user_avg_amount > 0 else 1.0
        hour = txn_date.hour
        is_weekend = 1 if txn_date.weekday() in (5, 6) else 0
        is_atm = 1 if category == "Cash & ATM" else 0

        vector = np.array([[amount, ratio, hour, is_weekend, is_atm]])
        vector_scaled = scaler.transform(vector)

        # Raw anomaly score: lower = more abnormal in Isolation Forest
        raw_score = float(model.score_samples(vector_scaled)[0])
        # Map raw score (-0.8 to 0.0) to 0.0 - 1.0 where 1.0 is highest risk
        min_s = bundle["score_range"]["min"]
        max_s = bundle["score_range"]["max"]
        denom = (max_s - min_s) if max_s != min_s else 1.0
        normalized_anomaly = float(np.clip(1.0 - ((raw_score - min_s) / denom), 0.0, 1.0))

        reasons = []
        if ratio >= 4.0 and amount >= 15000:
            reasons.append(f"Transaction amount is {ratio}x higher than typical customer average.")
        if hour in (0, 1, 2, 3, 4):
            reasons.append("Unusual late-night transaction time (12:00 AM - 5:00 AM).")
        if is_atm and amount >= 20000:
            reasons.append("High-value physical ATM cash withdrawal spike.")
        if normalized_anomaly >= 0.70 and not reasons:
            reasons.append("Isolation Forest multi-feature outlier anomaly detected.")

        if normalized_anomaly >= 0.80 or len(reasons) >= 2:
            risk_level = "Critical"
        elif normalized_anomaly >= 0.60 or len(reasons) == 1:
            risk_level = "High"
        elif normalized_anomaly >= 0.35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return round(normalized_anomaly, 4), risk_level, reasons, bundle["model_version"]

    def predict_customer_segment(self, features: Dict[str, Any]) -> Tuple[str, str, Dict[str, Any], str]:
        """
        Cluster customer into behavioral financial segments.
        Returns: (cluster_id, segment_name, characteristics, model_version)
        """
        bundle = self.segmentation_bundle
        model = bundle["model"]
        scaler = bundle["scaler"]
        feature_names = bundle["feature_names"]

        vector = [float(features.get(name, 0.0)) for name in feature_names]
        X = np.array([vector])
        X_scaled = scaler.transform(X)

        cluster_idx = int(model.predict(X_scaled)[0])
        metadata = bundle["segment_metadata"].get(cluster_idx, {
            "name": f"Segment Cluster #{cluster_idx}",
            "description": "Standard retail customer profile",
            "risk_profile": "Moderate"
        })

        return str(cluster_idx), metadata["name"], metadata, bundle["model_version"]


model_registry = ModelRegistryManager.get_instance()
