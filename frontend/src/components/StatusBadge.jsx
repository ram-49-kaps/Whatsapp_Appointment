export default function StatusBadge({ status }) {
  const config = {
    confirmed: {
      label: 'CONFIRMED',
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    cancelled: {
      label: 'CANCELLED',
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
    },
    rescheduled: {
      label: 'RESCHEDULED',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
    },
  };

  const c = config[status] || config.confirmed;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold tracking-wider ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
