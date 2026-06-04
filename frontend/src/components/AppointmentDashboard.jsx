import { useState, useEffect, useCallback } from 'react';
import {
  getAppointments,
  rescheduleAppointment,
  cancelAppointment,
} from '../utils/api';
import { useRealtime } from '../hooks/useRealtime';
import AppointmentCard from './AppointmentCard';
import RescheduleModal from './RescheduleModal';

export default function AppointmentDashboard({ showToast, refreshKey }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await getAppointments();
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + refresh when new appointment is created
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments, refreshKey]);

  // Real-time subscription
  useRealtime(fetchAppointments);

  async function handleReschedule(id, newTime) {
    await rescheduleAppointment(id, newTime);
    showToast('Appointment rescheduled. WhatsApp notification sent.', 'success');
    fetchAppointments();
  }

  async function handleCancel(appointment) {
    if (!window.confirm(`Cancel ${appointment.customer_name}'s appointment?`)) return;
    try {
      await cancelAppointment(appointment.id);
      showToast('Appointment cancelled. Slot is now available.', 'success');
      fetchAppointments();
    } catch (err) {
      showToast('Failed to cancel. Please try again.', 'error');
    }
  }

  // Filter logic
  const filtered =
    filter === 'all'
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const counts = {
    all: appointments.length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-warm-gray border border-warm-gray-light rounded-full px-5 py-2 mb-6">
          Live from database →
        </span>
        <h1 className="font-display text-5xl md:text-6xl text-charcoal leading-[1.1] mb-4">
          Appointment<br />
          <span className="text-forest">Dashboard</span>
        </h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
        {[
          { label: 'Total', count: counts.all, color: 'bg-charcoal' },
          { label: 'Confirmed', count: counts.confirmed, color: 'bg-emerald-600' },
          { label: 'Cancelled', count: counts.cancelled, color: 'bg-red-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-cream-dark p-4 text-center"
          >
            <p className="font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-1">
              {stat.label}
            </p>
            <p className="font-display text-3xl text-charcoal">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {['all', 'confirmed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-full transition-all cursor-pointer ${
              filter === f
                ? 'bg-forest text-white'
                : 'bg-white text-warm-gray border border-cream-dark hover:border-warm-gray-light'
            }`}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Cards grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-warm-gray mt-3 font-mono text-sm">Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-dark">
          <p className="font-display text-2xl text-charcoal mb-2">No appointments yet</p>
          <p className="text-warm-gray text-sm">Create your first appointment to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((appt, i) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              index={i}
              onReschedule={setRescheduleTarget}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onConfirm={handleReschedule}
          onClose={() => setRescheduleTarget(null)}
        />
      )}
    </div>
  );
}
