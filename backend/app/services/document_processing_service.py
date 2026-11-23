import os
import re
import csv
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

# Keyword patterns for auto-categorization
CATEGORY_RULES = {
    "Salary & Income": [
        r"salary", r"payroll", r"direct dep", r"bonus", r"dividend",
        r"interest credit", r"stipend", r"neft.*cr", r"rtgs.*cr", r"imps.*cr"
    ],
    "Food & Dining": [
        r"swiggy", r"zomato", r"mcdonald", r"starbucks", r"restaurant",
        r"cafe", r"dining", r"kfc", r"domino", r"burger", r"blinkit",
        r"zepto", r"instamart", r"grocery", r"supermarket", r"food"
    ],
    "Shopping & Retail": [
        r"amazon", r"flipkart", r"myntra", r"zara", r"h&m", r"decathlon",
        r"retail", r"store", r"mall", r"ikea", r"clothing", r"ajio"
    ],
    "Utilities & Bills": [
        r"electricity", r"water", r"gas", r"bescom", r"airtel", r"jio",
        r"broadband", r"billdesk", r"recharge", r"utility", r"tneb"
    ],
    "Housing & Rent": [
        r"rent", r"landlord", r"society", r"maintenance", r"mortgage", r"housing"
    ],
    "Transportation & Travel": [
        r"uber", r"ola", r"irctc", r"makemytrip", r"indigo", r"flight",
        r"fuel", r"petrol", r"diesel", r"shell", r"metro", r"toll", r"fastag", r"cab"
    ],
    "Entertainment & Subscriptions": [
        r"netflix", r"spotify", r"prime", r"hotstar", r"youtube",
        r"cinema", r"movie", r"bookmyshow", r"apple\.com", r"subscription"
    ],
    "Health & Medical": [
        r"pharmacy", r"apollo", r"hospital", r"clinic", r"diagnostics",
        r"1mg", r"doctor", r"medical", r"medplus", r"healthcare"
    ],
    "Investments & Savings": [
        r"zerodha", r"groww", r"mutual fund", r"sip", r"upstox",
        r"coin", r"bse", r"nse", r"fixed dep", r"fd credit"
    ],
    "Cash & ATM": [
        r"atm wdl", r"cash wdl", r"atm debit", r"cash withdrawal"
    ]
}


def classify_category(description: str, transaction_type: str) -> str:
    """Classify transaction category based on description keywords and transaction type."""
    desc_lower = description.lower()
    
    if transaction_type == "credit":
        for pattern in CATEGORY_RULES["Salary & Income"]:
            if re.search(pattern, desc_lower):
                return "Salary & Income"
        for pattern in CATEGORY_RULES["Investments & Savings"]:
            if re.search(pattern, desc_lower):
                return "Investments & Savings"
        return "Other Income"
        
    for category, patterns in CATEGORY_RULES.items():
        if category == "Salary & Income":
            continue
        for pattern in patterns:
            if re.search(pattern, desc_lower):
                return category
                
    return "Other Expenses"


def parse_date_flexible(date_str: str) -> datetime:
    """Attempt parsing multiple standard banking date formats."""
    date_str = str(date_str).strip()
    formats = [
        "%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y",
        "%Y/%m/%d", "%d-%b-%Y", "%d %b %Y", "%d-%B-%Y",
        "%d %B %Y", "%Y-%m-%d %H:%M:%S", "%d/%m/%Y %H:%M:%S"
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unrecognized date format: '{date_str}'")


async def save_uploaded_file(file: UploadFile, user_id: str) -> Tuple[str, str, int]:
    """Validate file extension and save to local uploads directory."""
    ext = os.path.splitext(file.filename)[1].lower().lstrip(".")
    if ext not in ["csv", "xlsx", "xls", "pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload CSV, Excel (.xlsx, .xls), or PDF statements."
        )

    user_upload_dir = os.path.join(settings.LOCAL_STORAGE_DIR, str(user_id))
    os.makedirs(user_upload_dir, exist_ok=True)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(user_upload_dir, unique_filename)

    file_size = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):  # 1MB chunks
            buffer.write(chunk)
            file_size += len(chunk)

    return file_path, ext, file_size


