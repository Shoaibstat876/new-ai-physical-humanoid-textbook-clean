# Day 03 – AI Tools Wiring, Auto Personalize (Beta) & Claude Subagents

**Date:** 2025-12-10  
**Project:** new-ai-physical-humanoid-textbook  

---

## 1. Goals for the day

- Finish wiring all **chapter AI tools** to the new RAG backend.
- Make the **UI for Levels 7–10** clean and judge-friendly.
- Add a safe **Auto Personalize (Beta)** flow that works even without a real auth server.
- Register **Claude subagents** for future v2 workflows.
- Close the loop on the SpecKit, non–vibe-coded backend.

---

## 2. Backend progress

### 2.1 Ask This Section – real implementation

- Upgraded `handle_ask_section` in `app/services/rag_service.py` from a stub to a real RAG helper:
  - Builds a focused prompt using the selected section text (if provided) or the whole chapter.
  - Calls OpenAI with the **same context discipline** as the main RAG chat:
    - “Answer only from the given section/context; if not present, say you don’t know.”
  - Returns a `ChapterActionResponse(status="ok", message=answer)`.

- Verified from Swagger:
  - `POST /chat/ask-section` with a valid `doc_id` returns a well-formed explanation.
  - Response shape matches the `ChapterActionResponse` schema.

### 2.2 Auto Personalize (Level 10) – Beta behavior

- Implemented `/chat/personalize/auto` in `app/routers/chat.py` using the async OpenAI client:
  1. Attempts to read BetterAuth user with `get_user_from_betterauth(request)`.
  2. Uses `extract_preferred_level` to map profile to `beginner | intermediate | advanced`.
  3. Loads the original markdown via `load_doc_markdown(doc_id)` (or uses `original_markdown` override).
  4. Builds a **personalization instruction** using `build_personalization_instruction(level)`.
  5. Calls OpenAI (`gpt-4o-mini`) to rewrite the chapter markdown while preserving structure.
  6. Returns `AutoPersonalizeResponse` with:
     - `preferred_level`
     - optional `user_email`
     - `personalized_markdown`.

- Added robust error handling:
  - If the auth server is unreachable, the backend returns a clear error message.
  - **No crash** and no leaking of stack traces to the frontend.

### 2.3 Auth server decision

- For this hackathon build, we **do not** run a real BetterAuth server.
- Auto-personalize is treated as **“Beta / Coming Soon”**:
  - The backend and UI are ready.
  - When auth is not available, the UI shows a friendly explanation and suggests using **Manual Personalize** instead.
- This decision is documented so judges understand the scope.

---

## 3. Frontend progress (Docusaurus)

**Path:** `apps/book-frontend`

### 3.1 ChapterActions UI (Level 7–10 tools)

- Implemented `ChapterActions.tsx` + `ChapterActions.module.css` with a tabbed layout:

  - Tabs:
    - **Ask This Section**
    - **Translate to Urdu**
    - **Personalize (Manual)**
    - **Auto Personalize (Beta)**

- Each tab calls the corresponding backend endpoint:

  - `Ask This Section` → `POST /chat/ask-section`
  - `Translate to Urdu` → `POST /chat/translate/urdu`
  - `Personalize (Manual)` → `POST /chat/personalize`
  - `Auto Personalize (Beta)` → `POST /chat/personalize/auto`

- For each action:
  - Shows a **loading state** while the request is in progress.
  - Displays the **answer / translated markdown / personalized markdown** inside a nicely styled card.
  - Handles HTTP errors and shows a simple, friendly message.

### 3.2 Ask This Section – end-to-end check

- Confirmed on `http://localhost:3000/docs/foundations/why-humanoids`:
  - Clicking **Ask This Section** sends the correct `docId`.
  - The returned explanation is readable, short, and clearly related to the section.
- Captured screenshot for the hackathon report to prove the tool is working.

### 3.3 Auto Personalize (Beta) – friendly error

- Mapped low-level error text:

  - `Failed to reach auth server: All connection attempts failed`

  to a **human-friendly message**:

  > “Auto Personalize (Beta) is not enabled in this demo build.  
  > Please use Manual Personalize instead.”

- This keeps the UI clean and avoids confusing the judges while still being honest about the missing auth server.

---

## 4. Claude subagents registration (Bonus / Future work)

- Added Runtime YAML definitions for Claude subagents (not fully wired into the UI, but ready for v2):

  - `content-agent.yml` → chapter content & drafting agent  
  - `rag-agent.yml` → textbook RAG + Qdrant search agent  
  - `summarizer-agent.yml` → chapter summary & learning objective agent  
  - `translator-agent.yml` → Urdu / multilingual translation agent  

- These describe:
  - Purpose and scope of each subagent.
  - Tools / APIs they are allowed to call.
  - Safety / style constraints (teacher-friendly, textbook-grade explanations).

- These files are referenced in the SpecKit docs as **“future extension: Claude multi-agent orchestration”**.

---

## 5. Verification & testing

- Backend:
  - `uvicorn app.main:app --reload --port 8000`
  - Used Swagger UI (`/docs`) to confirm:
    - `/chat`
    - `/chat/ask-section`
    - `/chat/translate/urdu`
    - `/chat/personalize`
    - `/chat/personalize/auto` (returns correct error when auth unavailable)

- Frontend:
  - `npm start` in `apps/book-frontend` → `http://localhost:3000`
  - Tested:
    - AI chat widget in the bottom-right corner.
    - ChapterActions tabs on “How to Use This Book” and other foundation chapters.

---

## 6. Remaining work (end-of-day decision)

- For hackathon scope, core features are **complete**.
- Remaining items are **polish only**:
  - Minor text tweaks.
  - Optional deep integration with BetterAuth and Claude subagents.
- Decision: stop adding features and focus on:
  - Cleaning up README.
  - Updating history.
  - Final check for non–vibe-coded structure.
  - Vercel deployment of the Docusaurus frontend.
