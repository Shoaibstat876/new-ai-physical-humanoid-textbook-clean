# Day 02 – RAG Tools Wiring Progress

## 1. Context

New clean project:

- Root: `D:\new-ai-physical-humanoid-textbook`
- Backend: `apps/rag-backend`
- Frontend (Docusaurus book): `apps/book-frontend`
- Qdrant indexing script: `app/scripts/index_textbook.py`

Today’s goal: **finish wiring the three main AI tools for a single chapter** and confirm end-to-end flow.

---

## 2. Backend Status

### ✅ Environment & Server

- Created virtualenv in `apps/rag-backend\.venv`.
- Installed backend dependencies from `requirements.txt`.
- Fixed `app.config.Settings` `.env` parsing error (`backend_allowed_origins` JSON issue).
- Verified FastAPI server runs correctly:

  ```bash
  cd apps/rag-backend
  .\.venv\Scripts\activate
  uvicorn app.main:app --reload --port 8000
