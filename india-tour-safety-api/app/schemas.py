from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class TouristProfileBase(BaseModel):
    full_name: str
    gender: Optional[str] = None
    date_of_birth: Optional[date] = None
    nationality: Optional[str] = None
    id_type: Optional[str] = None
    id_number: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    trip_start_date: Optional[date] = None
    trip_end_date: Optional[date] = None
    planned_cities: Optional[list[str]] = None
    accommodation_details: Optional[str] = None


class TouristProfileCreate(TouristProfileBase):
    pass


class TouristProfileUpdate(TouristProfileBase):
    is_active: Optional[bool] = None


class TouristProfileOut(TouristProfileBase):
    id: int
    user_id: str
    tourist_id_code: str
    is_active: bool
    safety_score: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class RiskZoneBase(BaseModel):
    name: str
    description: Optional[str] = None
    risk_level: str
    category: Optional[str] = None
    city: Optional[str] = None
    geom: Any


class RiskZoneCreate(RiskZoneBase):
    pass


class RiskZoneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    geom: Optional[Any] = None
    is_active: Optional[bool] = None


class RiskZoneOut(RiskZoneBase):
    id: int
    is_active: bool
    created_by: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LocationIn(BaseModel):
    tourist_id_code: str
    lat: float
    lng: float
    accuracy_m: Optional[float] = None
    source: Optional[str] = None
    recorded_at: Optional[datetime] = None


class TouristLocationOut(BaseModel):
    id: int
    tourist_profile_id: int
    tourist_id_code: str
    lat: float
    lng: float
    accuracy_m: Optional[float]
    source: Optional[str]
    recorded_at: datetime

    class Config:
        from_attributes = True


class SafetyAlertBase(BaseModel):
    type: str
    severity: str
    title: str
    description: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    extra_data: Optional[dict] = None


class SafetyAlertOut(SafetyAlertBase):
    id: int
    tourist_profile_id: Optional[int]
    tourist_id_code: Optional[str]
    status: str
    triggered_at: datetime
    resolved_at: Optional[datetime]
    resolved_by: Optional[str]

    class Config:
        from_attributes = True


class PanicRequest(BaseModel):
    tourist_id_code: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    note: Optional[str] = Field(default=None, max_length=500)
