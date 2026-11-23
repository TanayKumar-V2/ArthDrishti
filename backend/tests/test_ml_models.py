import pytest
from datetime import datetime
from app.ml.inference.model_loader import model_registry


def test_credit_risk_stacking_ensemble():
    """Verify Stacking Ensemble predicts calibrated default probability."""
    # Low risk profile
    low_risk_features = {
        "monthly_income_avg": 150000.0,
        "monthly_expense_avg": 55000.0,
        "net_monthly_cash_flow": 95000.0,
        "savings_rate": 0.63,
        "expense_volatility": 3000.0,
        "income_stability_score": 0.95,
        "recurring_expense_ratio": 0.35,
        "discretionary_spending_ratio": 0.20,
        "credit_to_debit_ratio": 2.7,
        "average_transaction_amount": 1200.0,
        "max_single_debit_amount": 15000.0,
        "transaction_frequency_monthly": 35.0,
        "salary_regularity_days": 30.0,
        "emergency_fund_months": 8.0,
        "outlier_transaction_count": 0
    }
    prob_low, band_low, version = model_registry.predict_credit_risk(low_risk_features)
    assert 0.0 <= prob_low <= 1.0
    assert band_low in ["Low", "Medium"]
    assert "credit_stack" in version

    # High risk profile (strained cash flow, zero savings, high outliers)
    high_risk_features = {
        "monthly_income_avg": 40000.0,
        "monthly_expense_avg": 48000.0,
        "net_monthly_cash_flow": -8000.0,
        "savings_rate": -0.20,
        "expense_volatility": 15000.0,
        "income_stability_score": 0.40,
        "recurring_expense_ratio": 0.65,
        "discretionary_spending_ratio": 0.35,
        "credit_to_debit_ratio": 0.83,
        "average_transaction_amount": 2500.0,
        "max_single_debit_amount": 35000.0,
        "transaction_frequency_monthly": 45.0,
        "salary_regularity_days": 42.0,
        "emergency_fund_months": 0.0,
        "outlier_transaction_count": 4
    }
    prob_high, band_high, _ = model_registry.predict_credit_risk(high_risk_features)
    assert prob_high > prob_low
    assert band_high in ["Medium", "High", "Severe"]


def test_fraud_anomaly_detection():
    """Verify Isolation Forest catches suspicious transaction anomalies."""
    # 1. Normal Daytime Coffee transaction
    normal_score, normal_level, normal_reasons, _ = model_registry.predict_fraud_score(
        amount=350.0,
        txn_date=datetime(2026, 5, 12, 14, 30),  # 2:30 PM
        category="Food & Dining",
        user_avg_amount=1200.0
    )
    assert normal_score < 0.60
    assert normal_level in ["Low", "Medium"]

    # 2. Extreme midnight cash withdrawal (e.g. 50,000 at 3:15 AM)
    fraud_score, fraud_level, fraud_reasons, _ = model_registry.predict_fraud_score(
        amount=50000.0,
        txn_date=datetime(2026, 5, 12, 3, 15),  # 3:15 AM
        category="Cash & ATM",
        user_avg_amount=1200.0
    )
    assert fraud_score > normal_score
    assert fraud_level in ["High", "Critical"]
    assert len(fraud_reasons) >= 1


def test_customer_segmentation_clustering():
    """Verify KMeans produces valid customer personas and cluster metadata."""
    features = {
        "monthly_income_avg": 95000.0,
        "savings_rate": 0.35,
        "discretionary_spending_ratio": 0.25,
        "recurring_expense_ratio": 0.40,
        "expense_volatility": 4500.0
    }
    cluster_id, seg_name, meta, version = model_registry.predict_customer_segment(features)
    assert cluster_id in ["0", "1", "2", "3"]
    assert len(seg_name) > 0
    assert "description" in meta


def test_prediction_api_endpoints(client):
    """Test full prediction API lifecycle for credit risk, fraud, and segmentation."""
    # 1. Register & login
    client.post("/api/v1/auth/register", json={
        "email": "ml_tester@example.com",
        "password": "Password123!",
        "full_name": "ML Tester"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": "ml_tester@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Trigger Credit Risk scoring
    credit_res = client.post("/api/v1/predictions/credit-risk", headers=headers)
    assert credit_res.status_code == 200
    credit_data = credit_res.json()
    assert "default_probability" in credit_data
    assert "risk_band" in credit_data
    assert "segment" in credit_data

    # 3. Get Latest Credit Score
    latest_res = client.get("/api/v1/predictions/credit-risk/latest", headers=headers)
    assert latest_res.status_code == 200
    assert latest_res.json()["default_probability"] == credit_data["default_probability"]

    # 4. Trigger Fraud Scan
    fraud_res = client.post("/api/v1/predictions/fraud/scan", headers=headers)
    assert fraud_res.status_code == 200
    assert "alerts_detected" in fraud_res.json()

    # 5. Get Customer Segment
    seg_res = client.get("/api/v1/predictions/segment", headers=headers)
    assert seg_res.status_code == 200
    assert "segment_name" in seg_res.json()

    # 6. Get Financial Health Score
    health_res = client.get("/api/v1/predictions/financial-health-score", headers=headers)
    assert health_res.status_code == 200
    assert 0.0 <= health_res.json()["score"] <= 100.0
