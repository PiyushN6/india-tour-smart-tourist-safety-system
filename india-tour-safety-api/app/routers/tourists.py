from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user, CurrentUser, require_admin
from ..core.security import encrypt_field, decrypt_field

router = APIRouter(prefix="/tourists", tags=["tourists"])


def _generate_tourist_code(db: Session) -> str:
    # Simple incremental code TR-<id>; in production you might want a more robust scheme
    last = db.query(models.TouristProfile).order_by(models.TouristProfile.id.desc()).first()
    next_id = 1 if not last else last.id + 1
    return f"TR-{next_id:06d}"


@router.post("/", response_model=schemas.TouristProfileOut)
def create_or_update_tourist_profile(
    body: schemas.TouristProfileCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    profile = (
        db.query(models.TouristProfile)
        .filter(models.TouristProfile.user_id == user.id, models.TouristProfile.is_active == True)  # noqa: E712
        .first()
    )

    payload = body.dict(exclude_unset=True)
    if "id_number" in payload and payload["id_number"] is not None:
        payload["id_number"] = encrypt_field(payload["id_number"])
    if "emergency_contact_phone" in payload and payload["emergency_contact_phone"] is not None:
        payload["emergency_contact_phone"] = encrypt_field(payload["emergency_contact_phone"])

    if profile:
        # Update existing profile
        for field, value in payload.items():
            setattr(profile, field, value)
    else:
        tourist_id_code = _generate_tourist_code(db)
        profile = models.TouristProfile(
            user_id=user.id,
            tourist_id_code=tourist_id_code,
            **payload,
        )
        db.add(profile)

    db.commit()
    db.refresh(profile)

    # Decrypt sensitive fields for response only (not re-persisted)
    if profile.id_number:
        profile.id_number = decrypt_field(profile.id_number)
    if profile.emergency_contact_phone:
        profile.emergency_contact_phone = decrypt_field(profile.emergency_contact_phone)

    return profile


@router.get("/me", response_model=schemas.TouristProfileOut)
def get_my_tourist_profile(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    profile = (
        db.query(models.TouristProfile)
        .filter(models.TouristProfile.user_id == user.id, models.TouristProfile.is_active == True)  # noqa: E712
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active tourist profile found")

    if profile.id_number:
        profile.id_number = decrypt_field(profile.id_number)
    if profile.emergency_contact_phone:
        profile.emergency_contact_phone = decrypt_field(profile.emergency_contact_phone)

    return profile


@router.get("/{tourist_id_code}", response_model=schemas.TouristProfileOut)
def get_tourist_by_code(
    tourist_id_code: str,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_admin),
):
    profile = (
        db.query(models.TouristProfile)
        .filter(models.TouristProfile.tourist_id_code == tourist_id_code)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tourist not found")

    if profile.id_number:
        profile.id_number = decrypt_field(profile.id_number)
    if profile.emergency_contact_phone:
        profile.emergency_contact_phone = decrypt_field(profile.emergency_contact_phone)

    return profile


@router.get("/me/safety-score")
def get_my_safety_score(
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    """Compute a heuristic safety score for the current tourist.

    High level model:
    - Start from 100 points.
    - Look back over the last 14 days of alerts.
    - Newer alerts have more impact than older ones (time decay).
    - Critical / panic events hurt more than low‑severity anomalies.
    - Resolved alerts still count, but with a smaller weight than unresolved ones.
    - If there is an unresolved critical panic in the last 24h, clamp to a lower
      ceiling to avoid showing a misleadingly high score.
    - If there have been no alerts for several days, allow gradual recovery back
      toward a high score.
    The result is stored on the tourist profile and returned as JSON.
    """

    profile = (
        db.query(models.TouristProfile)
        .filter(models.TouristProfile.user_id == user.id, models.TouristProfile.is_active == True)  # noqa: E712
        .first()
    )
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active tourist profile found")

    now = datetime.utcnow()
    window_start = now - timedelta(days=14)

    recent_alerts = (
        db.query(models.SafetyAlert)
        .filter(
            models.SafetyAlert.tourist_profile_id == profile.id,
            models.SafetyAlert.triggered_at >= window_start,
        )
        .all()
    )

    score = 100.0
    for alert in recent_alerts:
        if not alert.triggered_at:
            continue

        # Time decay: recent alerts penalise more than older ones, over a 14-day window.
        age_days = max(0.0, (now - alert.triggered_at).total_seconds() / 86400.0)
        decay = 1.0 - min(age_days, 14.0) / 14.0
        decay = max(decay, 0.3)  # never count completely as zero

        # Base penalty by severity
        if alert.severity == "critical":
            base_penalty = 25.0
        elif alert.severity == "high":
            base_penalty = 15.0
        elif alert.severity in {"medium", "low"}:
            base_penalty = 7.0
        else:
            base_penalty = 5.0

        # Extra weight by type / geography context
        geo_factor = 1.0
        if alert.type == "panic":
            geo_factor = 1.5
        elif alert.type == "geofence_breach":
            geo_factor = 1.2

        # Resolved incidents still affect the score but a bit less than active ones.
        resolution_factor = 0.7 if alert.status == "resolved" else 1.0

        penalty = base_penalty * decay * geo_factor * resolution_factor
        score -= penalty

    # If there is any unresolved critical panic in last 24h, clamp to a lower ceiling.
    recent_critical_panic = (
        db.query(models.SafetyAlert)
        .filter(
            models.SafetyAlert.tourist_profile_id == profile.id,
            models.SafetyAlert.type == "panic",
            models.SafetyAlert.severity == "critical",
            models.SafetyAlert.status != "resolved",
            models.SafetyAlert.triggered_at >= now - timedelta(hours=24),
        )
        .first()
    )
    if recent_critical_panic is not None:
        score = min(score, 40.0)

    # Gentle recovery: if there have been no alerts at all in the last 3 days,
    # nudge the score upwards toward a "safe" band.
    quiet_window_start = now - timedelta(days=3)
    has_recent_incident = (
        db.query(models.SafetyAlert)
        .filter(
            models.SafetyAlert.tourist_profile_id == profile.id,
            models.SafetyAlert.triggered_at >= quiet_window_start,
        )
        .first()
        is not None
    )

    if not has_recent_incident and score < 90.0:
        score = min(90.0, score + 10.0)

    score = max(0.0, min(100.0, score))

    profile.safety_score = int(round(score))
    db.add(profile)
    db.commit()

    return {"safety_score": profile.safety_score}
