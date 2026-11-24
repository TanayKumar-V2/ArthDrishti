# ArthDrishti

ArthDrishti is a financial analysis and loan review application. Customers can upload bank statements and review analytics generated from their transactions. Loan officers can review submitted applications alongside the applicant's financial analysis and record a decision.

> **Demo and data note:** Uploaded statements and their parsed transactions are user-provided data stored by this application. The repository also contains bundled machine-learning model files and may use local training datasets or synthetic fallback data to train/load some models. Generated scores and explanations are decision-support outputs, not verified financial advice or a lending decision.

## What the application does

### Customer workspace

- Create a customer account, sign in, and manage an account-scoped workspace.
- Upload CSV, Excel, or PDF bank statements in **Data Sources**; inspect processing status, parsed transactions, and remove uploaded sources.
- View financial health, credit risk, spending, cash flow, fraud indicators, customer segments, explainability, recommendations, and reports based on available parsed transactions.
- Ask the AI Advisor about the financial context available to the application. It requires a configured Groq API key; requests fail clearly if Groq is unavailable.
- Submit a loan application and view its status.

For the most useful analysis, upload and confirm a statement has finished processing before opening analytics or applying for a loan. When submitting an application, the application captures an analysis snapshot using the selected statement sources where provided; otherwise it uses the customer's available parsed statement data. The officer's review report is tied to that application snapshot.

### Loan officer workspace

- Review real loan applications submitted by customers in the officer dashboard and applications list.
- Open an application to review its applicant details and financial analysis, including the captured financial health and risk results, cash flow, spending breakdown, fraud scan, segment, explanations, and recommendations where available.
- Approve or reject an application. Decisions are saved to the application record.

Customer and officer routes are role-gated. Create separate customer and loan officer accounts for a demo. Public registration supports the customer and loan officer roles; administrative access is separate. Some secondary or administrative screens may be incomplete or use demonstration content, so use the customer analysis and loan application review flows above for a data-backed demonstration.

## Technology

- **Web app:** Next.js 16, React 19, TypeScript, Tailwind CSS 4.
- **API:** FastAPI, Python 3.11, Pydantic, SQLAlchemy.
- **Storage and background services:** PostgreSQL, Redis, Celery worker; local uploads are persisted under `backend/uploads` in the provided Docker Compose setup.
- **Analytics:** scikit-learn models plus transaction feature engineering and application rules.

## Run locally with Docker

Prerequisites: Docker Desktop with Compose and Node.js/npm if running the frontend outside Docker.

1. Copy `.env.example` to `.env` and set private secrets and database credentials for your environment. Do not commit `.env` or put secrets in `NEXT_PUBLIC_*` variables.
2. Start the backend dependencies and API:

   ```bash
   docker compose up --build -d postgres redis backend celery_worker
   ```

3. In another terminal, install frontend packages and start the web app:

   ```bash
   npm install
   npm run dev
   ```

4. Open <http://localhost:3000>. The API health endpoint is <http://localhost:8000/health>; interactive API docs are at <http://localhost:8000/api/v1/docs>.

Alternatively, start all Compose services, including the web app, with `docker compose up --build`. The web app is available at port 3000 and the API at port 8000. To stop the services, run `docker compose down`. This keeps named database volumes; `docker compose down -v` removes those volumes and their data.

The Compose file currently supplies development database credentials and a development JWT key directly in its service configuration. Treat this setup as local-only; changing similarly named values in `.env` does not override every hard-coded Compose setting. Before using a shared or deployed environment, update the Compose service configuration to use private environment variables/secrets. The seeded local administrator defaults are `admin@arthdrishti.local` / `ChangeMeAdmin123!`; the Compose backend currently uses these config defaults. Change them before use beyond a disposable local demo.

## Run the API without Docker

The API requires a reachable PostgreSQL database and Redis instance. From the repository root, create a Python 3.11 environment, install `backend/requirements.txt`, configure `DATABASE_URL`, `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`, and `JWT_SECRET_KEY`, then start the API from `backend`:

```bash
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
Set-Location backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Run the Celery worker from the `backend` directory if using queued tasks:

```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

## Configuration

`.env.example` lists the available settings. Common settings include:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLAlchemy connection string for PostgreSQL. |
| `REDIS_URL` | Redis connection used by the API. |
| `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` | Celery queue and result connections. |
| `JWT_SECRET_KEY` | Signing key for authentication tokens; set a strong private value. |
| `FIRST_SUPERUSER_EMAIL`, `FIRST_SUPERUSER_PASSWORD` | Initial seeded admin credentials. |
| `LOCAL_STORAGE_DIR`, `USE_LOCAL_STORAGE` | Local upload storage configuration. |
| `GROQ_API_KEY`, `GROQ_MODEL` | Groq provider settings used for generated customer analytics. Set the key for uploads and analysis workflows. |
| `NEXT_PUBLIC_API_BASE_URL` | API base URL used by the browser, normally `http://localhost:8000/api/v1`. |
| `NEXT_PUBLIC_ENABLE_MOCK_DATA` | Enables a demo login/registration fallback when the API cannot be reached. Keep it `false` for backend-backed sign-in and registration. |

