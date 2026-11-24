import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from xml.sax.saxutils import escape

from fastapi import HTTPException
from sqlalchemy.orm import Session
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

from app.core.config import settings
from app.models import Report
from app.models.financial import Transaction
from app.models.ml import RiskScore
from app.services.feature_engineering_service import compute_20_financial_features


def generate_pdf_report(
    db: Session,
    user_id: str,
    report_type: str = "comprehensive",
    document_ids: Optional[List[str]] = None,
) -> Report:
    """Create a PDF report from this user's parsed statement transactions."""
    transaction_query = db.query(Transaction).filter(Transaction.user_id == user_id)
    if document_ids is not None:
        transaction_query = (
            transaction_query.filter(Transaction.document_id.in_(document_ids))
            if document_ids
            else transaction_query.filter(False)
        )
    transactions = transaction_query.order_by(Transaction.transaction_date.asc()).all()
    if not transactions:
        raise HTTPException(
            status_code=400,
            detail="Upload a statement with parsed transactions before generating a report.",
        )

    transaction_data = [
        {
            "transaction_date": txn.transaction_date,
            "amount": float(txn.amount),
            "transaction_type": txn.transaction_type,
            "category": txn.category,
            "description": txn.description,
        }
        for txn in transactions
    ]
    features = compute_20_financial_features(transaction_data)
    if not features:
        raise HTTPException(status_code=400, detail="No financial features could be calculated from this statement.")

    if document_ids is not None:
        from app.services.prediction_service import evaluate_customer_credit_risk
        risk_result = evaluate_customer_credit_risk(db, user_id, document_ids)
        probability = float(risk_result["default_probability"])
        risk_band = risk_result["risk_band"]
        health_score = float(risk_result["financial_health_score"])
    else:
        risk = db.query(RiskScore).filter(RiskScore.user_id == user_id).order_by(RiskScore.created_at.desc()).first()
        if not risk:
            from app.services.prediction_service import evaluate_customer_credit_risk
            risk_result = evaluate_customer_credit_risk(db, user_id)
            probability = float(risk_result["default_probability"])
            risk_band = risk_result["risk_band"]
            health_score = float(risk_result["financial_health_score"])
        else:
            probability = float(risk.default_probability)
            risk_band = risk.risk_band
            health_score = float(risk.financial_health_score)

    total_income = sum(float(txn.amount) for txn in transactions if txn.transaction_type == "credit")
    total_expenses = sum(float(txn.amount) for txn in transactions if txn.transaction_type == "debit")
    report_id = str(uuid.uuid4())
    user_report_dir = os.path.join(settings.LOCAL_STORAGE_DIR, str(user_id))
    os.makedirs(user_report_dir, exist_ok=True)
    file_path = os.path.join(user_report_dir, f"risk_report_{report_id[:8]}.pdf")

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Heading1"], fontSize=20,
        textColor=colors.HexColor("#0f172a"), spaceAfter=15,
    )
    subtitle_style = ParagraphStyle(
        "ReportSub", parent=styles["Normal"], fontSize=10,
        textColor=colors.HexColor("#64748b"), spaceAfter=20,
    )
    heading_style = ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"], fontSize=13,
        textColor=colors.HexColor("#1e293b"), spaceBefore=15, spaceAfter=10,
    )

    report_title = report_type.replace("_", " ").title()
    elements = [
        Paragraph("ArthDrishti Financial Risk Intelligence Platform", title_style),
        Paragraph(
            f"{escape(report_title)} Report | Generated {datetime.now(timezone.utc).strftime('%B %d, %Y')}",
            subtitle_style,
        ),
        Spacer(1, 10),
    ]

    score_data = [
        ["Credit Risk Tier", "Default Probability", "Financial Health Score"],
        [risk_band, f"{probability * 100:.1f}%", f"{health_score:.1f}/100"],
    ]
    score_table = Table(score_data, colWidths=[170, 170, 170])
    score_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#334155")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    elements.extend([score_table, Spacer(1, 15), Paragraph("Statement Analysis", heading_style)])

    metrics = [
        ["Transactions analyzed", f"{len(transactions):,}"],
        ["Total income", f"Rs. {total_income:,.2f}"],
        ["Total expenses", f"Rs. {total_expenses:,.2f}"],
        ["Net cash flow", f"Rs. {total_income - total_expenses:,.2f}"],
        ["Monthly income average", f"Rs. {float(features.get('monthly_income_avg', 0)):,.2f}"],
        ["Monthly expense average", f"Rs. {float(features.get('monthly_expense_avg', 0)):,.2f}"],
        ["Savings rate", f"{float(features.get('savings_rate', 0)) * 100:.1f}%"],
        ["Recurring expense ratio", f"{float(features.get('recurring_expense_ratio', 0)) * 100:.1f}%"],
        ["Discretionary spending ratio", f"{float(features.get('discretionary_spending_ratio', 0)) * 100:.1f}%"],
        ["Surplus coverage estimate", f"{float(features.get('emergency_fund_months', 0)):.1f} months"],
    ]
    metrics_table = Table(metrics, colWidths=[255, 255])
    metrics_table.setStyle(TableStyle([
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1e293b")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    elements.append(metrics_table)

    SimpleDocTemplate(file_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40).build(elements)

    report_record = Report(
        id=report_id,
        user_id=user_id,
        report_type=report_type,
        file_path=file_path,
        status="completed",
        created_at=datetime.now(timezone.utc),
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)
    return report_record
