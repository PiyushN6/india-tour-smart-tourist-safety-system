from datetime import datetime, timedelta
from time import time
from collections import deque
from typing import Deque, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user, CurrentUser

router = APIRouter(prefix="/locations", tags=["locations"])


_LOC_RATE_WINDOW_SECONDS = 300
_LOC_RATE_MAX_CALLS = 120
_location_calls: Dict[int, Deque[float]] = {}


def _check_location_rate_limit(profile_id: int) -> None:
    now = time()
    calls = _location_calls.setdefault(profile_id, deque())
    while calls and now - calls[0] > _LOC_RATE_WINDOW_SECONDS:
        calls.popleft()
    if len(calls) >= _LOC_RATE_MAX_CALLS:
        raise HTTPException(status_code=429, detail="Too many location updates, please slow down.")
    calls.append(now)


def _point_in_bbox(point_lat: float, point_lng: float, geom: dict) -> bool:
    """Very simple helper that expects geom to have a bbox [min_lng, min_lat, max_lng, max_lat].

    This keeps v1 simple without needing full PostGIS; later we can replace with proper geometry checks.
    """

    bbox = geom.get("bbox")
    if not bbox or len(bbox) != 4:
        return False
    min_lng, min_lat, max_lng, max_lat = bbox
    return min_lat <= point_lat <= max_lat and min_lng <= point_lng <= max_lng


@router.get("/zones", response_model=List[schemas.RiskZoneOut])
def list_risk_zones(db: Session = Depends(get_db)):
    zones = (
        db.query(models.RiskZone)
        .filter(models.RiskZone.is_active == True)  # noqa: E712
        .order_by(models.RiskZone.risk_level.desc(), models.RiskZone.name)
        .all()
    )
    return zones


@router.post("/", response_model=List[schemas.SafetyAlertOut])
def ingest_location(
    body: schemas.LocationIn,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    profile = (
        db.query(models.TouristProfile)
        .filter(
            models.TouristProfile.tourist_id_code == body.tourist_id_code,
            models.TouristProfile.is_active == True,  # noqa: E712
        )
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Active tourist profile not found")

    _check_location_rate_limit(profile.id)

    # Normalize recorded_at to a naive UTC datetime so arithmetic with
    # database timestamps (which are stored as naive UTC) is safe.
    if body.recorded_at is not None:
        if body.recorded_at.tzinfo is not None:
            recorded_at = body.recorded_at.replace(tzinfo=None)
        else:
            recorded_at = body.recorded_at
    else:
        recorded_at = datetime.utcnow()

    loc = models.TouristLocation(
        tourist_profile_id=profile.id,
        tourist_id_code=profile.tourist_id_code,
        lat=body.lat,
        lng=body.lng,
        accuracy_m=body.accuracy_m,
        source=body.source or "web",
        recorded_at=recorded_at,
    )
    db.add(loc)

    alerts: list[models.SafetyAlert] = []

    # Simple geofence check using bbox in geom
    zones = (
        db.query(models.RiskZone)
        .filter(models.RiskZone.is_active == True)  # noqa: E712
        .all()
    )
    now = datetime.utcnow()
    window_start = now - timedelta(minutes=5)

    for zone in zones:
        if not isinstance(zone.geom, dict):
            continue
        if not _point_in_bbox(body.lat, body.lng, zone.geom):
            continue

        # Only create alerts for higher risk levels
        if zone.risk_level.lower() not in {"medium", "high"}:
            continue

        # De-duplicate alerts for same zone and tourist in a short window
        existing = (
            db.query(models.SafetyAlert)
            .filter(
                models.SafetyAlert.tourist_profile_id == profile.id,
                models.SafetyAlert.type == "geofence_breach",
                models.SafetyAlert.triggered_at >= window_start,
                models.SafetyAlert.status != "resolved",
                models.SafetyAlert.extra_data["zone_id"].as_integer() == zone.id,
            )
            .first()
        )
        if existing:
            continue

        alert = models.SafetyAlert(
            tourist_profile_id=profile.id,
            tourist_id_code=profile.tourist_id_code,
            type="geofence_breach",
            severity="high" if zone.risk_level.lower() == "high" else "medium",
            status="new",
            title=f"Entered {zone.risk_level.capitalize()} risk zone: {zone.name}",
            description=zone.description,
            lat=body.lat,
            lng=body.lng,
            triggered_at=now,
            extra_data={"zone_id": zone.id, "zone_city": zone.city},
        )
        db.add(alert)
        alerts.append(alert)

    # Simple anomaly placeholder: if last location was >30 minutes ago, create inactivity alert
    last_loc = (
        db.query(models.TouristLocation)
        .filter(models.TouristLocation.tourist_profile_id == profile.id)
        .order_by(models.TouristLocation.recorded_at.desc())
        .offset(1)
        .first()
    )
    if last_loc and (recorded_at - last_loc.recorded_at) > timedelta(minutes=30):
        anomaly_existing = (
            db.query(models.SafetyAlert)
            .filter(
                models.SafetyAlert.tourist_profile_id == profile.id,
                models.SafetyAlert.type == "inactivity",
                models.SafetyAlert.status != "resolved",
            )
            .first()
        )
        if not anomaly_existing:
            anomaly = models.SafetyAlert(
                tourist_profile_id=profile.id,
                tourist_id_code=profile.tourist_id_code,
                type="inactivity",
                severity="medium",
                status="new",
                title="No movement detected for over 30 minutes",
                description="System detected a long gap between location updates.",
                lat=body.lat,
                lng=body.lng,
                triggered_at=now,
                extra_data={
                    "rule": "inactivity_30_min",
                    "last_recorded_at": last_loc.recorded_at.isoformat(),
                },
            )
            db.add(anomaly)
            alerts.append(anomaly)

    db.commit()
    for a in alerts:
        db.refresh(a)

    return alerts
