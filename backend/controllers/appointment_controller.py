from datetime import datetime, timezone

from config.database import supabase
from services.whatsapp_service import (
    send_confirmation,
    send_cancellation_notification,
    send_reschedule_notification,
)


def create_appointment(data: dict) -> dict:
    """
    Create a new appointment, save to Supabase, and send WhatsApp confirmation.

    Args:
        data: Validated appointment data (customer_name, phone_number, appointment_time, notes)

    Returns:
        The created appointment record from the database
    """
    # Insert into Supabase
    record = {
        "customer_name": data["customer_name"],
        "phone_number": data["phone_number"],
        "appointment_time": data["appointment_time"],
        "notes": data.get("notes"),
        "status": "confirmed",
        "reminder_sent": False,
        "confirmation_sent": False,
    }

    response = supabase.table("appointments").insert(record).execute()
    appointment = response.data[0]

    # Send WhatsApp confirmation
    try:
        result = send_confirmation(appointment)
        # Update the record with message SID
        supabase.table("appointments").update(
            {
                "confirmation_sent": True,
                "message_sid": result["sid"],
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        ).eq("id", appointment["id"]).execute()

        appointment["confirmation_sent"] = True
        appointment["message_sid"] = result["sid"]

    except Exception as e:
        print(f"⚠️ Appointment created but WhatsApp confirmation failed: {e}")
        # Appointment is still saved — don't fail the whole request

    return appointment


def get_all_appointments() -> list:
    """
    Fetch all appointments from the database, ordered by appointment time (newest first).
    """
    response = (
        supabase.table("appointments")
        .select("*")
        .order("appointment_time", desc=False)
        .execute()
    )
    return response.data


def get_appointment(appointment_id: str) -> dict | None:
    """
    Fetch a single appointment by ID.

    Returns:
        The appointment dict, or None if not found
    """
    response = (
        supabase.table("appointments")
        .select("*")
        .eq("id", appointment_id)
        .execute()
    )
    return response.data[0] if response.data else None


def reschedule_appointment(appointment_id: str, new_time: str) -> dict | None:
    """
    Reschedule an appointment to a new time.
    Updates the database and sends a WhatsApp notification.

    Args:
        appointment_id: UUID of the appointment
        new_time: ISO format datetime string of the new appointment time

    Returns:
        The updated appointment, or None if not found
    """
    # Get the existing appointment
    appointment = get_appointment(appointment_id)
    if not appointment:
        return None

    if appointment["status"] == "cancelled":
        raise ValueError("Cannot reschedule a cancelled appointment.")

    # Update in database
    response = (
        supabase.table("appointments")
        .update(
            {
                "appointment_time": new_time,
                "status": "confirmed",
                "reminder_sent": False,  # Reset reminder for new time
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", appointment_id)
        .execute()
    )

    updated = response.data[0] if response.data else None

    # Send WhatsApp notification
    if updated:
        try:
            send_reschedule_notification(appointment, new_time)
        except Exception as e:
            print(f"⚠️ Appointment rescheduled but WhatsApp notification failed: {e}")

    return updated


def cancel_appointment(appointment_id: str) -> dict | None:
    """
    Cancel an appointment. Updates the database and sends a WhatsApp notification.

    Args:
        appointment_id: UUID of the appointment

    Returns:
        The updated appointment, or None if not found
    """
    # Get the existing appointment
    appointment = get_appointment(appointment_id)
    if not appointment:
        return None

    if appointment["status"] == "cancelled":
        raise ValueError("Appointment is already cancelled.")

    # Update in database
    response = (
        supabase.table("appointments")
        .update(
            {
                "status": "cancelled",
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        .eq("id", appointment_id)
        .execute()
    )

    updated = response.data[0] if response.data else None

    # Send WhatsApp cancellation notification
    if updated:
        try:
            send_cancellation_notification(appointment)
        except Exception as e:
            print(f"⚠️ Appointment cancelled but WhatsApp notification failed: {e}")

    return updated


def get_available_slots() -> list:
    """
    Get cancelled appointment slots that are still in the future.
    These are slots that other customers could potentially book.
    """
    now = datetime.now(timezone.utc).isoformat()

    response = (
        supabase.table("appointments")
        .select("id, appointment_time, created_at")
        .eq("status", "cancelled")
        .gte("appointment_time", now)
        .order("appointment_time", desc=False)
        .execute()
    )
    return response.data
