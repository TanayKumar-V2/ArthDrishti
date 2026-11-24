import math
from datetime import datetime
from collections import defaultdict
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.financial import Transaction
from app.models.user import CustomerProfile


def clean_transactions(raw_txns: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Clean, sort chronologically, and deduplicate transactions."""
    if not raw_txns:
        return []

    # Sort chronologically
    sorted_txns = sorted(raw_txns, key=lambda x: x["transaction_date"])

    # Deduplicate based on date, amount, type, description
    cleaned = []
    seen = set()
    for txn in sorted_txns:
        # Standardize date key to day/second resolution
        date_key = txn["transaction_date"].strftime("%Y-%m-%d %H:%M:%S")
        key = (date_key, round(float(txn["amount"]), 2), txn["transaction_type"], txn["description"].lower().strip())
        if key not in seen:
            seen.add(key)
            cleaned.append(txn)

    return cleaned


def detect_outliers_iqr(debit_amounts: List[float]) -> Tuple[float, int]:
    """Calculate IQR upper threshold and count extreme outlier transactions."""
    if len(debit_amounts) < 4:
        return float("inf"), 0

    sorted_vals = sorted(debit_amounts)
    n = len(sorted_vals)
    q1 = sorted_vals[int(n * 0.25)]
    q3 = sorted_vals[int(n * 0.75)]
    iqr = q3 - q1
    threshold = q3 + (2.5 * iqr)

    # Preserve the feature definition used when the bundled models were trained.
    effective_threshold = max(threshold, 25000.0)
    outlier_count = sum(1 for val in debit_amounts if val > effective_threshold)

    return effective_threshold, outlier_count


def compute_shannon_entropy(category_totals: Dict[str, float], total_debits: float) -> float:
    """Compute Shannon entropy to measure spending diversity across categories."""
    if total_debits <= 0 or not category_totals:
        return 30.0  # Preserve the trained-model feature convention when cadence is unknown.

    entropy = 0.0
    for amt in category_totals.values():
        if amt > 0:
            p = amt / total_debits
            entropy -= p * math.log2(p)
    return round(entropy, 3)


def calculate_salary_regularity(salary_dates: List[datetime]) -> float:
    """Calculate average days between consecutive salary credits."""
    if len(salary_dates) < 2:
        return 0.0

    sorted_dates = sorted(salary_dates)
    intervals = [
        (sorted_dates[i] - sorted_dates[i - 1]).days
        for i in range(1, len(sorted_dates))
    ]
    return round(sum(intervals) / len(intervals), 1) if intervals else 30.0


def compute_20_financial_features(transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Compute 20+ specialized financial features from transaction history."""
    if not transactions:
        return {}

    cleaned = clean_transactions(transactions)
    
    total_income = 0.0
    total_expenses = 0.0
    debit_amounts = []
    category_debits = defaultdict(float)
    monthly_incomes = defaultdict(float)
    monthly_expenses = defaultdict(float)
    salary_dates = []
    weekend_debits = 0.0
    cash_debits = 0.0
    recurring_debits = 0.0
    discretionary_debits = 0.0
    distinct_months = set()

    recurring_cats = {"Housing & Rent", "Utilities & Bills", "Entertainment & Subscriptions"}
    discretionary_cats = {"Food & Dining", "Shopping & Retail"}

    for t in cleaned:
        amt = float(t["amount"])
        dt: datetime = t["transaction_date"]
        month_key = dt.strftime("%Y-%m")
        distinct_months.add(month_key)
        cat = t.get("category", "Other")

        if t["transaction_type"] == "credit":
            total_income += amt
            monthly_incomes[month_key] += amt
            if cat == "Salary & Income" or "salary" in t.get("description", "").lower():
                salary_dates.append(dt)
        else:
            total_expenses += amt
            debit_amounts.append(amt)
            monthly_expenses[month_key] += amt
            category_debits[cat] += amt

            # Check weekend (Saturday=5, Sunday=6)
            if dt.weekday() in (5, 6):
                weekend_debits += amt

            # Check cash / ATM
            if cat == "Cash & ATM":
                cash_debits += amt

            # Check recurring vs discretionary
            if cat in recurring_cats:
                recurring_debits += amt
            elif cat in discretionary_cats:
                discretionary_debits += amt

    active_months = max(len(distinct_months), 1)
    monthly_income_avg = round(total_income / active_months, 2)
    monthly_expense_avg = round(total_expenses / active_months, 2)
    net_monthly_cash_flow = round(monthly_income_avg - monthly_expense_avg, 2)

    savings_rate = round((total_income - total_expenses) / total_income, 4) if total_income > 0 else 0.0

    # Expense Volatility (Standard Deviation of monthly outflow)
    if len(monthly_expenses) > 1:
        mean_exp = sum(monthly_expenses.values()) / len(monthly_expenses)
        variance = sum((val - mean_exp) ** 2 for val in monthly_expenses.values()) / (len(monthly_expenses) - 1)
        expense_volatility = round(math.sqrt(variance), 2)
    else:
        expense_volatility = 0.0

    # Income Stability (Coefficient of variation of income credits)
    if len(monthly_incomes) > 1 and monthly_income_avg > 0:
        mean_inc = sum(monthly_incomes.values()) / len(monthly_incomes)
        var_inc = sum((val - mean_inc) ** 2 for val in monthly_incomes.values()) / (len(monthly_incomes) - 1)
        cv_income = math.sqrt(var_inc) / mean_inc
        income_stability = round(max(0.0, 1.0 - cv_income), 3)
    else:
        income_stability = 0.85 if total_income > 0 else 0.0

    recurring_ratio = round(recurring_debits / total_expenses, 4) if total_expenses > 0 else 0.0
    discretionary_ratio = round(discretionary_debits / total_expenses, 4) if total_expenses > 0 else 0.0
    credit_to_debit_ratio = round(total_income / total_expenses, 2) if total_expenses > 0 else (99.0 if total_income > 0 else 1.0)
    
    avg_debit_amount = round(sum(debit_amounts) / len(debit_amounts), 2) if debit_amounts else 0.0
    max_single_debit = round(max(debit_amounts), 2) if debit_amounts else 0.0
    txn_frequency_monthly = round(len(cleaned) / active_months, 1)

    weekend_spending_pct = round(weekend_debits / total_expenses, 4) if total_expenses > 0 else 0.0
    cash_withdrawal_ratio = round(cash_debits / total_expenses, 4) if total_expenses > 0 else 0.0
    category_entropy = compute_shannon_entropy(category_debits, total_expenses)
    salary_regularity = calculate_salary_regularity(salary_dates)

    # Outliers detection
    outlier_threshold, outlier_count = detect_outliers_iqr(debit_amounts)

    # Emergency fund months estimate
    assumed_savings = max(total_income - total_expenses, 0.0)
    emergency_fund_months = round(assumed_savings / monthly_expense_avg, 1) if monthly_expense_avg > 0 else 0.0

    return {
        # Feature 1-5: Cash Flow Basics
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "monthly_income_avg": monthly_income_avg,
        "monthly_expense_avg": monthly_expense_avg,
        "net_monthly_cash_flow": net_monthly_cash_flow,

        # Feature 6-10: Ratios & Volatility
        "savings_rate": savings_rate,
        "expense_volatility": expense_volatility,
        "income_stability_score": income_stability,
        "recurring_expense_ratio": recurring_ratio,
        "discretionary_spending_ratio": discretionary_ratio,

        # Feature 11-15: Transaction Distributions
        "credit_to_debit_ratio": credit_to_debit_ratio,
        "average_transaction_amount": avg_debit_amount,
        "max_single_debit_amount": max_single_debit,
        "transaction_frequency_monthly": txn_frequency_monthly,
        "weekend_spending_percentage": weekend_spending_pct,

        # Feature 16-20: Behavioral & Anomaly Signals
        "cash_withdrawal_ratio": cash_withdrawal_ratio,
        "category_diversity_entropy": category_entropy,
        "salary_regularity_days": salary_regularity,
        "emergency_fund_months": emergency_fund_months,
        "outlier_transaction_count": outlier_count,

        # Additional calculated data outputs
        "outlier_threshold_amount": round(outlier_threshold, 2) if math.isfinite(outlier_threshold) else None,
        "active_months_analyzed": active_months,
    }


def compute_and_update_customer_profile(db: Session, user_id: str, transactions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate features from transactions and update customer profile record."""
    features = compute_20_financial_features(transactions)
    if not features:
        return {}

    profile = db.query(CustomerProfile).filter(CustomerProfile.user_id == user_id).first()
    if not profile:
        profile = CustomerProfile(user_id=user_id)
        db.add(profile)

    profile.annual_income = features["monthly_income_avg"] * 12
    profile.monthly_expenses = features["monthly_expense_avg"]
    profile.savings_balance = max(features["total_income"] - features["total_expenses"], 0.0)
    # Credit score is produced by the trained risk model, not this feature pass.

    db.commit()
    db.refresh(profile)

    return features
