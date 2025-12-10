"""
Index textbook docs into Qdrant.

Run from apps/rag-backend with:
    .\.venv\Scripts\activate
    python scripts/index_textbook.py
"""

from pathlib import Path
from typing import List

from app.services.qdrant_service import ensure_collection, upsert_chunks
from app.services.docs_service import load_doc_markdown

# List the doc_ids you want to index
DOC_IDS: List[str] = [
    "foundations/how-to-use-this-book",
    "foundations/why-physical-ai-matters",
    "foundations/why-humanoids",
    "foundations/digital-to-embodied-intelligence",
    "foundations/data-from-the-real-world",
    "foundations/robot-sensors-and-perception",
    "foundations/robot-control-systems",
    "foundations/actuation-and-locomotion",
    "foundations/humanoid-design-kinematics",
    # add more doc_ids as you create pages
]


def simple_chunk(text: str, doc_id: str, max_chars: int = 800) -> List[dict]:
    """
    Very simple chunker: split text into ~max_chars blocks.
    """
    chunks: List[dict] = []
    current = []
    current_len = 0
    idx = 0

    for para in text.split("\n\n"):
        para = para.strip()
        if not para:
            continue

        if current_len + len(para) > max_chars and current:
            chunks.append(
                {
                    "id": f"{doc_id}-{idx}",
                    "doc_id": doc_id,
                    "chunk_index": idx,
                    "text": "\n\n".join(current),
                }
            )
            idx += 1
            current = [para]
            current_len = len(para)
        else:
            current.append(para)
            current_len += len(para) + 2

    if current:
        chunks.append(
            {
                "id": f"{doc_id}-{idx}",
                "doc_id": doc_id,
                "chunk_index": idx,
                "text": "\n\n".join(current),
            }
        )

    return chunks


def main() -> None:
    print("Ensuring Qdrant collection exists...")
    ensure_collection()

    all_chunks: List[dict] = []

    for doc_id in DOC_IDS:
        try:
            print(f"Loading doc: {doc_id}")
            markdown = load_doc_markdown(doc_id)
        except FileNotFoundError as e:
            print(f"  SKIP (not found): {e}")
            continue

        doc_chunks = simple_chunk(markdown, doc_id)
        print(f"  -> {len(doc_chunks)} chunks")
        all_chunks.extend(doc_chunks)

    if not all_chunks:
        print("No chunks to index. Check DOC_IDS and docs folder.")
        return

    print(f"Indexing {len(all_chunks)} chunks into Qdrant...")
    upsert_chunks(all_chunks)
    print("Done.")


if __name__ == "__main__":
    main()
