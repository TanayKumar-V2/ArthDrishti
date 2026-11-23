from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    default_probability = Column(Numeric(5, 4), nullable=False)  # e.g. 0.1245
    risk_band = Column(String(50), nullable=False)  # low, medium, high, severe
    financial_health_score = Column(Numeric(5, 2), nullable=False)  # 0-100
    model_version = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="risk_scores")


class FraudAlert(Base):
    __tablename__ = "fraud_alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id", ondelete="CASCADE"), nullable=True, unique=True)
    anomaly_score = Column(Numeric(5, 4), nullable=False)
    risk_level = Column(String(50), nullable=False)  # Low, Medium, High, Critical
    reasons = Column(JSON, default=list)  # list of trigger reasons
    status = Column(String(50), default="unreviewed", nullable=False)  # unreviewed, confirmed_fraud, false_positive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="fraud_alerts")
    transaction = relationship("Transaction", back_populates="fraud_alert")


class Forecast(Base):
    __tablename__ = "forecasts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    horizon = Column(String(50), nullable=False)  # 7d, 30d, 180d
    forecast_type = Column(String(50), default="cash_flow", nullable=False)
    data = Column(JSON, nullable=False)  # series data points with upper/lower bounds
    model_version = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="forecasts")


class CustomerSegment(Base):
    __tablename__ = "customer_segments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cluster_id = Column(String(50), nullable=False)
    segment_name = Column(String(100), nullable=False)
    characteristics = Column(JSON, default=dict)
    model_version = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="segment")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    prediction_id = Column(String(36), nullable=False, index=True)
    prediction_type = Column(String(50), nullable=False)  # credit_risk, fraud
    feature_contributions = Column(JSON, nullable=False)  # [{feature, contribution}]
    base_value = Column(Numeric(8, 4), default=0.0)
    model_version = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
