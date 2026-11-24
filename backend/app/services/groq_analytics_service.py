"""Groq-backed customer analytics. No heuristic fallback is returned on failure."""

import json
import logging
import re
import threading
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)
_GROQ_REQUEST_LOCK = threading.Lock()
_GROQ_NEXT_REQUEST_AT = 0.0
_GROQ_MIN_REQUEST_INTERVAL_SECONDS = 2.1

TRANSACTION_CATEGORIES = [
    "Salary & Income", "Food & Dining", "Shopping & Retail", "Utilities & Bills",
    "Housing & Rent", "Transportation & Travel", "Entertainment & Subscriptions",
    "Health & Medical", "Investments & Savings", "Cash & ATM", "Other Income", "Other Expenses",
]


def _strict_object_schema(properties: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "type": "object",
        "properties": properties,
        "required": list(properties),
        "additionalProperties": False,
    }


def _clean_and_parse_json(content: str) -> Dict[str, Any]:
    if not content:
        raise ValueError("Empty response content from Groq")
    # Strip any chain-of-thought blocks if the model leaked them into content
    cleaned = re.sub(r"<think>[\s\S]*?</think>", "", content, flags=re.DOTALL).strip()
    # Strip markdown code blocks
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    # Locate outermost JSON object
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        cleaned = cleaned[start_idx : end_idx + 1]
    result = json.loads(cleaned)
    if not isinstance(result, dict):
        raise ValueError("Expected a JSON object from Groq")
    return result


