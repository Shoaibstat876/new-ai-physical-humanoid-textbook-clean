from typing import List, Optional

from pydantic import BaseModel, Field


class Source(BaseModel):
    id: Optional[str] = None
    text: Optional[str] = None
    score: Optional[float] = None

    title: Optional[str] = None
    url: Optional[str] = None
    doc_id: Optional[str] = None


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)


class ChapterActionRequest(BaseModel):
    doc_id: str
    selection: Optional[str] = None
    level: Optional[str] = "beginner"


class ChapterActionResponse(BaseModel):
    status: str
    message: str
