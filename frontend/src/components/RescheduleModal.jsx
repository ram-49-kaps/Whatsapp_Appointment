import { useState } from 'react';

export default function RescheduleModal({ appointment, onConfirm, onClose }) {
  const [newTime, setNewTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newTime) {
      setError('Please select a new date and time.');
      return;
    }
    if (new Date(newTime) <= new Date()) {
      setError('Must be a future date.');
      return;
    }

    setLoading(true);
    try {
      const utcTime = new Date(newTime).toISOString();
      await onConfirm(appointment.id, utcTime);
      onClose();
    } catch (err) {
      setError('Failed to reschedule. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-cream-dark max-w-md w-full p-8 animate-fade-in-up">
        <h2 className="font-display text-2xl text-charcoal mb-1">
          Reschedule Appointment
        </h2>
        <p className="text-warm-gray text-sm mb-6">
          Pick a new date and time for{' '}
          <span className="font-semibold text-charcoal">{appointment.customer_name}</span>.
          They'll be notified via WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-2">
              New Date & Time
            </label>
            <input
              type="datetime-local"
              value={newTime}
              onChange={(e) => {
                setNewTime(e.target.value);
                setError('');
              }}
              min={new Date().toISOString().slice(0, 16)}
              className={`w-full px-4 py-3 bg-cream rounded-lg border text-charcoal text-base ${
                error ? 'border-red-400' : 'border-cream-dark'
              }`}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-medium text-warm-gray bg-cream hover:bg-cream-dark rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 text-sm font-semibold text-white bg-forest hover:bg-forest-light rounded-xl transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? 'Saving...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
