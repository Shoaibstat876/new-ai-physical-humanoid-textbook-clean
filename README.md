# AI Physical & Humanoid Robotics Textbook

An AI-native, spec-driven textbook built with **Docusaurus**, a **FastAPI RAG backend**, **Qdrant** vector search, and **OpenAI** models.

> Learn Physical AI and humanoid robotics with a textbook that **talks back**,  
> answers questions, translates to Urdu, and personalizes chapters to your level.

---

## 🧭 Project Overview

This repository contains a complete AI-assisted textbook:

- **Textbook frontend**  
  - Built with **Docusaurus** (`apps/book-frontend`)  
  - Organized chapters under Foundations, Humanoid Robotics, etc.  
  - Deployed as a static site (e.g. Vercel).

- **RAG backend**  
  - Built with **FastAPI** (`apps/rag-backend`)  
  - Uses **Qdrant** + **OpenAI embeddings** for textbook search.  
  - Exposes chapter tools via `/chat/*` endpoints.

- **Spec-Driven Development (SpecKit Plus)**  
  - Clear Constitution, specs, and plan in `docs-project/`.  
  - Implementation follows the plan; no vibe coding.

---

## ✨ Key Features

### 1. AI Chat Widget (Global)

- Floating **“Physical AI Assistant”** in the bottom-right corner.
- You can ask any question about the course:
  - Uses Qdrant RAG over the textbook.
  - Shows answers along with underlying context chunks.

### 2. Chapter Tools (Level 7–10)

On each chapter page, a **“AI Tools for This Chapter”** panel provides:

- **Ask This Section**  
  Get an explanation of the current chapter based on textbook content.

- **Translate to Urdu**  
  Translate the **full chapter** to Urdu while preserving Markdown structure.

- **Personalize (Manual)**  
  Choose your level — `beginner`, `intermediate`, or `advanced` — and receive a rewritten chapter in the same structure.

- **Auto Personalize (Beta)**  
  Designed to use the student’s saved level from an auth server (BetterAuth).  
  In this demo build, if the auth server is not available, the UI shows a friendly:
  > “Auto Personalize (Beta) is not enabled in this demo build. Please use Manual Personalize instead.”

### 3. RAG Backend

- Chunked chapters stored in **Qdrant** with OpenAI embeddings (`text-embedding-3-small`).
- `/chat` endpoint:
  - Retrieves top-k relevant chunks.
  - Builds a context-only prompt.
  - Uses `gpt-4.1-mini` to answer strictly from context.

### 4. Claude Subagents (Future Work)

YAML definitions for **Claude multi-agent workflows**:

- `content-agent.yml` – content drafting & editing  
- `rag-agent.yml` – vector search over textbook  
- `summarizer-agent.yml` – summaries and learning objectives  
- `translator-agent.yml` – multilingual / Urdu support  

These are documented and ready for a v2, but not required for the hackathon demo.

---

## 🗂 Project Structure

```text
.
├── apps
│   ├── book-frontend        # Docusaurus textbook
│   │   ├── docs             # Markdown / MDX chapters
│   │   └── src/components   # AIChatWidget, ChapterActions, etc.
│   └── rag-backend          # FastAPI RAG backend
│       ├── app
│       │   ├── main.py
│       │   ├── config.py
│       │   ├── routers/
│       │   ├── schemas/
│       │   ├── services/
│       │   └── scripts/
│       └── requirements.txt
├── docs-project             # SpecKit Constitution, specs, plan
└── history                  # Day-by-day logs (no vibe coding)
