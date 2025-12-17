from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """
    Global configuration object for the backend.

    Spec-Kit rules:
      - No business logic.
      - Pure source of configuration truth.
      - Everything injected through environment variables.
      - Other modules MUST import from here (never redefine constants).
    """

    # -----------------------------
    # OpenAI / ChatKit
    # -----------------------------
    openai_api_key: str = ""
    openai_chatkit_workflow_id: str | None = None  # optional: used only if workflows enabled

    # -----------------------------
    # Qdrant Vector Store
    # -----------------------------
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_collection: str = "physical_ai_textbook"  # default collection name

    # -----------------------------
    # Backend Server
    # -----------------------------
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # ✅ RAG toggle (prevents /chat crash)
    # env: RAG_MODE=on|off
    rag_mode: str = "on"

    # Allowed frontends (CORS) (note: main.py currently uses CORS_ORIGINS env var)
    backend_allowed_origins: List[str] = ["http://localhost:3000"]

    # -----------------------------
    # BetterAuth (optional)
    # -----------------------------
    auth_server_url: str = "http://localhost:3005"

    # -----------------------------
    # Environment loading
    # -----------------------------
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Global exported settings instance (Spec-Kit contract)
settings = Settings()
