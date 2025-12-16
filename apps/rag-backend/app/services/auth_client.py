from __future__ import annotations

from typing import Any, Dict, Optional

import httpx
from fastapi import HTTPException, Request

from app.config import settings


def _normalize(url: str) -> str:
    return (url or "").rstrip("/")


# -----------------------------
# BetterAuth (future mode)
# -----------------------------
def _betterauth_base() -> str:
    # BetterAuth v1 base: {AUTH_SERVER}/api/auth
    return _normalize(getattr(settings, "auth_server_url", "")) + "/api/auth"


async def get_user_from_betterauth(request: Request) -> Optional[Dict[str, Any]]:
    """
    BetterAuth v1:
      GET /api/auth/user

    We forward cookies from the browser request to auth-server.

    Returns:
      - user dict if logged in
      - None if not logged in or no cookies
      - None if auth server is offline (graceful fallback)
    """
    cookie_header = request.headers.get("cookie")
    if not cookie_header:
        return None

    base = _betterauth_base()
    if not base or base == "/api/auth":
        return None

    url = f"{base}/user"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                url,
                headers={
                    "cookie": cookie_header,  # forward cookies
                    "accept": "application/json",
                },
            )
    except httpx.HTTPError as e:
        print(f"[auth_client] BetterAuth unreachable: {e}")
        return None

    if resp.status_code in (401, 404):
        return None

    if resp.status_code >= 400:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Auth server error {resp.status_code} while fetching user.",
        )

    data = resp.json()  # BetterAuth usually returns: { user: {...}, session: {...} }
    if isinstance(data, dict):
        user = data.get("user")
        return user if isinstance(user, dict) else None

    return None


# -----------------------------
# Demo Auth (Level-5 mode)
# -----------------------------
async def get_user_from_demo_auth(request: Request) -> Optional[Dict[str, Any]]:
    """
    Demo auth-server (our Level-5 approach):
      GET /me

    Returns:
      { email, preferredLevel } or None
    """
    cookie_header = request.headers.get("cookie")
    if not cookie_header:
        return None

    base = _normalize(getattr(settings, "auth_server_url", ""))
    if not base:
        return None

    url = f"{base}/me"

    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            resp = await client.get(
                url,
                headers={
                    "cookie": cookie_header,
                    "accept": "application/json",
                },
            )
    except httpx.HTTPError as e:
        print(f"[auth_client] Demo auth unreachable: {e}")
        return None

    if resp.status_code != 200:
        return None

    data = resp.json()
    if not isinstance(data, dict):
        return None

    email = str(data.get("email", "")).strip()
    preferred = str(data.get("preferredLevel", "beginner")).strip().lower() or "beginner"

    if not email:
        return None

    if preferred not in {"beginner", "intermediate", "advanced"}:
        preferred = "beginner"

    return {"email": email, "preferredLevel": preferred}


# -----------------------------
# One function used by backend
# -----------------------------
async def get_user(request: Request) -> Optional[Dict[str, Any]]:
    """
    Single entry point.

    TODAY (Level-5): we use Demo /me.
    LATER: when BetterAuth is real, we can switch by env.

    Control:
      AUTH_MODE=demo | betterauth
    Default: demo (safe for hackathon)
    """
    mode = (getattr(settings, "auth_mode", "") or "").strip().lower()

    if mode == "betterauth":
        return await get_user_from_betterauth(request)

    # default safe mode
    return await get_user_from_demo_auth(request)


def extract_preferred_level(user: Optional[Dict[str, Any]]) -> str:
    """
    Extract preferred level from either:
      - BetterAuth user object (maybe user.profile.preferredLevel)
      - Demo auth object { preferredLevel }

    Returns normalized:
      - beginner / intermediate / advanced
    """
    if not user:
        return "beginner"

    profile = user.get("profile") if isinstance(user, dict) else None
    if not isinstance(profile, dict):
        profile = user

    raw = (
        profile.get("preferredLevel")
        or profile.get("preferred_level")
        or profile.get("PreferredLevel")
        or ""
    )

    level = str(raw).lower().strip()

    if "advanced" in level or level.startswith("adv"):
        return "advanced"
    if "intermediate" in level or "medium" in level or level.startswith("inter"):
        return "intermediate"
    if "beginner" in level or level.startswith("beg"):
        return "beginner"

    return "beginner"
