from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.ml import RiskScore, FraudAlert, CustomerSegment
from app.models.financial import Transaction
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
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.groq_analytics_service import assess_financial_health

router = APIRouter(prefix="/predictions", tags=["Predictions & Risk Intelligence"])


@router.post("/credit-risk", response_model=CreditRiskEvaluationResponse)
def run_credit_risk_scoring(
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger credit risk stacking ensemble evaluation for current customer."""
    ids = [value.strip() for value in document_ids.split(",") if value.strip()] if document_ids is not None else None
    result = evaluate_customer_credit_risk(db, current_user.id, ids)
    return result


@router.get("/credit-risk/latest", response_model=RiskScoreOut)
def get_latest_credit_score(
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get most recent credit risk score."""
    ids = [value.strip() for value in document_ids.split(",") if value.strip()] if document_ids is not None else None
    # Re-evaluate so the current Groq interpretation and health assessment are used.
    evaluate_customer_credit_risk(db, current_user.id, ids)
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
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run unsupervised Isolation Forest scan on transaction history."""
    ids = [value.strip() for value in document_ids.split(",") if value.strip()] if document_ids is not None else None
    alerts = scan_user_transactions_for_fraud(db, current_user.id, ids)
    return {
        "user_id": current_user.id,
        "scanned_at": datetime.now(timezone.utc),
        "alerts_detected": len(alerts),
        "alerts": alerts
    }


@router.get("/fraud/alerts", response_model=List[FraudAlertOut])
def list_fraud_alerts(
    alert_status: Optional[str] = None,
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List fraud alerts detected for the customer."""
    query = db.query(FraudAlert).filter(FraudAlert.user_id == current_user.id)
    if document_ids is not None:
        ids = [value.strip() for value in document_ids.split(",") if value.strip()]
        query = query.join(Transaction, FraudAlert.transaction_id == Transaction.id).filter(Transaction.document_id.in_(ids)) if ids else query.filter(False)
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
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get customer's behavioral persona segment from KMeans clustering."""
    ids = [value.strip() for value in document_ids.split(",") if value.strip()] if document_ids is not None else None
    evaluate_customer_credit_risk(db, current_user.id, ids)
    seg = db.query(CustomerSegment).filter(CustomerSegment.user_id == current_user.id).first()
    return seg


@router.get("/financial-health-score", response_model=FinancialHealthScoreOut)
def get_financial_health_score(
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get Groq's 0-100 assessment grounded in transaction-derived metrics."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if document_ids is not None:
        ids = [value.strip() for value in document_ids.split(",") if value.strip()]
        query = query.filter(Transaction.document_id.in_(ids)) if ids else query.filter(False)
    transactions = query.all()
    features = compute_20_financial_features([
        {
            "transaction_date": txn.transaction_date,
            "amount": float(txn.amount),
            "transaction_type": txn.transaction_type,
            "category": txn.category,
            "description": txn.description,
        }
        for txn in transactions
    ])
    if not features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before requesting a financial health score.")

    health = assess_financial_health(features)
    raw_score = health["score"]
    features["financial_health_score"] = raw_score
    features["financial_health_rating"] = health["rating"]
    features["financial_health_explanation"] = health["explanation"]

    return FinancialHealthScoreOut(
        user_id=current_user.id,
        score=raw_score,
        rating=health["rating"],
        components={
            "monthly_income_avg": float(features["monthly_income_avg"]),
            "monthly_expense_avg": float(features["monthly_expense_avg"]),
            "net_monthly_cash_flow": float(features["net_monthly_cash_flow"]),
            "savings_rate": float(features["savings_rate"]),
            "income_stability_score": float(features["income_stability_score"]),
            "discretionary_spending_ratio": float(features["discretionary_spending_ratio"]),
            "emergency_fund_months": float(features["emergency_fund_months"]),
        },
        explanation=health["explanation"],
        evaluated_at=datetime.now(timezone.utc)
    )
