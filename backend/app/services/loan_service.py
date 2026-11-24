from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from collections import defaultdict
import logging
import math
from sqlalchemy.orm import Session

from app.models.financial import Document, Loan, LoanAnalysisSnapshot, LoanRepayment, Transaction
from app.models.ml import FraudAlert
from app.services.prediction_service import evaluate_customer_credit_risk
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.explainability_service import compute_xai_contributions
from app.services.fraud_service import scan_user_transactions_for_fraud

logger = logging.getLogger(__name__)


def calculate_amortization_schedule(principal: float, annual_rate_pct: float, term_months: int) -> List[Dict[str, Any]]:
    """Generate fixed monthly installment repayment schedule."""
    monthly_rate = (annual_rate_pct / 100.0) / 12.0
    if monthly_rate > 0:
        emi = principal * (monthly_rate * (1 + monthly_rate) ** term_months) / (((1 + monthly_rate) ** term_months) - 1)
    else:
        emi = principal / term_months

    schedule = []
    start_date = datetime.now(timezone.utc)
    for i in range(1, term_months + 1):
        due_date = start_date + timedelta(days=30 * i)
        schedule.append({
            "installment_number": i,
            "due_date": due_date,
            "amount": round(emi, 2),
            "status": "pending"
        })
    return schedule


def capture_loan_analysis(
    db: Session,
    loan: Loan,
    user_id: str,
    document_ids: Optional[List[str]] = None,
    risk_result: Optional[Dict[str, Any]] = None,
    analysis_basis: str = "application_time",
    fraud_scan_status: str = "not_run",
) -> LoanAnalysisSnapshot:
    """Persist the transaction analytics used to review a loan application."""
    txn_query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        txn_query = txn_query.filter(Transaction.document_id.in_(document_ids)) if document_ids else txn_query.filter(False)
    transactions = txn_query.order_by(Transaction.transaction_date.asc()).all()
    txn_dicts = [
        {
            "transaction_date": txn.transaction_date,
            "amount": float(txn.amount),
            "transaction_type": txn.transaction_type,
            "category": txn.category,
            "description": txn.description,
        }
        for txn in transactions
    ]
    features = compute_20_financial_features(txn_dicts)
    if not features:
        raise ValueError("No parsed statement transactions are available for applicant analysis.")

    if risk_result is None:
        risk_result = evaluate_customer_credit_risk(db, user_id, document_ids)

    category_totals: Dict[str, Dict[str, float]] = defaultdict(lambda: {"amount": 0.0, "count": 0})
    monthly_totals: Dict[str, Dict[str, Any]] = {}
    for txn in transactions:
        month_key = txn.transaction_date.strftime("%Y-%m")
        month_label = txn.transaction_date.strftime("%b %Y")
        month = monthly_totals.setdefault(month_key, {"month": month_label, "income": 0.0, "expenses": 0.0})
        amount = float(txn.amount)
        if txn.transaction_type.lower() == "credit":
            month["income"] += amount
        else:
            month["expenses"] += amount
            category = category_totals[txn.category]
            category["amount"] += amount
            category["count"] += 1

    total_expenses = sum(item["amount"] for item in category_totals.values())
    spending_breakdown = [
        {
            "category": category,
            "amount": round(item["amount"], 2),
            "percentage": round(item["amount"] / total_expenses * 100, 1) if total_expenses else 0.0,
            "count": item["count"],
        }
        for category, item in sorted(category_totals.items(), key=lambda pair: pair[1]["amount"], reverse=True)
    ]
    monthly_cash_flow = [
        {
            **item,
            "income": round(item["income"], 2),
            "expenses": round(item["expenses"], 2),
            "net_savings": round(item["income"] - item["expenses"], 2),
        }
        for _, item in sorted(monthly_totals.items())
    ]

    alert_rows = db.query(FraudAlert, Transaction).join(
        Transaction, Transaction.id == FraudAlert.transaction_id
    ).filter(FraudAlert.user_id == user_id)
    if document_ids is not None:
        alert_rows = alert_rows.filter(Transaction.document_id.in_(document_ids)) if document_ids else alert_rows.filter(False)
    alerts = alert_rows.order_by(FraudAlert.created_at.desc()).all()
    risk_counts: Dict[str, int] = defaultdict(int)
    fraud_alerts = []
    for alert, txn in alerts:
        risk_counts[alert.risk_level] += 1
        fraud_alerts.append({
            "transaction_id": txn.id,
            "transaction_date": txn.transaction_date.isoformat(),
            "description": txn.description,
            "category": txn.category,
            "amount": float(txn.amount),
            "risk_level": alert.risk_level,
            "anomaly_score": float(alert.anomaly_score),
            "reasons": alert.reasons or [],
            "status": alert.status,
        })

    document_ids_in_data = list(dict.fromkeys(txn.document_id for txn in transactions if txn.document_id))
    document_names = db.query(Document.file_name).filter(Document.id.in_(document_ids_in_data)).all() if document_ids_in_data else []
    recommendations = []
    if float(features.get("emergency_fund_months", 0)) < 3:
        recommendations.append({
            "title": "Build a 3-month emergency cushion",
            "reason": f"The transaction-based surplus estimate covers about {features.get('emergency_fund_months', 0):.1f} months of expenses.",
        })
    if float(features.get("discretionary_spending_ratio", 0)) > 0.35:
        recommendations.append({
            "title": "Review discretionary spending",
            "reason": f"Flexible spending is {float(features['discretionary_spending_ratio']) * 100:.1f}% of recorded outflows.",
        })
    if float(features.get("savings_rate", 0)) <= 0:
        recommendations.append({
            "title": "Address monthly cash-flow pressure",
            "reason": "Recorded outflows meet or exceed recorded inflows in the analyzed statement data.",
        })

    snapshot = LoanAnalysisSnapshot(
        loan_id=loan.id,
        source_document_ids=document_ids_in_data,
        source_document_names=[row[0] for row in document_names],
        transaction_count=len(transactions),
        period_start=min((txn.transaction_date for txn in transactions), default=None),
        period_end=max((txn.transaction_date for txn in transactions), default=None),
        financial_health_score=risk_result["financial_health_score"],
        default_probability=risk_result["default_probability"],
        risk_band=risk_result["risk_band"],
        model_version=risk_result["model_version"],
        features={
            key: (None if isinstance(value, float) and not math.isfinite(value) else value)
            for key, value in features.items()
        },
        spending_breakdown=spending_breakdown,
        monthly_cash_flow=monthly_cash_flow,
        fraud_summary={
            "scan_status": fraud_scan_status,
            "saved_alert_count": len(fraud_alerts),
            "flagged_transaction_count": sum(1 for txn in transactions if txn.is_flagged),
            "risk_level_counts": dict(risk_counts),
            "basis_note": "Fraud signals come from the transaction anomaly scan. A failed or not-run scan is not evidence that the account is clear.",
        },
        fraud_alerts=fraud_alerts,
        segment=risk_result.get("segment"),
        xai_contributions=compute_xai_contributions(features),
        recommendations=recommendations,
        analysis_basis=analysis_basis,
        generated_at=datetime.now(timezone.utc),
    )
    db.add(snapshot)
    db.flush()
    return snapshot


