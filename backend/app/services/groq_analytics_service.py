"""Groq-backed customer analytics. No heuristic fallback is returned on failure."""

import json
import logging
from typing import Any, Dict, List

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)

TRANSACTION_CATEGORIES = [
    "Salary & Income", "Food & Dining", "Shopping & Retail", "Utilities & Bills",
    "Housing & Rent", "Transportation & Travel", "Entertainment & Subscriptions",
    "Health & Medical", "Investments & Savings", "Cash & ATM", "Other Income", "Other Expenses",
]


def complete_json(system_prompt: str, payload: Dict[str, Any], max_tokens: int = 1800) -> Dict[str, Any]:
    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""
    if not api_key:
        raise HTTPException(status_code=503, detail="Groq analytics are unavailable because GROQ_API_KEY is not configured.")

    url = f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions"
    body = {
        "model": settings.GROQ_MODEL,
        "temperature": 0.1,
        "max_tokens": max_tokens,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False, allow_nan=False)},
        ],
    }
    try:
        response = httpx.post(
            url,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json=body,
            timeout=45.0,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        result = json.loads(content)
        if not isinstance(result, dict):
            raise ValueError("Expected a JSON object")
        return result
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Groq analytics request failed")
        raise HTTPException(status_code=502, detail="Groq could not complete this analysis. Please retry.") from exc


def assess_financial_health(features: Dict[str, Any]) -> Dict[str, Any]:
    result = complete_json(
        "Assess the customer's financial health from the supplied parsed-statement metrics. Return JSON with "
        "score (number 0-100), rating (short string), and explanation (one concise paragraph). This is an "
        "AI estimate, not a lending decision. Do not infer account balances, bureau data, or facts absent from input.",
        {"metrics": features},
        max_tokens=450,
    )
    try:
        score = float(result["score"])
        rating = str(result["rating"]).strip()
        explanation = str(result["explanation"]).strip()
        if not 0 <= score <= 100 or not rating or not explanation:
            raise ValueError("Invalid health assessment")
        return {"score": round(score, 1), "rating": rating, "explanation": explanation}
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Groq returned an invalid financial-health assessment.") from exc


def classify_credit_risk(probability: float, features: Dict[str, Any]) -> str:
    result = complete_json(
        "Interpret the supplied trained-model default probability and transaction metrics as a customer-facing "
        "risk band. Return JSON with risk_band, selected from Low, Medium, High, or Severe. Do not change or "
        "recalculate the supplied model probability; this is a qualitative interpretation, not a lending decision.",
        {"trained_model_default_probability": probability, "transaction_metrics": features},
        max_tokens=150,
    )
    band = str(result.get("risk_band", "")).title()
    if band not in {"Low", "Medium", "High", "Severe"}:
        raise HTTPException(status_code=502, detail="Groq returned an invalid credit-risk interpretation.")
    return band


def describe_customer_segment(cluster_id: int, features: Dict[str, Any]) -> Dict[str, Any]:
    result = complete_json(
        "Describe the behavioral customer segment indicated by this trained KMeans cluster and its transaction "
        "metrics. Return JSON with segment_name, description, and risk_profile. The cluster ID comes from the "
        "trained model; do not infer facts absent from the supplied metrics.",
        {"trained_model_cluster_id": cluster_id, "transaction_metrics": features},
        max_tokens=300,
    )
    name = str(result.get("segment_name", "")).strip()
    description = str(result.get("description", "")).strip()
    profile = str(result.get("risk_profile", "")).strip()
    if not name or not description or not profile:
        raise HTTPException(status_code=502, detail="Groq returned an invalid customer-segment description.")
    return {"name": name[:100], "description": description[:500], "risk_profile": profile[:100]}


def generate_recommendations(features: Dict[str, Any]) -> List[Dict[str, str]]:
    result = complete_json(
        "Generate up to five practical, personalized financial recommendations using only the supplied "
        "parsed-transaction metrics. Return JSON with a recommendations array; each item has title, "
        "description, category, and impact_level (Low, Medium, or High). Do not promise investment returns, "
        "invent balances/debts, or return generic advice unsupported by the metrics.",
        {"metrics": features},
        max_tokens=1100,
    )
    recommendations = result.get("recommendations")
    if not isinstance(recommendations, list):
        raise HTTPException(status_code=502, detail="Groq returned invalid recommendations.")
    cleaned = []
    for item in recommendations[:5]:
        if not isinstance(item, dict):
            continue
        title, description = str(item.get("title", "")).strip(), str(item.get("description", "")).strip()
        if not title or not description:
            continue
        impact = str(item.get("impact_level", "")).title()
        if impact not in {"Low", "Medium", "High"}:
            raise HTTPException(status_code=502, detail="Groq returned an invalid recommendation priority.")
        cleaned.append({
            "title": title[:160],
            "description": description[:1200],
            "category": str(item.get("category", "General"))[:60],
            "impact_level": impact,
        })
    return cleaned


def categorize_transactions(transactions: List[Dict[str, Any]]) -> Dict[str, str]:
    """Classify merchant descriptions with Groq rather than keyword rules."""
    categories: Dict[str, str] = {}
    for offset in range(0, len(transactions), 60):
        batch = transactions[offset:offset + 60]
        result = complete_json(
            "Classify each bank transaction from its description and debit/credit direction. Return JSON with "
            "transactions array containing every supplied id and category. Categories must be selected from: "
            + ", ".join(TRANSACTION_CATEGORIES)
            + ". Do not infer amounts, dates, or account details. Use Other Income or Other Expenses when uncertain.",
            {"transactions": batch},
            max_tokens=2200,
        )
        rows = result.get("transactions")
        if not isinstance(rows, list):
            raise HTTPException(status_code=502, detail="Groq returned invalid transaction categories.")
        for row in rows:
            if isinstance(row, dict) and row.get("id"):
                category = str(row.get("category", ""))
                if category not in TRANSACTION_CATEGORIES:
                    raise HTTPException(status_code=502, detail="Groq returned an unsupported transaction category.")
                categories[str(row["id"])] = category
        if any(str(item["id"]) not in categories for item in batch):
            raise HTTPException(status_code=502, detail="Groq did not categorize every transaction.")
    return categories


def explain_credit_risk(features: Dict[str, Any], probability: float, risk_band: str) -> List[Dict[str, str]]:
    result = complete_json(
        "Explain this existing machine-learning credit-risk result in plain language using only the supplied "
        "transaction-derived features. Return JSON with insights: an array of up to six objects, each with "
        "feature and description. Do not claim causal attribution, model feature importance, SHAP values, "
        "or invent additive contributions. Explicitly distinguish observed statement metrics from estimates.",
        {"default_probability": probability, "risk_band": risk_band, "features": features},
        max_tokens=1000,
    )
    insights = result.get("insights")
    if not isinstance(insights, list):
        raise HTTPException(status_code=502, detail="Groq returned an invalid credit-risk explanation.")
    return [
        {"feature": str(item.get("feature", "Financial profile"))[:100],
         "description": str(item.get("description", "")).strip()[:1000]}
        for item in insights[:6]
        if isinstance(item, dict) and str(item.get("description", "")).strip()
    ]


def explain_what_if(payload: Dict[str, Any]) -> str:
    result = complete_json(
        "Explain the supplied machine-learning what-if comparison in plain language. Return JSON with "
        "summary as a concise paragraph. Refer to the supplied model probabilities and scenario values "
        "without inventing causes or guaranteeing outcomes.",
        payload,
        max_tokens=350,
    )
    summary = str(result.get("summary", "")).strip()
    if not summary:
        raise HTTPException(status_code=502, detail="Groq returned an empty scenario explanation.")
    return summary[:1200]


def generate_forecast_values(features: Dict[str, Any], horizon: str, dates: List[str], starting_net_flow: float) -> List[Dict[str, float]]:
    result = complete_json(
        "Create an uncertain cash-flow projection from the supplied historical transaction aggregates. "
        "Return JSON with a data array containing exactly one item per supplied date, in the same order. "
        "Each item must contain projected_income, projected_expense, projected_balance, lower_bound, "
        "upper_bound, all finite non-negative numbers except projected_balance may be negative. Use the "
        "starting net-flow figure only as a cumulative reference, never describe it as an observed bank balance. "
        "Do not assume specific salary dates or bills unless supported by the supplied metrics.",
        {"horizon": horizon, "dates": dates, "starting_net_flow_reference": starting_net_flow, "metrics": features},
        max_tokens=3200,
    )
    values = result.get("data")
    if not isinstance(values, list) or len(values) != len(dates):
        raise HTTPException(status_code=502, detail="Groq returned an incomplete cash-flow projection.")
    output = []
    try:
        for date, item in zip(dates, values):
            point = {key: float(item[key]) for key in ("projected_income", "projected_expense", "projected_balance", "lower_bound", "upper_bound")}
            if any(not (-1e12 < value < 1e12) for value in point.values()):
                raise ValueError("Forecast value out of bounds")
            if point["projected_income"] < 0 or point["projected_expense"] < 0:
                raise ValueError("Negative income or expense")
            point["date"] = date
            output.append(point)
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=502, detail="Groq returned invalid cash-flow values.") from exc
    return output


