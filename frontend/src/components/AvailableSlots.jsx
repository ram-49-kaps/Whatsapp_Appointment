import { useState, useEffect, useCallback } from 'react';
import { getAvailableSlots, createAppointment } from '../utils/api';
import { useRealtime } from '../hooks/useRealtime';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function AvailableSlots({ showToast }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    try {
      const res = await getAvailableSlots();
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  useRealtime(fetchSlots);

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <div className="text-center mb-10">
        <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-warm-gray border border-warm-gray-light rounded-full px-5 py-2 mb-6">
          Freed up slots →
        </span>
        <h1 className="font-display text-5xl md:text-6xl text-charcoal leading-[1.1] mb-4">
          Available<br />
          <span className="text-forest">Slots</span>
        </h1>
        <p className="text-warm-gray text-lg max-w-md mx-auto">
          These time slots were cancelled and are now open for booking.
        </p>
      </div>

      {/* Slots list */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-8 h-8 border-2 border-forest border-t-transparent rounded-full animate-spin" />
          <p className="text-warm-gray mt-3 font-mono text-sm">Loading slots...</p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-cream-dark max-w-lg mx-auto">
          <div className="text-5xl mb-4">📅</div>
          <p className="font-display text-2xl text-charcoal mb-2">No available slots</p>
          <p className="text-warm-gray text-sm">
            Cancelled appointment slots will appear here.
          </p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {slots.map((slot, i) => (
            <div
              key={slot.id}
              className={`bg-white rounded-2xl border border-cream-dark p-6 flex items-center justify-between transition-all hover:shadow-md hover:border-warm-gray-light animate-fade-in-up opacity-0 stagger-${Math.min(i + 1, 6)}`}
              style={{ animationFillMode: 'forwards' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-charcoal">
                    {formatDate(slot.appointment_time)}
                  </p>
                  <p className="text-sm text-warm-gray">
                    {formatTime(slot.appointment_time)}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs tracking-[0.15em] uppercase text-forest bg-forest/5 px-4 py-2 rounded-full">
                Open
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