def create_loan_application(
    db: Session,
    user_id: str,
    amount: float,
    purpose: str,
    term_months: int,
    interest_rate: float = 10.5,
    document_ids: Optional[List[str]] = None,
) -> Loan:
    """Submit loan application and generate initial repayment schedule."""
    # Score from the customer's currently uploaded transactions at application time.
    # Reusing an older score could hide changes in the latest statement.
    eval_res = evaluate_customer_credit_risk(db, user_id, document_ids)
    risk_tier = eval_res["risk_band"]

    fraud_scan_status = "completed"
    try:
        scan_user_transactions_for_fraud(db, user_id, document_ids)
    except Exception:
        logger.exception("Fraud scan failed while preparing loan analysis for user %s", user_id)
        db.rollback()
        fraud_scan_status = "failed"

    loan = Loan(
        user_id=user_id,
        amount=amount,
        purpose=purpose,
        term_months=term_months,
        interest_rate=interest_rate,
        status="pending",
        risk_tier=risk_tier,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(loan)
    db.flush()

    # Create scheduled repayments
    schedule = calculate_amortization_schedule(amount, interest_rate, term_months)
    db_repayments = [
        LoanRepayment(
            loan_id=loan.id,
            due_date=item["due_date"],
            amount=item["amount"],
            status="pending",
            created_at=datetime.now(timezone.utc)
        )
        for item in schedule
    ]
    db.add_all(db_repayments)
    db.flush()
    capture_loan_analysis(db, loan, user_id, document_ids, eval_res, fraud_scan_status=fraud_scan_status)
    db.commit()
    db.refresh(loan)

    return loan


def decide_loan_application(db: Session, loan_id: str, decision: str) -> Loan:
    """Officer decisioning (approved or rejected)."""
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise ValueError("Loan not found")

    decision = decision.lower().strip()
    if decision not in ["approved", "rejected"]:
        raise ValueError("Decision must be either 'approved' or 'rejected'")

    loan.status = decision
    loan.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(loan)
    return loan
