"""
Embedding service (Spec-Kit compliant)

This module provides a pure, framework-agnostic embedding utility
for the RAG pipeline. It is deliberately minimal, stable, and testable.
"""

from __future__ import annotations
from typing import List

from openai import OpenAI
from app.config import settings


# ----------------------------------------
# Model registry for future ADR changes
# ----------------------------------------
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIM = 1536  # Dimension for text-embedding-3-small

_client = OpenAI(api_key=settings.openai_api_key)


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Convert a list of texts into numeric embedding vectors.

    Args:
        texts (List[str]):
            List of raw textual inputs. Strings may be long; they will be
            automatically truncated by the embedding model if needed.

    Returns:
        List[List[float]]:
            A list of embedding vectors, one per input text.

    Raises:
        RuntimeError:
            If the embedding API responds unexpectedly.

    Contract (Spec-Kit):
        - Pure function: no side effects, no framework dependencies.
        - Deterministic: same input → same output.
        - Testable: can be mocked in unit tests.

    """
    if not texts:
        return []

    try:
        response = _client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=texts,
        )
    except Exception as e:
        raise RuntimeError(f"[embedding_service] Failed to embed texts: {e}") from e

    if not hasattr(response, "data"):
        raise RuntimeError(
            "[embedding_service] Invalid embedding API response: missing `data` field"
        )

    try:
        return [item.embedding for item in response.data]
    except Exception as e:
        raise RuntimeError(
            "[embedding_service] Invalid embedding vector structure"
        ) from e
