import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

export async function createAppointment(data) {
  const res = await api.post('/appointments', data);
  return res.data;
}

export async function getAppointments() {
  const res = await api.get('/appointments');
  return res.data;
}

export async function getAppointment(id) {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
}

export async function rescheduleAppointment(id, newTime) {
  const res = await api.put(`/appointments/${id}/reschedule`, {
    new_appointment_time: newTime,
  });
  return res.data;
}

export async function cancelAppointment(id) {
  const res = await api.put(`/appointments/${id}/cancel`);
  return res.data;
}

export async function getAvailableSlots() {
  const res = await api.get('/appointments/available-slots');
  return res.data;
}

export default api;