def interpret_fraud_anomalies(transactions: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    if not transactions:
        return {}
    result = complete_json(
        "Review transaction anomaly scores already produced by an Isolation Forest model. Return JSON with "
        "transactions array; for every supplied id return id, risk_level (Low, Medium, High, Critical), and "
        "reasons (array of short strings). Use the anomaly score and transaction context; do not state that a "
        "transaction is fraud. Treat this as triage for human review, not a rule or final finding.",
        {"transactions": transactions},
        max_tokens=min(3500, 250 + len(transactions) * 70),
    )
    rows = result.get("transactions")
    if not isinstance(rows, list):
        raise HTTPException(status_code=502, detail="Groq returned invalid fraud-triage results.")
    by_id: Dict[str, Dict[str, Any]] = {}
    allowed = {"Low", "Medium", "High", "Critical"}
    for item in rows:
        if not isinstance(item, dict) or not item.get("id"):
            continue
        level = str(item.get("risk_level", "")).title()
        if level not in allowed or not isinstance(item.get("reasons"), list):
            raise HTTPException(status_code=502, detail="Groq returned invalid fraud-triage details.")
        reasons = item.get("reasons", [])
        by_id[str(item["id"])] = {
            "risk_level": level,
            "reasons": [str(reason)[:400] for reason in reasons[:4]] if isinstance(reasons, list) else [],
        }
    if any(str(row["id"]) not in by_id for row in transactions):
        raise HTTPException(status_code=502, detail="Groq did not return triage for every anomaly.")
    return by_id
