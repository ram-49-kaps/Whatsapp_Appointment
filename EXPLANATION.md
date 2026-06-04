# Practical Test - Written Explanation

## Tools Used
- **Frontend**: React (Vite) with Tailwind CSS v3.4.17 for the booking form and live dashboard.
- **Backend**: FastAPI (Python 3.12) as the REST API server handling all business logic.
- **Database**: Supabase (PostgreSQL) for storing appointments with real-time subscription support.
- **Messaging**: Twilio WhatsApp Sandbox API for sending confirmation, cancellation, reschedule, and reminder messages.
- **Scheduler**: APScheduler (Python) for the automatic 1-hour reminder background job.

## How the Data Flows
When a user fills in the booking form on the frontend, the data is sent as a POST request to the FastAPI backend. The backend validates the input, saves the appointment to Supabase, and then calls the Twilio API to send a WhatsApp confirmation message to the customer. The live dashboard on the frontend subscribes to Supabase real-time changes, so any new booking, cancellation, or reschedule is reflected instantly without a page refresh. A background scheduler runs every 60 seconds on the backend, checking for confirmed appointments within the next hour that have not yet received a reminder, and automatically sends a WhatsApp reminder message.

## Hardest Part Solved
The hardest part was handling timezone synchronization correctly. The browser sends local time (IST, UTC+5:30), but the backend and database operate in UTC. Initially, the appointment times were being stored with a 5.5-hour offset, which caused the dashboard to display wrong times and the reminder service to never find matching appointments. I solved this by converting all dates to UTC ISO format on the frontend before submission, and converting them back to the local timezone (Asia/Kolkata) on the backend when formatting WhatsApp messages.

## Time Taken
The entire project took approximately 4-5 hours to build and test end to end.
