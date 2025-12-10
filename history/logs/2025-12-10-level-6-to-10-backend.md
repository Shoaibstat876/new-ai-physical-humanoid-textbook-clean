# Day Log — Backend + RAG Rewrite (New SpecKit Project)

**Date:** 2025-12-10  
**Project:** new-ai-physical-humanoid-textbook  
**Focus:** Clean SpecKit-based backend, RAG + tools, Qdrant, and wiring to Docusaurus

---

## 1. Project / Folder Setup

- Created NEW clean project at: `D:\new-ai-physical-humanoid-textbook`
- Ran `specifyplus init . --ai claude --script ps` to set up SpecKit structure
- Added custom app folders:
  - `apps/book-frontend` (copied from old project)
  - `apps/rag-backend` (backend for RAG + tools)
- Ensured history and docs-project structure:
  - `docs-project/constitution.md`
  - `docs-project/specs/`
  - `docs-project/plan/`
  - `history/logs`, `history/adr`, `history/prompts`

---

## 2. Backend (FastAPI) — apps/rag-backend

**Root:** `D:\new-ai-physical-humanoid-textbook\apps\rag-backend`

- Created virtual env and installed dependencies:
  - `python -m venv .venv`
  - `.\.venv\Scripts\activate`
  - `pip install -r requirements.txt`
- Main app:
  - `app/main.py` with `FastAPI` app and CORS middleware
  - CORS reads `backend_allowed_origins` from `.env` (JSON list)
  - Routers included from `app.routers.chat`
- Config:
  - `app/config.py` using `pydantic-settings`
  - Settings include:
    - `openai_api_key`
    - `qdrant_url`, `qdrant_api_key`, `qdrant_collection`
    - `backend_host`, `backend_port`
    - `backend_allowed_origins`
    - `auth_server_url` (BetterAuth)

---

## 3. Services

### 3.1 Embeddings

**File:** `app/services/embeddings.py`

- Uses OpenAI client with `OPENAI_API_KEY` from `.env`
- Embedding model: `text-embedding-3-small`
- `EMBEDDING_DIM = 1536`
- Function `embed_texts(texts: List[str]) -> List[list[float]]`:
  - Calls `client.embeddings.create`
  - Returns list of embedding vectors

### 3.2 Qdrant Service

**File:** `app/services/qdrant_service.py`

- Creates a `QdrantClient` using:
  - `settings.qdrant_url`
  - `settings.qdrant_api_key`
- `ensure_collection()`:
  - Creates collection if missing with:
    - `size=EMBEDDING_DIM`
    - `distance=Distance.COSINE`
- `upsert_chunks(chunks: List[dict])`:
  - Embeds all chunk texts with `embed_texts`
  - Upserts as `PointStruct` with payload:
    - `doc_id`, `chunk_index`, `text`
- `search(question: str, limit: int = 5) -> List[dict]`:
  - Embeds query
  - Calls `query_points` on Qdrant
  - Returns list of dicts with `text`, `doc_id`, `chunk_index`, `score`

### 3.3 Docs Service

**File:** `app/services/docs_service.py`

- Computes `PROJECT_ROOT` from `__file__`
- `DOCS_ROOT = PROJECT_ROOT / "apps" / "book-frontend" / "docs"`
- `load_doc_markdown(doc_id: str) -> str`:
  - Tries both:
    - `<DOCS_ROOT>/<doc_id>.md`
    - `<DOCS_ROOT>/<doc_id>.mdx`
  - Raises `FileNotFoundError` with a clear message if missing

### 3.4 Auth Client (BetterAuth)

**File:** `app/services/auth_client.py`

- Base URL: `AUTH_BASE_URL = settings.auth_server_url.rstrip("/") + "/api/auth"`
- `get_user_from_betterauth(request: Request)`:
  - Reads `Cookie` header from incoming request
  - Calls `GET /api/auth/user` on auth server
  - Returns `user` dict or `None` for not logged-in
- `extract_preferred_level(user)`:
  - Reads custom fields:
    - `preferredLevel`, `preferred_level`, `PreferredLevel`
  - Normalizes to one of:
    - `"beginner" | "intermediate" | "advanced"`
  - Defaults to `"beginner"`

