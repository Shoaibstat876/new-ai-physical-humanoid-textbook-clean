from __future__ import annotations

from typing import Dict, List, TypedDict, Any
import hashlib

from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams, PointStruct

from app.config import settings
from app.services.embeddings import EMBEDDING_DIM, embed_texts


# ---------------------------------------------------------
# Types
# ---------------------------------------------------------

class Chunk(TypedDict):
    """
    Minimal contract for a RAG chunk.

    This matches what index_textbook.py produces:
      - doc_id: textbook doc identifier (e.g. "foundations/how-to-use-this-book")
      - chunk_index: integer index within the document
      - text: raw markdown/plain text for this chunk
    """
    doc_id: str
    chunk_index: int
    text: str


class SearchResult(TypedDict, total=False):
    """
    Normalized search result returned to the RAG layer.
    """
    text: str
    doc_id: str
    chunk_index: int
    score: float


# ---------------------------------------------------------
# Global Qdrant Client (library-level, not framework-bound)
# ---------------------------------------------------------

_qdrant_client = QdrantClient(
    url=settings.qdrant_url,
    api_key=settings.qdrant_api_key,
)


def _get_client() -> QdrantClient:
    """
    Internal helper to access the shared Qdrant client.

    Having this indirection makes it easier to mock in tests.
    """
    return _qdrant_client


# ---------------------------------------------------------
# Collection management
# ---------------------------------------------------------

def ensure_collection() -> None:
    """
    Ensure that the Qdrant collection for textbook chunks exists.

    Idempotent: safe to call on startup or from indexing scripts.
    """
    client = _get_client()

    try:
        collections = client.get_collections().collections
    except Exception as e:  # pragma: no cover - network boundary
        raise RuntimeError(f"[qdrant_service] Failed to list collections: {e}") from e

    existing = {c.name for c in collections}

    if settings.qdrant_collection in existing:
        return

    try:
        client.create_collection(
            collection_name=settings.qdrant_collection,
            vectors_config=VectorParams(
                size=EMBEDDING_DIM,
                distance=Distance.COSINE,
            ),
        )
    except Exception as e:  # pragma: no cover - network boundary
        raise RuntimeError(
            f"[qdrant_service] Failed to create collection "
            f"{settings.qdrant_collection!r}: {e}"
        ) from e


# ---------------------------------------------------------
# Stable point IDs (prevents collisions / overwrites)
# ---------------------------------------------------------

def _stable_point_id(doc_id: str, chunk_index: int) -> int:
    """
    Deterministic stable integer ID for Qdrant points.

    Why:
      - Using enumerate idx (0..N) causes collisions across re-index runs.
      - Stable ID ensures upsert updates the *same chunk* predictably.

    Implementation:
      - sha1(doc_id + ":" + chunk_index) -> take first 16 hex chars -> int (64-bit)
    """
    key = f"{doc_id}:{chunk_index}".encode("utf-8")
    hex16 = hashlib.sha1(key).hexdigest()[:16]  # 64-bit space
    return int(hex16, 16)


# ---------------------------------------------------------
# Upsert
# ---------------------------------------------------------

def upsert_chunks(chunks: List[Chunk]) -> None:
    """
    Upsert textbook chunks into Qdrant.

    Args:
        chunks:
            List of chunk dicts with keys:
              - "doc_id": str
              - "chunk_index": int
              - "text": str

    Contract (Spec-Kit):
        - No framework imports (FastAPI, etc.).
        - Pure data in / data out; side-effect is only on Qdrant.
        - Deterministic for the same inputs (modulo external service).
    """
    if not chunks:
        return

    texts = [c["text"] for c in chunks]

    try:
        vectors = embed_texts(texts)
    except Exception as e:
        raise RuntimeError(f"[qdrant_service] Failed to embed chunks: {e}") from e

    if len(vectors) != len(chunks):
        raise RuntimeError(
            "[qdrant_service] Embedding count mismatch: "
            f"{len(vectors)} vectors for {len(chunks)} chunks"
        )

    points: List[PointStruct] = []
    for i, c in enumerate(chunks):
        doc_id = c["doc_id"]
        chunk_index = int(c["chunk_index"])

        points.append(
            PointStruct(
                # ✅ Stable unique ID (prevents overwrite collisions)
                id=_stable_point_id(doc_id, chunk_index),
                vector=vectors[i],
                payload={
                    "doc_id": doc_id,
                    "chunk_index": chunk_index,
                    "text": c["text"],
                },
            )
        )

    client = _get_client()
    try:
        client.upsert(
            collection_name=settings.qdrant_collection,
            points=points,
        )
    except Exception as e:  # pragma: no cover - network boundary
        raise RuntimeError(f"[qdrant_service] Failed to upsert chunks: {e}") from e


# ---------------------------------------------------------
# Search
# ---------------------------------------------------------

def search(question: str, limit: int = 5) -> List[SearchResult]:
    """
    Vector similarity search over all textbook chunks.

    Level-2 demo guardrail:
      - If Qdrant is down / times out / misconfigured, DO NOT crash the API.
      - Return empty hits instead of raising, so the app responds gracefully.
    """
    if not question.strip():
        return []

    try:
        [query_vec] = embed_texts([question])

        client = _get_client()
        response = client.query_points(
            collection_name=settings.qdrant_collection,
            query=query_vec,
            with_payload=True,
            limit=limit,
        )

        results: List[SearchResult] = []
        for hit in getattr(response, "points", []):
            payload: Dict[str, Any] = hit.payload or {}
            results.append(
                SearchResult(
                    text=payload.get("text", "") or "",
                    doc_id=payload.get("doc_id", "") or "",
                    chunk_index=int(payload.get("chunk_index", 0) or 0),
                    score=float(hit.score),
                )
            )

        return results

    except Exception:
        return []
