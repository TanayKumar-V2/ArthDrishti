from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from app.models.financial import Transaction
from app.models.ml import FraudAlert
from app.ml.inference.model_loader import model_registry
from app.services.groq_analytics_service import interpret_fraud_anomalies


def scan_user_transactions_for_fraud(db: Session, user_id: str, document_ids: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """Score debit transactions with Isolation Forest and let Groq triage the anomalies."""
    query = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "debit",
    )
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    transactions = query.order_by(Transaction.transaction_date.asc()).all()
    if not transactions:
        return []

    average_amount = sum(float(txn.amount) for txn in transactions) / len(transactions)
    scored = []
    for txn in transactions:
        anomaly_score, model_version = model_registry.predict_fraud_score(
            amount=float(txn.amount),
            txn_date=txn.transaction_date,
            category=txn.category,
            user_avg_amount=average_amount,
        )
        scored.append({
            "id": txn.id,
            "date": txn.transaction_date.isoformat(),
            "amount": float(txn.amount),
            "description": txn.description,
            "category": txn.category,
            "anomaly_score": anomaly_score,
            "model_version": model_version,
        })

    triage = interpret_fraud_anomalies(scored)

    detected_alerts = []
    for txn, score in zip(transactions, scored):
        interpretation = triage.get(txn.id, {"risk_level": "Low", "reasons": []})
        level = interpretation["risk_level"]
        existing = db.query(FraudAlert).filter(FraudAlert.transaction_id == txn.id).first()
        txn.is_flagged = level != "Low" or bool(existing and existing.status == "confirmed_fraud")
        if existing:
            existing.anomaly_score = score["anomaly_score"]
            existing.risk_level = level
            existing.reasons = interpretation["reasons"]
            if level == "Low" and existing.status == "unreviewed":
                existing.status = "false_positive"
        if level != "Low" and not existing:
            alert = FraudAlert(
                user_id=user_id,
                transaction_id=txn.id,
                anomaly_score=score["anomaly_score"],
                risk_level=level,
                reasons=interpretation["reasons"],
                status="unreviewed",
                created_at=datetime.now(timezone.utc),
            )
            db.add(alert)
            detected_alerts.append({
                "transaction_id": txn.id,
                "amount": float(txn.amount),
                "description": txn.description,
                "date": txn.transaction_date,
                "anomaly_score": score["anomaly_score"],
                "risk_level": level,
                "reasons": interpretation["reasons"],
            })
    db.commit()
    return detected_alerts
