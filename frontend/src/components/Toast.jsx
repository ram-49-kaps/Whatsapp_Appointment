import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const borderColors = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  };

  return (
    <div
      className={`fixed top-6 right-6 z-50 max-w-sm bg-white rounded-lg shadow-2xl border-l-4 ${borderColors[type]} p-4 flex items-start gap-3 transition-all duration-300 ${visible ? 'animate-toast-in' : 'opacity-0 translate-x-full'}`}
    >
      <span className="text-xl">{icons[type]}</span>
      <div className="flex-1">
        <p className="text-sm font-medium text-charcoal">{message}</p>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        className="text-warm-gray hover:text-charcoal transition-colors cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}
