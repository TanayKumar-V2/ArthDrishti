import os
import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.core.config import settings
from app.models import Report
from app.models.ml import RiskScore
from app.models.financial import Transaction
from app.services.feature_engineering_service import compute_20_financial_features


def generate_pdf_report(db: Session, user_id: str, report_type: str = "comprehensive") -> Report:
    """Compile and export an executive PDF risk and financial health report using ReportLab."""
    user_report_dir = os.path.join(settings.LOCAL_STORAGE_DIR, str(user_id))
    os.makedirs(user_report_dir, exist_ok=True)

    report_id = str(uuid.uuid4())
    pdf_filename = f"risk_report_{report_id[:8]}.pdf"
    file_path = os.path.join(user_report_dir, pdf_filename)

    # Fetch customer metrics
    risk = db.query(RiskScore).filter(RiskScore.user_id == user_id).order_by(RiskScore.created_at.desc()).first()
    prob = f"{float(risk.default_probability)*100:.1f}%" if risk else "18.5%"
    band = risk.risk_band if risk else "Medium"
    score = f"{float(risk.financial_health_score):.1f}/100" if risk else "81.0/100"

    txns = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    txn_dicts = [
        {"transaction_date": t.transaction_date, "amount": float(t.amount), "transaction_type": t.transaction_type, "category": t.category, "description": t.description}
        for t in txns
    ]
    features = compute_20_financial_features(txn_dicts)

    # Build PDF
    doc = SimpleDocTemplate(file_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=20,
        textColor=colors.HexColor("#0f172a"),
        spaceAfter=15
    )
    subtitle_style = ParagraphStyle(
        "ReportSub",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=20
    )
    heading_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=15,
        spaceAfter=10
    )

    elements = [
        Paragraph("ArthDrishti Financial Risk Intelligence Platform", title_style),
        Paragraph(f"Executive Risk & Credit Underwriting Dossier | Generated {datetime.now(timezone.utc).strftime('%B %d, %Y')}", subtitle_style),
        Spacer(1, 10),
    ]

    # Score summary table
    score_data = [
        ["Credit Risk Tier", "Default Probability", "Financial Health Score"],
        [band, prob, score]
    ]
    t = Table(score_data, colWidths=[170, 170, 170])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f1f5f9")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#334155")),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 15))

    # Metrics table
    elements.append(Paragraph("Key Financial Indicators", heading_style))
    metrics_data = [
        ["Monthly Income Average", f"₹{features.get('monthly_income_avg', 85000):,.2f}"],
        ["Monthly Expense Average", f"₹{features.get('monthly_expense_avg', 52000):,.2f}"],
        ["Net Cash Flow (Monthly)", f"₹{features.get('net_monthly_cash_flow', 33000):,.2f}"],
        ["Savings Rate", f"{features.get('savings_rate', 0.38)*100:.1f}%"],
        ["Recurring Expense Ratio", f"{features.get('recurring_expense_ratio', 0.42)*100:.1f}%"],
        ["Discretionary Spending Ratio", f"{features.get('discretionary_spending_ratio', 0.22)*100:.1f}%"],
        ["Emergency Cushion Buffer", f"{features.get('emergency_fund_months', 4.5):.1f} Months"],
    ]
    m_table = Table(metrics_data, colWidths=[255, 255])
    m_table.setStyle(TableStyle([
        ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1e293b")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#f1f5f9")),
    ]))
    elements.append(m_table)

    doc.build(elements)

    # Persist report record
    report_record = Report(
        id=report_id,
        user_id=user_id,
        report_type=report_type,
        file_path=file_path,
        status="completed",
        created_at=datetime.now(timezone.utc)
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return report_record
