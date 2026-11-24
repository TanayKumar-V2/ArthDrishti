# Import Base and all models for Alembic metadata discovery
from app.db.session import Base
from app.models import (
    User,
    RefreshToken,
    CustomerProfile,
    Document,
    Transaction,
    Loan,
    LoanRepayment,
    LoanAnalysisSnapshot,
    RiskScore,
    FraudAlert,
    Forecast,
    CustomerSegment,
    Explanation,
    Recommendation,
    Report,
    AuditLog,
    ModelRegistry,
)

__all__ = ["Base"]
