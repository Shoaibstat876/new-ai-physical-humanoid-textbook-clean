from pathlib import Path

# Project root (four levels up from this file)
PROJECT_ROOT = Path(__file__).resolve().parents[4]

# Path to Docusaurus docs inside new project
DOCS_ROOT = PROJECT_ROOT / "apps" / "book-frontend" / "docs"


def load_doc_markdown(doc_id: str) -> str:
    """
    Load chapter content from the docs folder.
    Supports both .md and .mdx files.
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
    raise FileNotFoundError(f"Markdown file not found for doc_id={doc_id!r}. Tried: {tried}")
