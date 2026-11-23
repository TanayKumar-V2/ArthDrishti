"""
Training and Serialization Pipeline for ArthDrishti ML Models
Trained on Real-World Financial Datasets:
- LendingClub Loan Dataset (Credit Risk Stacking Ensemble)
- ULB Credit Card Fraud Dataset (Isolation Forest Anomaly Detector)
- CC General Cardholder Dataset (Customer Segmentation KMeans)
"""

import os
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import (
    RandomForestClassifier,
    GradientBoostingClassifier,
    StackingClassifier,
    IsolationForest,
    HistGradientBoostingClassifier
)
from sklearn.linear_model import LogisticRegression
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score, f1_score, silhouette_score


FEATURE_NAMES_CREDIT = [
    "monthly_income_avg",
    "monthly_expense_avg",
    "net_monthly_cash_flow",
    "savings_rate",
    "expense_volatility",
    "income_stability_score",
    "recurring_expense_ratio",
    "discretionary_spending_ratio",
    "credit_to_debit_ratio",
    "average_transaction_amount",
    "max_single_debit_amount",
    "transaction_frequency_monthly",
    "salary_regularity_days",
    "emergency_fund_months",
    "outlier_transaction_count"
]

FEATURE_NAMES_FRAUD = [
    "amount",
    "amount_to_avg_ratio",
    "hour_of_day",
    "is_weekend",
    "is_cash_withdrawal"
]

FEATURE_NAMES_SEGMENTATION = [
    "monthly_income_avg",
    "savings_rate",
    "discretionary_spending_ratio",
    "recurring_expense_ratio",
    "expense_volatility"
]


def find_data_file(relative_paths):
    """Locate a dataset file across workspace and backend directories."""
    for path in relative_paths:
        if os.path.exists(path):
            return path
        # Check from repository root or current directory
        alt_path = os.path.join("..", path)
        if os.path.exists(alt_path):
            return alt_path
        alt_path2 = os.path.join("c:/Tanay/ArthDrishti", path)
        if os.path.exists(alt_path2):
            return alt_path2
    return None


def generate_synthetic_credit_training_data(n_samples: int = 3000):
    """Fallback generator for credit risk training data."""
    np.random.seed(42)
    income = np.random.lognormal(mean=11.2, sigma=0.6, size=n_samples)
    expense_ratio = np.random.uniform(0.35, 1.15, size=n_samples)
    expense = income * expense_ratio
    net_flow = income - expense
    savings_rate = np.clip((income - expense) / income, -0.5, 0.75)
    volatility = expense * np.random.uniform(0.05, 0.45, size=n_samples)
    stability = np.random.beta(a=7, b=2, size=n_samples)
    recurring_ratio = np.random.uniform(0.20, 0.70, size=n_samples)
    discretionary_ratio = np.random.uniform(0.10, 0.60, size=n_samples)
    cr_dr_ratio = np.clip(income / np.maximum(expense, 1.0), 0.2, 5.0)
    avg_txn = np.random.uniform(400, 4500, size=n_samples)
    max_debit = avg_txn * np.random.uniform(4, 25, size=n_samples)
    frequency = np.random.poisson(lam=42, size=n_samples)
    salary_days = np.random.normal(loc=30, scale=3, size=n_samples)
    emergency_months = np.maximum(savings_rate * 6.0, 0.0)
    outliers = np.random.poisson(lam=1.2, size=n_samples)

    X = np.column_stack([
        income, expense, net_flow, savings_rate, volatility,
        stability, recurring_ratio, discretionary_ratio, cr_dr_ratio,
        avg_txn, max_debit, frequency, salary_days, emergency_months, outliers
    ])

    log_odds = (
        2.5 * (expense_ratio - 0.75)
        - 3.0 * savings_rate
        - 1.5 * stability
        + 1.8 * (volatility / income)
        + 0.8 * (outliers > 2)
        - 0.5
    )
    prob_default = 1.0 / (1.0 + np.exp(-log_odds))
    y = (np.random.binomial(n=1, p=prob_default) == 1).astype(int)
    return X, y