def parse_csv_statement(file_path: str) -> List[Dict[str, Any]]:
    """Parse transactions from a standard or bank-exported CSV statement."""
    transactions = []
    
    with open(file_path, mode="r", encoding="utf-8-sig", errors="replace") as f:
        # Detect delimiter (comma, semicolon, or tab)
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample)
            delimiter = dialect.delimiter
        except Exception:
            delimiter = ","
            
        reader = csv.DictReader(f, delimiter=delimiter)
        if not reader.fieldnames:
            return transactions

        # Normalize fieldnames to lowercase trimmed strings
        field_map = {name.lower().strip(): name for name in reader.fieldnames if name}

        # Identify date column
        date_col = next((field_map[k] for k in ["date", "txn date", "transaction date", "value date", "posted date"] if k in field_map), None)
        # Identify description column
        desc_col = next((field_map[k] for k in ["description", "narration", "particulars", "details", "remarks", "memo", "payee"] if k in field_map), None)
        # Single amount column
        amount_col = next((field_map[k] for k in ["amount", "txn amount", "transaction amount"] if k in field_map), None)
        # Credit / Debit split columns
        credit_col = next((field_map[k] for k in ["credit", "deposit", "cr", "credit amount", "received"] if k in field_map), None)
        debit_col = next((field_map[k] for k in ["debit", "withdrawal", "dr", "debit amount", "paid"] if k in field_map), None)
        type_col = next((field_map[k] for k in ["type", "transaction type", "cr/dr", "dr/cr", "cr_dr"] if k in field_map), None)

        if not date_col:
            raise ValueError("CSV is missing a recognized 'Date' column.")

        for row in reader:
            raw_date = row.get(date_col)
            if not raw_date:
                continue

            try:
                txn_date = parse_date_flexible(raw_date)
            except Exception:
                continue

            description = (row.get(desc_col) or "Transaction").strip() if desc_col else "Transaction"

            # Compute amount and type
            txn_amount = 0.0
            txn_type = "debit"

            if credit_col and debit_col:
                raw_cr = (row.get(credit_col) or "").replace(",", "").strip()
                raw_dr = (row.get(debit_col) or "").replace(",", "").strip()
                
                cr_val = float(raw_cr) if raw_cr and raw_cr != "-" else 0.0
                dr_val = float(raw_dr) if raw_dr and raw_dr != "-" else 0.0

                if cr_val > 0:
                    txn_amount = cr_val
                    txn_type = "credit"
                elif dr_val > 0:
                    txn_amount = dr_val
                    txn_type = "debit"
                else:
                    continue
            elif amount_col:
                raw_amt = (row.get(amount_col) or "0").replace(",", "").replace("$", "").replace("₹", "").strip()
                try:
                    val = float(raw_amt)
                except ValueError:
                    continue

                if val < 0:
                    txn_amount = abs(val)
                    txn_type = "debit"
                elif val > 0:
                    txn_amount = val
                    if type_col and row.get(type_col):
                        raw_type = row.get(type_col, "").lower().strip()
                        txn_type = "credit" if raw_type in ["cr", "credit", "c"] else "debit"
                    else:
                        txn_type = "credit" if "cr" in raw_amt.lower() else "debit"
                else:
                    continue
            else:
                continue

            category = classify_category(description, txn_type)

            transactions.append({
                "transaction_date": txn_date,
                "amount": round(txn_amount, 2),
                "transaction_type": txn_type,
                "category": category,
                "description": description,
                "is_flagged": False,
            })

    return transactions


