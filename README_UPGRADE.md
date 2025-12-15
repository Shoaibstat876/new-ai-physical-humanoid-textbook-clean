# Project Upgrade Walkthrough (Levels System)

This repo includes an **upgrade lane** to make the Hackathon demo more stable and production-like **without changing the core submission**.

---

## ✅ Level 0 — Safe Basecamp
- Added `.env.example`
- Confirmed `.gitignore` blocks secrets and local DB files
- Added this `README_UPGRADE.md`

---

## ✅ Level 1 — Health & Status
- Backend: `/health` endpoint added and verified
- Frontend: global StatusBar added (shows backend/auth status)

---

## ✅ Level 2 — Demo Mode Guardrails (No 500 Errors)
- Backend: Qdrant failures no longer crash the API
- Backend: RAG handles “no hits / no data” safely and returns a friendly message
- Backend: Missing OpenAI key returns a friendly message (no crash)
- Frontend: Auto-Personalize shows a friendly demo fallback when auth server is offline

---

## ✅ Level 3 — Auth Server Stabilized
- Local auth server runs on **port 3005**
- `/healthz` endpoint verified
- CORS configured via `TRUSTED_ORIGINS`
- **No database required** for demo mode
- Backend safely handles **auth server offline or unreachable**
- Auth remains **disabled by default** (`AUTH_ENABLED=false`) and is used only to verify integration readiness

---

## 🚀 Quick Local Run

### Backend
```bash
cd apps/rag-backend
.venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

Test:
```bash
curl http://127.0.0.1:8000/health
```

---

### Auth Server (Optional – Demo Readiness Only)
```bash
cd apps/auth-server
npm install
node server.js
```

Health check:
```bash
curl http://127.0.0.1:3005/healthz
```

---

### Frontend
Run the book frontend normally (as described in the main README) and confirm:
- StatusBar reflects backend/auth availability
- ChapterActions behave safely in demo mode
- Auto-Personalize shows fallback messaging when auth is disabled

---

## 📦 Commit & Push
```powershell
git add README_UPGRADE.md
git commit -m "docs(level-3): document stabilized auth server"
git push
```

---

### ✅ Result
- Main submission remains untouched
- Upgrade lane demonstrates production thinking
- Auth is present, safe, optional, and non-blocking
- Judges see stability, not risk
