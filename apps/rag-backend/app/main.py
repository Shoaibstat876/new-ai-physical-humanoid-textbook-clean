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
# For the hackathon we keep this simple and explicit:
# - Frontend runs on: http://localhost:3000
# - Backend runs on:  http://localhost:8000
#
# If you later deploy to Vercel / production, you can
# extend this list or load it from environment.
# ---------------------------------------------------------
ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

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
# Root health endpoint
# Useful to quickly verify that:
# - the app booted
# - settings are loaded
# - CORS configuration is applied
# ---------------------------------------------------------
@app.get("/")
async def root() -> dict:
    return {
        "message": "Physical AI RAG backend is running",
        "backend_host": settings.backend_host,
        "backend_port": settings.backend_port,
        "cors_origins": ALLOWED_ORIGINS,
    }
