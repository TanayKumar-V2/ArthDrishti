from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.financial import Loan, LoanRepayment
from app.models.ml import RiskScore
from app.services.prediction_service import evaluate_customer_credit_risk


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


def create_loan_application(
    db: Session,
    user_id: str,
    amount: float,
    purpose: str,
    term_months: int,
    interest_rate: float = 10.5
) -> Loan:
    """Submit loan application and generate initial repayment schedule."""
    # Automated risk tier assignment based on current risk score
    latest_score = db.query(RiskScore).filter(RiskScore.user_id == user_id).order_by(RiskScore.created_at.desc()).first()
    if not latest_score:
        eval_res = evaluate_customer_credit_risk(db, user_id)
        risk_tier = eval_res["risk_band"]
    else:
        risk_tier = latest_score.risk_band

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
