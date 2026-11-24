from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# Explainability & What-If Schemas
class FeatureContributionItem(BaseModel):
    feature: str
    contribution: float
    description: str


class ExplanationOut(BaseModel):
    prediction_id: str
    prediction_type: str
    default_probability: float
    risk_band: str
    base_value: Optional[float] = None
    explanation: List[FeatureContributionItem]
    model_version: str
    created_at: datetime


class WhatIfRequest(BaseModel):
    income_delta: float = Field(0.0, description="Monthly income adjustment in INR")
    expense_delta: float = Field(0.0, description="Monthly expense reduction/increase in INR")
    debt_delta: float = Field(0.0, description="Debt payoff/increase in INR")
    loan_amount: Optional[float] = Field(None, description="Prospective loan amount")


class WhatIfResponse(BaseModel):
    baseline_default_probability: float
    simulated_default_probability: float
    delta_probability: float
    baseline_risk_band: str
    simulated_risk_band: str
    baseline_health_score: float
    simulated_health_score: float
    impact_summary: str
    feature_shifts: Dict[str, Any]


# Cash Flow Forecast Schemas
class ForecastDataPoint(BaseModel):
    date: str
    projected_income: float
    projected_expense: float
    projected_balance: float
    lower_bound: float
    upper_bound: float


class ForecastGenerateRequest(BaseModel):
    horizon: str = Field("30d", description="7d, 30d, 180d")
    forecast_type: str = "cash_flow"
    document_ids: Optional[List[str]] = None


class ForecastOut(BaseModel):
    id: str
    user_id: str
    horizon: str
    forecast_type: str
    data: List[ForecastDataPoint]
    model_version: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Loans Schemas
class LoanApplicationCreate(BaseModel):
    amount: float = Field(..., gt=0)
    purpose: str = Field(..., min_length=3)
    term_months: int = Field(..., ge=1, le=120)
    interest_rate: Optional[float] = 10.5
    document_ids: Optional[List[str]] = None


class RepaymentScheduleItem(BaseModel):
    installment_number: int
    due_date: datetime
    amount: float
    status: str


class LoanOut(BaseModel):
    id: str
    user_id: str
    amount: float
    purpose: str
    term_months: int
    interest_rate: float
    status: str
    risk_tier: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoanReviewOut(LoanOut):
    applicant_name: str
    applicant_email: str
    financial_health_score: Optional[float] = None
    default_probability: Optional[float] = None


class LoanApplicantAnalysisOut(BaseModel):
    application: LoanReviewOut
    credit_risk: Dict[str, Any]
    transaction_count: int
    period_start: Optional[datetime] = None
    period_end: Optional[datetime] = None
    source_document_ids: List[str] = Field(default_factory=list)
    source_document_names: List[str] = Field(default_factory=list)
    features: Dict[str, Any] = Field(default_factory=dict)
    spending_breakdown: List[Dict[str, Any]] = Field(default_factory=list)
    monthly_cash_flow: List[Dict[str, Any]] = Field(default_factory=list)
    fraud_summary: Dict[str, Any] = Field(default_factory=dict)
    fraud_alerts: List[Dict[str, Any]] = Field(default_factory=list)
    segment: Optional[Dict[str, Any]] = None
    xai_contributions: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    analysis_basis: str
    generated_at: datetime


class LoanDecisionRequest(BaseModel):
    decision: str = Field(..., description="approved | rejected")
    officer_notes: Optional[str] = None


# Recommendations & Reports Schemas
class RecommendationOut(BaseModel):
    id: str
    title: str
    description: str
    category: str
    impact_level: str
    is_dismissed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportGenerateRequest(BaseModel):
    report_type: str = "comprehensive"  # credit_risk, financial_health, comprehensive
    document_ids: Optional[List[str]] = None


class ReportOut(BaseModel):
    id: str
    user_id: str
    report_type: str
    file_path: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
