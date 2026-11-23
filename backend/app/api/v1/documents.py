import logging
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.financial import Document, Transaction
from app.core.dependencies import get_current_user
from app.schemas.financial import DocumentOut, DocumentUploadResponse
from app.services.document_processing_service import save_uploaded_file, parse_document_file
from app.services.feature_engineering_service import compute_and_update_customer_profile
from app.models.ml import FraudAlert
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = logging.getLogger(__name__)


def run_document_processing_pipeline(document_id: str, file_path: str, file_type: str, user_id: str, db_factory):
    """Background task to parse document, bulk insert transactions, and compute 20+ features."""
    db: Session = db_factory()
    try:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            return

        doc.status = "processing"
        db.commit()

        # Parse transactions from file
        parsed_txns = parse_document_file(file_path, file_type)
        if not parsed_txns:
            doc.status = "completed"
            doc.error_message = "No transactions found or file was empty"
            db.commit()
            return

        # Bulk insert transactions
        db_txns = []
        for t in parsed_txns:
            db_txn = Transaction(
                user_id=user_id,
                document_id=document_id,
                transaction_date=t["transaction_date"],
                amount=t["amount"],
                transaction_type=t["transaction_type"],
                category=t["category"],
                description=t["description"],
                is_flagged=t["is_flagged"]
            )
            db_txns.append(db_txn)

        db.add_all(db_txns)
        db.flush()

        # Compute 20+ financial features & update customer profile
        compute_and_update_customer_profile(db, user_id, parsed_txns)
        from app.services.recommendation_service import generate_smart_recommendations
        generate_smart_recommendations(db, user_id, [document_id])

        doc.status = "completed"
        db.commit()

    except Exception as e:
        db.rollback()
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.status = "failed"
            doc.error_message = str(e)
            db.commit()
    finally:
        db.close()


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload CSV, Excel, or PDF bank statement. Processing begins asynchronously."""
    file_path, file_type, file_size = await save_uploaded_file(file, current_user.id)

    doc = Document(
        user_id=current_user.id,
        file_name=file.filename or "statement",
        file_type=file_type,
        file_path=file_path,
        file_size=file_size,
        status="pending"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Trigger async processing pipeline in background
    from app.db.session import SessionLocal
    background_tasks.add_task(
        run_document_processing_pipeline,
        doc.id,
        file_path,
        file_type,
        current_user.id,
        SessionLocal
    )

    return DocumentUploadResponse(
        document_id=doc.id,
        file_name=doc.file_name,
        status="pending",
        message="Document uploaded successfully. Processing initiated."
    )


@router.get("", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all uploaded documents and their processing status."""
    return db.query(Document).filter(Document.user_id == current_user.id).order_by(Document.created_at.desc()).all()


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get details and processing status of a specific document."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.get("/{document_id}/status")
def get_document_status(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Poll processing status of an uploaded document."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    return {
        "id": doc.id,
        "status": doc.status,
        "error_message": doc.error_message,
        "updated_at": doc.updated_at
    }


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a document and associated transactions."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == current_user.id
    ).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    stored_file = None
    try:
        upload_root = Path(settings.LOCAL_STORAGE_DIR).resolve()
        candidate = Path(doc.file_path).resolve()
        candidate.relative_to(upload_root)
        stored_file = candidate
    except (OSError, ValueError):
        logger.warning("Skipping uploaded file cleanup for document %s: path is outside upload storage", document_id)

    transaction_ids = [row[0] for row in db.query(Transaction.id).filter(Transaction.document_id == doc.id).all()]
    if transaction_ids:
        db.query(FraudAlert).filter(FraudAlert.transaction_id.in_(transaction_ids)).delete(synchronize_session=False)

    db.delete(doc)
    db.commit()
    if stored_file and stored_file.is_file():
        try:
            stored_file.unlink()
        except OSError:
            logger.exception("Could not remove uploaded file for deleted document %s", document_id)
    return None
