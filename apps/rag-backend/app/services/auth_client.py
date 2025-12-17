"""
Spec-Kit Trace
Feature: specs/<###-betterauth-integration>/
Spec: specs/<###-betterauth-integration>/spec.md
Plan: specs/<###-betterauth-integration>/plan.md
Tasks: specs/<###-betterauth-integration>/tasks.md
Story: US1 (Priority P1)
Task(s): T030, T031
Purpose: Backend-side BetterAuth client helper to:
         (1) fetch the logged-in user from BetterAuth by forwarding browser cookies,
         (2) extract/normalize preferred learning level for personalization flows.
Non-Goals: Session creation, sign-in/out, account management, or token validation.
           This module is a thin client + normalization layer.

NOTE: Replace <...> placeholders with your real feature folder + IDs.
This file is security-adjacent. Keep behavior deterministic and fail-safe.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, Request

from app.config import settings


# Trace: US1 / T030 — Base URL for BetterAuth (v1). We call GET /api/auth/user
AUTH_BASE_URL = settings.auth_server_url.rstrip("/") + "/api/auth"


# Trace: US1 / T030 — Fetch current user (if logged in) by forwarding cookies
async def get_user_from_betterauth(request: Request) -> Optional[Dict[str, Any]]:
    """
    BetterAuth v1:
      GET /api/auth/user

    We forward the same cookies the browser sends to the backend.

    Returns:
        dict | None:
          - user dict if logged in
          - None if no cookies or no active session
          - None if auth server is offline (graceful fallback)
    """
    cookie_header = request.headers.get("cookie")
    if not cookie_header:
        # No cookies → probably not logged in
        return None

    url = f"{AUTH_BASE_URL}/user"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                url,
                headers={
                    "Cookie": cookie_header,
                    "accept": "application/json",
                },
            )
    except httpx.HTTPError as e:
        # Trace: US1 / T030 — Auth server down/unreachable → treat as "not logged in"
        # (do not break the caller endpoint)
        print(f"[auth_client] Failed to reach auth server: {e}")
        return None

    # Not authenticated / user not found
    if resp.status_code in (401, 404):
        return None

    # Other errors from auth-server (it is up but unhappy)
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Auth server returned error {resp.status_code} when fetching user.",
        )

    # BetterAuth returns: { "user": {...}, "session": {...} }
    data = resp.json()
    user = data.get("user") if isinstance(data, dict) else None

    return user or None


# Trace: US1 / T031 — Normalize preferred level for personalization
def extract_preferred_level(user: Optional[Dict[str, Any]]) -> str:
    """
    Extract the user's preferred learning level from the BetterAuth user object.

    Normalized return values:
      - "beginner"
      - "intermediate"
      - "advanced"

    Falls back to "beginner" if missing or unrecognized.
    """
    if not user:
        return "beginner"

    # Some apps store it under user.profile, some directly on user
    profile = user.get("profile") or user

    raw = (
        profile.get("preferredLevel")
        or profile.get("preferred_level")
        or profile.get("PreferredLevel")
        or ""
    )

    level = raw.lower().strip()

    if "advanced" in level or level.startswith("adv"):
        return "advanced"

    if "intermediate" in level or "medium" in level or level.startswith("inter"):
        return "intermediate"

    if "beginner" in level or level.startswith("beg"):
        return "beginner"

    return "beginner"
