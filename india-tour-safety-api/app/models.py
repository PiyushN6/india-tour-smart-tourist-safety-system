from datetime import datetime, date
from typing import Optional

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .db import Base


class TouristProfile(Base):
    __tablename__ = "tourist_profiles"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    user_id: Mapped[str] = mapped_column(String(64), index=True)
    tourist_id_code: Mapped[str] = mapped_column(String(32), unique=True, index=True)

    full_name: Mapped[str] = mapped_column(String(255))
    gender: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    nationality: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    id_type: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    id_number: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)

    phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    trip_start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    trip_end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    planned_cities: Mapped[Optional[JSON]] = mapped_column(JSON, nullable=True)
    accommodation_details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    safety_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    locations: Mapped[list["TouristLocation"]] = relationship(
        back_populates="tourist_profile", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["SafetyAlert"]] = relationship(
        back_populates="tourist_profile", cascade="all, delete-orphan"
    )


class RiskZone(Base):
    __tablename__ = "risk_zones"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(16), index=True)
    category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    geom: Mapped[JSON] = mapped_column(JSON)

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class TouristLocation(Base):
    __tablename__ = "tourist_locations"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    tourist_profile_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("tourist_profiles.id", ondelete="CASCADE"), index=True
    )
    tourist_id_code: Mapped[str] = mapped_column(String(32), index=True)

    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    accuracy_m: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    source: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)

    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    tourist_profile: Mapped[TouristProfile] = relationship(back_populates="locations")


class SafetyAlert(Base):
    __tablename__ = "safety_alerts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    tourist_profile_id: Mapped[Optional[int]] = mapped_column(
        BigInteger, ForeignKey("tourist_profiles.id", ondelete="SET NULL"), nullable=True
    )
    tourist_id_code: Mapped[Optional[str]] = mapped_column(String(32), nullable=True, index=True)

    type: Mapped[str] = mapped_column(String(32), index=True)
    severity: Mapped[str] = mapped_column(String(16), index=True)
    status: Mapped[str] = mapped_column(String(16), index=True, default="new")

    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    lat: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    lng: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    triggered_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    resolved_by: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # renamed from "metadata" because that name is reserved by SQLAlchemy's Declarative API
    extra_data: Mapped[Optional[JSON]] = mapped_column(JSON, nullable=True)

    tourist_profile: Mapped[Optional[TouristProfile]] = relationship(back_populates="alerts")
