import pytest

from fastapi import HTTPException

from app.routers.locations import _point_in_bbox
from app.core.security import encrypt_field, decrypt_field
from app.routers.incidents import _check_panic_rate_limit, _panic_calls, _PANIC_RATE_MAX_CALLS


def test_point_in_bbox_inside_and_outside() -> None:
    geom = {"bbox": [10.0, 20.0, 11.0, 21.0]}  # min_lng, min_lat, max_lng, max_lat

    assert _point_in_bbox(20.5, 10.5, geom) is True
    assert _point_in_bbox(19.9, 10.5, geom) is False
    assert _point_in_bbox(20.5, 9.9, geom) is False


def test_encrypt_decrypt_roundtrip() -> None:
    secret = "test-secret-1234"

    encrypted = encrypt_field(secret)
    assert isinstance(encrypted, str)
    assert encrypted != secret

    decrypted = decrypt_field(encrypted)
    assert decrypted == secret


def test_panic_rate_limiter_blocks_after_threshold() -> None:
    user_id = 9999
    # Reset any prior state for this user
    _panic_calls.pop(user_id, None)

    # First N calls should be allowed
    for _ in range(_PANIC_RATE_MAX_CALLS):
        _check_panic_rate_limit(user_id)

    # Next call within the window should raise 429
    with pytest.raises(HTTPException) as exc:
        _check_panic_rate_limit(user_id)

    assert exc.value.status_code == 429
