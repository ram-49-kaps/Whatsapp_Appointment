import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration loaded from environment variables."""

    # Server
    PORT: int = int(os.getenv("PORT", "5000"))

    # Supabase
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # Timezone
    TIMEZONE: str = os.getenv("TIMEZONE", "Asia/Kolkata")

    # Twilio WhatsApp
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")

    # Simulation mode — falls back to True if Twilio creds are missing
    SIMULATION_MODE: bool = (
        os.getenv("SIMULATION_MODE", "false").lower() == "true"
        or not os.getenv("TWILIO_ACCOUNT_SID")
        or not os.getenv("TWILIO_AUTH_TOKEN")
    )

    # CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")


settings = Settings()
