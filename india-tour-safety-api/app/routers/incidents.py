from datetime import datetime
from time import time
from collections import deque
from typing import Deque, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user, CurrentUser
from ..core.config import settings

router = APIRouter(prefix="/incidents", tags=["incidents"])


_PANIC_RATE_WINDOW_SECONDS = 60
_PANIC_RATE_MAX_CALLS = 3
_panic_calls: Dict[int, Deque[float]] = {}


def _check_panic_rate_limit(user_id: int) -> None:
    now = time()
    calls = _panic_calls.setdefault(user_id, deque())
    while calls and now - calls[0] > _PANIC_RATE_WINDOW_SECONDS:
        calls.popleft()
    if len(calls) >= _PANIC_RATE_MAX_CALLS:
        raise HTTPException(status_code=429, detail="Too many panic requests, please wait a moment.")
    calls.append(now)


def _dispatch_panic_alert(alert: models.SafetyAlert, profile: models.TouristProfile) -> None:
    """Simulate sending an alert to emergency contacts / authorities.

    For this prototype we simply log a line; in production this hook can be wired
    to SMS / email gateways or an operations dashboard.
    """

    try:
        contact_name = profile.emergency_contact_name or "(unknown contact)"
        contact_phone = profile.emergency_contact_phone or "(no phone)"
        print(  # noqa: T201
            "[DISPATCH] Panic for "
            f"{profile.full_name} ({profile.tourist_id_code}) – "
            f"notify {contact_name} at {contact_phone}; "
            f"location=({alert.lat},{alert.lng}); note={alert.description!r}",
            flush=True,
        )

        # Optional hook: integrate with real providers when enabled.
        if settings.SAFETY_DISPATCH_ENABLED and settings.SAFETY_DISPATCH_PROVIDER:
            provider = settings.SAFETY_DISPATCH_PROVIDER.lower()
            if provider == "twilio":
                _dispatch_via_twilio(alert, profile)
            elif provider == "sendgrid":
                _dispatch_via_sendgrid(alert, profile)
    except Exception:
        # Dispatch is best-effort for demo; failures should not block the API.
        pass


def _dispatch_via_twilio(alert: models.SafetyAlert, profile: models.TouristProfile) -> None:
    """Placeholder Twilio SMS dispatch hook.

    In a real deployment you would import the Twilio client and send an SMS
    using TWILIO_* settings. For this project we just log the intent so that
    the wiring is clear without requiring live credentials.
    """

    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN or not settings.TWILIO_FROM_NUMBER:
        return

    contact_phone = profile.emergency_contact_phone or "(no phone)"
    print(  # noqa: T201
        "[TWILIO] Would send SMS from "
        f"{settings.TWILIO_FROM_NUMBER} to {contact_phone} for panic alert {alert.id}",
        flush=True,
    )


def _dispatch_via_sendgrid(alert: models.SafetyAlert, profile: models.TouristProfile) -> None:
    """Placeholder SendGrid email dispatch hook.

    In a real deployment you would use the SendGrid client and SAFETY_DISPATCH_FROM_EMAIL
    to send an email to configured recipients.
    """

    if not settings.SENDGRID_API_KEY or not settings.SAFETY_DISPATCH_FROM_EMAIL:
        return

    print(  # noqa: T201
        "[SENDGRID] Would send email from "
        f"{settings.SAFETY_DISPATCH_FROM_EMAIL} for panic alert {alert.id}",
        flush=True,
    )


@router.post("/panic", response_model=schemas.SafetyAlertOut)
def trigger_panic(
    body: schemas.PanicRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    _check_panic_rate_limit(user.id)

    # If tourist_id_code is not provided, map from current user to their active profile
    query = db.query(models.TouristProfile).filter(models.TouristProfile.is_active == True)  # noqa: E712
    if body.tourist_id_code:
        query = query.filter(models.TouristProfile.tourist_id_code == body.tourist_id_code)
    else:
        query = query.filter(models.TouristProfile.user_id == user.id)

    profile = query.first()
    if not profile:
        raise HTTPException(status_code=404, detail="Active tourist profile not found")

    now = datetime.utcnow()

    extra_data = {
        "source": "panic_button",
        "triggered_by": user.id,
    }
    if body.note:
        extra_data["note"] = body.note
    if profile.emergency_contact_name or profile.emergency_contact_phone:
        extra_data["emergency_contact_name"] = profile.emergency_contact_name
        extra_data["emergency_contact_phone"] = profile.emergency_contact_phone

    alert = models.SafetyAlert(
        tourist_profile_id=profile.id,
        tourist_id_code=profile.tourist_id_code,
        type="panic",
        severity="critical",
        status="new",
        title="Panic button activated",
        description=body.note,
        lat=body.lat,
        lng=body.lng,
        triggered_at=now,
        extra_data=extra_data,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    _dispatch_panic_alert(alert, profile)

    return alert
