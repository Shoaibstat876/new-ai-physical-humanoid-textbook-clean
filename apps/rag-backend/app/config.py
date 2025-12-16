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
    openai_chatkit_workflow_id: str | None = None

    # -----------------------------
    # Qdrant Vector Store
    # -----------------------------
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_collection: str = "physical_ai_textbook"

    # -----------------------------
    # RAG behavior (IMPORTANT)
    # -----------------------------
    # off = safe mode (no vector search, no crash)
    # on  = real RAG mode
    rag_mode: str = "off"

    # -----------------------------
    # Backend Server
    # -----------------------------
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000

    # Allowed frontends (CORS)
    backend_allowed_origins: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

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
        extra = "ignore"   # 🔑 prevents random env vars from crashing backend


# ---------------------------------------------------------
# Global exported settings instance (Spec-Kit contract)
# ---------------------------------------------------------
settings = Settings()
