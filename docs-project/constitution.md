# AI Physical & Humanoid Robotics Textbook – Project Constitution

## 1. Project Identity

**Project Name**  
new-ai-physical-humanoid-textbook

**Goal**  
Build a spec-driven, AI-native textbook + RAG assistant that teaches Physical AI and Humanoid Robotics using:

- A Docusaurus textbook frontend (`apps/book-frontend`)
- A FastAPI RAG backend (`apps/rag-backend`)
- Qdrant vector DB + OpenAI
- Personalization & Urdu translation

The old project at:  
`C:\Users\Shoaib\Documents\ai-physical-humanoid-textbook`  
is used as **reference only** (for content and code ideas).

---

## 2. Core Rules

1. **No raw vibe coding**
   - No new features or big changes without:
     - A spec in `docs-project/specs`, and
     - A plan/task in `docs-project/plan` or `history/adr`.

2. **Spec-driven vibe coding**
   - We are allowed to “vibe” only inside the guardrails of:
     - `/sp.constitution`
     - `/sp.specify`
     - `/sp.plan`
     - `/sp.tasks`
   - AI (Claude / ChatGPT) must follow the specs and this Constitution.

3. **Single source of truth**
   - Specs define:
     - Architecture
     - API contracts
     - Textbook structure
     - UI flows
   - If code and spec disagree:
     1. Decide what is correct,
     2. Update spec first,
     3. Then update code,
     4. Log big changes as ADR in `history/adr`.

4. **History from Day 1**
   - Every serious work session is recorded in `history/logs`.
   - Important decisions become ADRs in `history/adr`.

5. **Small, safe steps**
   - Prefer many small changes over big refactors.
   - Each change must be:
     - Understandable,
     - Testable,
     - Traceable to some spec/task.

6. **Educational quality**
   - Code and content should be readable by students and teachers.
   - Avoid “clever but confusing” tricks.
   - Add light comments where logic is non-obvious.

---

## 3. Architecture Boundaries

1. **Frontend (`apps/book-frontend`)**
   - Docusaurus app that:
     - Renders MDX textbook pages,
     - Provides navigation & sidebar,
     - Shows a chat/assistant panel,
     - Calls backend for:
       - Q&A,
       - Urdu translation,
       - Personalization.
   - Frontend **never** talks directly to Qdrant or OpenAI.

2. **Backend (`apps/rag-backend`)**
   - FastAPI service that:
     - Talks to Qdrant,
     - Calls OpenAI / ChatKit workflows,
     - Exposes endpoints:
       - `POST /chat`
       - `POST /chat/ask-section`
       - `POST /chat/translate-urdu`
       - `POST /chat/personalize`
       - `POST /chat/personalize/auto` (optional/advanced).
   - Uses `.env` for secrets (never committed).

3. **Vector store (Qdrant)**
   - Holds textbook chunks + embeddings.
   - Collections & payload schemas must be documented in `docs-project/specs/rag-backend.md`.

4. **Auth / Personalization**
   - If we use BetterAuth or similar, it must be described in specs.
   - Any mock / incomplete pieces must be listed as **known limitations**.

---

## 4. Quality & Testing

- Main flows must work end-to-end:
  - Open textbook → ask question → see answer with sources.
  - Translate answer to Urdu.
  - Personalize a chapter.
- Keep a simple test checklist inside `docs-project/plan/tasks-overview.md`.
- If we cannot fix a bug before deadline:
  - Document it as known issue,
  - Log it in `history/logs`,
  - Add ADR if it affects architecture.

---

## 5. Working with AI

- AI is a co-developer, not the boss.
- We always read and understand code before using it.
- For new features:
  1. Update/create spec,
  2. Update plan/tasks,
  3. Then implement.

---

## 6. Changing This Constitution

- Any change must:
  - Have a clear reason (deadline, new requirement, etc.),
  - Be recorded as ADR,
  - Still respect:
    - No uncontrolled vibe coding,
    - History from Day 1,
    - Clear structure for teacher review.
