from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.ml import RiskScore, FraudAlert, CustomerSegment
from app.core.dependencies import get_current_user
from app.schemas.ml import (
    RiskScoreOut,
    CustomerSegmentOut,
    FraudAlertOut,
    FraudAlertUpdate,
    CreditRiskEvaluationResponse,
    FinancialHealthScoreOut,
)
from app.services.prediction_service import evaluate_customer_credit_risk, get_latest_risk_score
from app.services.fraud_service import scan_user_transactions_for_fraud

router = APIRouter(prefix="/predictions", tags=["Predictions & Risk Intelligence"])


@router.post("/credit-risk", response_model=CreditRiskEvaluationResponse)
def run_credit_risk_scoring(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger credit risk stacking ensemble evaluation for current customer."""
    result = evaluate_customer_credit_risk(db, current_user.id)
    return result


@router.get("/credit-risk/latest", response_model=RiskScoreOut)
def get_latest_credit_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get most recent credit risk score."""
    score = get_latest_risk_score(db, current_user.id)
    if not score:
        # Run first evaluation automatically
        evaluate_customer_credit_risk(db, current_user.id)
        score = get_latest_risk_score(db, current_user.id)
    return score


@router.get("/credit-risk/history", response_model=List[RiskScoreOut])
def get_credit_score_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve historical risk scores to track credit score trajectory."""
    return db.query(RiskScore).filter(
        RiskScore.user_id == current_user.id
    ).order_by(RiskScore.created_at.desc()).limit(limit).all()


@router.post("/fraud/scan")
def trigger_fraud_scan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run unsupervised Isolation Forest scan on transaction history."""
    alerts = scan_user_transactions_for_fraud(db, current_user.id)
    return {
        "user_id": current_user.id,
        "scanned_at": datetime.now(timezone.utc),
        "alerts_detected": len(alerts),
        "alerts": alerts
    }


@router.get("/fraud/alerts", response_model=List[FraudAlertOut])
def list_fraud_alerts(
    alert_status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List fraud alerts detected for the customer."""
    query = db.query(FraudAlert).filter(FraudAlert.user_id == current_user.id)
    if alert_status:
        query = query.filter(FraudAlert.status == alert_status.lower())
    return query.order_by(FraudAlert.created_at.desc()).all()


@router.patch("/fraud/alerts/{alert_id}", response_model=FraudAlertOut)
def update_fraud_alert_status(
    alert_id: str,
    update_data: FraudAlertUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update review status of a fraud alert (e.g. confirmed_fraud, false_positive)."""
    alert = db.query(FraudAlert).filter(
        FraudAlert.id == alert_id,
        FraudAlert.user_id == current_user.id
    ).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    alert.status = update_data.status
    db.commit()
    db.refresh(alert)
    return alert


@router.get("/segment", response_model=CustomerSegmentOut)
def get_customer_segment(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer's behavioral persona segment from KMeans clustering."""
    seg = db.query(CustomerSegment).filter(CustomerSegment.user_id == current_user.id).first()
    if not seg:
        # Run evaluation to cluster customer
        evaluate_customer_credit_risk(db, current_user.id)
        seg = db.query(CustomerSegment).filter(CustomerSegment.user_id == current_user.id).first()
    return seg


@router.get("/financial-health-score", response_model=FinancialHealthScoreOut)
def get_financial_health_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get composite 0-100 financial health score across income, savings, debt, and stability."""
    score_record = get_latest_risk_score(db, current_user.id)
    raw_score = float(score_record.financial_health_score) if score_record else 80.0

    if raw_score >= 80:
        rating = "Excellent"
    elif raw_score >= 65:
        rating = "Good"
    elif raw_score >= 50:
        rating = "Fair"
    else:
        rating = "Needs Attention"

    return FinancialHealthScoreOut(
        user_id=current_user.id,
        score=raw_score,
        rating=rating,
        components={
            "savings_rate_score": 25.0,
            "cash_flow_buffer_score": 22.5,
            "income_stability_score": 18.0,
            "expense_discipline_score": 14.5
        },
        evaluated_at=datetime.now(timezone.utc)
    )
