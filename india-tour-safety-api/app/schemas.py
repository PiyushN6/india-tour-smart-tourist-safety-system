from datetime import date, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, root_validator


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
    # New fields mirroring the extended tourist_profiles table
    gov_id_type: str
    gov_id_number: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    pincode: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact_relation: Optional[str] = None
    digital_id_number: Optional[str] = None
    extra_data: Optional[dict[str, Any]] = None
    trip_start_date: Optional[date] = None
    trip_end_date: Optional[date] = None
    planned_cities: Optional[list[str]] = None
    accommodation_details: Optional[str] = None


class TouristProfileCreate(TouristProfileBase):
    @root_validator(skip_on_failure=True)
    def validate_other_id_label_required(cls, values: dict) -> dict:
        gov_id_type = values.get("gov_id_type")
        extra_data = values.get("extra_data") or {}
        if gov_id_type == "other":
            label = extra_data.get("other_gov_id_label")
            if not label or not str(label).strip():
                raise ValueError(
                    "When gov_id_type is 'other', extra_data.other_gov_id_label is required."
                )
        return values


class TouristProfileUpdate(TouristProfileBase):
    is_active: Optional[bool] = None

    @root_validator(skip_on_failure=True)
    def validate_other_id_label_required(cls, values: dict) -> dict:
        gov_id_type = values.get("gov_id_type")
        extra_data = values.get("extra_data") or {}
        if gov_id_type == "other":
            label = extra_data.get("other_gov_id_label")
            if not label or not str(label).strip():
                raise ValueError(
                    "When gov_id_type is 'other', extra_data.other_gov_id_label is required."
                )
        return values


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
