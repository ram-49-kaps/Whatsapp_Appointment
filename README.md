# WhatsApp Appointment Automation & Live Dashboard

A complete, full-stack appointment booking and management system that automatically sends WhatsApp notifications (confirmations, reschedules, cancellations) and 1-hour reminders using Twilio. It features a modern, responsive React-based admin dashboard with real-time updates powered by Supabase.

---

## 🚀 Features

- **Dynamic Booking Form**: Easily book, reschedule, or cancel appointments.
- **Real-Time Admin Dashboard**: Instantly view and manage appointments. Staging updates, cancellations, and status changes are synced in real time via Supabase subscription.
- **Automated WhatsApp Notifications**:
  - Immediate booking confirmations.
  - Real-time rescheduling/cancellation alerts.
- **1-Hour Auto-Reminders**: A background worker scans for upcoming appointments and sends a reminder exactly 1 hour before the scheduled slot.
- **Robust Timezone Management**: Full integration between user local timezone (IST) and UTC storage.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**: Fast, single-page application framework.
- **Tailwind CSS**: Sleek, modern styling with a dark-mode-first aesthetic.
- **Lucide Icons & Tailwind Transitions**: Fluid UI interactions and micro-animations.

### Backend
- **FastAPI (Python 3.12)**: Asynchronous REST API server.
- **APScheduler**: Background job scheduler for automated 1-hour reminders.
- **Twilio SDK**: Messaging gateway for WhatsApp Sandbox.
- **Supabase (PostgreSQL)**: Managed database with real-time replication client.

---

## 📂 Project Structure

```text
Whatsapp_Automation/
├── backend/
│   ├── config/          # Database and app settings
│   ├── controllers/     # Business logic controllers
│   ├── routes/          # REST API routes (Appointments, Slots)
│   ├── services/        # Twilio WhatsApp and reminder scheduler services
│   ├── utils/           # Timezone & formatting utilities
│   ├── main.py          # FastAPI application entrypoint
│   └── requirements.txt # Python dependencies
└── frontend/
    ├── src/
    │   ├── components/  # Booking Form, Dashboard, Toast, Available Slots
    │   ├── hooks/       # Real-time state synchronization hook
    │   ├── utils/       # Centralized API fetch wrapper
    │   ├── App.jsx      # Router and main layout
    │   └── main.jsx     # Frontend entrypoint
    ├── index.html       # Single Page App wrapper
    ├── package.json     # Node.js dependencies
    └── vite.config.js   # Vite configuration
```

---

## ⚙️ Local Setup

### 1. Prerequisite Environments
Create `.env` files in both the `backend/` and `frontend/` directories matching the formats below:

#### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886 # Twilio Sandbox Number
MY_WHATSAPP_NUMBER=whatsapp:+91xxxxxxxxx   # Your verified sandbox recipient
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_KEY=your_supabase_anon_key
```

---

### 2. Run Backend (FastAPI)
Navigate to the `backend/` folder and set up a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
*The backend API will start at `http://localhost:8000`.*

---

### 3. Run Frontend (React + Vite)
Navigate to the `frontend/` folder and start the development server:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to view the application.*

---

## 💡 Technical Explanation & Timezone Sync

- **The Challenge**: The user interface operates in local time (e.g., IST, UTC+5:30), but database fields are saved in UTC. Standardizing datetime offsets is critical for the background scheduler to send notifications exactly 1 hour before the session.
- **The Solution**: 
  1. Frontend converts all calendar selections into UTC ISO strings before issuing API requests.
  2. The database receives and logs entries in strict UTC timezone.
  3. The backend scheduling task runs every 60 seconds, queries upcoming bookings in UTC, and formats the alert messages back to the customer's timezone (Asia/Kolkata) using absolute time mapping.
