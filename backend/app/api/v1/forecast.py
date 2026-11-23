from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.xai_loans_reports import ForecastOut, ForecastGenerateRequest
from app.services.forecast_service import generate_cash_flow_forecast, get_latest_forecast

router = APIRouter(prefix="/forecast", tags=["Cash Flow Forecasting"])


@router.post("/generate", response_model=ForecastOut, status_code=status.HTTP_201_CREATED)
def trigger_forecast_generation(
    payload: ForecastGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger time-series cash flow forecasting job."""
    return generate_cash_flow_forecast(db, current_user.id, payload.horizon)


@router.get("", response_model=ForecastOut)
def get_forecast(
    horizon: str = Query("30d", pattern="^(7d|30d|180d)$"),
    type: Optional[str] = "cash_flow",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve latest forecast projections with upper and lower confidence intervals."""
    return get_latest_forecast(db, current_user.id, horizon)


@router.get("/status/{task_id}")
def get_forecast_task_status(task_id: str):
    """Poll async forecasting task status."""
    return {
        "task_id": task_id,
        "status": "completed",
        "progress": 100
    }
