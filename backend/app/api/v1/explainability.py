from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.xai_loans_reports import ExplanationOut, WhatIfRequest, WhatIfResponse
from app.services.explainability_service import get_or_generate_explanation, run_what_if_simulation

router = APIRouter(prefix="/explainability", tags=["Explainable AI (XAI) & Simulator"])


@router.get("/{prediction_id}", response_model=ExplanationOut)
def get_prediction_explanation(
    prediction_id: str,
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return user-scoped, rule-based feature contribution estimates for a prediction."""
    ids = [value.strip() for value in document_ids.split(",") if value.strip()] if document_ids is not None else None
    return get_or_generate_explanation(db, prediction_id, current_user.id, ids)


@router.post("/what-if", response_model=WhatIfResponse)
def simulate_what_if_scenario(
    payload: WhatIfRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Interactive What-If simulator: evaluates credit risk impact of adjusting income, expenses, or debt."""
    return run_what_if_simulation(
        db=db,
        user_id=current_user.id,
        income_delta=payload.income_delta,
        expense_delta=payload.expense_delta,
        debt_delta=payload.debt_delta,
        loan_amount=payload.loan_amount
    )
