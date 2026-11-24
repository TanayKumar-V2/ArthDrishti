from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Numeric, Integer, Index, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # csv, xlsx, pdf
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0)
    status = Column(String(50), default="pending", nullable=False)  # pending, processing, completed, failed
    error_message = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="documents")
    transactions = relationship("Transaction", back_populates="document", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    transaction_date = Column(DateTime, nullable=False, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    transaction_type = Column(String(20), nullable=False)  # credit, debit
    category = Column(String(100), default="Uncategorized", nullable=False, index=True)
    description = Column(String(500), nullable=False)
    is_flagged = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="transactions")
    document = relationship("Document", back_populates="transactions")
    fraud_alert = relationship("FraudAlert", back_populates="transaction", uselist=False)

    __table_args__ = (
        Index("idx_transactions_user_date", "user_id", "transaction_date"),
    )


class Loan(Base):
    __tablename__ = "loans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(14, 2), nullable=False)
    purpose = Column(String(255), nullable=False)
    term_months = Column(Integer, nullable=False)
    interest_rate = Column(Numeric(5, 2), default=0.0)
    status = Column(String(50), default="pending", nullable=False)  # pending, approved, rejected, active, closed
    risk_tier = Column(String(50), default="Moderate", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="loans")
    repayments = relationship("LoanRepayment", back_populates="loan", cascade="all, delete-orphan")


class LoanRepayment(Base):
    __tablename__ = "loan_repayments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_id = Column(String(36), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, index=True)
    due_date = Column(DateTime, nullable=False)
    amount = Column(Numeric(14, 2), nullable=False)
    status = Column(String(50), default="pending", nullable=False)  # pending, paid, overdue
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    loan = relationship("Loan", back_populates="repayments")


class LoanAnalysisSnapshot(Base):
    __tablename__ = "loan_analysis_snapshots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    loan_id = Column(String(36), ForeignKey("loans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    source_document_ids = Column(JSON, nullable=False, default=list)
    source_document_names = Column(JSON, nullable=False, default=list)
    transaction_count = Column(Integer, nullable=False, default=0)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    financial_health_score = Column(Numeric(5, 2), nullable=False)
    default_probability = Column(Numeric(5, 4), nullable=False)
    risk_band = Column(String(50), nullable=False)
    model_version = Column(String(100), nullable=False)
    features = Column(JSON, nullable=False, default=dict)
    spending_breakdown = Column(JSON, nullable=False, default=list)
    monthly_cash_flow = Column(JSON, nullable=False, default=list)
    fraud_summary = Column(JSON, nullable=False, default=dict)
    fraud_alerts = Column(JSON, nullable=False, default=list)
    segment = Column(JSON, nullable=True)
    xai_contributions = Column(JSON, nullable=False, default=list)
    recommendations = Column(JSON, nullable=False, default=list)
    analysis_basis = Column(String(40), nullable=False, default="application_time")
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
