"""
Physical AI & Humanoid Robotics — RAG Backend
=============================================

FastAPI application entrypoint.

Responsibilities:
- Create the FastAPI app instance
- Configure CORS for the Docusaurus frontend (localhost:3000)
- Wire router modules (chat, health, etc.)
- Expose a simple root endpoint for quick diagnostics
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
# CORS configuration
#
# Default (hackathon/local):
# - Frontend runs on: http://localhost:3000
#
# Optional (production):
# - Set CORS_ORIGINS as comma-separated list:
#   CORS_ORIGINS="https://your-site.vercel.app,https://custom-domain.com"
# ---------------------------------------------------------
def _get_allowed_origins() -> List[str]:
    env = os.getenv("CORS_ORIGINS", "").strip()
    if env:
        return [o.strip() for o in env.split(",") if o.strip()]
    return ["http://localhost:3000", "http://localhost:3001"]


ALLOWED_ORIGINS = _get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Routers
#
# All chat-related endpoints are in app/routers/chat.py
# and mounted at:
#   POST /chat
#   POST /chat/ask-section
#   POST /chat/translate/urdu
#   POST /chat/personalize
#   POST /chat/personalize/auto
# ---------------------------------------------------------
app.include_router(chat.router)


# ---------------------------------------------------------
# Root endpoint (quick diagnostics)
# ---------------------------------------------------------
@app.get("/", tags=["health"])
async def root() -> dict:
    return {
        "message": "Physical AI RAG backend is running",
        "backend_host": settings.backend_host,
        "backend_port": settings.backend_port,
        "cors_origins": ALLOWED_ORIGINS,
    }


# ---------------------------------------------------------
# Dedicated health endpoint (nice for Uptime checks)
# ---------------------------------------------------------
@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "service": "rag-backend", "version": app.version}
