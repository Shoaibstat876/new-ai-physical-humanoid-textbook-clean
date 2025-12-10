# System Architecture Spec

## 1. Overview

This project is an AI-native textbook with a separate RAG backend.

- **Frontend:** `apps/book-frontend` (Docusaurus)
- **Backend:** `apps/rag-backend` (FastAPI)
- **Vector DB:** Qdrant Cloud
- **LLM Provider:** OpenAI (and/or ChatKit workflows)
- **Auth (optional):** BetterAuth or similar

The old repo on C:\ is used only as a reference for code/content.

---

## 2. Components

### 2.1 Book Frontend (Docusaurus)

Responsibilities:

- Render MDX textbook pages.
- Provide navigation (sidebar, sections).
- Show assistant panel (Q&A, Urdu, personalization).
- Call backend APIs only (no DB, no Qdrant direct).

### 2.2 RAG Backend (FastAPI)

Responsibilities:

- RAG pipeline: embed → retrieve from Qdrant → call LLM → return answer + sources.
- Chapter-aware personalization.
- Urdu translation of answers / explanations.
- Clean JSON APIs.

### 2.3 Qdrant Vector Store

Responsibilities:

- Store textbook chunks + embeddings + metadata.
- Provide similarity search for questions and chapter queries.

### 2.4 LLM / Agents Layer

Responsibilities:

- Handle:
  - General Q&A,
  - Urdu translation,
  - Personalization.
- Implementation can use:
  - Direct OpenAI,
  - ChatKit workflows,
  - Sub-agents (future).

---

## 3. High-Level Data Flow

1. User opens a textbook page.
2. User asks a question.
3. Frontend sends `POST /chat` to backend.
4. Backend:
   - Embeds question,
   - Queries Qdrant,
   - Calls LLM with retrieved context,
   - Returns answer + sources list.
5. Frontend displays answer and citations.

Similar patterns for `/chat/translate-urdu` and `/chat/personalize`.
