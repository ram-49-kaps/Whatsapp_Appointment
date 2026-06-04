import re
from datetime import datetime, timezone
from pydantic import BaseModel, field_validator
from typing import Optional


class AppointmentCreate(BaseModel):
    """Schema for creating a new appointment."""

    customer_name: str
    phone_number: str
    appointment_time: datetime
    notes: Optional[str] = None

    @field_validator("customer_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Customer name is required.")
        if len(v) > 100:
            raise ValueError("Customer name must be under 100 characters.")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        # Remove spaces, dashes, parentheses
        cleaned = re.sub(r"[\s\-()]", "", v)
        if not re.match(r"^\+\d{10,15}$", cleaned):
            raise ValueError(
                "Phone number must be in international format (e.g., +1234567890)."
            )
        return cleaned

    @field_validator("appointment_time")
    @classmethod
    def validate_future_time(cls, v: datetime) -> datetime:
        # Make timezone-aware if naive
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= datetime.now(timezone.utc):
            raise ValueError("Appointment time must be in the future.")
        return v


class AppointmentReschedule(BaseModel):
    """Schema for rescheduling an appointment."""

    new_appointment_time: datetime

    @field_validator("new_appointment_time")
    @classmethod
    def validate_future_time(cls, v: datetime) -> datetime:
        if v.tzinfo is None:
            v = v.replace(tzinfo=timezone.utc)
        if v <= datetime.now(timezone.utc):
            raise ValueError("New appointment time must be in the future.")
        return v
