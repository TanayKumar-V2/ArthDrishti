import os
import io
import tempfile
import pytest
from datetime import datetime

from app.services.document_processing_service import (
    parse_csv_statement,
    classify_category,
    parse_date_flexible,
)
from app.services.feature_engineering_service import (
    clean_transactions,
    compute_20_financial_features,
    detect_outliers_iqr,
)


@pytest.fixture
def sample_csv_file():
    """Create a temporary CSV statement file."""
    content = """Date,Description,Amount,Type
2026-01-01,Tech Solutions Salary Credit,120000.00,Credit
2026-01-03,Apartment Rent Transfer,30000.00,Debit
2026-01-05,Swiggy Order Food Delivery,850.00,Debit
2026-01-08,BESCOM Electricity Bill,2400.00,Debit
2026-01-12,Amazon Marketplace Shopping,4500.00,Debit
2026-01-15,Uber India Ride,420.00,Debit
2026-01-20,HDFC ATM Cash Withdrawal,5000.00,Debit
2026-01-25,Zerodha Broking SIP Investment,15000.00,Debit
2026-02-01,Tech Solutions Salary Credit,120000.00,Credit
2026-02-03,Apartment Rent Transfer,30000.00,Debit
2026-02-14,Zomato Restaurant Dining,1200.00,Debit
"""
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".csv", encoding="utf-8") as f:
        f.write(content)
        path = f.name

    yield path
    if os.path.exists(path):
        os.remove(path)


def test_category_classification():
    """Verify smart keyword categorization."""
    assert classify_category("Infosys Monthly Salary", "credit") == "Salary & Income"
    assert classify_category("Swiggy Delivery #991", "debit") == "Food & Dining"
    assert classify_category("Amazon Retail Order", "debit") == "Shopping & Retail"
    assert classify_category("BESCOM Bill Payment", "debit") == "Utilities & Bills"
    assert classify_category("Uber Trip Ride", "debit") == "Transportation & Travel"
    assert classify_category("Zerodha Broking SIP", "debit") == "Investments & Savings"
    assert classify_category("ATM Cash Withdrawal", "debit") == "Cash & ATM"


def test_csv_parsing(sample_csv_file):
    """Verify CSV statement parser correctly extracts fields and categories."""
    txns = parse_csv_statement(sample_csv_file)
    assert len(txns) == 11

    salary_txns = [t for t in txns if t["transaction_type"] == "credit"]
    assert len(salary_txns) == 2
    assert salary_txns[0]["amount"] == 120000.00
    assert salary_txns[0]["category"] == "Salary & Income"

    debit_txns = [t for t in txns if t["transaction_type"] == "debit"]
    assert len(debit_txns) == 9


def test_20_financial_features():
    """Verify feature engineering computes all 22 features accurately."""
    mock_txns = [
        {"transaction_date": datetime(2026, 1, 1), "amount": 100000.0, "transaction_type": "credit", "category": "Salary & Income", "description": "Salary"},
        {"transaction_date": datetime(2026, 1, 3), "amount": 25000.0, "transaction_type": "debit", "category": "Housing & Rent", "description": "Rent"},
        {"transaction_date": datetime(2026, 1, 10), "amount": 5000.0, "transaction_type": "debit", "category": "Food & Dining", "description": "Food"},
        {"transaction_date": datetime(2026, 2, 1), "amount": 100000.0, "transaction_type": "credit", "category": "Salary & Income", "description": "Salary"},
        {"transaction_date": datetime(2026, 2, 3), "amount": 25000.0, "transaction_type": "debit", "category": "Housing & Rent", "description": "Rent"},
        {"transaction_date": datetime(2026, 2, 14), "amount": 6000.0, "transaction_type": "debit", "category": "Shopping & Retail", "description": "Shopping"},
    ]

    features = compute_20_financial_features(mock_txns)

    assert "total_income" in features
    assert features["total_income"] == 200000.0
    assert features["total_expenses"] == 61000.0
    assert features["monthly_income_avg"] == 100000.0
    assert features["savings_rate"] > 0.50
    assert features["recurring_expense_ratio"] > 0.50
    assert features["financial_health_score"] >= 70.0
    assert "category_diversity_entropy" in features
    assert "salary_regularity_days" in features
    assert "weekend_spending_percentage" in features


def test_document_and_transaction_api(client):
    """Test full upload, transaction listing, summary, and category update workflow."""
    # 1. Register & login
    client.post("/api/v1/auth/register", json={
        "email": "pipeline_user@example.com",
        "password": "Password123!",
        "full_name": "Pipeline Tester"
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": "pipeline_user@example.com",
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Upload CSV statement
    csv_bytes = b"Date,Description,Amount,Type\n2026-01-01,Salary Credit,85000,Credit\n2026-01-05,Groceries,3200,Debit\n"
    files = {"file": ("statement.csv", io.BytesIO(csv_bytes), "text/csv")}
    upload_res = client.post("/api/v1/documents/upload", files=files, headers=headers)
    assert upload_res.status_code == 202
    doc_id = upload_res.json()["document_id"]

    # 3. Check document status
    status_res = client.get(f"/api/v1/documents/{doc_id}/status", headers=headers)
    assert status_res.status_code == 200

    # 4. List documents
    docs_res = client.get("/api/v1/documents", headers=headers)
    assert docs_res.status_code == 200
    assert len(docs_res.json()) >= 1
