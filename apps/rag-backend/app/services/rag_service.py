from __future__ import annotations

from typing import List

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
# OpenAI client + model config (library-level)
# ---------------------------------------------------------

client = OpenAI(api_key=settings.openai_api_key)

RAG_MODEL = "gpt-4.1-mini"


# ---------------------------------------------------------
# Build RAG prompt
# ---------------------------------------------------------

def build_prompt(question: str, contexts: List[str]) -> str:
    """
    Build a simple RAG prompt using the retrieved context chunks.

    Contract:
      - `question` is the learner's natural language question.
      - `contexts` is a list of chunk texts (may be empty).
    """
    context_block = "\n\n---\n\n".join(contexts) or "No relevant context found."

    return (
        "You are a teaching assistant for the 'Physical AI & Humanoid Robotics' textbook.\n"
        "Answer the question STRICTLY using the CONTEXT below.\n"
        "If the answer is not in the context, say you don't know.\n\n"
        f"QUESTION:\n{question}\n\n"
        f"CONTEXT:\n{context_block}"
    )


# ---------------------------------------------------------
# RAG: Answer a question using Qdrant + OpenAI
# ---------------------------------------------------------

async def answer_question(req: ChatRequest) -> ChatResponse:
    """
    Full RAG pipeline for textbook Q&A.

    Steps:
      1) Vector search in Qdrant for the question.
      2) Build a context-aware prompt.
      3) Call OpenAI to generate an answer strictly from that context.
      4) Return ChatResponse with answer and Source list.
    """
    hits = search(req.question, limit=5)
    contexts = [h["text"] for h in hits]

    prompt = build_prompt(req.question, contexts)

    try:
        completion = client.chat.completions.create(
            model=RAG_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You answer strictly from the given context.",
                },
                {"role": "user", "content": prompt},
            ],
        )
    except Exception as e:
        # Let the API layer decide how to turn this into HTTP
        raise RuntimeError(f"[rag_service] OpenAI chat completion failed: {e}") from e

    message_content = completion.choices[0].message.content or ""

    sources: List[Source] = [
        Source(
            id=f'{h["doc_id"]}-{h["chunk_index"]}',
            text=h["text"],
            score=h["score"],
        )
        for h in hits
    ]

    return ChatResponse(answer=message_content, sources=sources)


# =====================================================================
# Ask This Section (Level 7)
# =====================================================================

async def handle_ask_section(req: ChapterActionRequest) -> ChapterActionResponse:
    """
    Level 7: Explain a selected section of the chapter.

    UI contract:
      - If `selection` is empty -> status="error" + friendly message.
      - Otherwise -> status="ok" + explanation text.
    """
    # 1) Validate user selection
    if not req.selection or not req.selection.strip():
        return ChapterActionResponse(
            status="error",
            message=(
                "No section was selected. Please highlight a paragraph in the "
                "chapter first, then click 'Ask This Section'."
            ),
        )

    # 2) Try to load chapter (optional sanity check, not required)
    try:
        _ = load_doc_markdown(req.doc_id)
    except FileNotFoundError:
        # We can still explain the raw selection even if the chapter file is missing.
        pass

    # 3) Persona style based on requested level
    level = (req.level or "beginner").lower()

    if level == "advanced":
        persona = (
            "Explain this section for an advanced learner. "
            "Keep technical details, but still be clear and structured. "
            "You may mention equations or deeper concepts when helpful."
        )
    elif level == "intermediate":
        persona = (
            "Explain this section for an intermediate learner who knows some "
            "basic AI and programming. Use clear technical terms, but avoid "
            "heavy math. Use short paragraphs and bullet points when useful."
        )
    else:
        persona = (
            "Explain this section for a beginner student with no robotics "
            "background. Use very simple English, short sentences, and "
            "classroom-style examples."
        )

    system_prompt = (
        "You are a teaching assistant for the 'Physical AI & Humanoid Robotics' course.\n"
        "You will receive a section of the textbook.\n"
        "Your job is to explain it clearly, following the persona instructions.\n\n"
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
        completion = client.chat.completions.create(
            model=RAG_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Ask This Section failed while contacting the AI model: {e}",
        )

    explanation = completion.choices[0].message.content or ""

    return ChapterActionResponse(
        status="ok",
        message=explanation or "Sorry, I could not generate an explanation.",
    )


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
        "You are a professional technical translator. "
        "Translate the following Markdown content into Urdu. "
        "Preserve ALL Markdown structure (headings, lists, code blocks)."
    )

    try:
        completion = client.chat.completions.create(
            model=RAG_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": markdown},
            ],
        )
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Translation to Urdu failed while contacting the AI model: {e}",
        )

    urdu_markdown = completion.choices[0].message.content or ""

    return ChapterActionResponse(status="ok", message=urdu_markdown)


# ---------------------------------------------------------
# Manual Personalization (Level 8)
# ---------------------------------------------------------

def build_personalization_instruction(level: str | None) -> str:
    """
    Map a learner level string to a clear rewriting instruction.
    """
    normalized = (level or "beginner").lower()

    if normalized == "beginner":
        return (
            "Rewrite this chapter for a BEGINNER. Use simple English and "
            "classroom-style examples. Preserve Markdown."
        )

    if normalized == "intermediate":
        return (
            "Rewrite this chapter for an INTERMEDIATE learner. "
            "Use moderate technical language. Preserve Markdown."
        )

    if normalized == "advanced":
        return (
            "Rewrite this chapter for an ADVANCED learner. "
            "Use deeper insights and precise terms. Preserve Markdown."
        )

    return "Rewrite clearly for a general learner and preserve Markdown structure."


async def handle_personalize(req: ChapterActionRequest) -> ChapterActionResponse:
    """
    Level 8: Manual personalization of a chapter by learner level.

    UI contract:
      - Returns status="ok" + rewritten markdown on success.
      - Returns status="error" + message on failure.
    """
    try:
        markdown = load_doc_markdown(req.doc_id)
    except FileNotFoundError as e:
        return ChapterActionResponse(status="error", message=str(e))

    instruction = build_personalization_instruction(req.level)

    system_prompt = (
        "You are an expert educator for the Physical AI textbook.\n"
        "Rewrite the chapter based on the instruction.\n\n"
        "Rules:\n"
        "- Preserve headings, lists, and code blocks.\n"
        "- Maintain technical accuracy.\n"
        "- Do NOT add new topics.\n"
    )

    user_content = f"INSTRUCTION:\n{instruction}\n\nCHAPTER:\n\n{markdown}"

    try:
        completion = client.chat.completions.create(
            model=RAG_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
        )
    except Exception as e:
        return ChapterActionResponse(
            status="error",
            message=f"Personalization failed while contacting the AI model: {e}",
        )

    personalized_markdown = completion.choices[0].message.content or ""

    return ChapterActionResponse(status="ok", message=personalized_markdown)