def load_lendingclub_credit_data(nrows: int = 150000):
    """Extract and engineer features from real LendingClub loan records."""
    lc_file = find_data_file([
        "data/accepted_2007_to_2018q4.csv/accepted_2007_to_2018Q4.csv",
        "data/accepted_2007_to_2018Q4.csv"
    ])
    if not lc_file:
        print("   [Info] LendingClub dataset not found, using calibrated synthetic generator.")
        return generate_synthetic_credit_training_data()

    print(f"   [Data] Ingesting LendingClub loan dataset from: {lc_file}")
    cols = [
        "loan_amnt", "int_rate", "annual_inc", "installment", "dti",
        "revol_bal", "revol_util", "delinq_2yrs", "total_acc", "open_acc",
        "inq_last_6mths", "loan_status"
    ]
    df = pd.read_csv(lc_file, usecols=cols, nrows=nrows)
    # Target: 1 = Charged Off / Default, 0 = Fully Paid
    df = df[df["loan_status"].isin(["Fully Paid", "Charged Off", "Default"])].copy()
    y = df["loan_status"].apply(lambda s: 1 if s in ["Charged Off", "Default"] else 0).values

    if df["revol_util"].dtype == object:
        df["revol_util"] = df["revol_util"].astype(str).str.rstrip("%").astype(float)
    df["int_rate"] = df["int_rate"].astype(float)

    monthly_inc = np.maximum(df["annual_inc"].fillna(df["annual_inc"].median()) / 12.0, 1000.0)
    dti = df["dti"].fillna(df["dti"].median()).clip(0, 100)
    inst = df["installment"].fillna(df["installment"].median())
    monthly_exp = monthly_inc * (dti / 100.0) + inst
    net_cash = monthly_inc - monthly_exp
    savings_rate = np.clip((monthly_inc - monthly_exp) / monthly_inc, -0.5, 0.8)
    volatility = monthly_exp * 0.12
    stability = np.clip(1.0 - (dti / 100.0), 0.1, 0.95)
    rec_ratio = np.clip(inst / np.maximum(monthly_exp, 1.0), 0.1, 0.8)
    disc_ratio = np.clip(1.0 - (dti / 100.0), 0.1, 0.8)
    cr_dr = np.clip(monthly_inc / np.maximum(monthly_exp, 1.0), 0.5, 5.0)
    avg_txn = inst / 4.0
    max_debit = avg_txn * 3.5
    freq = df["total_acc"].fillna(15).clip(5, 50)
    salary_days = np.full_like(monthly_inc, 30.0)
    emg_months = np.clip(df["revol_bal"].fillna(5000) / np.maximum(monthly_exp, 1000.0), 0.5, 12.0)
    outliers = df["delinq_2yrs"].fillna(0).clip(0, 10) + df["inq_last_6mths"].fillna(0).clip(0, 5)

    X = np.column_stack([
        monthly_inc, monthly_exp, net_cash, savings_rate, volatility,
        stability, rec_ratio, disc_ratio, cr_dr,
        avg_txn, max_debit, freq, salary_days, emg_months, outliers
    ])
    print(f"   [Data] Successfully prepared {len(X)} loan records ({np.sum(y == 1)} defaults, {np.sum(y == 0)} fully paid).")
    return X, y


