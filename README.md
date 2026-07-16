# AI Financial Risk Intelligence Platform

An end-to-end, production-style machine learning platform that analyzes a customer's financial data and returns credit risk scores, fraud alerts, spending insights, cash flow forecasts, and explainable AI reports — the kind of system a bank, NBFC, or fintech risk team would build internally.

> ⚠️ **Data disclaimer**: This project uses a synthetically generated banking dataset that mimics real transaction histories, loans, and spending patterns. No real customer or financial data is used. Synthetic data generation is documented in [`docs/synthetic-data.md`](docs/synthetic-data.md).

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [ML Models](#ml-models)
- [Explainable AI](#explainable-ai)
- [MLOps Pipeline](#mlops-pipeline)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Roadmap](#roadmap)
- [Screenshots](#screenshots)
- [License](#license)

---

## Overview

A customer uploads or connects their financial data (bank statements, transaction history, salary slips), and within seconds the platform returns:

| Output | Description |
|---|---|
| **Credit Risk Score** | Probability of loan default |
| **Fraud Risk** | Anomaly detection on transaction history |
| **Spending Pattern Analysis** | Categorized spending breakdown |
| **Customer Segmentation** | Cluster-based customer profiling |
| **Financial Health Score** | Composite 0–100 score across income, savings, debt, and credit history |
| **Cash Flow Forecast** | Predicted balance/expenses for next week, month, and 6 months |
| **Explainable AI Report** | SHAP/LIME-based reasoning for every prediction |
| **Personalized Recommendations** | Actionable financial advice grounded in model output |

The project intentionally combines classical ML, deep learning, time-series forecasting, anomaly detection, explainability, and MLOps into a single cohesive product rather than a single-notebook model.

---

## Features

- 🔐 JWT-based authentication with role-based access (Customer / Loan Officer / Admin)
- 📤 Upload CSV, Excel, or PDF bank/credit card statements
- 🧹 Automated data cleaning, outlier detection, and feature engineering (20+ engineered features)
- 🤖 Multiple specialized ML models (not one general-purpose model)
- 🔍 Explainable AI with per-prediction SHAP/LIME breakdowns
- 🧪 Interactive "what-if" simulator (e.g. *"what if income increases by ₹20,000?"*)
- 📈 Time-series cash flow forecasting with confidence intervals
- 🚨 Real-time fraud alerts on unlabeled, imbalanced transaction data
- 🧭 Customer segmentation via clustering
- 💡 Rule-based (and optionally LLM-grounded) financial recommendations
- 📊 Full analytics dashboard with dark/light themes
- 🛠️ Full MLOps loop — versioning, drift monitoring, automated retraining hooks

---

## Architecture

```
                           USER
                             │
                             ▼
                  React + Next.js Frontend
                             │
                    Authentication (JWT/OAuth)
                             │
                             ▼
                    FastAPI Backend (REST)
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
 Financial Service      Prediction API      Report Generator
         │                    │                    │
         └──────────────┬─────┴────────────────────┘
                         │
                  Feature Engineering
                         │
         ┌───────────────┼────────────────────┐
         │               │                    │
         ▼               ▼                    ▼
 Loan Model       Fraud Model         Forecast Model
         │               │                    │
         └───────────────┼────────────────────┘
                         ▼
               Explainability Engine
                  (SHAP + LIME)
                         │
                         ▼
                  PostgreSQL Database
                         │
                         ▼
                  Analytics Dashboard
```

---

## Tech Stack

**Frontend**
- React / Next.js, TypeScript
- Tailwind CSS, shadcn/ui, Framer Motion
- React Query (TanStack Query), Zustand
- Recharts / Apache ECharts / Tremor

**Backend**
- FastAPI, Pydantic, SQLAlchemy, Alembic
- Celery + Redis (async jobs & caching)
- JWT authentication

**Database**
- PostgreSQL
- Redis (cache + task queue)

**Machine Learning**
- scikit-learn, XGBoost, LightGBM, CatBoost
- TensorFlow / PyTorch (forecasting, autoencoders)
- Optuna (hyperparameter tuning)
- SHAP, LIME (explainability)
- pandas, NumPy

**MLOps**
- MLflow (model registry & experiment tracking)
- Evidently AI (drift monitoring)
- Docker, GitHub Actions (CI/CD)
- Prometheus + Grafana (monitoring)

**Cloud**
- AWS (EC2, S3, RDS) / GCP / Azure (any one)

---

## Project Structure

```
app/
├── main.py                        # FastAPI app entrypoint, router registration
├── core/
│   ├── config.py                  # environment/settings (Pydantic BaseSettings)
│   ├── security.py                # JWT encode/decode, password hashing
│   └── dependencies.py            # get_current_user, get_db, role guards
├── models/                        # SQLAlchemy ORM models
├── schemas/                       # Pydantic request/response schemas
├── api/v1/
│   ├── auth.py
│   ├── documents.py
│   ├── transactions.py
│   ├── loans.py
│   ├── predictions.py
│   ├── forecast.py
│   ├── explainability.py
│   ├── recommendations.py
│   ├── reports.py
│   └── admin.py
├── services/
│   ├── auth_service.py
│   ├── document_processing_service.py
│   ├── feature_engineering_service.py
│   ├── prediction_service.py
│   ├── fraud_service.py
│   ├── forecast_service.py
│   ├── explainability_service.py
│   ├── recommendation_service.py
│   └── report_service.py
├── ml/
│   ├── models/                    # serialized model bundles (.pkl / .pt)
│   ├── inference/                 # model-loading + prediction wrappers
│   └── training/                  # training scripts
├── tasks/
│   └── celery_tasks.py            # async jobs (document processing, scoring, reports)
├── db/
│   ├── session.py
│   └── migrations/                # Alembic migrations
└── tests/

frontend/
├── app/                           # Next.js app router pages
├── components/                    # UI components (shadcn/ui based)
├── lib/                           # API client, utils
└── store/                         # Zustand state
```

---

## Database Schema

Simplified entity list (full DDL in [`db/migrations/`](db/migrations)):

| Table | Purpose |
|---|---|
| `users` | Account records, role (customer/loan_officer/admin) |
| `refresh_tokens` | JWT refresh token tracking |
| `customer_profiles` | Income, expenses, debt, savings snapshot |
| `documents` | Uploaded statements/slips + processing status |
| `transactions` | Parsed transaction history, categorized, fraud-flagged |
| `loans` | Loan applications and status |
| `loan_repayments` | Repayment schedule and late-payment tracking |
| `risk_scores` | Credit risk output + financial health score |
| `fraud_alerts` | Fraud predictions per transaction |
| `forecasts` | Time-series forecast outputs (JSONB series) |
| `customer_segments` | Cluster assignment per customer |
| `explanations` | SHAP/LIME feature contributions (polymorphic) |
| `recommendations` | Generated financial advice |
| `reports` | Generated PDF report metadata |
| `audit_logs` | Security/action audit trail |
| `model_registry` | Deployed model versions + metrics |

Key design decisions:
- Every ML output table stores a `model_version` string for reproducibility and drift tracking.
- `explanations` uses a polymorphic reference (`prediction_id` + `prediction_type`) so SHAP/LIME storage is unified across credit risk and fraud predictions.
- `transactions` is indexed on `(user_id, transaction_date)`; consider monthly partitioning at scale.

---

## API Reference

Base URL: `/api/v1`

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login, returns access + refresh token |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/verify-email` | Verify email |
| POST | `/auth/forgot-password` | Trigger reset flow |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Current user info |

</details>

<details>
<summary><strong>Documents & Transactions</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/documents/upload` | Upload statement (async processing, returns 202) |
| GET | `/documents` | List uploads + status |
| GET | `/documents/{id}` | Get document detail |
| DELETE | `/documents/{id}` | Delete document |
| GET | `/documents/{id}/status` | Poll processing status |
| GET | `/transactions` | List/filter transactions |
| GET | `/transactions/{id}` | Transaction detail |
| PATCH | `/transactions/{id}` | Manual category correction |
| GET | `/transactions/summary` | Aggregates for dashboard charts |

</details>

<details>
<summary><strong>Loans</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/loans/apply` | Submit loan application |
| GET | `/loans` | List user's loans |
| GET | `/loans/{id}` | Loan detail |
| GET | `/loans/{id}/repayment-schedule` | Repayment schedule |

</details>

<details>
<summary><strong>Predictions</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/predictions/credit-risk` | Run credit risk scoring |
| GET | `/predictions/credit-risk/latest` | Latest score |
| GET | `/predictions/credit-risk/history` | Score history |
| POST | `/predictions/fraud/scan` | Trigger fraud scan |
| GET | `/predictions/fraud/alerts` | List fraud alerts |
| PATCH | `/predictions/fraud/alerts/{id}` | Update alert status |
| GET | `/predictions/segment` | Customer segment |
| GET | `/predictions/financial-health-score` | Composite health score |

</details>

<details>
<summary><strong>Forecasting & Explainability</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| POST | `/forecast/generate` | Trigger async forecast job |
| GET | `/forecast/status/{task_id}` | Poll forecast job |
| GET | `/forecast?type=&horizon=` | Get forecast results |
| GET | `/explainability/{prediction_id}` | SHAP/LIME breakdown |
| POST | `/explainability/what-if` | Simulate feature changes |

</details>

<details>
<summary><strong>Recommendations, Reports, Admin</strong></summary>

| Method | Endpoint | Description |
|---|---|---|
| GET | `/recommendations` | List recommendations |
| PATCH | `/recommendations/{id}/dismiss` | Dismiss a recommendation |
| POST | `/reports/generate` | Generate PDF report (async) |
| GET | `/reports` | List reports |
| GET | `/reports/{id}/download` | Download report |
| GET | `/admin/users` | List users (admin) |
| GET | `/admin/loans?status=` | Loan queue (admin) |
| PATCH | `/admin/loans/{id}/decision` | Approve/reject loan |
| GET | `/admin/models` | Model registry |
| POST | `/admin/models/{name}/rollback` | Rollback model version |
| GET | `/health` | Health check |
| GET | `/metrics` | Prometheus scrape endpoint |

</details>

---

## ML Models

| Task | Algorithms | Notes |
|---|---|---|
| **Credit Risk** | Logistic Regression, Random Forest, XGBoost, LightGBM, CatBoost → **Stacking Ensemble** | Outputs default probability |
| **Fraud Detection** | Isolation Forest, LOF, Autoencoder, One-Class SVM | Unsupervised — fraud data is unlabeled/imbalanced |
| **Customer Segmentation** | KMeans, DBSCAN, HDBSCAN | Clusters: Luxury Spenders, Young Investors, High-Risk Borrowers, etc. |
| **Spending Classification** | Random Forest, Gradient Boosting, Neural Network | Categorizes transactions (food, travel, utilities, ...) |
| **Cash Flow Forecasting** | LSTM, GRU, Transformer / Temporal Fusion Transformer | Forecasts next week / month / 6 months |
| **Financial Health Score** | Weighted composite (not a trained model) | Combines income stability, savings, debt, credit history, emergency fund |

Models are versioned and served via a model registry loaded once at app startup (see [Serving Models](#serving-a-trained-model) below).

### Serving a trained model

1. Save a bundle (model + preprocessing + metadata), not just the raw model:
   ```python
   joblib.dump({
       "model": trained_model,
       "scaler": fitted_scaler,
       "feature_names": [...],
       "model_version": "credit_stack_v1.0",
   }, "app/ml/models/credit_risk_v1.pkl")
   ```
2. Load all models once at startup into an in-memory registry (`app/ml/inference/model_loader.py`).
3. Validate input via Pydantic schemas before inference.
4. Run inference + SHAP explanation in the service layer.
5. Route heavy models (LSTM, autoencoders) through Celery; keep tree-based models synchronous.

---

## Explainable AI

Every prediction returns *why*, not just a score:

```json
{
  "default_probability": 0.82,
  "risk_band": "high",
  "model_version": "credit_stack_v1.3",
  "explanation": [
    { "feature": "debt_to_income_ratio", "contribution": 0.24 },
    { "feature": "late_payments", "contribution": 0.18 },
    { "feature": "credit_utilization", "contribution": 0.15 },
    { "feature": "savings_balance", "contribution": 0.12 },
    { "feature": "salary_stability", "contribution": -0.08 }
  ]
}
```

- **SHAP** (`TreeExplainer`) for tree-based models — fast, used synchronously.
- **LIME** / `KernelExplainer` for non-tree models (autoencoders) — slower, run async.
- Powers the **What-If Simulator**: adjust an input (e.g. income +₹20,000) and see the score update in real time.

---

## MLOps Pipeline

```
Raw Data → Validation → Feature Engineering → Train/Test Split
   → Optuna Hyperparameter Search → Model Training → Model Evaluation
   → MLflow Model Registry → Deployment → Monitoring (Evidently AI)
```

- **MLflow**: experiment tracking + model registry (mirrored in `model_registry` table for app queries)
- **Evidently AI**: data/prediction drift monitoring
- **Prometheus + Grafana**: system and model performance dashboards
- **GitHub Actions**: CI for tests, linting, and deployment
- **Docker**: containerized services for reproducible environments

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (recommended)

### Setup

```bash
# clone
git clone https://github.com/<your-username>/ai-financial-risk-platform.git
cd ai-financial-risk-platform

# backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # fill in secrets/DB URL
alembic upgrade head          # run migrations
uvicorn app.main:app --reload

# celery worker (separate terminal)
celery -A app.tasks.celery_app worker --loglevel=info

# frontend
cd ../frontend
npm install
npm run dev
```

### Or with Docker Compose

```bash
docker-compose up --build
```

Backend available at `http://localhost:8000`, frontend at `http://localhost:3000`, API docs (Swagger) at `http://localhost:8000/docs`.

---

## Environment Variables

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost:5432/finrisk
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=change-me
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
MLFLOW_TRACKING_URI=http://localhost:5000
AWS_S3_BUCKET=finrisk-documents

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
```

---

## Running Tests

```bash
# backend
cd backend
pytest --cov=app tests/

# frontend
cd frontend
npm run test
```

---

## Roadmap

| Phase | Weeks | Focus |
|---|---|---|
| 1 | 1–2 | Foundation — frontend, backend, auth, PostgreSQL, Docker, CI |
| 2 | 3–4 | Data pipeline — upload, validation, cleaning, feature engineering |
| 3 | 5–6 | Core ML — credit risk, fraud, segmentation models |
| 4 | 7–8 | APIs — prediction, forecasting, explainability, reporting endpoints |
| 5 | 9–10 | Dashboard — charts, filters, what-if simulator, report pages |
| 6 | 11 | MLOps — MLflow, versioning, drift monitoring, retraining hooks |
| 7 | 12 | Polish — UI/UX, performance, docs, deployment, demo recording |

---

## Screenshots

> _Add dashboard, explainability, and forecast page screenshots here once built._

---

## License

This project is for educational/portfolio purposes. Synthetic data only — see [`docs/synthetic-data.md`](docs/synthetic-data.md) for generation methodology.