Groq is used to categorize uploaded transaction descriptions and generate financial-health assessments, risk-band and segment interpretations, fraud triage, recommendations, forecasts, and explanations. These workflows require `GROQ_API_KEY`; if the key is missing or Groq fails, the API reports an error instead of substituting rule-based analytics. Transaction descriptions and derived financial metrics are sent to Groq for these requests. Only expose values prefixed with `NEXT_PUBLIC_` if they are safe for browser clients to see. Do not use real customer statements in a public or shared demo environment unless you are comfortable sending this information to the configured Groq service.

## How to demonstrate with your own data

1. Start PostgreSQL, Redis, and the API, then start the frontend.
2. Register/sign in as a customer. Upload a CSV, XLSX, or supported PDF bank statement in **Data Sources**. Groq must be configured for transaction categorization; existing uploads can be reclassified from the Data Sources page.
3. Wait for processing to finish and check that the source contains parsed transactions. If the statement has no readable transaction rows, try CSV/XLSX or a text-based PDF export from the bank.
4. Open the analytics pages and reports. Their results depend on the selected or available parsed statement transactions.
5. Register/sign in with a separate loan officer account. Submit a loan application from the customer account and review it in the officer workspace. Open the application report before recording an approval or rejection.

Customer information and uploaded data are scoped to the signed-in account. Do not use another person's statement without authorization.

## Analytics and model limitations

- Statement parsing extracts transaction fields from uploaded CSV, XLSX, and PDF files. Bank export formats vary, so always verify the parsed rows, dates, and debit/credit direction before relying on analytics.
- Transaction totals and numeric model inputs are calculated from parsed ledger rows. Groq generates transaction categories, the financial-health assessment, customer-facing risk and segment interpretations, fraud triage, recommendations, forecasts, and explanations. Credit probability, anomaly scores, and segment cluster IDs come from bundled scikit-learn artifacts. If a required artifact is missing, startup invokes the training pipeline, which can use local datasets when available or synthetic fallback data. Training sources are not the same as the customer's uploaded statement.
- Fraud flags are Groq triage of anomaly scores from the trained Isolation Forest model; they do not establish fraud. Cash-flow projections are Groq-generated estimates, not guarantees or the bank's actual balance.
- Credit-risk probability, fraud anomaly scores, and segmentation cluster IDs come from the bundled trained models. Groq produces their customer-facing interpretations and handles the other generated analytics. Credit-risk explanations are narrative summaries, not formal SHAP/LIME feature attribution. Numeric transaction totals and feature preparation remain calculated from the uploaded ledger.
- Model training data sources currently used by `backend/app/ml/training/train_all.py` are:

  | Dataset file | Model/purpose |
  | --- | --- |
  | `accepted_2007_to_2018Q4.csv` (LendingClub Accepted Loans) | Credit-risk model training; derives labels from loan outcomes such as `Fully Paid` and `Charged Off`. |
  | `creditcard.csv` (ULB Credit Card Fraud dataset) | Fraud anomaly detector training. |
  | `CC GENERAL.csv` (Credit Card Customer Segmentation dataset) | KMeans customer segmentation training. |

  When any required model artifact is missing, the training pipeline looks for these local files. If a corresponding dataset is unavailable, that model's training path uses synthetic fallback data. The `data/` directory is ignored by Git and is not included when cloning the repository. It may also contain Czech bank dataset files (`account.csv`, `card.csv`, `client.csv`, `disp.csv`, `district.csv`, `loan.csv`, `order.csv`, and `trans.csv`); those files are present locally but are not referenced by the current model training pipeline. See [`docs/synthetic-data.md`](docs/synthetic-data.md) for the optional synthetic statement generator.
- This project is a demo application. It is not a production lending, fraud-detection, or regulatory compliance system.

## Repository layout

```text
src/app/                 Next.js routes and page layouts
src/components/          Shared frontend components
src/lib/                 Frontend API and application utilities
backend/app/api/v1/       FastAPI route modules
backend/app/models/      SQLAlchemy database models
backend/app/schemas/     Pydantic request/response schemas
backend/app/services/    Parsing, analytics, scoring, and report services
backend/app/ml/models/   Bundled model artifacts
backend/uploads/         Local uploaded-file storage
scripts/                 Data generation and model utility scripts
docs/                    Supporting project documentation
```

## Useful commands

```bash
npm run dev        # Start the Next.js development server
npm run build      # Build the Next.js application
npm run start      # Serve a production build
npm run lint       # Run ESLint
npm run test       # Currently runs `next build`; it is not a unit-test suite
```

## License

No license file is currently provided. Contact the project owner before redistributing or using this project outside its intended demo context.
