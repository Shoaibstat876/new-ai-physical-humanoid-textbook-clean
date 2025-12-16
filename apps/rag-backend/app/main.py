"""
Physical AI & Humanoid Robotics — RAG Backend
=============================================

FastAPI application entrypoint.

Responsibilities:
- Create the FastAPI app instance
- Configure CORS for the Docusaurus frontend
- Wire router modules (chat, health, etc.)
- Expose health endpoints
"""

from __future__ import annotations

import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import chat


# ---------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------
app = FastAPI(
    title="Physical AI & Humanoid Robotics — RAG Backend",
    version="0.1.0",
)


# ---------------------------------------------------------
# CORS configuration (SINGLE SOURCE OF TRUTH + SAFE FALLBACKS)
#
# Priority:
# 1) settings.backend_allowed_origins (preferred)
# 2) CORS_ORIGINS env (comma-separated)
# 3) localhost fallback (includes 127.0.0.1)
#
# Also:
# - Avoid "*" when allow_credentials=True
# - Allow localhost on any port during dev via allow_origin_regex
# ---------------------------------------------------------
def _clean_origin(origin: str) -> str:
    return origin.strip().rstrip("/")


def _dedupe_preserve_order(items: List[str]) -> List[str]:
    seen = set()
    out: List[str] = []
    for x in items:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _get_allowed_origins() -> List[str]:
    # 1) Preferred: settings.backend_allowed_origins
    origins_obj = getattr(settings, "backend_allowed_origins", None)
    if isinstance(origins_obj, list):
        cleaned = [
            _clean_origin(o)
            for o in origins_obj
            if isinstance(o, str) and o.strip()
        ]
        cleaned = _dedupe_preserve_order([o for o in cleaned if o])
        if cleaned:
            return cleaned

    # 2) Fallback: env var (comma-separated)
    env = os.getenv("CORS_ORIGINS", "").strip()
    if env:
        cleaned = [_clean_origin(o) for o in env.split(",") if o.strip()]
        cleaned = _dedupe_preserve_order([o for o in cleaned if o])
        if cleaned:
            return cleaned

    # 3) Final fallback: local dev (both hosts)
    return ["http://localhost:3000", "http://127.0.0.1:3000"]


ALLOWED_ORIGINS = _get_allowed_origins()

# ❗ Critical safety: don't allow "*" with cookies/credentials
# If "*" appears from env/settings, replace with explicit dev origins
if "*" in ALLOWED_ORIGINS:
    ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

ALLOWED_ORIGINS = _dedupe_preserve_order([_clean_origin(o) for o in ALLOWED_ORIGINS])

print("✅ CORS ALLOWED_ORIGINS =", ALLOWED_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    # ✅ allow any localhost port in dev (Docusaurus sometimes changes port)
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routers
# ---------------------------------------------------------
app.include_router(chat.router)


# ---------------------------------------------------------
# Root endpoint (quick diagnostics)
# ---------------------------------------------------------
@app.get("/", tags=["health"])
async def root() -> dict:
    return {
        "message": "Physical AI RAG backend is running",
        "cors_origins": ALLOWED_ORIGINS,
    }


# ---------------------------------------------------------
# Health endpoint
# ---------------------------------------------------------
@app.get("/health", tags=["health"])
async def health() -> dict:
    return {
        "status": "ok",
        "service": "rag-backend",
        "version": app.version,
    }