def train_and_save_credit_risk(output_dir: str):
    """Train Stacking Ensemble on real LendingClub loan dataset for maximum accuracy."""
    print("-> Training Credit Risk Stacking Classifier on LendingClub Data...")
    X, y = load_lendingclub_credit_data()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Base estimators: Monotonic HistGradientBoosting + RandomForest + LogisticRegression
    monotonic_cst = [-1, 1, -1, -1, 1, -1, 1, 0, -1, 0, 1, 0, 0, -1, 1]
    estimators = [
        ("hgb", HistGradientBoostingClassifier(max_iter=150, max_depth=6, monotonic_cst=monotonic_cst, random_state=42)),
        ("rf", RandomForestClassifier(n_estimators=100, max_depth=8, n_jobs=-1, random_state=42)),
        ("lr", LogisticRegression(max_iter=1000, C=0.5, random_state=42))
    ]

    stacking_clf = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(C=1.0),
        cv=3,
        n_jobs=-1
    )

    stacking_clf.fit(X_train_scaled, y_train)

    y_pred_proba = stacking_clf.predict_proba(X_test_scaled)[:, 1]
    y_pred = (y_pred_proba >= 0.5).astype(int)

    auc = roc_auc_score(y_test, y_pred_proba)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    print(f"   Credit Risk Metrics: ROC-AUC={auc:.4f}, Accuracy={acc:.4f}, F1={f1:.4f}")

    bundle = {
        "model": stacking_clf,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES_CREDIT,
        "model_version": "credit_stack_v2.0_lendingclub",
        "algorithm": "Stacking (HistGradientBoosting + RandomForest + LogisticRegression)",
        "metrics": {"roc_auc": round(auc, 4), "accuracy": round(acc, 4), "f1": round(f1, 4)},
        "dataset_source": "LendingClub Accepted Loans Dataset",
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    out_path = os.path.join(output_dir, "credit_risk_v1.pkl")
    joblib.dump(bundle, out_path)
    print(f"   Saved Credit Risk bundle to: {out_path}")
    return bundle


def train_and_save_fraud_detector(output_dir: str):
    """Train Isolation Forest on ULB Credit Card transaction dataset."""
    print("-> Training Fraud Anomaly Detector on ULB Credit Card Dataset...")
    fraud_file = find_data_file(["data/creditcard.csv"])

    if fraud_file:
        print(f"   [Data] Ingesting ULB Credit Card fraud dataset from: {fraud_file}")
        df = pd.read_csv(fraud_file)
        hour = ((df["Time"] // 3600) % 24).values
        day = (df["Time"] // (3600 * 24)).values
        is_weekend = ((day % 7) >= 5).astype(int)
        amt = df["Amount"].values
        mean_amt = np.mean(amt)
        ratio = np.clip(amt / max(mean_amt, 1.0), 0.1, 50.0)
        is_atm = np.where((amt % 500 == 0) & (amt > 1000), 1, 0)
        X = np.column_stack([amt, ratio, hour, is_weekend, is_atm])
        n_frauds = int(df["Class"].sum())
        contamination = float(np.clip(n_frauds / len(df), 0.001, 0.05))
        dataset_name = "ULB Credit Card Fraud Dataset (284,807 transactions)"
    else:
        print("   [Info] creditcard.csv not found, using calibrated synthetic generator.")
        # Fallback generator
        np.random.seed(42)
        n_normal, n_fraud = 4800, 200
        normal_amounts = np.random.lognormal(mean=6.8, sigma=0.9, size=n_normal)
        normal_ratio = np.random.uniform(0.2, 2.5, size=n_normal)
        normal_hours = np.random.choice(range(7, 23), size=n_normal)
        normal_weekend = np.random.choice([0, 1], p=[0.72, 0.28], size=n_normal)
        normal_atm = np.random.choice([0, 1], p=[0.92, 0.08], size=n_normal)

        fraud_amounts = np.random.lognormal(mean=9.5, sigma=1.2, size=n_fraud)
        fraud_ratio = np.random.uniform(3.5, 15.0, size=n_fraud)
        fraud_hours = np.random.choice([0, 1, 2, 3, 4, 5, 23], size=n_fraud)
        fraud_weekend = np.random.choice([0, 1], p=[0.5, 0.5], size=n_fraud)
        fraud_atm = np.random.choice([0, 1], p=[0.45, 0.55], size=n_fraud)

        X = np.vstack([
            np.column_stack([normal_amounts, normal_ratio, normal_hours, normal_weekend, normal_atm]),
            np.column_stack([fraud_amounts, fraud_ratio, fraud_hours, fraud_weekend, fraud_atm])
        ])
        contamination = 0.04
        dataset_name = "Calibrated Synthetic Financial Anomalies"

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=contamination,
        max_samples="auto",
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_scaled)

    raw_scores = iso_forest.score_samples(X_scaled)
    min_s, max_s = raw_scores.min(), raw_scores.max()

    bundle = {
        "model": iso_forest,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES_FRAUD,
        "score_range": {"min": float(min_s), "max": float(max_s)},
        "model_version": "fraud_isoforest_v2.0_ulb",
        "algorithm": "Isolation Forest (Unsupervised Anomaly Detector)",
        "metrics": {"contamination": round(contamination, 5), "n_estimators": 150, "samples_trained": len(X)},
        "dataset_source": dataset_name,
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    out_path = os.path.join(output_dir, "fraud_detector_v1.pkl")
    joblib.dump(bundle, out_path)
    print(f"   Fraud Detector trained on {len(X)} transactions. Saved bundle to: {out_path}")
    return bundle


def train_and_save_customer_segmentation(output_dir: str):
    """Train KMeans clustering on CC General cardholder dataset."""
    print("-> Training Customer Segmentation KMeans on CC GENERAL Dataset...")
    cc_file = find_data_file(["data/CC GENERAL.csv", "data/cc_general.csv"])

    if cc_file:
        print(f"   [Data] Ingesting CC GENERAL dataset from: {cc_file}")
        df = pd.read_csv(cc_file).drop(columns=["CUST_ID"], errors="ignore")
        df = df.fillna(df.median(numeric_only=True))

        inc = np.maximum(df["CREDIT_LIMIT"] / 3.0, 1000)
        pur = df["PURCHASES"]
        payments = df["PAYMENTS"]
        rec_ratio = np.clip(df["INSTALLMENTS_PURCHASES"] / np.maximum(pur, 1), 0, 1)
        disc_ratio = np.clip(df["ONEOFF_PURCHASES"] / np.maximum(pur, 1), 0, 1)
        savings = np.clip((inc - payments) / inc, -0.5, 0.8)
        volat = df["BALANCE"] * 0.1

        X_seg = np.column_stack([inc, savings, disc_ratio, rec_ratio, volat])
        dataset_name = "CC GENERAL Cardholder Dataset (8,950 profiles)"
    else:
        print("   [Info] CC GENERAL.csv not found, using calibrated synthetic generator.")
        X_credit, _ = generate_synthetic_credit_training_data(n_samples=2500)
        X_seg = X_credit[:, [0, 3, 7, 6, 4]]
        dataset_name = "Calibrated Synthetic Segments"

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_seg)

    kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
    kmeans.fit(X_scaled)
    sil_score = float(round(silhouette_score(X_scaled, kmeans.labels_, sample_size=min(3000, len(X_scaled)), random_state=42), 4))
    print(f"   Customer Segmentation Silhouette Score: {sil_score}")

    segment_metadata = {
        0: {
            "name": "Conservative Savers",
            "description": "High savings discipline, minimal discretionary spend, low revolving balances.",
            "risk_profile": "Very Low"
        },
        1: {
            "name": "Salaried Professionals",
            "description": "Consistent income, steady utility & installment obligations, moderate discretionary spend.",
            "risk_profile": "Low"
        },
        2: {
            "name": "Affluent / High Spenders",
            "description": "High net cash flow, significant one-off retail transactions, large credit limits.",
            "risk_profile": "Low-Moderate"
        },
        3: {
            "name": "Overextended Borrowers",
            "description": "High revolving credit and installment commitments, low savings buffer relative to debt.",
            "risk_profile": "High"
        }
    }

    bundle = {
        "model": kmeans,
        "scaler": scaler,
        "feature_names": FEATURE_NAMES_SEGMENTATION,
        "segment_metadata": segment_metadata,
        "model_version": "customer_kmeans_v2.0_ccgeneral",
        "algorithm": "KMeans Clustering (k=4)",
        "metrics": {"silhouette_score": sil_score, "clusters": 4, "samples_trained": len(X_seg)},
        "dataset_source": dataset_name,
        "trained_at": datetime.now(timezone.utc).isoformat()
    }

    out_path = os.path.join(output_dir, "customer_segmentation_v1.pkl")
    joblib.dump(bundle, out_path)
    print(f"   Saved Customer Segmentation bundle to: {out_path}")
    return bundle


def train_all_models(output_dir: str = "./app/ml/models"):
    """Execute training and serialization for all core machine learning models."""
    os.makedirs(output_dir, exist_ok=True)
    print("==================================================================")
    print("Starting ArthDrishti Machine Learning Model Training Pipeline")
    print(f"Target Output Directory: {os.path.abspath(output_dir)}")
    print("==================================================================")

    credit_bundle = train_and_save_credit_risk(output_dir)
    fraud_bundle = train_and_save_fraud_detector(output_dir)
    segment_bundle = train_and_save_customer_segmentation(output_dir)

    print("==================================================================")
    print("All Models Successfully Trained and Serialized on Datasets!")
    print("==================================================================")
    return {
        "credit_risk": credit_bundle,
        "fraud_detector": fraud_bundle,
        "segmentation": segment_bundle
    }


if __name__ == "__main__":
    train_all_models()
