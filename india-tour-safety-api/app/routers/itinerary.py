from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import UserItinerary


router = APIRouter(prefix="/itinerary", tags=["itinerary"])


class ItineraryPayload(BaseModel):
    user_id: str
    items: List[Any]
    trip_note: Optional[str] = None


@router.post("/save")
def save_itinerary(payload: ItineraryPayload, db: Session = Depends(get_db)) -> dict:
    """Create or update a user's itinerary row.

    We key the row by user_id so each user has a single persisted itinerary.
    """

    try:
        existing: UserItinerary | None = db.get(UserItinerary, payload.user_id)

        if existing is None:
            existing = UserItinerary(
                user_id=payload.user_id,
                items=payload.items,
                trip_note=payload.trip_note,
            )
            db.add(existing)
        else:
            existing.items = payload.items
            existing.trip_note = payload.trip_note

        db.commit()
        db.refresh(existing)

        return {
            "user_id": existing.user_id,
            "items": existing.items,
            "trip_note": existing.trip_note,
        }
    except Exception as exc:  # pragma: no cover - defensive logging
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save itinerary") from exc


@router.post("/clear")
def clear_itinerary(user_id: str, db: Session = Depends(get_db)) -> dict:
    """Delete a user's itinerary row if it exists."""

    try:
      existing: UserItinerary | None = db.get(UserItinerary, user_id)

      if existing is None:
          return {"user_id": user_id, "cleared": False}

      db.delete(existing)
      db.commit()

      return {"user_id": user_id, "cleared": True}
    except Exception as exc:  # pragma: no cover
      db.rollback()
      raise HTTPException(status_code=500, detail="Failed to clear itinerary") from exc
