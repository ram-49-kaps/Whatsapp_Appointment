from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from routes.appointment_routes import router as appointment_router
from services.reminder_service import start_reminder_service


# ─── Lifespan: startup & shutdown ───────────────────────────────────────────

_scheduler = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup and shutdown events."""
    # Startup
    global _scheduler
    _scheduler = start_reminder_service()
    print(f"🚀 Server running on port {settings.PORT}")
    print(f"📄 API docs available at http://localhost:{settings.PORT}/docs")
    yield
    # Shutdown
    if _scheduler:
        _scheduler.shutdown()
        print("🛑 Reminder service stopped.")


# ─── FastAPI App ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="WhatsApp Appointment Reminder API",
    description=(
        "A complete appointment management system with WhatsApp notifications "
        "via Twilio. Supports creating, rescheduling, and cancelling appointments "
        "with automatic 1-hour reminders."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register Routes ────────────────────────────────────────────────────────

app.include_router(appointment_router)


# ─── Health Check ────────────────────────────────────────────────────────────


@app.get("/", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "WhatsApp Appointment Reminder API",
        "simulation_mode": settings.SIMULATION_MODE,
    }


@app.get("/health", tags=["Health"])
async def health():
    """Detailed health check."""
    return {
        "status": "healthy",
        "service": "WhatsApp Appointment Reminder API",
        "simulation_mode": settings.SIMULATION_MODE,
        "supabase_connected": bool(settings.SUPABASE_URL),
        "twilio_configured": not settings.SIMULATION_MODE,
    }


# ─── Run with Uvicorn ───────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
    )
