"""
Spec-Kit Trace
Feature: specs/<###-rag-indexing>/
Spec: specs/<###-rag-indexing>/spec.md
Plan: specs/<###-rag-indexing>/plan.md
Tasks: specs/<###-rag-indexing>/tasks.md
Story: US1 (Priority P1)
Task(s): T010
Purpose: Load textbook chapter markdown from the Docusaurus docs
         directory so it can be indexed into Qdrant or served to RAG.
Non-Goals: Rendering, parsing, chunking, or indexing logic.
           This module ONLY loads raw markdown content.

NOTE: Replace <...> placeholders with your real feature IDs.
"""

from pathlib import Path


# Trace: US1 / T010 — Resolve project root deterministically
# Project root (four levels up from this file)
PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Trace: US1 / T010 — Path to Docusaurus docs inside the project
DOCS_ROOT = PROJECT_ROOT / "apps" / "book-frontend" / "docs"


# Trace: US1 / T010 — Load markdown for a given doc_id
def load_doc_markdown(doc_id: str) -> str:
    """
    Load chapter content from the Docusaurus docs folder.

    Supports both:
      - .md
      - .mdx

    Args:
        doc_id: Docusaurus doc ID (e.g. "foundations/how-to-use-this-book")

    Returns:
        Raw markdown string.

    Raises:
        FileNotFoundError if no matching markdown file is found.
    """
    base = DOCS_ROOT / doc_id

    candidates = [
        base.with_suffix(".md"),
        base.with_suffix(".mdx"),
    ]

    for path in candidates:
        if path.exists():
            return path.read_text(encoding="utf-8")

    tried = " or ".join(str(p) for p in candidates)
    raise FileNotFoundError(
        f"Markdown file not found for doc_id={doc_id!r}. Tried: {tried}"
    )
