from typing import Dict, Any, List, Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.ml import RiskScore
from app.models.financial import Transaction
from app.ml.inference.model_loader import model_registry
from app.services.feature_engineering_service import compute_20_financial_features
from app.services.groq_analytics_service import assess_financial_health, explain_credit_risk, explain_what_if


def get_or_generate_explanation(db: Session, prediction_id: str, user_id: str, document_ids: Optional[List[str]] = None) -> Dict[str, Any]:
    """Build a user-scoped explanation from that user's latest real prediction and ledger."""
    query = db.query(RiskScore).filter(RiskScore.user_id == user_id)
    if prediction_id.lower() == "latest":
        risk_score = query.order_by(RiskScore.created_at.desc()).first()
    else:
        risk_score = query.filter(RiskScore.id == prediction_id).first()

    if not risk_score and prediction_id.lower() != "latest":
        raise HTTPException(status_code=404, detail="Risk prediction not found for this account.")
    if not risk_score:
        from app.services.prediction_service import evaluate_customer_credit_risk
        evaluate_customer_credit_risk(db, user_id)
        risk_score = query.order_by(RiskScore.created_at.desc()).first()
    if not risk_score:
        raise HTTPException(status_code=400, detail="Upload a statement before requesting an explanation.")

    default_prob = float(risk_score.default_probability)
    risk_band = risk_score.risk_band
    version = risk_score.model_version

    # Query customer features
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    txns = query.all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    features = compute_20_financial_features(txn_dicts)
    if not features:
        raise HTTPException(status_code=400, detail="No parsed transactions are available for this explanation.")

    insights = explain_credit_risk(features, default_prob, risk_band)

    return {
        "prediction_id": risk_score.id,
        "prediction_type": "credit_risk",
        "default_probability": default_prob,
        "risk_band": risk_band,
        "base_value": None,
        "explanation": insights,
        "model_version": version,
        "created_at": risk_score.created_at
    }


def run_what_if_simulation(
    db: Session,
    user_id: str,
    income_delta: float,
    expense_delta: float,
    document_ids: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Simulate changes to income, expenses, and liabilities to evaluate live risk delta."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        query = query.filter(Transaction.document_id.in_(document_ids)) if document_ids else query.filter(False)
    txns = query.all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    base_features = compute_20_financial_features(txn_dicts)
    if not base_features:
        raise HTTPException(status_code=400, detail="Upload a statement with parsed transactions before simulating a scenario.")

    # Baseline prediction
    base_prob, base_band, _ = model_registry.predict_credit_risk(base_features)

    # Apply adjustments
    simulated_features = dict(base_features)
    new_income = max(base_features["monthly_income_avg"] + income_delta, 0.0)
    new_expense = max(base_features["monthly_expense_avg"] + expense_delta, 0.0)
    
    new_net_flow = new_income - new_expense
    new_savings_rate = (new_income - new_expense) / new_income if new_income > 0 else 0.0

    simulated_features["monthly_income_avg"] = round(new_income, 2)
    simulated_features["monthly_expense_avg"] = round(new_expense, 2)
    simulated_features["net_monthly_cash_flow"] = round(new_net_flow, 2)
    simulated_features["savings_rate"] = round(new_savings_rate, 4)
    simulated_features["credit_to_debit_ratio"] = round(new_income / new_expense, 2) if new_expense > 0 else (99.0 if new_income > 0 else 1.0)
    recurring_amount = base_features["recurring_expense_ratio"] * base_features["monthly_expense_avg"]
    simulated_features["recurring_expense_ratio"] = round(recurring_amount / new_expense, 4) if new_expense > 0 else 0.0
    simulated_features["emergency_fund_months"] = round(max(new_net_flow, 0.0) / new_expense, 1) if new_expense > 0 else 0.0
    base_expenses = base_features["monthly_expense_avg"]
    simulated_features["expense_volatility"] = round(
        base_features["expense_volatility"] * (new_expense / base_expenses), 2
    ) if base_expenses > 0 else 0.0

    # Simulated prediction
    sim_prob, sim_band, _ = model_registry.predict_credit_risk(simulated_features)
    delta_prob = round(sim_prob - base_prob, 4)

    base_health = assess_financial_health(base_features)["score"]
    simulated_features["monthly_income_avg"] = new_income
    simulated_features["monthly_expense_avg"] = new_expense
    simulated_features["net_monthly_cash_flow"] = new_net_flow
    simulated_health = assess_financial_health(simulated_features)["score"]
    summary = explain_what_if({
        "baseline_default_probability": base_prob,
        "simulated_default_probability": sim_prob,
        "baseline_risk_band": base_band,
        "simulated_risk_band": sim_band,
        "baseline_financial_health_score": base_health,
        "simulated_financial_health_score": simulated_health,
        "income_change": income_delta,
        "expense_change": expense_delta,
    })

    return {
        "baseline_default_probability": base_prob,
        "simulated_default_probability": sim_prob,
        "delta_probability": delta_prob,
        "baseline_risk_band": base_band,
        "simulated_risk_band": sim_band,
        "baseline_health_score": base_health,
        "simulated_health_score": simulated_health,
        "impact_summary": summary,
        "feature_shifts": {
            "income_adjusted": new_income,
            "expenses_adjusted": new_expense,
            "net_flow_adjusted": new_net_flow,
            "savings_rate_adjusted": new_savings_rate
        }
    }
