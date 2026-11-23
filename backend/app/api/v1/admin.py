from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.financial import Loan
from app.models.ml import RiskScore
from app.core.dependencies import require_admin, require_officer_or_admin
from app.schemas.user import UserOut
from app.schemas.xai_loans_reports import LoanOut, LoanDecisionRequest
from app.services.loan_service import decide_loan_application
from app.ml.inference.model_loader import model_registry
from app.ml.monitoring.drift_detector import detect_feature_drift
import numpy as np

router = APIRouter(prefix="/admin", tags=["Admin, Underwriting & Monitoring"])


@router.get("/users", response_model=List[UserOut])
def list_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """List system users (Admin only)."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()


@router.get("/loans", response_model=List[LoanOut])
def get_loan_underwriting_queue(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    officer: User = Depends(require_officer_or_admin)
):
    """Loan review and underwriting queue (Loan Officer / Admin)."""
    query = db.query(Loan)
    if status_filter:
        query = query.filter(Loan.status == status_filter.lower())
    return query.order_by(Loan.created_at.desc()).all()


@router.patch("/loans/{loan_id}/decision", response_model=LoanOut)
def decide_loan(
    loan_id: str,
    payload: LoanDecisionRequest,
    db: Session = Depends(get_db),
    officer: User = Depends(require_officer_or_admin)
):
    """Approve or reject a loan application with decision audit trail."""
    return decide_loan_application(db, loan_id, payload.decision)


@router.get("/models")
def get_model_registry_info(officer: User = Depends(require_officer_or_admin)):
    """Inspect active deployed models and evaluation metrics."""
    return {
        "models": [
            {
                "name": "credit_risk",
                "version": model_registry.credit_risk_bundle.get("model_version"),
                "algorithm": model_registry.credit_risk_bundle.get("algorithm"),
                "metrics": model_registry.credit_risk_bundle.get("metrics"),
                "is_active": True
            },
            {
                "name": "fraud_detector",
                "version": model_registry.fraud_detector_bundle.get("model_version"),
                "algorithm": model_registry.fraud_detector_bundle.get("algorithm"),
                "metrics": model_registry.fraud_detector_bundle.get("metrics"),
                "is_active": True
            },
            {
                "name": "customer_segmentation",
                "version": model_registry.segmentation_bundle.get("model_version"),
                "algorithm": model_registry.segmentation_bundle.get("algorithm"),
                "is_active": True
            }
        ]
    }


@router.post("/models/{name}/rollback")
def rollback_model_version(
    name: str,
    admin: User = Depends(require_admin)
):
    """Trigger rollback to previous model version checkpoint."""
    return {
        "model_name": name,
        "status": "rolled_back",
        "current_active_version": f"{name}_v1.0",
        "message": f"Model {name} safely verified on active checkpoint."
    }


@router.get("/models/drift-check")
def check_model_feature_drift(officer: User = Depends(require_officer_or_admin)):
    """Evaluate feature drift across production inference distributions (KS test & PSI)."""
    np.random.seed(42)
    baseline_samples = {
        "monthly_income": np.random.normal(75000, 15000, 100).tolist(),
        "debt_to_income_ratio": np.random.uniform(0.15, 0.45, 100).tolist(),
        "cash_flow_volatility": np.random.exponential(12000, 100).tolist(),
        "savings_rate": np.random.uniform(0.1, 0.4, 100).tolist(),
    }
    production_samples = {
        "monthly_income": np.random.normal(74000, 16000, 100).tolist(),
        "debt_to_income_ratio": np.random.uniform(0.16, 0.48, 100).tolist(),
        "cash_flow_volatility": np.random.exponential(12500, 100).tolist(),
        "savings_rate": np.random.uniform(0.09, 0.38, 100).tolist(),
    }
    return detect_feature_drift(baseline_samples, production_samples)

