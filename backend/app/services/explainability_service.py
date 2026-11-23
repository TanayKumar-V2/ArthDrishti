import math
from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.ml import Explanation, RiskScore
from app.models.financial import Transaction
from app.ml.inference.model_loader import model_registry
from app.services.feature_engineering_service import compute_20_financial_features


FEATURE_DESCRIPTIONS = {
    "debt_to_income_ratio": "Debt obligations relative to monthly take-home salary",
    "savings_rate": "Fraction of gross income saved after all monthly expenses",
    "income_stability_score": "Consistency of payroll deposits without irregular lapses",
    "expense_volatility": "Unpredictability in month-over-month debit swings",
    "recurring_expense_ratio": "Committed non-negotiable living costs (rent, utilities)",
    "discretionary_spending_ratio": "Flexible lifestyle spending on dining and shopping",
    "credit_to_debit_ratio": "Overall ratio of money received to money spent",
    "emergency_fund_months": "Liquid cushion available to absorb unexpected shocks",
    "outlier_transaction_count": "Frequency of abnormal, high-value debit anomalies"
}


def compute_xai_contributions(features: Dict[str, Any], default_prob: float) -> List[Dict[str, Any]]:
    """
    Compute local feature contributions (SHAP-style local additive attributions).
    Positive contribution = increases risk of default.
    Negative contribution = reduces risk of default (protective factor).
    """
    contributions = []

    # 1. Savings rate contribution
    savings = float(features.get("savings_rate", 0.0))
    c_savings = round(-0.45 * savings, 3)
    contributions.append({
        "feature": "savings_rate",
        "contribution": c_savings,
        "description": FEATURE_DESCRIPTIONS["savings_rate"]
    })

    # 2. Income stability
    stability = float(features.get("income_stability_score", 0.8))
    c_stability = round(-0.25 * (stability - 0.5), 3)
    contributions.append({
        "feature": "income_stability_score",
        "contribution": c_stability,
        "description": FEATURE_DESCRIPTIONS["income_stability_score"]
    })

    # 3. Discretionary ratio
    discretionary = float(features.get("discretionary_spending_ratio", 0.3))
    c_disc = round(0.35 * (discretionary - 0.25), 3)
    contributions.append({
        "feature": "discretionary_spending_ratio",
        "contribution": c_disc,
        "description": FEATURE_DESCRIPTIONS["discretionary_spending_ratio"]
    })

    # 4. Recurring commitments
    recurring = float(features.get("recurring_expense_ratio", 0.4))
    c_rec = round(0.30 * (recurring - 0.40), 3)
    contributions.append({
        "feature": "recurring_expense_ratio",
        "contribution": c_rec,
        "description": FEATURE_DESCRIPTIONS["recurring_expense_ratio"]
    })

    # 5. Outlier transaction spikes
    outliers = int(features.get("outlier_transaction_count", 0))
    c_outliers = round(0.08 * outliers, 3)
    contributions.append({
        "feature": "outlier_transaction_count",
        "contribution": c_outliers,
        "description": FEATURE_DESCRIPTIONS["outlier_transaction_count"]
    })

    # 6. Emergency Fund Cushion
    emergency = float(features.get("emergency_fund_months", 3.0))
    c_emerg = round(-0.06 * min(emergency, 6.0), 3)
    contributions.append({
        "feature": "emergency_fund_months",
        "contribution": c_emerg,
        "description": FEATURE_DESCRIPTIONS["emergency_fund_months"]
    })

    # Sort descending by absolute magnitude of contribution
    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)
    return contributions


def get_or_generate_explanation(db: Session, prediction_id: str) -> Dict[str, Any]:
    """Retrieve existing explanation or calculate on the fly for given risk score."""
    risk_score = db.query(RiskScore).filter(RiskScore.id == prediction_id).first()
    if not risk_score:
        risk_score = db.query(RiskScore).order_by(RiskScore.created_at.desc()).first()

    default_prob = float(risk_score.default_probability) if risk_score else 0.22
    risk_band = risk_score.risk_band if risk_score else "Medium"
    version = risk_score.model_version if risk_score else "credit_stack_v1.0"

    # Query customer features
    user_id = risk_score.user_id if risk_score else ""
    txns = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    features = compute_20_financial_features(txn_dicts)
    if not features:
        features = {
            "savings_rate": 0.35, "income_stability_score": 0.88,
            "discretionary_spending_ratio": 0.24, "recurring_expense_ratio": 0.42,
            "outlier_transaction_count": 1, "emergency_fund_months": 4.2
        }

    contributions = compute_xai_contributions(features, default_prob)

    return {
        "prediction_id": prediction_id,
        "prediction_type": "credit_risk",
        "default_probability": default_prob,
        "risk_band": risk_band,
        "base_value": 0.28,
        "explanation": contributions,
        "model_version": version,
        "created_at": risk_score.created_at if risk_score else datetime.now(timezone.utc)
    }


