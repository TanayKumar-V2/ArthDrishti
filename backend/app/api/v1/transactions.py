from typing import List, Optional
from datetime import datetime, timezone
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.models.user import User
from app.models.financial import Transaction
from app.core.dependencies import get_current_user
from app.schemas.financial import (
    TransactionOut,
    TransactionUpdate,
    TransactionSummary,
    CategoryBreakdownItem,
    MonthlyTrendItem,
    FinancialFeaturesOut,
)
from app.services.feature_engineering_service import compute_20_financial_features

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionOut])
def list_transactions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List and filter transactions with pagination."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if document_ids is not None:
        ids = [value.strip() for value in document_ids.split(",") if value.strip()]
        query = query.filter(Transaction.document_id.in_(ids)) if ids else query.filter(False)

    if category:
        query = query.filter(Transaction.category.ilike(f"%{category}%"))
    if transaction_type:
        query = query.filter(Transaction.transaction_type == transaction_type.lower())
    if is_flagged is not None:
        query = query.filter(Transaction.is_flagged == is_flagged)
    if start_date:
        query = query.filter(Transaction.transaction_date >= start_date)
    if end_date:
        query = query.filter(Transaction.transaction_date <= end_date)

    return query.order_by(Transaction.transaction_date.desc()).offset(skip).limit(limit).all()


@router.get("/summary", response_model=TransactionSummary)
def get_transaction_summary(
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Aggregates for dashboard charts (monthly totals, category breakdowns, net cash flow)."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if document_ids is not None:
        ids = [value.strip() for value in document_ids.split(",") if value.strip()]
        query = query.filter(Transaction.document_id.in_(ids)) if ids else query.filter(False)
    txns = query.all()

    total_income = 0.0
    total_expenses = 0.0
    category_totals = defaultdict(float)
    category_counts = defaultdict(int)
    monthly_data = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})

    for t in txns:
        amt = float(t.amount)
        month_str = t.transaction_date.strftime("%b %Y")

        if t.transaction_type == "credit":
            total_income += amt
            monthly_data[month_str]["income"] += amt
        else:
            total_expenses += amt
            monthly_data[month_str]["expenses"] += amt
            category_totals[t.category] += amt
            category_counts[t.category] += 1

    net_cash_flow = round(total_income - total_expenses, 2)
    savings_rate = round(net_cash_flow / total_income, 4) if total_income > 0 else 0.0

    category_breakdown = [
        CategoryBreakdownItem(
            category=cat,
            amount=round(amt, 2),
            percentage=round((amt / total_expenses) * 100, 1) if total_expenses > 0 else 0.0,
            count=category_counts[cat]
        )
        for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    monthly_trend = [
        MonthlyTrendItem(
            month=m,
            income=round(data["income"], 2),
            expenses=round(data["expenses"], 2),
            net_savings=round(data["income"] - data["expenses"], 2)
        )
        for m, data in monthly_data.items()
    ]

    return TransactionSummary(
        total_income=round(total_income, 2),
        total_expenses=round(total_expenses, 2),
        net_cash_flow=net_cash_flow,
        savings_rate=savings_rate,
        transaction_count=len(txns),
        category_breakdown=category_breakdown,
        monthly_trend=monthly_trend
    )


@router.get("/features", response_model=FinancialFeaturesOut)
def get_user_features(
    document_ids: Optional[str] = Query(None, description="Comma-separated statement IDs to include"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve 20+ engineered financial feature metrics for the current user."""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    if document_ids is not None:
        ids = [value.strip() for value in document_ids.split(",") if value.strip()]
        query = query.filter(Transaction.document_id.in_(ids)) if ids else query.filter(False)
    txns = query.all()
    txn_dicts = [
        {
            "transaction_date": t.transaction_date,
            "amount": float(t.amount),
            "transaction_type": t.transaction_type,
            "category": t.category,
            "description": t.description
        }
        for t in txns
    ]

    features = compute_20_financial_features(txn_dicts)

    return FinancialFeaturesOut(
        user_id=current_user.id,
        features=features,
        feature_count=len(features),
        computed_at=datetime.now(timezone.utc)
    )


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get single transaction detail."""
    txn = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return txn


@router.patch("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: str,
    update_data: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Manual category correction or fraud flag toggle for a transaction."""
    txn = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    ).first()
    if not txn:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")

    if update_data.category is not None:
        txn.category = update_data.category
    if update_data.is_flagged is not None:
        txn.is_flagged = update_data.is_flagged

    db.commit()
    db.refresh(txn)
    return txn
