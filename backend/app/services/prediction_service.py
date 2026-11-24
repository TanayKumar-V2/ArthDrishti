from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.user import User, CustomerProfile
from app.models.financial import Transaction
from app.models.ml import RiskScore, CustomerSegment
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.groq_analytics_service import assess_financial_health
from app.ml.inference.model_loader import model_registry


def evaluate_customer_credit_risk(db: Session, user_id: str, document_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Run Stacking Ensemble credit risk scoring for a customer,
    derive their financial health score, and persist to `risk_scores` table.
    """
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    txns = query.all()
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
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before requesting credit-risk scoring.")

    # Run ML Credit Risk Stacking Ensemble
    default_prob, risk_band, model_version = model_registry.predict_credit_risk(features)
    health_assessment = assess_financial_health(features)
    health_score = health_assessment["score"]

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
        "financial_health_rating": health_assessment["rating"],
        "financial_health_explanation": health_assessment["explanation"],
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
