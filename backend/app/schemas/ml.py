from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class RiskScoreOut(BaseModel):
    id: str
    user_id: str
    default_probability: float
    risk_band: str
    financial_health_score: float
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerSegmentOut(BaseModel):
    cluster_id: str
    segment_name: str
    characteristics: Dict[str, Any]
    model_version: str

    model_config = ConfigDict(from_attributes=True)


class FraudAlertOut(BaseModel):
    id: str
    user_id: str
    transaction_id: Optional[str] = None
    anomaly_score: float
    risk_level: str
    reasons: List[str]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FraudAlertUpdate(BaseModel):
    status: str  # unreviewed, confirmed_fraud, false_positive


class CreditRiskEvaluationResponse(BaseModel):
    user_id: str
    default_probability: float
    risk_band: str
    financial_health_score: float
    segment: Dict[str, Any]
    model_version: str
    evaluated_at: datetime


class FinancialHealthScoreOut(BaseModel):
    user_id: str
    score: float
    rating: str
    components: Dict[str, float]
    evaluated_at: datetime
