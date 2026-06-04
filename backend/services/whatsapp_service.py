import time
import random
import string
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from twilio.rest import Client
from config.settings import settings

# ─── Twilio Client Setup ────────────────────────────────────────────────────

_twilio_client: Client | None = None

if not settings.SIMULATION_MODE:
    _twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    print("✅ Twilio WhatsApp service initialized (LIVE mode)")
else:
    print(
        "⚠️  WhatsApp service running in SIMULATION mode "
        "— messages will be logged, not sent."
    )


# ─── Core Send Function ─────────────────────────────────────────────────────


def send_whatsapp_message(to: str, body: str) -> dict:
    """
    Send a WhatsApp message via Twilio, or simulate if in simulation mode.

    Args:
        to: Phone number in international format (e.g., +1234567890)
        body: The message text to send

    Returns:
        dict with 'sid' (message ID) and 'simulated' (bool)
    """
    if settings.SIMULATION_MODE:
        mock_sid = f"SIM_{int(time.time())}_{''.join(random.choices(string.ascii_lowercase, k=6))}"
        print("")
        print("┌──────────────────────────────────────────────────┐")
        print("│  📱 SIMULATED WhatsApp Message                  │")
        print("├──────────────────────────────────────────────────┤")
        print(f"│  To:   {to}")
        print(f"│  SID:  {mock_sid}")
        print(f"│  Body: {body}")
        print("└──────────────────────────────────────────────────┘")
        print("")
        return {"sid": mock_sid, "simulated": True}

    try:
        message = _twilio_client.messages.create(
            from_=f"whatsapp:{settings.TWILIO_WHATSAPP_NUMBER}",
            to=f"whatsapp:{to}",
            body=body,
        )
        print(f"✅ WhatsApp sent to {to} — SID: {message.sid}")
        return {"sid": message.sid, "simulated": False}

    except Exception as e:
        print(f"❌ Failed to send WhatsApp to {to}: {e}")
        raise


# ─── Message Templates ──────────────────────────────────────────────────────


def _format_time(dt_str: str) -> str:
    """Format an ISO datetime string into a human-readable string in local timezone."""
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local_dt = dt.astimezone(ZoneInfo(settings.TIMEZONE))
    return local_dt.strftime("%A, %B %d, %Y at %I:%M %p")


def _format_time_short(dt_str: str) -> str:
    """Format an ISO datetime string into short time in local timezone."""
    dt = datetime.fromisoformat(dt_str)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    local_dt = dt.astimezone(ZoneInfo(settings.TIMEZONE))
    return local_dt.strftime("%I:%M %p")


def send_confirmation(appointment: dict) -> dict:
    """Send an appointment confirmation message."""
    time_str = _format_time(appointment["appointment_time"])

    body = (
        f"Hi {appointment['customer_name']}! Your appointment is confirmed.\n\n"
        f"Date & Time: {time_str}\n\n"
        f"If you need to reschedule or cancel, please contact us. Thank you!"
    )
    return send_whatsapp_message(appointment["phone_number"], body)


def send_reminder(appointment: dict) -> dict:
    """Send a 1-hour reminder message."""
    time_str = _format_time_short(appointment["appointment_time"])

    body = (
        f"Reminder: Hi {appointment['customer_name']}!\n\n"
        f"Your appointment is coming up soon — at {time_str}.\n"
        f"See you shortly!"
    )
    return send_whatsapp_message(appointment["phone_number"], body)


def send_reschedule_notification(appointment: dict, new_time: str) -> dict:
    """Send a rescheduled notification."""
    time_str = _format_time(new_time)

    body = (
        f"Hi {appointment['customer_name']}, your appointment has been rescheduled.\n\n"
        f"New Date & Time: {time_str}\n\n"
        f"If this doesn't work, please contact us. Thank you!"
    )
    return send_whatsapp_message(appointment["phone_number"], body)


def send_cancellation_notification(appointment: dict) -> dict:
    """Send a cancellation notification."""
    time_str = _format_time(appointment["appointment_time"])

    body = (
        f"Hi {appointment['customer_name']}, your appointment on "
        f"{time_str} has been cancelled.\n\n"
        f"If you'd like to rebook, please visit our portal or contact us. Thank you!"
    )
    return send_whatsapp_message(appointment["phone_number"], body)