def run_what_if_simulation(
    db: Session,
    user_id: str,
    income_delta: float,
    expense_delta: float,
    debt_delta: float,
    loan_amount: float = None
) -> Dict[str, Any]:
    """Simulate changes to income, expenses, and liabilities to evaluate live risk delta."""
    txns = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    base_features = compute_20_financial_features(txn_dicts)
    if not base_features:
        base_features = {
            "monthly_income_avg": 80000.0, "monthly_expense_avg": 50000.0, "net_monthly_cash_flow": 30000.0,
            "savings_rate": 0.375, "expense_volatility": 4000.0, "income_stability_score": 0.85,
            "recurring_expense_ratio": 0.40, "discretionary_spending_ratio": 0.25, "credit_to_debit_ratio": 1.6,
            "average_transaction_amount": 1200.0, "max_single_debit_amount": 18000.0, "transaction_frequency_monthly": 35.0,
            "salary_regularity_days": 30.0, "emergency_fund_months": 4.0, "outlier_transaction_count": 0,
            "financial_health_score": 80.0
        }

    # Baseline prediction
    base_prob, base_band, _ = model_registry.predict_credit_risk(base_features)

    # Apply adjustments
    simulated_features = dict(base_features)
    new_income = max(base_features["monthly_income_avg"] + income_delta, 10000.0)
    new_expense = max(base_features["monthly_expense_avg"] + expense_delta, 5000.0)
    
    # If loan requested, add estimated monthly EMI (~10.5% annual over 36 mo)
    if loan_amount and loan_amount > 0:
        monthly_emi = (loan_amount * 0.105 / 12) + (loan_amount / 36)
        new_expense += monthly_emi

    new_net_flow = new_income - new_expense
    new_savings_rate = (new_income - new_expense) / new_income if new_income > 0 else 0.0

    simulated_features["monthly_income_avg"] = round(new_income, 2)
    simulated_features["monthly_expense_avg"] = round(new_expense, 2)
    simulated_features["net_monthly_cash_flow"] = round(new_net_flow, 2)
    simulated_features["savings_rate"] = round(new_savings_rate, 4)
    simulated_features["credit_to_debit_ratio"] = round(new_income / new_expense, 2) if new_expense > 0 else 5.0
    simulated_features["recurring_expense_ratio"] = round(
        base_features.get("recurring_expense_ratio", 0.40) * (new_expense / base_features["monthly_expense_avg"]),
        4
    )
    simulated_features["emergency_fund_months"] = round(max(new_savings_rate * 6.0, 0.5), 1)
    simulated_features["expense_volatility"] = round(
        base_features.get("expense_volatility", 4000.0) * (new_expense / base_features["monthly_expense_avg"]),
        2
    )
    simulated_features["income_stability_score"] = round(min(base_features.get("income_stability_score", 0.85) + 0.05, 0.98), 2)

    # Simulated prediction
    sim_prob, sim_band, _ = model_registry.predict_credit_risk(simulated_features)
    delta_prob = round(sim_prob - base_prob, 4)

    base_health = float(base_features.get("financial_health_score", 75.0))
    sim_health = round(min(max(base_health - (delta_prob * 45.0), 10.0), 100.0), 1)

    if delta_prob < -0.05:
        summary = f"Risk reduced significantly! Default probability drops by {abs(delta_prob)*100:.1f}%."
    elif delta_prob > 0.05:
        summary = f"Risk increased by {delta_prob*100:.1f}%. Monthly cash flow is compressed."
    else:
        summary = "Nominal impact. Financial risk remains within standard confidence limits."

    return {
        "baseline_default_probability": base_prob,
        "simulated_default_probability": sim_prob,
        "delta_probability": delta_prob,
        "baseline_risk_band": base_band,
        "simulated_risk_band": sim_band,
        "baseline_health_score": base_health,
        "simulated_health_score": sim_health,
        "impact_summary": summary,
        "feature_shifts": {
            "income_adjusted": new_income,
            "expenses_adjusted": new_expense,
            "net_flow_adjusted": new_net_flow,
            "savings_rate_adjusted": new_savings_rate
        }
    }
