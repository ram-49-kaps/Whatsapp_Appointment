import { useState } from 'react';
import { createAppointment } from '../utils/api';

export default function AppointmentForm({ onSuccess, showToast }) {
  const [form, setForm] = useState({
    customer_name: '',
    phone_number: '',
    appointment_time: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required';
    if (!form.phone_number.trim()) {
      errs.phone_number = 'Phone is required';
    } else if (!/^\+\d{10,15}$/.test(form.phone_number.replace(/[\s\-()]/g, ''))) {
      errs.phone_number = 'Use international format (e.g. +1234567890)';
    }
    if (!form.appointment_time) {
      errs.appointment_time = 'Date & time is required';
    } else if (new Date(form.appointment_time) <= new Date()) {
      errs.appointment_time = 'Must be a future date';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const payload = {
        ...form,
        appointment_time: new Date(form.appointment_time).toISOString(),
      };
      await createAppointment(payload);
      showToast('Appointment booked! WhatsApp confirmation sent.', 'success');
      setForm({ customer_name: '', phone_number: '', appointment_time: '', notes: '' });
      setErrors({});
      if (onSuccess) onSuccess();
    } catch (err) {
      const msg =
        err.response?.data?.detail?.[0]?.msg ||
        err.response?.data?.detail ||
        'Something went wrong. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  return (
    <div className="animate-fade-in-up">
      {/* Hero section */}
      <div className="text-center mb-12">
        <span className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-warm-gray border border-warm-gray-light rounded-full px-5 py-2 mb-6">
          Ready to schedule? Let's go →
        </span>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-charcoal leading-[1.1] mb-4">
          Book Your<br />
          <span className="text-forest">Appointment</span>
        </h1>
        <p className="text-warm-gray text-lg max-w-md mx-auto">
          Enter the details below and we'll send a WhatsApp confirmation instantly.
        </p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-cream-dark p-8 md:p-10 space-y-6"
      >
        {/* Customer Name */}
        <div>
          <label className="block font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-2">
            Customer Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={form.customer_name}
            onChange={(e) => handleChange('customer_name', e.target.value)}
            className={`w-full px-4 py-3 bg-cream rounded-lg border text-charcoal placeholder:text-warm-gray-light text-base ${
              errors.customer_name ? 'border-red-400' : 'border-cream-dark'
            }`}
          />
          {errors.customer_name && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.customer_name}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-2">
            WhatsApp Number
          </label>
          <input
            type="tel"
            placeholder="+1 234 567 8900"
            value={form.phone_number}
            onChange={(e) => handleChange('phone_number', e.target.value)}
            className={`w-full px-4 py-3 bg-cream rounded-lg border text-charcoal placeholder:text-warm-gray-light text-base ${
              errors.phone_number ? 'border-red-400' : 'border-cream-dark'
            }`}
          />
          {errors.phone_number && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.phone_number}</p>
          )}
        </div>

        {/* Appointment Time */}
        <div>
          <label className="block font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-2">
            Appointment Date & Time
          </label>
          <input
            type="datetime-local"
            value={form.appointment_time}
            onChange={(e) => handleChange('appointment_time', e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className={`w-full px-4 py-3 bg-cream rounded-lg border text-charcoal text-base ${
              errors.appointment_time ? 'border-red-400' : 'border-cream-dark'
            }`}
          />
          {errors.appointment_time && (
            <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.appointment_time}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="block font-mono text-xs tracking-[0.15em] uppercase text-warm-gray mb-2">
            Notes <span className="normal-case tracking-normal text-warm-gray-light">(optional)</span>
          </label>
          <textarea
            placeholder="Any special instructions..."
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-cream rounded-lg border border-cream-dark text-charcoal placeholder:text-warm-gray-light text-base resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest hover:bg-forest-light text-white font-semibold py-4 rounded-xl transition-all duration-300 text-base tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer hover:shadow-lg hover:shadow-forest/20 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Booking...
            </>
          ) : (
            <>
              Book Appointment
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
