from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class ChatMessage(BaseModel):
    sender: str  # "user" | "assistant"
    text: str


class AdvisorChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class AdvisorChatResponse(BaseModel):
    response: str
    model: str
    source: str  # "groq" | "fallback"
    metrics: Dict[str, Any]
