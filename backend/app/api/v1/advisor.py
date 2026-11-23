from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.advisor import AdvisorChatRequest, AdvisorChatResponse
from app.services.llm_service import (
    generate_financial_advisor_response,
    get_user_financial_context,
)

router = APIRouter(prefix="/advisor", tags=["AI Advisor"])


@router.post("/chat", response_model=AdvisorChatResponse)
async def chat_with_advisor(
    request: AdvisorChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Interact with ArthDrishti AI Advisor powered by Groq (openai/gpt-oss-20b).
    Responses are grounded in the user's real financial health metrics and transaction history.
    """
    history_dicts = (
        [msg.model_dump() for msg in request.history] if request.history else None
    )
    result = await generate_financial_advisor_response(
        db=db,
        user_id=current_user.id,
        user_message=request.message,
        chat_history=history_dicts,
    )
    return result


@router.get("/context", response_model=Dict[str, Any])
def get_advisor_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieve user's financial profile metrics used to ground advisor responses.
    """
    return get_user_financial_context(db=db, user_id=current_user.id)
