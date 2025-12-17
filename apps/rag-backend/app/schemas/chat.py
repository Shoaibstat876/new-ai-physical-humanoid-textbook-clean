"""
Spec-Kit Trace
Feature: specs/<###-rag-chat-contracts>/
Spec: specs/<###-rag-chat-contracts>/spec.md
Plan: specs/<###-rag-chat-contracts>/plan.md
Tasks: specs/<###-rag-chat-contracts>/tasks.md
Story: US1 (Priority P1)
Task(s): T010, T011
Purpose: Define strict request/response schemas for RAG chat, chapter actions,
         and source attribution used by frontend and backend contracts.
Non-Goals: Business logic, persistence models, vector search internals,
           or API routing definitions.

NOTE: Replace <###-rag-chat-contracts>, US1, and task IDs with exact values.
This file represents a CONTRACT boundary and must remain backward compatible.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


# Trace: US1 / T010 — Source attribution returned from RAG
class Source(BaseModel):
    id: Optional[str] = None
    text: Optional[str] = None
    score: Optional[float] = None

    title: Optional[str] = None
    url: Optional[str] = None
    doc_id: Optional[str] = None


# Trace: US1 / T010 — Chat request contract (frontend → backend)
class ChatRequest(BaseModel):
    question: str


# Trace: US1 / T010 — Chat response contract (backend → frontend)
class ChatResponse(BaseModel):
    answer: str
    sources: List[Source] = Field(default_factory=list)


# Trace: US1 / T011 — Chapter-level action request (e.g., personalize, explain)
class ChapterActionRequest(BaseModel):
    doc_id: str
    selection: Optional[str] = None
    level: Optional[str] = "beginner"


# Trace: US1 / T011 — Chapter-level action response
class ChapterActionResponse(BaseModel):
    status: str
    message: str
