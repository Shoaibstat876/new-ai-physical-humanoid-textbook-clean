# Tasks Overview – new-ai-physical-humanoid-textbook

This file converts the Implementation Plan into small, safe, trackable tasks.

---

## 1. Backend Tasks (FastAPI)

### 1.1 Project Setup
- [ ] Create `apps/rag-backend` base folder
- [ ] Add `main.py` with FastAPI app + CORS
- [ ] Add `config.py` with settings
- [ ] Add `routers/chat.py`
- [ ] Add `schemas/chat.py`
- [ ] Add `services/rag_service.py`
- [ ] Add `services/personalize_service.py`
- [ ] Add `services/auth_client.py` (optional)
- [ ] Create `.env` and `.env.example`
- [ ] Add `requirements.txt`

### 1.2 RAG Pipeline
- [ ] Implement embeddings
- [ ] Connect to Qdrant
- [ ] Retrieve top-N chunks
- [ ] Construct LLM prompt
- [ ] Return answers + sources

### 1.3 Endpoints
- [ ] `/chat`
- [ ] `/chat/translate-urdu`
- [ ] `/chat/personalize`
- [ ] `/chat/personalize/auto` (optional)
- [ ] `/chat/ask-section` (optional)

---

## 2. Frontend Tasks (Docusaurus)

### 2.1 Setup
- [ ] Initialize Docusaurus project in `apps/book-frontend`
- [ ] Configure sidebars
- [ ] Add homepage + layout

### 2.2 Textbook Content
- [ ] Foundations chapters (all)
- [ ] Humanoid robotics basics
- [ ] AI for humanoids
- [ ] Applications
- [ ] Add missing MDX pages

### 2.3 Assistant Panel
- [ ] UI for questions
- [ ] Display answer
- [ ] Display sources
- [ ] Add Translate to Urdu button
- [ ] Add Personalize Chapter button

### 2.4 Connect Frontend to Backend
- [ ] Create `api.ts`
- [ ] Add functions for:
  - [ ] askQuestion
  - [ ] translateUrdu
  - [ ] personalizeChapter

---

## 3. Integration Tasks
- [ ] Test end-to-end
- [ ] Fix MDX errors
- [ ] Validate embeddings + Qdrant
- [ ] Final polishing for submission

---

## 4. Logs / ADR Tasks
- [ ] Log Day 02 after we begin code migration
- [ ] Add ADR for any big architectural choice

---

## 5. Next Step
Start backend setup (`apps/rag-backend`) following specs + tasks.
