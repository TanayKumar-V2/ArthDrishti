from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.financial import Loan, LoanRepayment
from app.core.dependencies import get_current_user
from app.schemas.xai_loans_reports import LoanOut, LoanApplicationCreate, RepaymentScheduleItem
from app.services.loan_service import create_loan_application

router = APIRouter(prefix="/loans", tags=["Loans & Underwriting"])


@router.post("/apply", response_model=LoanOut, status_code=status.HTTP_201_CREATED)
def apply_for_loan(
    payload: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a loan application. Automatically evaluates risk and generates repayment schedule."""
    return create_loan_application(
        db=db,
        user_id=current_user.id,
        amount=payload.amount,
        purpose=payload.purpose,
        term_months=payload.term_months,
        interest_rate=payload.interest_rate or 10.5
    )


@router.get("", response_model=List[LoanOut])
def list_user_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List loan applications for current user."""
    return db.query(Loan).filter(Loan.user_id == current_user.id).order_by(Loan.created_at.desc()).all()


@router.get("/{loan_id}", response_model=LoanOut)
def get_loan_details(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details for a specific loan."""
    loan = db.query(Loan).filter(Loan.id == loan_id, Loan.user_id == current_user.id).first()
    if not loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Loan not found")
    return loan


@router.get("/{loan_id}/repayment-schedule", response_model=List[RepaymentScheduleItem])
def get_loan_repayment_schedule(
    loan_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full amortization repayment schedule for a loan."""
    repayments = db.query(LoanRepayment).filter(LoanRepayment.loan_id == loan_id).order_by(LoanRepayment.due_date.asc()).all()
    return [
        RepaymentScheduleItem(
            installment_number=idx + 1,
            due_date=r.due_date,
            amount=float(r.amount),
            status=r.status
        )
        for idx, r in enumerate(repayments)
    ]
