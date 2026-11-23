from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.financial import Transaction
from app.models import Recommendation
from app.services.feature_engineering_service import compute_20_financial_features


def generate_smart_recommendations(db: Session, user_id: str, document_ids: Optional[List[str]] = None) -> List[Recommendation]:
    """Generate rule-based financial advice grounded in computed risk features."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    txns = query.all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    features = compute_20_financial_features(txn_dicts)
    if not features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before generating recommendations.")

    recs_to_add = []

    # Rule 1: Low emergency fund
    emergency_months = float(features.get("emergency_fund_months", 3.0))
    if emergency_months < 3.0:
        recs_to_add.append({
            "title": "Build a 3-Month Emergency Cushion",
            "description": f"The surplus-based coverage estimate from your transaction history is about {emergency_months:.1f} months. Consider building a separate liquid reserve; the statement does not report your account balance.",
            "category": "Savings",
            "impact_level": "High"
        })

    # Rule 2: High discretionary retail & dining spend
    disc_ratio = float(features.get("discretionary_spending_ratio", 0.25))
    if disc_ratio > 0.35:
        recs_to_add.append({
            "title": "Curtail High Discretionary Outflow",
            "description": f"Lifestyle purchases account for {disc_ratio*100:.1f}% of total debits in the uploaded data. Reducing this share could increase monthly surplus; exact savings depend on actual spending changes.",
            "category": "Debt",
            "impact_level": "Medium"
        })

    # Rule 3: High savings rate opportunity
    savings_rate = float(features.get("savings_rate", 0.30))
    if savings_rate > 0.40:
        recs_to_add.append({
            "title": "Maximize Tax-Advantaged Mutual Fund SIPs",
            "description": f"Excellent {savings_rate*100:.1f}% savings rate! Deploy surplus cash into diversified index funds rather than idle zero-interest current accounts.",
            "category": "Investment",
            "impact_level": "High"
        })

    # Clear old and save fresh recommendations
    db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()
    db_recs = [
        Recommendation(
            user_id=user_id,
            title=r["title"],
            description=r["description"],
            category=r["category"],
            impact_level=r["impact_level"],
            is_dismissed=False,
            created_at=datetime.now(timezone.utc)
        )
        for r in recs_to_add
    ]
    db.add_all(db_recs)
    db.commit()

    return db.query(Recommendation).filter(Recommendation.user_id == user_id).all()
