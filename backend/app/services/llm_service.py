import logging
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.financial import Loan, Transaction
from app.models.ml import CustomerSegment, FraudAlert, RiskScore
from app.services.feature_engineering_service import compute_20_financial_features

logger = logging.getLogger(__name__)


def get_user_financial_context(db: Session, user_id: str) -> Dict[str, Any]:
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).order_by(
        desc(Transaction.transaction_date)
    ).limit(100).all()
    txn_data = [
        {"transaction_date": txn.transaction_date, "amount": float(txn.amount),
         "transaction_type": txn.transaction_type, "category": txn.category,
         "description": txn.description}
        for txn in transactions
    ]
    features = compute_20_financial_features(txn_data) if txn_data else {}

    risk = None
    health = None
    if features:
        from app.services.prediction_service import evaluate_customer_credit_risk
        evaluation = evaluate_customer_credit_risk(db, user_id)
        health = {"score": evaluation["financial_health_score"], "rating": evaluation["financial_health_rating"]}
        risk = db.query(RiskScore).filter(RiskScore.user_id == user_id).order_by(desc(RiskScore.created_at)).first()
    segment = db.query(CustomerSegment).filter(CustomerSegment.user_id == user_id).order_by(
        desc(CustomerSegment.created_at)
    ).first()

    loans = db.query(Loan).filter(Loan.user_id == user_id).all()
    alerts = db.query(FraudAlert).filter(
        FraudAlert.user_id == user_id, FraudAlert.status == "unreviewed"
    ).all()
    return {
        "financial_health_score": float(risk.financial_health_score) if risk else (health["score"] if health else None),
        "financial_health_rating": health["rating"] if health else None,
        "credit_risk_band": risk.risk_band if risk else None,
        "default_probability_pct": round(float(risk.default_probability) * 100, 2) if risk else None,
        "customer_segment": segment.segment_name if segment else None,
        "savings_rate_pct": round(float(features.get("savings_rate", 0)) * 100, 1) if features else None,
        "emergency_fund_months": features.get("emergency_fund_months") if features else None,
        "discretionary_spend_ratio_pct": round(float(features["discretionary_spending_ratio"]) * 100, 1) if features else None,
        "recent_transaction_count": len(transactions),
        "total_active_loans": len([loan for loan in loans if loan.status == "approved"]),
        "pending_fraud_alerts": len(alerts),
        "available_transaction_metrics": features,
    }


async def generate_financial_advisor_response(
    db: Session,
    user_id: str,
    user_message: str,
    chat_history: Optional[List[Dict[str, str]]] = None,
) -> Dict[str, Any]:
    api_key = settings.GROQ_API_KEY.strip() if settings.GROQ_API_KEY else ""
    if not api_key:
        raise HTTPException(status_code=503, detail="AI Advisor is unavailable because GROQ_API_KEY is not configured.")

    context = get_user_financial_context(db, user_id)
    system_prompt = (
        "You are ArthDrishti's financial analysis advisor. Answer from the supplied account context only. "
        "Do not invent missing scores, balances, debts, or transaction facts. State when data is unavailable. "
        "Do not promise outcomes or present your response as a lending decision or professional financial advice. "
        f"Account context: {context}"
    )
    messages: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
    for item in (chat_history or [])[-6:]:
        content = str(item.get("text", "")).strip()
        if content:
            messages.append({"role": "assistant" if item.get("sender") != "user" else "user", "content": content})
    messages.append({"role": "user", "content": user_message})

    try:
        async with httpx.AsyncClient(timeout=35.0) as client:
            response = await client.post(
                f"{settings.GROQ_BASE_URL.rstrip('/')}/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": settings.GROQ_MODEL, "messages": messages, "temperature": 0.2, "max_tokens": 1024},
            )
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"].strip()
            if not content:
                raise ValueError("Groq returned an empty response")
    except Exception as exc:
        logger.exception("Groq AI Advisor request failed")
        raise HTTPException(status_code=502, detail="Groq could not answer this question. Please retry.") from exc
    return {"response": content, "model": settings.GROQ_MODEL, "source": "groq", "metrics": context}
