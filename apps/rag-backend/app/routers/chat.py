from typing import Optional, Dict, Any

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from openai import AsyncOpenAI

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    ChapterActionRequest,
    ChapterActionResponse,
)
from app.services.rag_service import (
    answer_question,
    handle_ask_section,
    handle_translate_urdu,
    handle_personalize,  # Level 8 manual personalization
    build_personalization_instruction,  # centralized persona builder
)
from app.services.auth_client import (
    get_user_from_betterauth,
    extract_preferred_level,
)
from app.services.docs_service import load_doc_markdown
from app.config import settings

# ---------------------------------------------------------
# OpenAI async client (uses your OPENAI_API_KEY from .env)
# ---------------------------------------------------------
client = AsyncOpenAI(api_key=settings.openai_api_key)

# All chat routes share the /chat prefix
router = APIRouter(prefix="/chat", tags=["chat"])


# ================================
#  SCHEMAS FOR AUTO PERSONALIZE
# ================================
class AutoPersonalizeRequest(BaseModel):
    """
    Request body for auto personalization.
    - doc_id: e.g. 'foundations/why-physical-ai-matters'
    - original_markdown: optional override if frontend sends full content
    """
    doc_id: str
    original_markdown: Optional[str] = None


class AutoPersonalizeResponse(BaseModel):
    """
    Response body for auto personalization.
    Frontend can use:
    - preferred_level: which level was applied
    - user_email: who it was personalized for (if available)
    - personalized_markdown: final rewritten chapter
    """
    preferred_level: Optional[str] = None
    user_email: Optional[str] = None
    personalized_markdown: str


# ================================
#  MAIN CHAT ENDPOINT (RAG)
# ================================
@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest) -> ChatResponse:
    """
    Full RAG endpoint (Level 6).
    Uses Qdrant + embeddings to answer questions from textbook docs.
    """
    return await answer_question(payload)


# ================================
#  CHAPTER ACTIONS — TOOLS
# ================================
@router.post("/ask-section", response_model=ChapterActionResponse)
async def ask_section(payload: ChapterActionRequest) -> ChapterActionResponse:
    """
    Ask-this-section tool (Level 7).
    """
    return await handle_ask_section(payload)


@router.post("/translate/urdu", response_model=ChapterActionResponse)
async def translate_urdu(
    payload: ChapterActionRequest,
) -> ChapterActionResponse:
    """
    Real Urdu translation (Level 7).
    """
    return await handle_translate_urdu(payload)


@router.post("/personalize", response_model=ChapterActionResponse)
async def personalize(
    payload: ChapterActionRequest,
) -> ChapterActionResponse:
    """
    Manual personalization endpoint (Level 8).
    Frontend sends level explicitly; this is already working.
    """
    return await handle_personalize(payload)


# ================================
#  (OPTIONAL) SIMPLE LEVEL → PERSONA
#  (kept for reuse if needed elsewhere)
# ================================
def level_to_persona(level: Optional[str]) -> str:
    """
    Fallback persona text if build_personalization_instruction
    is not available or level is unknown.
    """
    level_normalized = (level or "").strip().lower()

    if level_normalized == "beginner":
        return (
            "Explain to a first-semester student with no robotics background. "
            "Use very simple English, short sentences, friendly tone, and many "
            "real-life examples from classroom and everyday life."
        )

    if level_normalized == "intermediate":
        return (
            "Explain for a student who knows basic programming and some AI. "
            "Use clear technical terms, simple diagrams in text, and connect ideas "
            "to robots, sensors, and simulations when useful."
        )

    if level_normalized == "advanced":
        return (
            "Explain for an advanced learner or engineer. "
            "Use precise technical language, math when helpful, and deeper "
            "connections to system design and architecture."
        )

    # Fallback: safe, teacher-friendly style
    return (
        "Explain in simple, teacher-friendly language with examples and analogies. "
        "Keep things clear and not too technical."
    )


async def generate_personalized_markdown(
    system_prompt: str,
    original_markdown: str,
) -> str:
    """
    Call the LLM to rewrite the chapter according to the persona rules.
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        "Rewrite the following chapter content according to the persona "
                        "rules. Keep valid Markdown headings, lists, and code blocks.\n\n"
                        f"{original_markdown}"
                    ),
                },
            ],
            temperature=0.2,
        )
        # OpenAI typing quirk – these attributes are present at runtime
        # type: ignore[attr-defined]
        content = response.choices[0].message.content
        return content or ""
    except Exception as e:
        # Return visible error string; frontend can display or log it
        return f"ERROR calling LLM for personalization: {e}"


# ================================
#  LEVEL 10: AUTO-PERSONALIZATION
# ================================
@router.post("/personalize/auto", response_model=AutoPersonalizeResponse)
async def personalize_chapter_auto(
    payload: AutoPersonalizeRequest,
    request: Request,
) -> AutoPersonalizeResponse:
    """
    Auto-personalization endpoint (Level 10).

    If BetterAuth is available:
      - uses user's preferredLevel from their profile.

    If BetterAuth is OFFLINE or user not logged in:
      - falls back to a 'beginner' guest profile.
    """

    # --- 1) Try to get logged-in user from BetterAuth ---
    user: Optional[Dict[str, Any]] = await get_user_from_betterauth(request)

    if user:
        preferred_level = extract_preferred_level(user) or "beginner"
        user_email: Optional[str] = (
            user.get("email") if isinstance(user, dict) else None
        )
    else:
        # Fallback: demo mode, no auth server / not logged in
        preferred_level = "beginner"
        user_email = None

    # --- 2) Get original markdown ---
    if payload.original_markdown:
        original_markdown = payload.original_markdown
    else:
        try:
            # This reads from your Docusaurus docs folder
            original_markdown = load_doc_markdown(payload.doc_id)
        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail=f"Chapter markdown not found for doc_id={payload.doc_id!r}.",
            )

    # --- 3) Build personalization instruction from rag_service ---
    # If build_personalization_instruction can't handle the level,
    # we fall back to the simpler persona text.
    try:
        instruction = build_personalization_instruction(preferred_level)
    except Exception:
        instruction = level_to_persona(preferred_level)

    # --- 4) Build system prompt for LLM ---
    system_prompt = (
        "You are an AI educator for the 'Physical AI & Humanoid Robotics' course.\n"
        "You receive a raw textbook chapter in Markdown.\n"
        "Your job is to auto-personalize it for a specific learner profile.\n\n"
        f"Learner profile level: {preferred_level}\n"
        f"Personalization instruction:\n{instruction}\n\n"
        "Rules:\n"
        "- Keep technical correctness.\n"
        "- Preserve Markdown headings, lists, and code blocks.\n"
        "- Add small examples and analogies suited to the learner level.\n"
        "- Do NOT introduce completely new chapters or topics; only rewrite/expand "
        "  what is already given.\n"
    )

    # --- 5) Call LLM ---
    personalized_markdown = await generate_personalized_markdown(
        system_prompt=system_prompt,
        original_markdown=original_markdown,
    )

    # --- 6) Final response ---
    return AutoPersonalizeResponse(
        preferred_level=preferred_level,
        user_email=user_email,
        personalized_markdown=personalized_markdown,
    )
