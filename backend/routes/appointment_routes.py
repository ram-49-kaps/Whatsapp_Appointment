from fastapi import APIRouter, HTTPException

from utils.schemas import AppointmentCreate, AppointmentReschedule
from controllers.appointment_controller import (
    create_appointment,
    get_all_appointments,
    get_appointment,
    reschedule_appointment,
    cancel_appointment,
    get_available_slots,
)

router = APIRouter(prefix="/api/appointments", tags=["Appointments"])


@router.post("", status_code=201)
async def create(data: AppointmentCreate):
    """
    Create a new appointment.
    Saves to database and sends a WhatsApp confirmation message.
    """
    try:
        appointment = create_appointment(
            {
                "customer_name": data.customer_name,
                "phone_number": data.phone_number,
                "appointment_time": data.appointment_time.isoformat(),
                "notes": data.notes,
            }
        )
        return {
            "success": True,
            "message": "Appointment created and confirmation sent.",
            "data": appointment,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("")
async def list_all():
    """
    Get all appointments, ordered by appointment time.
    This endpoint powers the live dashboard.
    """
    try:
        appointments = get_all_appointments()
        return {
            "success": True,
            "count": len(appointments),
            "data": appointments,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/available-slots")
async def available_slots():
    """
    Get cancelled appointment slots that are still in the future.
    These are available for other customers to book.
    """
    try:
        slots = get_available_slots()
        return {
            "success": True,
            "count": len(slots),
            "data": slots,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{appointment_id}")
async def get_one(appointment_id: str):
    """Get a single appointment by its ID."""
    try:
        appointment = get_appointment(appointment_id)
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        return {"success": True, "data": appointment}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{appointment_id}/reschedule")
async def reschedule(appointment_id: str, data: AppointmentReschedule):
    """
    Reschedule an appointment to a new time.
    Sends a WhatsApp notification about the change.
    """
    try:
        updated = reschedule_appointment(
            appointment_id, data.new_appointment_time.isoformat()
        )
        if not updated:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        return {
            "success": True,
            "message": "Appointment rescheduled successfully.",
            "data": updated,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{appointment_id}/cancel")
async def cancel(appointment_id: str):
    """
    Cancel an appointment.
    Sends a WhatsApp cancellation notification and frees the slot.
    """
    try:
        updated = cancel_appointment(appointment_id)
        if not updated:
            raise HTTPException(status_code=404, detail="Appointment not found.")
        return {
            "success": True,
            "message": "Appointment cancelled. Slot is now available for others.",
            "data": updated,
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
