from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, Request

from app.config import settings

# Base URL for BetterAuth (v1) – will call /api/auth/user
AUTH_BASE_URL = settings.auth_server_url.rstrip("/") + "/api/auth"


async def get_user_from_betterauth(request: Request) -> Optional[Dict[str, Any]]:
    """
    Correct endpoint for BetterAuth v1:
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
        # 🔑 IMPORTANT:
        # Auth server is down / unreachable → behave as "not logged in"
        # instead of breaking the whole endpoint.
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

    data = resp.json()  # BetterAuth returns: { user: {...}, session: {...} }
    user = data.get("user") if isinstance(data, dict) else None

    return user or None


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
