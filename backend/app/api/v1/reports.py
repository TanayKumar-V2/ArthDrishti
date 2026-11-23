import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models import Report
from app.core.dependencies import get_current_user
from app.schemas.xai_loans_reports import ReportOut, ReportGenerateRequest
from app.services.report_service import generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports & PDF Generation"])


@router.post("/generate", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def trigger_report_generation(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate executive risk and financial health PDF report."""
    return generate_pdf_report(db, current_user.id, payload.report_type)


@router.get("", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List generated reports for current user."""
    return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()


@router.get("/{report_id}/download")
def download_report_pdf(
    report_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Download compiled PDF report binary."""
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report or not os.path.exists(report.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found")

    return FileResponse(
        path=report.file_path,
        filename=os.path.basename(report.file_path),
        media_type="application/pdf"
    )
