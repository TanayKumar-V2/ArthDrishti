from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.financial import Transaction
from app.models.ml import Forecast
from app.services.feature_engineering_service import compute_20_financial_features


def generate_cash_flow_forecast(db: Session, user_id: str, horizon: str = "30d", document_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """
    Generate time-series cash flow projections with upper/lower uncertainty bounds.
    Horizons supported: 7d, 30d, 180d.
    """
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    txns = query.all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    features = compute_20_financial_features(txn_dicts)
    if not features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before generating a cash-flow forecast.")

    daily_income_avg = features["monthly_income_avg"] / 30.0
    daily_expense_avg = features["monthly_expense_avg"] / 30.0
    # The upload parser does not read opening/current account balances. This is a
    # cumulative net-flow estimate, not a verified bank balance.
    current_balance = features["total_income"] - features["total_expenses"]

    # Determine projection points based on horizon
    if horizon == "7d":
        steps = 7
        step_delta = timedelta(days=1)
        fmt = "%Y-%m-%d"
    elif horizon == "180d":
        steps = 6
        step_delta = timedelta(days=30)
        fmt = "%b %Y"
    else:  # default 30d
        steps = 30
        step_delta = timedelta(days=1)
        fmt = "%Y-%m-%d"

    data_points = []
    simulated_balance = current_balance
    start_date = datetime.now(timezone.utc)

    for i in range(1, steps + 1):
        pt_date = start_date + (step_delta * i)
        
        # Periodic salary injection
        if horizon in ["7d", "30d"]:
            is_payday = pt_date.day == 1
            projected_inc = round(daily_income_avg * 30.0, 2) if is_payday else 0.0
            projected_exp = round(daily_expense_avg, 2)
        else:  # Monthly steps
            projected_inc = round(daily_income_avg * 30.0, 2)
            projected_exp = round(daily_expense_avg * 30.0, 2)

        simulated_balance += (projected_inc - projected_exp)

        # Standard error growth over forecast horizon
        uncertainty = (i ** 0.5) * (daily_expense_avg * 2.5)

        data_points.append({
            "date": pt_date.strftime(fmt),
            "projected_income": projected_inc,
            "projected_expense": projected_exp,
            "projected_balance": round(simulated_balance, 2),
            "lower_bound": round(simulated_balance - uncertainty, 2),
            "upper_bound": round(simulated_balance + uncertainty, 2)
        })

    # Save to forecasts table
    forecast_record = Forecast(
        user_id=user_id,
        horizon=horizon,
        forecast_type="cash_flow",
        data=data_points,
        model_version="average_net_flow_v1.0",
        created_at=datetime.now(timezone.utc)
    )
    db.add(forecast_record)
    db.commit()
    db.refresh(forecast_record)

    return {
        "id": forecast_record.id,
        "user_id": user_id,
        "horizon": horizon,
        "forecast_type": "cash_flow",
        "data": data_points,
        "model_version": forecast_record.model_version,
        "created_at": forecast_record.created_at
    }


def get_latest_forecast(db: Session, user_id: str, horizon: str = "30d") -> Forecast:
    """Retrieve existing forecast or generate on the fly."""
    fc = db.query(Forecast).filter(
        Forecast.user_id == user_id,
        Forecast.horizon == horizon
    ).order_by(Forecast.created_at.desc()).first()

    if not fc:
        res = generate_cash_flow_forecast(db, user_id, horizon)
        fc = db.query(Forecast).filter(Forecast.id == res["id"]).first()
    return fc
