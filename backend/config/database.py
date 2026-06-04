from supabase import create_client, Client
from config.settings import settings

if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError(
        "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file. "
        "Please set them before starting the server."
    )

supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY,
)

print("✅ Supabase client initialized successfully.")
