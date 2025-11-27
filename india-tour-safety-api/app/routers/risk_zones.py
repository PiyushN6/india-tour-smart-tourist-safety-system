from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .. import models, schemas
from ..db import get_db
from ..deps import get_current_user, require_admin, CurrentUser

router = APIRouter(prefix="/risk-zones", tags=["risk-zones"])


@router.get("/", response_model=List[schemas.RiskZoneOut])
def list_risk_zones(
    city: Optional[str] = Query(default=None),
    active_only: bool = Query(default=True),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(get_current_user),  # noqa: ARG001
):
    q = db.query(models.RiskZone)
    if city:
        q = q.filter(models.RiskZone.city == city)
    if active_only:
        q = q.filter(models.RiskZone.is_active == True)  # noqa: E712
    return q.order_by(models.RiskZone.id.desc()).all()


@router.post("/", response_model=schemas.RiskZoneOut)
def create_risk_zone(
    body: schemas.RiskZoneCreate,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_admin),
):
    zone = models.RiskZone(
        created_by=user.id,
        **body.dict(),
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone
