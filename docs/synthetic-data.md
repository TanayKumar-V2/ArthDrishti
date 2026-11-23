# Synthetic Financial Data Generation Methodology

This document details the generation methodology for the synthetic banking dataset used across **ArthDrishti**.

> ⚠️ **Strict Data Privacy**: Real customer banking records, personally identifiable information (PII), or confidential financial records are **never** utilized. All statements, transaction narratives, and account histories are programmatically generated using statistical distributions modeled on realistic Indian retail banking patterns.

---

## 1. Generation Architecture

The generator (`scripts/generate_synthetic_data.py`) creates realistic multi-month transaction histories based on configurable financial personas.

```
       [Financial Persona Configuration]
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
Fixed Recurring   Discretionary     Anomalies &
(Salary, Rent)   (Daily Expenses)  Outliers (5%)
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
            Chronological Assembly
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   CSV Export     Excel (.xlsx)   PDF Statement
```

---

## 2. Customer Personas

The generator models four representative financial behavioral archetypes:

| Persona | Monthly Income | Savings Rate | Spend Characteristics | Risk Level |
|---|---|---|---|---|
| **Salaried Professional** | ₹85,000 – ₹1,80,000 | 25% – 45% | Predictable monthly salary, moderate food/retail, SIP investments | Low |
| **Freelance / Gig Worker** | ₹40,000 – ₹1,20,000 | 10% – 25% | Volatile credit dates, higher cash withdrawals, irregular income | Medium |
| **Overextended Borrower** | ₹50,000 – ₹90,000 | < 5% | High credit card usage, recurring personal loan EMIs, late night spikes | High |
| **Conservative Saver** | ₹60,000 – ₹1,10,000 | > 50% | High fixed deposits, low discretionary spending, minimal debt | Very Low |

---

## 3. Statistical Distribution & Seasonality

1. **Salary Inflows**:
   - Generated on the 1st or final working day of each month with low variance ($\sigma < 2\%$).
2. **Fixed Recurring Commitments**:
   - **Rent & Society Maintenance**: 1st – 5th of each month ($20\% - 35\%$ of net salary).
   - **Utilities & Subscriptions**: Bescom, Airtel, Netflix, Jio ($2\% - 6\%$ of income).
3. **Daily Discretionary Spending**:
   - Modeled via Poisson process ($\lambda = 1.8$ transactions per day) with higher density on weekends ($+40\%$).
   - Amounts drawn from Log-Normal distributions:
     $$\ln(X) \sim \mathcal{N}(\mu, \sigma^2)$$
4. **Anomalies & Fraud Indicators (Injected at ~3-5% frequency)**:
   - High-value duplicate swipes within minutes.
   - High-velocity ATM cash withdrawals late at night (1:00 AM – 4:00 AM).
   - Sudden cross-border or foreign merchant charges.

---

## 4. Generating Test Datasets

Run the synthetic data CLI from the workspace root:

```bash
# Generate sample CSV statement (6 months, Salaried persona)
python scripts/generate_synthetic_data.py --format csv --months 6 --persona salaried --output sample_salaried.csv

# Generate sample Excel statement (.xlsx)
python scripts/generate_synthetic_data.py --format excel --months 6 --persona freelancer --output sample_freelancer.xlsx

# Generate sample PDF statement
python scripts/generate_synthetic_data.py --format pdf --months 3 --persona overextended --output sample_overextended.pdf
```
