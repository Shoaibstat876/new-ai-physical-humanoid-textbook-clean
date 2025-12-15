from __future__ import annotations

from typing import List, Optional

from openai import OpenAI

from app.config import settings
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    Source,
    ChapterActionRequest,
    ChapterActionResponse,
)
from app.services.qdrant_service import search
from app.services.docs_service import load_doc_markdown


# ---------------------------------------------------------
# OpenAI client + model config
# ---------------------------------------------------------

client = OpenAI(api_key=settings.openai_api_key)
RAG_MODEL = "gpt-4.1-mini"


# ---------------------------------------------------------
# Small helpers (keeps code DRY + consistent)
# ---------------------------------------------------------

def normalize_level(level: Optional[str]) -> str:
    return (level or "beginner").strip().lower()


def call_openai(system_prompt: str, user_content: str) -> str:
    """
    Single place to call OpenAI so we keep behavior consistent.

    Raises RuntimeError for service-level failures (API layer can decide HTTP mapping).
    """
    try:
        completion = client.chat.completions.create(
            model=RAG_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )
    except Exception as e:
        raise RuntimeError(f"[rag_service] OpenAI chat completion failed: {e}") from e

    return completion.choices[0].message.content or ""


def build_prompt(question: str, contexts: List[str]) -> str:
    """
    Build a strict RAG prompt.
    We keep it simple and enforce: answer only from context.
    """
    context_block = "\n\n---\n\n".join(contexts) if contexts else "No relevant context found."

    return (
        "You are a teaching assistant for the 'Physical AI & Humanoid Robotics' textbook.\n"
        "Answer the QUESTION STRICTLY using the CONTEXT.\n"
        "If the answer is not in the context, say you don't know.\n"
        "Do NOT add new topics.\n\n"
        f"QUESTION:\n{question}\n\n"
        f"CONTEXT:\n{context_block}\n"
    )


def level_persona_text(level: str) -> str:
    """
    Persona instructions used for explanations + personalization.
    """
    if level == "advanced":
        return (
            "Explain for an advanced learner. Keep technical details, be precise, "
            "use clear structure, and include deeper concepts when helpful."
        )
    if level == "intermediate":
        return (
            "Explain for an intermediate learner. Use some technical terms, "
            "avoid heavy math, and use bullet points when useful."
        )
    return (
        "Explain for a beginner with no robotics background. Use very simple English, "
        "short sentences, and classroom-style examples."
    )


def build_personalization_instruction(level: Optional[str]) -> str:
    """
    Map learner level -> rewriting instruction.
    """
    lvl = normalize_level(level)

    if lvl == "beginner":
        return (
            "Rewrite this chapter for a BEGINNER. Use simple English and classroom-style examples. "
            "Preserve Markdown."
        )
    if lvl == "intermediate":
        return (
            "Rewrite this chapter for an INTERMEDIATE learner. Use moderate technical language. "
            "Preserve Markdown."
        )
    if lvl == "advanced":
        return (
            "Rewrite this chapter for an ADVANCED learner. Use deeper insights and precise terms. "
            "Preserve Markdown."
        )

    return "Rewrite clearly for a general learner and preserve Markdown structure."


# ---------------------------------------------------------
# RAG Chat (SAFE MODE)
# ---------------------------------------------------------

async def answer_question(req: ChatRequest) -> ChatResponse:
    """
    Full RAG pipeline for textbook Q&A.

    SAFE MODE behavior (from settings.rag_mode):
      - "off"  => do not call Qdrant, answer with empty context (will say don't know)
      - "on"   => Qdrant must work, otherwise raise error
      - "auto" => try Qdrant; if it fails, silently fallback to no context
    """
    contexts: List[str] = []
    sources: List[Source] = []

    if settings.rag_mode != "off":
        try:
            hits = search(req.question, limit=5)

            # ✅ Guard: if Qdrant is OFF / unreachable OR no data indexed, return friendly answer (200 OK)
            if not hits:
                return ChatResponse(
                    answer=(
                        "RAG is unavailable right now (Qdrant not reachable or no data indexed). "
                        "Please start Qdrant / index data, or try again later."
                    ),
                    sources=[],
                )

            contexts = [h["text"] for h in hits]
            sources = [
                Source(
                    id=f'{h["doc_id"]}-{h["chunk_index"]}',
                    text=h["text"],
                    score=h["score"],
                )
                for h in hits
            ]
        except Exception as e:
            if settings.rag_mode == "on":
                raise RuntimeError(f"Qdrant failed: {e}") from e
            # "auto" => silent fallback

    prompt = build_prompt(req.question, contexts)

    system_prompt = (
        "You answer strictly from the provided context.\n"
        "Rules:\n"
        "- If context is empty or insufficient, say: \"I don't know based on the provided context.\"\n"
        "- Do NOT use outside knowledge.\n"
        "- Keep the answer concise and clear.\n"
    )

    # ✅ Optional (recommended): OpenAI key guard
    if not settings.openai_api_key:
        return ChatResponse(
            answer="OpenAI API key is not configured. Add OPENAI_API_KEY in backend .env.",
            sources=[],
        )

    answer = call_openai(system_prompt=system_prompt, user_content=prompt).strip()

    if not answer:
        answer = "I don't know based on the provided context."

    return ChatResponse(answer=answer, sources=sources)


