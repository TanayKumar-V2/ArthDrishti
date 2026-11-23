from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Document Schemas
class DocumentBase(BaseModel):
    file_name: str
    file_type: str


class DocumentOut(DocumentBase):
    id: str
    user_id: str
    file_size: int
    status: str  # pending, processing, completed, failed
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    document_id: str
    file_name: str
    status: str
    message: str


# Transaction Schemas
class TransactionBase(BaseModel):
    transaction_date: datetime
    amount: float
    transaction_type: str  # credit, debit
    category: str
    description: str
    is_flagged: bool = False


class TransactionCreate(TransactionBase):
    document_id: Optional[str] = None


class TransactionOut(TransactionBase):
    id: str
    user_id: str
    document_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    is_flagged: Optional[bool] = None


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float
    count: int


class MonthlyTrendItem(BaseModel):
    month: str
    income: float
    expenses: float
    net_savings: float


class TransactionSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_cash_flow: float
    savings_rate: float
    transaction_count: int
    category_breakdown: List[CategoryBreakdownItem]
    monthly_trend: List[MonthlyTrendItem]


# Feature Engineering Metrics Schema
class FinancialFeaturesOut(BaseModel):
    user_id: str
    features: Dict[str, Any]
    feature_count: int
    computed_at: datetime
