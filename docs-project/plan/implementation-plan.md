# Implementation Plan – new-ai-physical-humanoid-textbook

## 1. Overview

This plan describes how the specifications will be transformed into a working system.  
We will implement the project in two major components:

1. **Frontend** – Docusaurus textbook (`apps/book-frontend`)
2. **Backend** – FastAPI RAG API (`apps/rag-backend`)

The old project at `C:\Users\Shoaib\Documents\ai-physical-humanoid-textbook` will be used **only as reference** for existing code and content.

---

## 2. Backend (FastAPI)

### 2.1 Directory structure (planned)

apps/rag-backend/
app/
main.py
config.py
routers/
chat.py
services/
rag_service.py
personalize_service.py
auth_client.py
schemas/
chat.py
utils/
.env
requirements.txt


### 2.2 Features

- `/chat` → RAG Q&A with sources  
- `/chat/translate-urdu` → Urdu translation  
- `/chat/personalize` → manual personalization  
- `/chat/personalize/auto` → auto-level (optional)  
- Qdrant retrieval + OpenAI generation

### 2.3 Implementation approach

- Bring code **module-by-module** from the old project.
- Compare with spec.
- Rewrite or adjust as needed.
- Log any major architectural decision in `history/adr`.

---

## 3. Frontend (Docusaurus)

### 3.1 Directory structure (planned)

apps/book-frontend/
docs/
foundations/
humanoid-robotics/
ai-for-humanoids/
physical-ai-applications/
src/components/AssistantPanel
src/services/api.ts
docusaurus.config.js
sidebars.js


### 3.2 Features

- Renders textbook chapters (MDX)
- UI for:
  - Ask Question
  - Urdu Translate
  - Personalize Chapter
- Shows answer + sources panel

### 3.3 Implementation approach

- Copy docs (MDX) from old project.
- Add missing pages.
- Connect UI to backend endpoints.
- Make UI clean and minimal.

---

## 4. Non-Functional Requirements

- Clear code
- Simple architecture
- Easy to read for teachers/students
- No unnecessary complexity
- All secrets only in `.env`

---

## 5. What will NOT be done (for deadline)

These items will be completed **only if time allows**:

- BetterAuth full integration  
- Sub-agents  
- Advanced workflows  
- Urdu voice output  
- Performance tuning  
- Production deployment polishing  

---

## 6. Next Step

Generate task list based on this plan.
