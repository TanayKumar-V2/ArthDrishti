import os
import re
import csv
import uuid
from datetime import datetime
from typing import List, Dict, Any, Tuple
from fastapi import UploadFile, HTTPException, status
from app.core.config import settings

def classify_category(description: str, transaction_type: str) -> str:
    """Use a neutral placeholder; the parsed ledger is categorized by Groq after extraction."""
    return "Uncategorized"


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
    """Parse text PDFs with either row-oriented or cell-per-line transaction tables."""
    from pypdf import PdfReader

    transactions = []
    reader = PdfReader(file_path)

    # Some PDF extractors return one table cell per line. Supported layouts:
    # date, description, debit, credit, balance; and
    # date, reference, description, category, debit, credit, balance.
    transaction_date_pattern = re.compile(
        r"^(?:\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}[-/ ][A-Za-z]{3,9}[-/ ]\d{4})$"
    )
    amount_pattern = re.compile(r"-?\d[\d,]*(?:\.\d{1,2})?")

    def amount_from_cell(value: str) -> float:
        match = amount_pattern.search(value.replace("−", "-"))
        if not match:
            return 0.0
        try:
            return abs(float(match.group(0).replace(",", "")))
        except ValueError:
            return 0.0

    def signed_amount_from_cell(value: str) -> float:
        match = amount_pattern.search(value.replace(chr(8722), "-"))
        if not match:
            return 0.0
        try:
            return float(match.group(0).replace(",", ""))
        except ValueError:
            return 0.0

    balance_entries = []

    for page in reader.pages:
        text = page.extract_text() or ""
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        date_rows = [index for index, line in enumerate(lines) if transaction_date_pattern.fullmatch(line)]

        # Parse statements whose extracted text preserves the table's column order.
        for date_index, start in enumerate(date_rows):
            end = date_rows[date_index + 1] if date_index + 1 < len(date_rows) else len(lines)
            row = lines[start:end]
            try:
                txn_date = parse_date_flexible(row[0])
            except (ValueError, TypeError):
                continue

            if len(row) >= 7:
                description = row[2].strip()
                debit = amount_from_cell(row[4])
                credit = amount_from_cell(row[5])
                if not description or (debit <= 0 and credit <= 0):
                    continue

                txn_type = "credit" if credit > 0 else "debit"
                amount = credit if credit > 0 else debit
                transactions.append({
                    "transaction_date": txn_date,
                    "amount": round(amount, 2),
                    "transaction_type": txn_type,
                    "category": classify_category(description, txn_type),
                    "description": description,
                    "is_flagged": False,
                })
            elif len(row) == 6 and not amount_pattern.fullmatch(row[-1]):
                # A trailing CR/DR cell shifts amount and balance one place left.
                description = row[1].strip()
                amount = amount_from_cell(row[-3])
                balance = signed_amount_from_cell(row[-2])
                marker_text = row[-1]
                if not description or amount <= 0:
                    continue

                transaction = {
                    "transaction_date": txn_date,
                    "amount": round(amount, 2),
                    "transaction_type": "debit",
                    "category": "Other Expenses",
                    "description": description,
                    "is_flagged": False,
                }
                transactions.append(transaction)
                balance_entries.append((transaction, balance, description, marker_text))
            elif len(row) >= 5:
                # Compact statements may extract as date, narration,
                # reference, amount, balance. The reference is numeric too,
                # so do not interpret it as a debit or credit value.
                description = row[-4].strip()
                amount = amount_from_cell(row[-2])
                balance = signed_amount_from_cell(row[-1])
                if not description or amount <= 0:
                    continue

                transaction = {
                    "transaction_date": txn_date,
                    "amount": round(amount, 2),
                    "transaction_type": "debit",
                    "category": "Other Expenses",
                    "description": description,
                    "is_flagged": False,
                }
                transactions.append(transaction)
                balance_entries.append((transaction, balance, description, description))
            else:
                continue

    def marked_transaction_type(description: str):
        marker_text = description.upper()
        if re.search(r"\b(?:CR|CREDIT)\b", marker_text):
            return "credit"
        if re.search(r"\b(?:DR|DEBIT)\b", marker_text):
            return "debit"
        return None

    # Determine statement ordering from rows with explicit CR/DR markers,
    # then use running-balance movement for compact rows with no marker.
    orientation_matches = {"ascending": 0, "descending": 0}
    for index in range(1, len(balance_entries)):
        transaction, balance, description, marker_text = balance_entries[index]
        marker_type = marked_transaction_type(marker_text)
        if marker_type is None:
            continue

        previous_balance = balance_entries[index - 1][1]
        delta = balance - previous_balance
        if abs(abs(delta) - float(transaction["amount"])) > 0.02:
            continue

        ascending_type = "credit" if delta > 0 else "debit"
        descending_type = "credit" if delta < 0 else "debit"
        if ascending_type == marker_type:
            orientation_matches["ascending"] += 1
        if descending_type == marker_type:
            orientation_matches["descending"] += 1

    ascending = orientation_matches["ascending"] >= orientation_matches["descending"]
    for index, (transaction, balance, description, marker_text) in enumerate(balance_entries):
        inferred_type = None
        if index > 0:
            previous_balance = balance_entries[index - 1][1]
            balance_delta = balance - previous_balance if ascending else previous_balance - balance
            if abs(abs(balance_delta) - float(transaction["amount"])) <= 0.02:
                inferred_type = "credit" if balance_delta > 0 else "debit"

        if inferred_type is None:
            inferred_type = marked_transaction_type(marker_text)

        if inferred_type:
            transaction["transaction_type"] = inferred_type
            transaction["category"] = classify_category(description, inferred_type)

    if transactions:
        return transactions

    # Row-oriented examples: 2026-05-12 Amazon Marketplace 1249.00 DR
    # or 15/06/2026 Salary Credit - Infosys 85000.00 CR
    pattern = re.compile(
        r"(?P<date>\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{1,2}[-/ ][A-Za-z]{3,9}[-/ ]\d{4})\s+"
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
