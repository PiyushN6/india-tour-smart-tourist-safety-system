from __future__ import annotations

import base64
from typing import Optional

from .config import settings


def _get_key_bytes() -> Optional[bytes]:
    key = getattr(settings, "SAFETY_ENCRYPTION_KEY", None)
    if not key:
        return None
    try:
        return key.encode("utf-8")
    except Exception:
        return None


def encrypt_field(value: Optional[str]) -> Optional[str]:
    """Very small reversible obfuscation for sensitive fields.

    This is *not* strong cryptography, but is sufficient for demo purposes to
    avoid storing plain-text identifiers. If no key is configured, this is a
    no-op and returns the original value.
    """

    if value is None:
        return None

    key_bytes = _get_key_bytes()
    if not key_bytes:
        return value

    data = value.encode("utf-8")
    xored = bytes(b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(data))
    return base64.urlsafe_b64encode(xored).decode("ascii")


def decrypt_field(value: Optional[str]) -> Optional[str]:
    if value is None:
        return None

    key_bytes = _get_key_bytes()
    if not key_bytes:
        return value

    try:
        raw = base64.urlsafe_b64decode(value.encode("ascii"))
    except Exception:
        # value was not encoded with this helper; return as-is
        return value

    data = bytes(b ^ key_bytes[i % len(key_bytes)] for i, b in enumerate(raw))
    try:
        return data.decode("utf-8")
    except Exception:
        return value
