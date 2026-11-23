import pytest


def get_authenticated_headers(client, email="phase4_user@example.com", role="customer"):
    """Helper to register and login a user with given role."""
    client.post("/api/v1/auth/register", json={
        "email": email,
        "password": "Password123!",
        "full_name": f"User {role}",
        "role": role
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": email,
        "password": "Password123!"
    })
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_explainability_and_what_if(client):
    """Test SHAP-style explainability breakdown and What-If simulator."""
    headers = get_authenticated_headers(client, "xai_tester@example.com")

    # 1. Trigger risk evaluation
    eval_res = client.post("/api/v1/predictions/credit-risk", headers=headers)
    assert eval_res.status_code == 200

    # 2. Get explanation
    xai_res = client.get("/api/v1/explainability/latest", headers=headers)
    assert xai_res.status_code == 200
    xai_data = xai_res.json()
    assert "explanation" in xai_data
    assert len(xai_data["explanation"]) >= 4

    # 3. Simulate What-If scenario (increase income by 25,000, decrease expenses by 10,000)
    what_if_res = client.post("/api/v1/explainability/what-if", json={
        "income_delta": 25000.0,
        "expense_delta": -10000.0,
        "debt_delta": 0.0
    }, headers=headers)
    assert what_if_res.status_code == 200
    sim_data = what_if_res.json()
    assert "simulated_default_probability" in sim_data
    assert sim_data["simulated_default_probability"] <= sim_data["baseline_default_probability"]


def test_cash_flow_forecasting(client):
    """Test time-series cash flow projection generation."""
    headers = get_authenticated_headers(client, "forecast_user@example.com")

    # Generate 30d forecast
    gen_res = client.post("/api/v1/forecast/generate", json={"horizon": "30d"}, headers=headers)
    assert gen_res.status_code == 201
    fc_data = gen_res.json()
    assert len(fc_data["data"]) == 30
    assert "lower_bound" in fc_data["data"][0]
    assert "upper_bound" in fc_data["data"][0]

    # Retrieve forecast
    get_res = client.get("/api/v1/forecast?horizon=30d", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["horizon"] == "30d"


def test_loans_and_underwriting(client):
    """Test loan application, amortization schedule, and officer decisioning."""
    cust_headers = get_authenticated_headers(client, "borrower@example.com", "customer")
    officer_headers = get_authenticated_headers(client, "loan_officer@example.com", "loan_officer")

    # 1. Customer applies for personal loan
    loan_payload = {
        "amount": 250000.0,
        "purpose": "Home Renovation",
        "term_months": 24,
        "interest_rate": 11.5
    }
    apply_res = client.post("/api/v1/loans/apply", json=loan_payload, headers=cust_headers)
    assert apply_res.status_code == 201
    loan_id = apply_res.json()["id"]

    # 2. Check repayment amortization schedule
    sched_res = client.get(f"/api/v1/loans/{loan_id}/repayment-schedule", headers=cust_headers)
    assert sched_res.status_code == 200
    schedule = sched_res.json()
    assert len(schedule) == 24
    assert schedule[0]["amount"] > 0

    # 3. Loan officer reviews queue and approves loan
    queue_res = client.get("/api/v1/admin/loans?status=pending", headers=officer_headers)
    assert queue_res.status_code == 200
    assert any(l["id"] == loan_id for l in queue_res.json())

    decide_res = client.patch(f"/api/v1/admin/loans/{loan_id}/decision", json={
        "decision": "approved",
        "officer_notes": "Clean credit history and verified employment."
    }, headers=officer_headers)
    assert decide_res.status_code == 200
    assert decide_res.json()["status"] == "approved"


def test_recommendations_and_pdf_reports(client):
    """Test smart financial advice generation and executive PDF compilation."""
    headers = get_authenticated_headers(client, "report_user@example.com")

    # 1. Fetch recommendations
    recs_res = client.get("/api/v1/recommendations", headers=headers)
    assert recs_res.status_code == 200
    recs = recs_res.json()
    assert len(recs) >= 1

    # Dismiss one recommendation
    dismiss_res = client.patch(f"/api/v1/recommendations/{recs[0]['id']}/dismiss", headers=headers)
    assert dismiss_res.status_code == 200

    # 2. Generate PDF report
    gen_res = client.post("/api/v1/reports/generate", json={"report_type": "comprehensive"}, headers=headers)
    assert gen_res.status_code == 201
    report_id = gen_res.json()["id"]

    # 3. Download PDF report
    dl_res = client.get(f"/api/v1/reports/{report_id}/download", headers=headers)
    assert dl_res.status_code == 200
    assert dl_res.headers["content-type"] == "application/pdf"
    assert len(dl_res.content) > 1000  # Non-trivial PDF size


def test_prometheus_metrics_and_model_registry(client):
    """Test Prometheus /metrics scrape and admin model registry inspection."""
    officer_headers = get_authenticated_headers(client, "admin_metrics_user@example.com", "loan_officer")

    # 1. Prometheus /metrics endpoint
    metrics_res = client.get("/metrics")
    assert metrics_res.status_code == 200
    assert "arthdrishti_service_status" in metrics_res.text

    # 2. Admin models registry
    models_res = client.get("/api/v1/admin/models", headers=officer_headers)
    assert models_res.status_code == 200
    data = models_res.json()
    assert len(data["models"]) == 3
