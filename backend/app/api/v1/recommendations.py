from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models import Recommendation
from app.core.dependencies import get_current_user
from app.schemas.xai_loans_reports import RecommendationOut
from app.services.recommendation_service import generate_smart_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[RecommendationOut])
def list_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return AI-generated recommendations grounded in uploaded transaction features."""
    existing = db.query(Recommendation).filter(Recommendation.user_id == current_user.id).all()
    legacy_rule_titles = {
        "Build a 3-Month Emergency Cushion",
        "Curtail High Discretionary Outflow",
        "Maximize Tax-Advantaged Mutual Fund SIPs",
    }
    if not existing or any(item.title in legacy_rule_titles for item in existing):
        generate_smart_recommendations(db, current_user.id)
    return db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id,
        Recommendation.is_dismissed == False
    ).all()


@router.patch("/{recommendation_id}/dismiss")
def dismiss_recommendation(
    recommendation_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dismiss a recommendation."""
    rec = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found")

    rec.is_dismissed = True
    db.commit()
    return {"message": "Recommendation dismissed"}
