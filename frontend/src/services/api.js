import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Services
export const getServices = () => api.get('/services');
export const getService = (id) => api.get(`/services/${id}`);
export const createService = (data) => api.post('/services', data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const getBookingByCode = (code) => api.get(`/bookings/confirmation/${code}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);
export const getAllBookings = (params) => api.get('/bookings', { params });
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data);

// Availability
export const getAvailability = (serviceId, date) =>
  api.get(`/availability/${serviceId}/${date}`);
export const getTimeSlots = () => api.get('/availability/time-slots');
export const createTimeSlot = (data) => api.post('/availability/time-slots', data);
export const updateTimeSlot = (id, data) => api.put(`/availability/time-slots/${id}`, data);
export const deleteTimeSlot = (id) => api.delete(`/availability/time-slots/${id}`);
export const getBlockedDates = () => api.get('/availability/blocked-dates');
export const createBlockedDate = (data) => api.post('/availability/blocked-dates', data);
export const deleteBlockedDate = (id) => api.delete(`/availability/blocked-dates/${id}`);

// Admin
export const adminLogin = (credentials) => api.post('/admin/login', credentials);
export const adminRegister = (data) => api.post('/admin/register', data);
export const getAdminProfile = () => api.get('/admin/me');
export const getDashboardStats = () => api.get('/admin/dashboard/stats');
export const getCustomers = () => api.get('/admin/customers');

export default api;