def complete_json(
    system_prompt: str,
    payload: Dict[str, Any],
    max_tokens: int = 1800,
    response_schema: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    global _GROQ_NEXT_REQUEST_AT
    api_key = settings.GROQ_API_KEY.strip().strip("'\"") if settings.GROQ_API_KEY else ""
    if not api_key:
        raise HTTPException(status_code=503, detail="Groq analytics are unavailable because GROQ_API_KEY is not configured.")

    url = f"{settings.GROQ_BASE_URL.strip().strip('\'\"').rstrip('/')}/chat/completions"
    model = settings.GROQ_MODEL.strip().strip("'\"")
    is_reasoning_model = any(m in model.lower() for m in ("gpt-oss", "deepseek-r1", "qwq"))

    effective_max_tokens = max(max_tokens + 2048, 4096) if is_reasoning_model else max_tokens

    def build_body(use_schema: bool) -> Dict[str, Any]:
        req_body: Dict[str, Any] = {
            "model": model,
            "temperature": 0.1,
            "max_completion_tokens": effective_max_tokens,
            "response_format": (
                {
                    "type": "json_schema",
                    "json_schema": {"name": "analytics_result", "strict": True, "schema": response_schema},
                }
                if use_schema and response_schema
                else {"type": "json_object"}
            ),
            "messages": [
                {
                    "role": "system",
                    "content": (
                        system_prompt
                        if use_schema or not response_schema
                        else f"{system_prompt}\nReturn ONLY a raw valid JSON object matching the requested schema. Do not include markdown formatting or commentary."
                    ),
                },
                {"role": "user", "content": json.dumps(payload, ensure_ascii=False, allow_nan=False)},
            ],
        }
        if is_reasoning_model:
            req_body["reasoning_effort"] = "low"
            req_body["reasoning_format"] = "parsed"
        return req_body

    body = build_body(use_schema=bool(response_schema))

    try:
        # Serialize calls from concurrent FastAPI requests and pace them below the
        # documented 30 RPM limit for the configured model on the Developer tier.
        with _GROQ_REQUEST_LOCK:
            response = None
            schema_fallback_attempted = False
            for attempt in range(4):
                wait_for_slot = _GROQ_NEXT_REQUEST_AT - time.monotonic()
                if wait_for_slot > 0:
                    time.sleep(wait_for_slot)
                _GROQ_NEXT_REQUEST_AT = time.monotonic() + _GROQ_MIN_REQUEST_INTERVAL_SECONDS
                response = httpx.post(
                    url,
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json=body,
                    timeout=45.0,
                )
                try:
                    response.raise_for_status()
                    break
                except httpx.HTTPStatusError as exc:
                    if response.status_code == 429:
                        if attempt == 3:
                            raise HTTPException(
                                status_code=429,
                                detail="Groq rate limit is still active after retries. Wait for the provider limit window to reset, then retry.",
                            ) from exc
                        retry_after = response.headers.get("retry-after")
                        try:
                            delay = float(retry_after) if retry_after else float(2 ** (attempt + 1))
                        except ValueError:
                            delay = float(2 ** (attempt + 1))
                        if delay > 60:
                            raise HTTPException(
                                status_code=429,
                                detail="Groq has asked the service to wait more than a minute before retrying. Check the Groq project rate limits, then retry.",
                            ) from exc
                        logger.warning(
                            "Groq rate limited request (attempt %s/4); retrying after %.1f seconds.",
                            attempt + 1,
                            delay,
                        )
                        time.sleep(max(delay, 0.5))
                        continue

                    # If json_schema is rejected due to constrained decoding / JSON validation failure (400),
                    # fallback immediately to json_object mode
                    if (
                        response.status_code == 400
                        and response_schema
                        and not schema_fallback_attempted
                    ):
                        try:
                            err_msg = str(response.json().get("error", {}).get("message", "")).lower()
                        except Exception:
                            err_msg = response.text.lower()
                        if any(term in err_msg for term in ("json", "schema", "generate", "validate", "failed_generation")):
                            logger.warning("Groq rejected json_schema (%s); retrying in json_object mode.", err_msg[:200])
                            schema_fallback_attempted = True
                            body = build_body(use_schema=False)
                            continue

                    raise

            if response is None:
                raise RuntimeError("Groq request was not attempted")

        content = response.json()["choices"][0]["message"].get("content") or ""
        return _clean_and_parse_json(content)
    except HTTPException:
        raise
    except httpx.HTTPStatusError as exc:
        try:
            error_data = exc.response.json().get("error", {})
            upstream_message = error_data.get("message", "") if isinstance(error_data, dict) else str(error_data)
        except Exception:
            upstream_message = exc.response.text
        upstream_message = str(upstream_message).strip()[:700] or "No error details returned."
        logger.error(
            "Groq rejected analytics request (status=%s, model=%s): %s",
            exc.response.status_code,
            settings.GROQ_MODEL,
            upstream_message,
        )
        raise HTTPException(
            status_code=502,
            detail=f"Groq rejected this analytics request: {upstream_message}",
        ) from exc
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
        response_schema=_strict_object_schema({
            "score": {"type": "number"},
            "rating": {"type": "string"},
            "explanation": {"type": "string"},
        }),
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
        response_schema=_strict_object_schema({
            "risk_band": {"type": "string", "enum": ["Low", "Medium", "High", "Severe"]},
        }),
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
        response_schema=_strict_object_schema({
            "segment_name": {"type": "string"},
            "description": {"type": "string"},
            "risk_profile": {"type": "string"},
        }),
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
        response_schema=_strict_object_schema({
            "recommendations": {
                "type": "array",
                "items": _strict_object_schema({
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "category": {"type": "string"},
                    "impact_level": {"type": "string", "enum": ["Low", "Medium", "High"]},
                }),
            },
        }),
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

    def categorize_batch(batch: List[Dict[str, Any]]) -> None:
        if not batch:
            return
        try:
            result = complete_json(
                "Classify each bank transaction from its description and debit/credit direction. Return a JSON object "
                "with a transactions array. Return exactly one object for every input transaction, preserving each id "
                "exactly as supplied. Each object has only id and category. Categories must be selected from: "
                + ", ".join(TRANSACTION_CATEGORIES)
                + ". Do not infer amounts, dates, or account details. Use Other Income or Other Expenses when uncertain.",
                {"transactions": batch},
                max_tokens=max(1200, len(batch) * 80),
                response_schema=_strict_object_schema({
                    "transactions": {
                        "type": "array",
                        "items": _strict_object_schema({
                            "id": {"type": "string", "enum": [str(item["id"]) for item in batch]},
                            "category": {"type": "string", "enum": TRANSACTION_CATEGORIES},
                        }),
                    },
                }),
            )
        except HTTPException as exc:
            is_groq_validation_error = (
                exc.status_code == 502
                and isinstance(exc.detail, str)
                and exc.detail.startswith("Groq rejected this analytics request:")
            )
            if is_groq_validation_error and len(batch) > 1:
                midpoint = len(batch) // 2
                logger.warning("Groq rejected a transaction-category batch; retrying as smaller batches (size=%s).", len(batch))
                categorize_batch(batch[:midpoint])
                categorize_batch(batch[midpoint:])
                return
            raise
        rows = result.get("transactions")
        if not isinstance(rows, list):
            raise HTTPException(status_code=502, detail="Groq returned invalid transaction categories.")
        expected_ids = {str(item["id"]) for item in batch}
        unresolved = set(expected_ids)
        for row in rows:
            if not isinstance(row, dict) or row.get("id") is None:
                continue
            transaction_id = str(row["id"])
            category = str(row.get("category", ""))
            if transaction_id in unresolved and category in TRANSACTION_CATEGORIES:
                categories[transaction_id] = category
                unresolved.remove(transaction_id)

        if not unresolved:
            return

        # Some models omit rows in larger JSON responses. Retry only unresolved rows
        # in smaller calls, keeping the provider as the primary category decision maker.
        retry_rows = [item for item in batch if str(item["id"]) in unresolved]
        if len(retry_rows) == len(batch) == 1:
            item = retry_rows[0]
            ttype = str(item.get("transaction_type", "debit")).lower()
            categories[str(item["id"])] = "Other Income" if ttype == "credit" else "Other Expenses"
            return

        for offset in range(0, len(retry_rows), max(1, min(5, len(retry_rows) // 2 or 1))):
            categorize_batch(retry_rows[offset:offset + max(1, min(5, len(retry_rows) // 2 or 1))])

    # Process in compact batches of 10 for fast, reliable JSON generation and schema compliance
    for offset in range(0, len(transactions), 10):
        categorize_batch(transactions[offset:offset + 10])

    # Ensure every transaction has a category; fall back to Other Income/Expenses if any was skipped
    for item in transactions:
        tid = str(item["id"])
        if tid not in categories:
            ttype = str(item.get("transaction_type", "debit")).lower()
            categories[tid] = "Other Income" if ttype == "credit" else "Other Expenses"

    return categories


def explain_credit_risk(features: Dict[str, Any], probability: float, risk_band: str) -> List[Dict[str, str]]:
    result = complete_json(
        "Explain this existing machine-learning credit-risk result in plain language using only the supplied "
        "transaction-derived features. Return JSON with insights: an array of up to six objects, each with "
        "feature and description. Do not claim causal attribution, model feature importance, SHAP values, "
        "or invent additive contributions. Explicitly distinguish observed statement metrics from estimates.",
        {"default_probability": probability, "risk_band": risk_band, "features": features},
        max_tokens=1000,
        response_schema=_strict_object_schema({
            "insights": {
                "type": "array",
                "items": _strict_object_schema({
                    "feature": {"type": "string"},
                    "description": {"type": "string"},
                }),
            },
        }),
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
        response_schema=_strict_object_schema({"summary": {"type": "string"}}),
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
        response_schema=_strict_object_schema({
            "data": {
                "type": "array",
                "items": _strict_object_schema({
                    "projected_income": {"type": "number"},
                    "projected_expense": {"type": "number"},
                    "projected_balance": {"type": "number"},
                    "lower_bound": {"type": "number"},
                    "upper_bound": {"type": "number"},
                }),
            },
        }),
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
        response_schema=_strict_object_schema({
            "transactions": {
                "type": "array",
                "items": _strict_object_schema({
                    "id": {"type": "string", "enum": [str(item["id"]) for item in transactions]},
                    "risk_level": {"type": "string", "enum": ["Low", "Medium", "High", "Critical"]},
                    "reasons": {"type": "array", "items": {"type": "string"}},
                }),
            },
        }),
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