def parse_excel_statement(file_path: str) -> List[Dict[str, Any]]:
    """Parse transactions from an Excel spreadsheet (.xlsx / .xls)."""
    import pandas as pd

    transactions = []
    # Read first sheet
    df = pd.read_excel(file_path)
    if df.empty:
        return transactions

    # Lowercase string columns
    col_map = {str(col).lower().strip(): col for col in df.columns}

    date_col = next((col_map[k] for k in ["date", "txn date", "transaction date", "value date"] if k in col_map), None)
    desc_col = next((col_map[k] for k in ["description", "narration", "particulars", "details", "remarks"] if k in col_map), None)
    amount_col = next((col_map[k] for k in ["amount", "txn amount", "transaction amount"] if k in col_map), None)
    credit_col = next((col_map[k] for k in ["credit", "deposit", "cr"] if k in col_map), None)
    debit_col = next((col_map[k] for k in ["debit", "withdrawal", "dr"] if k in col_map), None)
    type_col = next((col_map[k] for k in ["type", "transaction type", "cr/dr", "dr/cr"] if k in col_map), None)

    if not date_col:
        raise ValueError("Excel file is missing a recognized 'Date' column.")

    for _, row in df.iterrows():
        raw_date = row[date_col]
        if pd.isna(raw_date):
            continue

        if isinstance(raw_date, datetime):
            txn_date = raw_date
        else:
            try:
                txn_date = parse_date_flexible(str(raw_date))
            except Exception:
                continue

        desc = str(row[desc_col]).strip() if desc_col and not pd.isna(row[desc_col]) else "Transaction"

        txn_amount = 0.0
        txn_type = "debit"

        if credit_col and debit_col:
            cr = float(row[credit_col]) if not pd.isna(row[credit_col]) else 0.0
            dr = float(row[debit_col]) if not pd.isna(row[debit_col]) else 0.0
            if cr > 0:
                txn_amount = cr
                txn_type = "credit"
            elif dr > 0:
                txn_amount = dr
                txn_type = "debit"
            else:
                continue
        elif amount_col:
            val = float(row[amount_col]) if not pd.isna(row[amount_col]) else 0.0
            if val < 0:
                txn_amount = abs(val)
                txn_type = "debit"
            elif val > 0:
                txn_amount = val
                if type_col and not pd.isna(row[type_col]):
                    t = str(row[type_col]).lower().strip()
                    txn_type = "credit" if t in ["cr", "credit", "c"] else "debit"
                else:
                    txn_type = "debit"
            else:
                continue
        else:
            continue

        category = classify_category(desc, txn_type)

        transactions.append({
            "transaction_date": txn_date,
            "amount": round(txn_amount, 2),
            "transaction_type": txn_type,
            "category": category,
            "description": desc,
            "is_flagged": False,
        })

    return transactions


def parse_pdf_statement(file_path: str) -> List[Dict[str, Any]]:
    """Parse transactions from text-based PDF bank statements using pypdf and regex line matching."""
    from pypdf import PdfReader

    transactions = []
    reader = PdfReader(file_path)

    # Common line regex: Date | Description | Amount | (Optional CR/DR)
    # Examples:
    # 2026-05-12 Amazon Marketplace 1249.00 DR
    # 15/06/2026 Salary Credit - Infosys 85000.00 CR
    pattern = re.compile(
        r"(?P<date>\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\s+"
        r"(?P<desc>.+?)\s+"
        r"(?P<amount>[0-9,]+(?:\.[0-9]{2})?)\s*"
        r"(?P<type>CR|DR|cr|dr|Credit|Debit)?",
        re.IGNORECASE
    )

    for page in reader.pages:
        text = page.extract_text() or ""
        for line in text.splitlines():
            line = line.strip()
            if not line:
                continue

            match = pattern.search(line)
            if match:
                raw_date = match.group("date")
                raw_desc = match.group("desc").strip()
                raw_amt = match.group("amount").replace(",", "")
                raw_type = (match.group("type") or "DR").upper()

                try:
                    txn_date = parse_date_flexible(raw_date)
                    amount = float(raw_amt)
                except (ValueError, TypeError):
                    continue

                txn_type = "credit" if "CR" in raw_type or "CREDIT" in raw_type else "debit"
                category = classify_category(raw_desc, txn_type)

                transactions.append({
                    "transaction_date": txn_date,
                    "amount": round(amount, 2),
                    "transaction_type": txn_type,
                    "category": category,
                    "description": raw_desc,
                    "is_flagged": False,
                })

    return transactions


def parse_document_file(file_path: str, file_type: str) -> List[Dict[str, Any]]:
    """Route document to appropriate parser based on file type."""
    file_type = file_type.lower()
    if file_type == "csv":
        return parse_csv_statement(file_path)
    elif file_type in ["xlsx", "xls"]:
        return parse_excel_statement(file_path)
    elif file_type == "pdf":
        return parse_pdf_statement(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_type}")
