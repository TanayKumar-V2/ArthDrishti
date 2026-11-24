from datetime import datetime, timezone
from typing import List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models import Recommendation
from app.models.financial import Transaction
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.groq_analytics_service import generate_recommendations


def generate_smart_recommendations(db: Session, user_id: str, document_ids: Optional[List[str]] = None) -> List[Recommendation]:
    """Generate and persist Groq recommendations grounded in parsed transaction metrics."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    transactions = query.all()
    features = compute_20_financial_features([
        {"transaction_date": txn.transaction_date, "amount": float(txn.amount),
         "transaction_type": txn.transaction_type, "category": txn.category, "description": txn.description}
        for txn in transactions
    ])
    if not features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before generating recommendations.")

    generated = generate_recommendations(features)
    db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()
    db.add_all([
        Recommendation(
            user_id=user_id,
            title=item["title"],
            description=item["description"],
            category=item["category"],
            impact_level=item["impact_level"],
            is_dismissed=False,
            created_at=datetime.now(timezone.utc),
        )
        for item in generated
    ])
    db.commit()
    return db.query(Recommendation).filter(Recommendation.user_id == user_id).all()
