import pytest
from app.core.config import settings


def get_authenticated_headers(client, email="advisor_test_user@example.com"):
    """Register and authenticate user for test client."""
    client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": "Test Client",
            "role": "customer",
        },
    )
    res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Password123!"},
    )
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_advisor_context_endpoint(client):
    """Verify customer financial risk context summary returns verified metrics."""
    headers = get_authenticated_headers(client, "context_user@example.com")
    res = client.get("/api/v1/advisor/context", headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert "financial_health_score" in data
    assert "credit_risk_band" in data
    assert "default_probability_pct" in data
    assert "customer_segment" in data
    assert "savings_rate_pct" in data
    assert "emergency_fund_months" in data
    assert isinstance(data["financial_health_score"], (int, float))


def test_advisor_chat_grounded_fallback(monkeypatch, client):
    """
    Verify /advisor/chat produces a numbers-grounded response using
    the configured openai/gpt-oss-20b model contract when fallback is triggered.
    """
    from app.services import llm_service
    async def mock_none(*args, **kwargs):
        return None
    monkeypatch.setattr(llm_service, "call_groq_llm", mock_none)

    headers = get_authenticated_headers(client, "chat_user@example.com")
    payload = {
        "message": "Can I afford another loan with my current EMI?",
        "history": [
            {"sender": "assistant", "text": "Hello, how can I assist with your finances?"}
        ],
    }
    res = client.post("/api/v1/advisor/chat", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["model"] == "openai/gpt-oss-20b"
    assert data["source"] == "fallback"
    assert "response" in data
    assert len(data["response"]) > 50
    # Must mention numbers or risk band in fallback
    assert (
        "Health Score" in data["response"]
        or "Credit Risk" in data["response"]
        or "Default Probability" in data["response"]
    )
    assert "metrics" in data
    assert "credit_risk_band" in data["metrics"]


def test_advisor_chat_spending_query(client):
    """Test spending-specific inquiry produces grounded expense advice."""
    headers = get_authenticated_headers(client, "spend_user@example.com")
    payload = {
        "message": "Where am I overspending on dining and retail?",
    }
    res = client.post("/api/v1/advisor/chat", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["model"] == "openai/gpt-oss-20b"
    assert "Discretionary" in data["response"] or "spending" in data["response"].lower()


def test_advisor_chat_mocked_groq_api(monkeypatch, client):
    """Verify live Groq API response handling when Groq service returns output."""
    from app.services import llm_service

    async def mock_call_groq_llm(messages, model=None, temperature=0.2, max_tokens=1024):
        return (
            "Groq openai/gpt-oss-20b analysis: Your 78.0 Health Score qualifies you for prime rates. "
            "We recommend maintaining credit card utilization under 25%."
        )

    monkeypatch.setattr(llm_service, "call_groq_llm", mock_call_groq_llm)

    headers = get_authenticated_headers(client, "groq_mock_user@example.com")
    payload = {"message": "Provide my full credit risk assessment."}
    res = client.post("/api/v1/advisor/chat", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()

    assert data["source"] == "groq"
    assert data["model"] == "openai/gpt-oss-20b"
    assert "Groq openai/gpt-oss-20b analysis" in data["response"]
    assert data["metrics"]["financial_health_score"] > 0