---

## 4. Schemas

**File:** `app/schemas/chat.py`

- `Source`:
  - `id`, `text`, `score`
  - Optional `title`, `url`, `doc_id` for linking chapters
- `ChatRequest`:
  - `question: str`
- `ChatResponse`:
  - `answer: str`
  - `sources: List[Source]` (with `default_factory=list`)
- `ChapterActionRequest`:
  - `doc_id: str`
  - Optional `selection: str | None`
  - `level: str | None = "beginner"`
- `ChapterActionResponse`:
  - `status: str`
  - `message: str`

---

## 5. RAG Logic

**File:** `app/services/rag_service.py`

- `build_prompt(question, contexts)`:
  - Combines question + context passages into a single prompt
  - Enforces: “answer only from context or say you don't know”
- `answer_question(req: ChatRequest) -> ChatResponse`:
  - Calls `search(...)` in Qdrant service
  - Uses `build_prompt` and `OpenAI` chat completions (`gpt-4.1-mini`)
  - Returns `ChatResponse` with answer + list of `Source`
- `handle_ask_section(...)`:
  - Stub implementation for “Ask this section” (Level 7)
- `handle_translate_urdu(...)`:
  - Loads markdown via `load_doc_markdown`
  - Uses OpenAI to translate into Urdu
  - Returns `ChapterActionResponse(status="ok", message=urdu_markdown)`
- `build_personalization_instruction(level: str) -> str`:
  - Returns detailed rewriting instructions based on level:
    - `"beginner"`, `"intermediate"`, `"advanced"`
- `handle_personalize(...)` (Level 8 manual):
  - Loads markdown
  - Builds instruction from `build_personalization_instruction`
  - Uses OpenAI to rewrite while preserving Markdown structure

---

## 6. Chat Router & Level 10 Auto-Personalize

**File:** `app/routers/chat.py`

- Router prefix: `/chat`
- Endpoints:
  - `POST /chat` → `chat(...)` → `answer_question`
  - `POST /chat/ask-section` → `handle_ask_section`
  - `POST /chat/translate/urdu` → `handle_translate_urdu`
  - `POST /chat/personalize` → `handle_personalize` (manual Level 8)
- Level 10 data models:
  - `AutoPersonalizeRequest` with:
    - `doc_id: str`
    - `original_markdown: str | None`
  - `AutoPersonalizeResponse` with:
    - `preferred_level: str | None`
    - `user_email: str | None`
    - `personalized_markdown: str`
- Level 10 endpoint:
  - `POST /chat/personalize/auto`:
    1. Reads BetterAuth user using `get_user_from_betterauth`
    2. Extracts `preferred_level` with `extract_preferred_level`
    3. Loads original markdown via `load_doc_markdown` (or `payload.original_markdown`)
    4. Builds personalization instruction (via `build_personalization_instruction` or a persona fallback)
    5. Calls OpenAI (async client) to rewrite chapter
    6. Returns `AutoPersonalizeResponse` with:
       - `preferred_level`
       - `user_email` (if present)
       - `personalized_markdown`

---

## 7. Indexing Script

**File:** `app/scripts/index_textbook.py`

- Ensures Qdrant collection exists (`ensure_collection()`)
- Hardcoded `DOC_IDS` for Foundations:
  - `foundations/how-to-use-this-book`
  - `foundations/why-physical-ai-matters`
  - `foundations/why-humanoids`
  - `foundations/digital-to-embodied-intelligence`
  - `foundations/data-from-the-real-world`
  - `foundations/robot-sensors-and-perception`
  - `foundations/robot-control-systems`
  - `foundations/actuation-and-locomotion`
  - `foundations/humanoid-design-kinematics`
- For each doc:
  - Loads markdown via `load_doc_markdown`
  - Splits into smaller chunks
  - Builds chunk objects with:
    - `id`, `doc_id`, `chunk_index`, `text`
- Calls `upsert_chunks(all_chunks)`
- Final result:
  - **59 chunks** indexed successfully in Qdrant

Command used:

```bash
cd apps/rag-backend
.\.venv\Scripts\activate
python -m app.scripts.index_textbook
