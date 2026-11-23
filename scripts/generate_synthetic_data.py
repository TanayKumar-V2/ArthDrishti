"""
Synthetic Banking Data Generator for ArthDrishti
Generates realistic financial statements in CSV, Excel (.xlsx), or PDF format.
"""

import os
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import argparse

MERCHANTS = {
    "Salary & Income": [
        ("Tech Mahindra Payroll", 85000, 140000),
        ("Infosys Direct Deposit", 95000, 160000),
        ("Consulting Fee Credit", 45000, 80000),
        ("Dividend Credit - Zerodha", 1200, 8500),
    ],
    "Food & Dining": [
        ("Swiggy Order #84920", 250, 1200),
        ("Zomato Delivery", 320, 1450),
        ("Starbucks Coffee", 350, 850),
        ("McDonalds Drive Thru", 400, 950),
        ("Blinkit Quick Commerce", 450, 2200),
        ("Zepto Grocery", 300, 1800),
    ],
    "Shopping & Retail": [
        ("Amazon India Marketplace", 650, 6800),
        ("Flipkart Internet Pvt Ltd", 899, 5400),
        ("Myntra Fashion", 1200, 4200),
        ("Decathlon Sports India", 1500, 7500),
        ("Zara Retail Store", 2200, 8900),
    ],
    "Utilities & Bills": [
        ("BESCOM Electricity Bill", 1200, 3400),
        ("Airtel Fiber Broadband", 999, 1499),
        ("Jio Prepaid Recharge", 299, 749),
        ("Billdesk Utility Payment", 800, 2500),
    ],
    "Housing & Rent": [
        ("Apartment Rent - Owner Transfer", 22000, 38000),
        ("Society Maintenance Dues", 3500, 6000),
    ],
    "Transportation & Travel": [
        ("Uber India Trip", 180, 850),
        ("Ola Cabs Ride", 150, 720),
        ("Indian Oil Petrol Pump", 1500, 4500),
        ("Fastag Toll Plaza", 150, 450),
    ],
    "Entertainment & Subscriptions": [
        ("Netflix India Subscription", 649, 649),
        ("Spotify Premium Individual", 119, 119),
        ("BookMyShow Movie Tickets", 600, 1600),
        ("YouTube Premium Family", 189, 189),
    ],
    "Investments & Savings": [
        ("Zerodha Broking Ltd SIP", 10000, 25000),
        ("Groww Mutual Fund Direct", 5000, 15000),
    ],
    "Cash & ATM": [
        ("HDFC ATM Cash Wdl", 2000, 10000),
        ("SBI ATM Cash Wdl", 1000, 5000),
    ]
}


def generate_transactions(months: int = 6, persona: str = "salaried") -> List[Dict[str, Any]]:
    """Generate realistic sequence of transactions over N months."""
    transactions = []
    end_date = datetime.now()
    start_date = end_date - timedelta(days=months * 30)

    current_date = start_date
    while current_date <= end_date:
        day = current_date.day

        # 1. Salary Credit on the 1st of each month
        if day == 1:
            desc, min_amt, max_amt = random.choice(MERCHANTS["Salary & Income"][:2])
            salary = random.randint(min_amt, max_amt)
            transactions.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Description": desc,
                "Type": "Credit",
                "Amount": float(salary),
                "Category": "Salary & Income"
            })

        # 2. Rent on 3rd of each month
        if day == 3:
            desc, min_amt, max_amt = MERCHANTS["Housing & Rent"][0]
            rent = random.randint(min_amt, max_amt)
            transactions.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Description": desc,
                "Type": "Debit",
                "Amount": float(rent),
                "Category": "Housing & Rent"
            })

        # 3. Monthly utility bills on 8th
        if day == 8:
            desc, min_amt, max_amt = MERCHANTS["Utilities & Bills"][0]
            transactions.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Description": desc,
                "Type": "Debit",
                "Amount": float(random.randint(min_amt, max_amt)),
                "Category": "Utilities & Bills"
            })

        # 4. Daily discretionary spending (0 to 3 transactions per day)
        txn_count = random.choices([0, 1, 2, 3], weights=[0.2, 0.4, 0.3, 0.1])[0]
        # Weekend boost
        if current_date.weekday() in (5, 6):
            txn_count += random.choice([0, 1])

        for _ in range(txn_count):
            category = random.choices(
                ["Food & Dining", "Shopping & Retail", "Transportation & Travel", "Entertainment & Subscriptions", "Cash & ATM"],
                weights=[0.45, 0.25, 0.15, 0.10, 0.05]
            )[0]
            desc, min_amt, max_amt = random.choice(MERCHANTS[category])
            amt = round(random.uniform(min_amt, max_amt), 2)
            transactions.append({
                "Date": current_date.strftime("%Y-%m-%d"),
                "Description": desc,
                "Type": "Debit",
                "Amount": amt,
                "Category": category
            })

        current_date += timedelta(days=1)

    return transactions


def export_csv(transactions: List[Dict[str, Any]], output_path: str):
    import csv
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["Date", "Description", "Type", "Amount", "Category"])
        writer.writeheader()
        writer.writerows(transactions)
    print(f"Exported {len(transactions)} transactions to CSV: {output_path}")


def export_excel(transactions: List[Dict[str, Any]], output_path: str):
    import pandas as pd
    df = pd.DataFrame(transactions)
    df.to_excel(output_path, index=False, engine="openpyxl")
    print(f"Exported {len(transactions)} transactions to Excel: {output_path}")


def export_pdf(transactions: List[Dict[str, Any]], output_path: str):
    """Export text-based statement format printable to PDF or formatted text."""
    lines = [
        "ARTHDRISHTI BANK - ACCOUNT STATEMENT",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "-" * 75,
        f"{'Date':<12} {'Description':<38} {'Amount':>12} {'Type':>6}",
        "-" * 75
    ]
    for t in transactions[:300]:  # Cap for statement sample
        lines.append(f"{t['Date']:<12} {t['Description'][:36]:<38} {t['Amount']:>12.2f} {t['Type'].upper():>6}")
    lines.append("-" * 75)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    print(f"Exported statement text: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate synthetic bank statements")
    parser.add_argument("--format", choices=["csv", "excel", "pdf"], default="csv")
    parser.add_argument("--months", type=int, default=6)
    parser.add_argument("--persona", choices=["salaried", "freelancer", "overextended"], default="salaried")
    parser.add_argument("--output", type=str, default="sample_statement.csv")
    args = parser.parse_args()

    txns = generate_transactions(months=args.months, persona=args.persona)
    if args.format == "csv":
        export_csv(txns, args.output)
    elif args.format == "excel":
        export_excel(txns, args.output)
    else:
        export_pdf(txns, args.output)
