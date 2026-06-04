from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from config.database import supabase
from services.whatsapp_service import send_reminder


def _check_and_send_reminders():
    """
    Runs every minute. Queries Supabase for confirmed appointments within
    the next 60 minutes that haven't had a reminder sent, sends WhatsApp
    reminders, and marks them as reminded.
    """
    try:
        now = datetime.now(timezone.utc)
        one_hour_later = datetime(
            now.year, now.month, now.day, now.hour, now.minute, now.second,
            tzinfo=timezone.utc
        )
        # Add 60 minutes
        from datetime import timedelta
        one_hour_later = now + timedelta(hours=1)

        # Query upcoming appointments needing reminders
        response = (
            supabase.table("appointments")
            .select("*")
            .eq("status", "confirmed")
            .eq("reminder_sent", False)
            .gte("appointment_time", now.isoformat())
            .lte("appointment_time", one_hour_later.isoformat())
            .execute()
        )

        upcoming = response.data
        if not upcoming:
            return  # No reminders needed — silent return

        print(f"⏰ Found {len(upcoming)} appointment(s) needing reminders.")

        for appointment in upcoming:
            try:
                # Send WhatsApp reminder
                result = send_reminder(appointment)

                # Mark as reminded in the database
                supabase.table("appointments").update(
                    {
                        "reminder_sent": True,
                        "updated_at": datetime.now(timezone.utc).isoformat(),
                    }
                ).eq("id", appointment["id"]).execute()

                print(
                    f"✅ Reminder sent to {appointment['customer_name']} "
                    f"({appointment['phone_number']}) — SID: {result['sid']}"
                )

            except Exception as send_error:
                # Don't let one failure stop the batch
                print(
                    f"❌ Failed to send reminder to {appointment['customer_name']}: "
                    f"{send_error}"
                )

    except Exception as cron_error:
        print(f"❌ Reminder cron job error: {cron_error}")


def start_reminder_service():
    """Start the background scheduler that checks for reminders every minute."""
    scheduler = BackgroundScheduler()
    scheduler.add_job(_check_and_send_reminders, "interval", seconds=60)
    scheduler.start()
    print("🔔 Reminder service started — checking every minute for upcoming appointments.")
    return scheduler
