from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.financial import Transaction
from app.models.ml import Forecast
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.groq_analytics_service import generate_forecast_values


def generate_cash_flow_forecast(db: Session, user_id: str, horizon: str = "30d", document_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    transactions = query.order_by(Transaction.transaction_date.asc()).all()
    features = compute_20_financial_features([
        {"transaction_date": txn.transaction_date, "amount": float(txn.amount),
         "transaction_type": txn.transaction_type, "category": txn.category, "description": txn.description}
        for txn in transactions
    ])
    if not features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before generating a cash-flow forecast.")

    now = datetime.now(timezone.utc)
    if horizon == "7d":
        dates = [(now + timedelta(days=day)).strftime("%Y-%m-%d") for day in range(1, 8)]
    elif horizon == "180d":
        dates = [(now + timedelta(days=30 * month)).strftime("%b %Y") for month in range(1, 7)]
    else:
        horizon = "30d"
        dates = [(now + timedelta(days=day)).strftime("%Y-%m-%d") for day in range(1, 31)]

    net_flow_reference = float(features["total_income"] - features["total_expenses"])
    data_points = generate_forecast_values(features, horizon, dates, net_flow_reference)
    model_version = f"groq_{settings.GROQ_MODEL[:48]}"
    record = Forecast(
        user_id=user_id,
        horizon=horizon,
        forecast_type="cash_flow",
        data=data_points,
        model_version=model_version,
        created_at=now,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {
        "id": record.id,
        "user_id": user_id,
        "horizon": horizon,
        "forecast_type": "cash_flow",
        "data": data_points,
        "model_version": record.model_version,
        "created_at": record.created_at,
    }


def get_latest_forecast(db: Session, user_id: str, horizon: str = "30d") -> Forecast:
    forecast = db.query(Forecast).filter(
        Forecast.user_id == user_id,
        Forecast.horizon == horizon,
    ).order_by(Forecast.created_at.desc()).first()
    if not forecast or not forecast.model_version.startswith("groq_"):
        result = generate_cash_flow_forecast(db, user_id, horizon)
        forecast = db.query(Forecast).filter(Forecast.id == result["id"]).first()
    return forecast
