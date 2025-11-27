from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from jose import jwt, JWTError

from .core.config import settings


class CurrentUser:
    def __init__(self, user_id: str, role: Optional[str] = None):
        self.id = user_id
        self.role = role or "tourist"


def _demo_user() -> CurrentUser:
    """Fallback user used when proper Supabase auth is not configured.

    This keeps the API usable during local development even without JWTs.
    """

    return CurrentUser(user_id="demo-user", role="tourist")


def get_current_user(authorization: str | None = Header(default=None, alias="Authorization")) -> CurrentUser:
    """Resolve the current user.

    - If SUPABASE_JWT_SECRET is **not** configured: return a demo user so that
      local development works without auth.
    - If SUPABASE_JWT_SECRET **is** configured: require a valid Bearer token
      and raise 401 on missing/invalid credentials.
    """

    # Auth not configured yet: keep previous relaxed behaviour
    if not settings.SUPABASE_JWT_SECRET:
        return _demo_user()

    # Auth configured: enforce proper Bearer token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience=settings.SUPABASE_JWT_AUDIENCE,
            issuer=settings.SUPABASE_JWT_ISSUER,
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    user_id = payload.get("sub") or payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID missing in token",
        )

    email = payload.get("email")
    role_claim = payload.get("role")

    admin_emails = set(settings.SAFETY_ADMIN_EMAILS or [])
    if email and email in admin_emails:
        role = "admin"
    else:
        role = role_claim or "tourist"

    return CurrentUser(user_id=str(user_id), role=role)


def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return user
