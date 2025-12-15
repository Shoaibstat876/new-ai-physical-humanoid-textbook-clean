# Project Upgrade Walkthrough (Levels System)

This repo includes an **upgrade lane** to make the Hackathon demo more stable and production-like without changing the core submission.

## ✅ Level 0 — Safe Basecamp
- Added `.env.example`
- Confirmed `.gitignore` blocks secrets and local DB files
- Added this `README_UPGRADE.md`

## ✅ Level 1 — Health & Status
- Backend: `/health` endpoint added and verified
- Frontend: global StatusBar added (shows backend/auth status)

## ✅ Level 2 — Demo Mode Guardrails (No 500 Errors)
- Backend: Qdrant failures no longer crash the API
- Backend: RAG handles “no hits / no data” safely and returns a friendly message
- Backend: OpenAI key missing returns a friendly message (no crash)
- Frontend: Auto-personalize shows a friendly demo fallback when auth server is offline

## Quick Local Run
### Backend
```bash
cd apps/rag-backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
Test:

bash
Copy code
curl http://127.0.0.1:8000/health
Frontend
Run the book frontend normally (as in main README) and confirm StatusBar + ChapterActions behave safely in demo mode.

sql
Copy code

Then commit + push:

```powershell
git add README_UPGRADE.md
git commit -m "docs(level-2): update upgrade checklist"
git push

## 🟨 Level 3 — Auth Server Revival

Purpose:
Run a minimal auth-server safely in demo mode.

How to run:
cd apps/auth-server
npm install
node server.js

Health check:
curl http://127.0.0.1:3005/healthz

Notes:
- Auth is disabled by default (AUTH_ENABLED=false)
- Used only to verify integration readiness
