import { useState } from 'react';
import AppointmentForm from './components/AppointmentForm';
import AppointmentDashboard from './components/AppointmentDashboard';
import AvailableSlots from './components/AvailableSlots';
import Toast from './components/Toast';

const TABS = [
  { id: 'book', label: 'New Appointment' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'slots', label: 'Available Slots' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('book');
  const [toast, setToast] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function showToast(message, type = 'success') {
    setToast({ message, type });
  }

  function handleNewAppointment() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Top Announcement Banner ───────────────────────────────────── */}
      <div className="bg-charcoal text-cream py-2.5 text-center">
        <p className="font-mono text-xs tracking-[0.15em] uppercase">
          WhatsApp Appointment Reminder System &nbsp;·&nbsp; Powered by Twilio + Supabase
        </p>
      </div>

      {/* ─── Navigation ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-cream/80 backdrop-blur-md border-b border-cream-dark">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-forest rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <span className="font-display text-xl text-charcoal">AppointMate</span>
          </div>

          {/* Nav tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-forest text-white'
                    : 'text-charcoal-light hover:bg-cream-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile nav */}
          <div className="md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-white border border-cream-dark rounded-lg px-3 py-2 text-sm font-medium text-charcoal cursor-pointer"
            >
              {TABS.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ─── Main Content ──────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">
        {activeTab === 'book' && (
          <AppointmentForm onSuccess={handleNewAppointment} showToast={showToast} />
        )}
        {activeTab === 'dashboard' && (
          <AppointmentDashboard showToast={showToast} refreshKey={refreshKey} />
        )}
        {activeTab === 'slots' && <AvailableSlots showToast={showToast} />}
      </main>

      {/* ─── Footer Curve ──────────────────────────────────────────────── */}
      <footer className="mt-auto">
        <div className="relative">
          <svg
            viewBox="0 0 1440 120"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C360,120 1080,0 1440,60 L1440,120 L0,120 Z"
              className="fill-forest"
            />
          </svg>
          <div className="bg-forest py-8 text-center -mt-1">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-white/60">
              Built for Better Call Centers · El Paso Water Quality LLC
            </p>
          </div>
        </div>
      </footer>

      {/* ─── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
