import StatusBadge from './StatusBadge';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AppointmentCard({
  appointment,
  onReschedule,
  onCancel,
  index = 0,
}) {
  const isCancelled = appointment.status === 'cancelled';

  return (
    <div
      className={`bg-white rounded-2xl border border-cream-dark p-6 transition-all duration-300 hover:shadow-md hover:border-warm-gray-light animate-fade-in-up opacity-0 stagger-${Math.min(index + 1, 6)}`}
      style={{ animationFillMode: 'forwards' }}
    >
      {/* Header: Name + Badge */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-xl text-charcoal">
            {appointment.customer_name}
          </h3>
          <p className="font-mono text-xs text-warm-gray mt-1 tracking-wide">
            {appointment.phone_number}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      {/* Time Info */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-cream rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center">
          <svg className="w-5 h-5 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-charcoal">
            {formatDate(appointment.appointment_time)}
          </p>
          <p className="text-xs text-warm-gray">
            {formatTime(appointment.appointment_time)}
          </p>
        </div>
      </div>

      {/* Reminder status */}
      {appointment.reminder_sent && (
        <p className="text-xs text-warm-gray mb-4 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Reminder sent
        </p>
      )}

      {/* Notes */}
      {appointment.notes && (
        <p className="text-sm text-warm-gray mb-4 italic">"{appointment.notes}"</p>
      )}

      {/* Actions */}
      {!isCancelled && (
        <div className="flex gap-2 pt-2 border-t border-cream-dark">
          <button
            onClick={() => onReschedule(appointment)}
            className="flex-1 py-2.5 text-sm font-medium text-forest bg-forest/5 hover:bg-forest/10 rounded-lg transition-colors cursor-pointer"
          >
            Reschedule
          </button>
          <button
            onClick={() => onCancel(appointment)}
            className="flex-1 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
