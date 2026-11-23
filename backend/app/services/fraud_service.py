from typing import List, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.financial import Transaction
from app.models.ml import FraudAlert
from app.ml.inference.model_loader import model_registry


def scan_user_transactions_for_fraud(db: Session, user_id: str) -> List[Dict[str, Any]]:
    """
    Scan all transactions for user through the Isolation Forest anomaly detector.
    Flags high-anomaly transactions and logs `FraudAlert` records.
    """
    txns = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.transaction_type == "debit"
    ).all()

    if not txns:
        return []

    # Calculate user's baseline average transaction amount
    total_debits = sum(float(t.amount) for t in txns)
    user_avg_amount = total_debits / len(txns) if len(txns) > 0 else 1000.0

    detected_alerts = []

    for txn in txns:
        anomaly_score, risk_level, reasons, model_version = model_registry.predict_fraud_score(
            amount=float(txn.amount),
            txn_date=txn.transaction_date,
            category=txn.category,
            user_avg_amount=user_avg_amount
        )

        # If anomaly triggers Medium, High, or Critical risk:
        if risk_level in ["Medium", "High", "Critical"]:
            txn.is_flagged = True

            # Check if alert already exists for this transaction
            existing_alert = db.query(FraudAlert).filter(FraudAlert.transaction_id == txn.id).first()
            if not existing_alert:
                alert = FraudAlert(
                    user_id=user_id,
                    transaction_id=txn.id,
                    anomaly_score=anomaly_score,
                    risk_level=risk_level,
                    reasons=reasons,
                    status="unreviewed",
                    created_at=datetime.now(timezone.utc)
                )
                db.add(alert)
                detected_alerts.append({
                    "transaction_id": txn.id,
                    "amount": float(txn.amount),
                    "description": txn.description,
                    "date": txn.transaction_date,
                    "anomaly_score": anomaly_score,
                    "risk_level": risk_level,
                    "reasons": reasons
                })

    db.commit()
    return detected_alerts
