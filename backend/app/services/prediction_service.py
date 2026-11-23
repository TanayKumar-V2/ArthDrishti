from typing import Dict, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.user import User, CustomerProfile
from app.models.financial import Transaction
from app.models.ml import RiskScore, CustomerSegment
from app.services.feature_engineering_service import compute_20_financial_features
from app.ml.inference.model_loader import model_registry


def evaluate_customer_credit_risk(db: Session, user_id: str) -> Dict[str, Any]:
    """
    Run Stacking Ensemble credit risk scoring for a customer,
    derive their financial health score, and persist to `risk_scores` table.
    """
    txns = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    txn_dicts = [
        {
            "transaction_date": t.transaction_date,
            "amount": float(t.amount),
            "transaction_type": t.transaction_type,
            "category": t.category,
            "description": t.description
        }
        for t in txns
    ]

    features = compute_20_financial_features(txn_dicts)
    if not features:
        # Fallback profile defaults
        features = {
            "monthly_income_avg": 75000.0,
            "monthly_expense_avg": 45000.0,
            "net_monthly_cash_flow": 30000.0,
            "savings_rate": 0.40,
            "expense_volatility": 4000.0,
            "income_stability_score": 0.85,
            "recurring_expense_ratio": 0.40,
            "discretionary_spending_ratio": 0.25,
            "credit_to_debit_ratio": 1.67,
            "average_transaction_amount": 1200.0,
            "max_single_debit_amount": 18000.0,
            "transaction_frequency_monthly": 35.0,
            "salary_regularity_days": 30.0,
            "emergency_fund_months": 4.5,
            "outlier_transaction_count": 0,
            "financial_health_score": 82.5
        }

    # Run ML Credit Risk Stacking Ensemble
    default_prob, risk_band, model_version = model_registry.predict_credit_risk(features)
    health_score = features.get("financial_health_score", 75.0)

    # Persist risk score record
    risk_record = RiskScore(
        user_id=user_id,
        default_probability=default_prob,
        risk_band=risk_band,
        financial_health_score=health_score,
        model_version=model_version,
        created_at=datetime.now(timezone.utc)
    )
    db.add(risk_record)

    # Run Customer Segmentation
    cluster_id, segment_name, characteristics, seg_version = model_registry.predict_customer_segment(features)
    
    # Update or insert customer segment
    existing_segment = db.query(CustomerSegment).filter(CustomerSegment.user_id == user_id).first()
    if existing_segment:
        existing_segment.cluster_id = cluster_id
        existing_segment.segment_name = segment_name
        existing_segment.characteristics = characteristics
        existing_segment.model_version = seg_version
    else:
        new_segment = CustomerSegment(
            user_id=user_id,
            cluster_id=cluster_id,
            segment_name=segment_name,
            characteristics=characteristics,
            model_version=seg_version
        )
        db.add(new_segment)

    # Update CustomerProfile credit_score
    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
    if profile:
        profile.credit_score = health_score

    db.commit()

    return {
        "user_id": user_id,
        "default_probability": default_prob,
        "risk_band": risk_band,
        "financial_health_score": health_score,
        "segment": {
            "cluster_id": cluster_id,
            "segment_name": segment_name,
            "characteristics": characteristics
        },
        "model_version": model_version,
        "evaluated_at": risk_record.created_at
    }


def get_latest_risk_score(db: Session, user_id: str) -> Optional[RiskScore]:
    """Retrieve the most recent risk score record for user."""
    return db.query(RiskScore).filter(
        RiskScore.user_id == user_id
    ).order_by(RiskScore.created_at.desc()).first()
