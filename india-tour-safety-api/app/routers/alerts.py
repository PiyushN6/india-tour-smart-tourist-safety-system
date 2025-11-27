from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user, require_admin, CurrentUser

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("/", response_model=List[schemas.SafetyAlertOut])
def list_alerts(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    type_filter: Optional[str] = Query(default=None, alias="type"),
    severity_filter: Optional[str] = Query(default=None, alias="severity"),
    tourist_id_code: Optional[str] = Query(default=None),
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),
):
    q = db.query(models.SafetyAlert)

    # Tourists only see their own alerts
    if user.role != "admin":
        # Map current user to their active profile
        profile = (
            db.query(models.TouristProfile)
            .filter(models.TouristProfile.user_id == user.id, models.TouristProfile.is_active == True)  # noqa: E712
            .first()
        )
        if not profile:
            return []
        q = q.filter(models.SafetyAlert.tourist_profile_id == profile.id)
    else:
        # Admin can filter by tourist_id_code for specific tourist
        if tourist_id_code:
            q = q.filter(models.SafetyAlert.tourist_id_code == tourist_id_code)

    if status_filter:
        q = q.filter(models.SafetyAlert.status == status_filter)
    if type_filter:
        q = q.filter(models.SafetyAlert.type == type_filter)
    if severity_filter:
        q = q.filter(models.SafetyAlert.severity == severity_filter)

    alerts = (
        q.order_by(models.SafetyAlert.triggered_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return alerts


@router.post("/{alert_id}/acknowledge", response_model=schemas.SafetyAlertOut)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_admin),
):
    alert = db.query(models.SafetyAlert).filter(models.SafetyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.status = "acknowledged"
    db.commit()
    db.refresh(alert)
    return alert


@router.post("/{alert_id}/resolve", response_model=schemas.SafetyAlertOut)
def resolve_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_admin),
):
    from datetime import datetime

    alert = db.query(models.SafetyAlert).filter(models.SafetyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.status = "resolved"
    alert.resolved_by = user.id
    alert.resolved_at = datetime.utcnow()
    db.commit()
    db.refresh(alert)
    return alert