# =====================================================================
# Ask This Section (Level 7)
# =====================================================================

async def handle_ask_section(req: ChapterActionRequest) -> ChapterActionResponse:
    """
    UI contract:
      - selection empty => status="error" + friendly message
      - selection present => status="ok" + explanation
    """
    if not req.selection or not req.selection.strip():
        return ChapterActionResponse(
            status="error",
            message=(
                "No section was selected. Please highlight a paragraph in the "
                "chapter first, then click 'Ask This Section'."
            ),
        )

    # Optional sanity check: chapter exists (not required to explain selection)
    try:
        _ = load_doc_markdown(req.doc_id)
    except FileNotFoundError:
        pass

    level = normalize_level(req.level)
    persona = level_persona_text(level)

    system_prompt = (
        "You are a teaching assistant for the 'Physical AI & Humanoid Robotics' course.\n"
        "You will receive a selected section from the textbook.\n"
        "Explain it clearly using the persona instructions.\n\n"
        f"Persona instructions: {persona}\n\n"
        "Rules:\n"
        "- Do not invent new topics.\n"
        "- You may reorder ideas for clarity.\n"
        "- Use headings or bullet points if helpful.\n"
    )

    user_content = (
        "Here is the selected section. Explain it according to the persona rules:\n\n"
        f"{req.selection}"
    )

    try:
        explanation = call_openai(system_prompt=system_prompt, user_content=user_content).strip()
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Ask This Section failed while contacting the AI model: {e}",
        )

    if not explanation:
        explanation = "Sorry, I could not generate an explanation."

    return ChapterActionResponse(status="ok", message=explanation)


# ---------------------------------------------------------
# Translate chapter to Urdu (Level 7)
# ---------------------------------------------------------

async def handle_translate_urdu(req: ChapterActionRequest) -> ChapterActionResponse:
    """
    Translate an entire chapter to Urdu, preserving Markdown structure.
    """
    try:
        markdown = load_doc_markdown(req.doc_id)
    except FileNotFoundError as e:
        return ChapterActionResponse(status="error", message=str(e))

    system_prompt = (
        "You are a professional technical translator.\n"
        "Translate the following Markdown into Urdu.\n"
        "Preserve ALL Markdown structure (headings, lists, code blocks, inline code).\n"
        "Do NOT add new content.\n"
    )

    try:
        urdu_markdown = call_openai(system_prompt=system_prompt, user_content=markdown).strip()
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Translation to Urdu failed while contacting the AI model: {e}",
        )

    if not urdu_markdown:
        urdu_markdown = "ترجمہ تیار نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔"

    return ChapterActionResponse(status="ok", message=urdu_markdown)


# ---------------------------------------------------------
# Manual Personalization (Level 8)
# ---------------------------------------------------------

async def handle_personalize(req: ChapterActionRequest) -> ChapterActionResponse:
    """
    Level 8: Manual personalization of a chapter by learner level.
    Returns rewritten markdown, preserving structure.
    """
    try:
        markdown = load_doc_markdown(req.doc_id)
    except FileNotFoundError as e:
        return ChapterActionResponse(status="error", message=str(e))

    instruction = build_personalization_instruction(req.level)

    system_prompt = (
        "You are an expert educator for the Physical AI & Humanoid Robotics textbook.\n"
        "Rewrite the chapter based on the instruction.\n\n"
        "Rules:\n"
        "- Preserve Markdown EXACTLY (headings, lists, code blocks).\n"
        "- Maintain technical accuracy.\n"
        "- Do NOT add new topics.\n"
        "- Do NOT remove important safety notes.\n"
    )

    user_content = f"INSTRUCTION:\n{instruction}\n\nCHAPTER:\n\n{markdown}"

    try:
        personalized_markdown = call_openai(system_prompt=system_prompt, user_content=user_content).strip()
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Personalization failed while contacting the AI model: {e}",
        )

    if not personalized_markdown:
        personalized_markdown = "Sorry, I could not personalize this chapter."

    return ChapterActionResponse(status="ok", message=personalized_markdown)
