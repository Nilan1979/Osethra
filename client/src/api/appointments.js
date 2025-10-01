// src/api/appointments.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000"
});

// appointments endpoints
export const getAppointments = (search) => API.get(`/appointments${search ? `?search=${search}` : ''}`);
export const getAppointment = (id) => API.get(`/appointments/${id}`);
export const createAppointment = (data) => API.post("/appointments", data);
export const updateAppointment = (id, data) => API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);
export const downloadPDF = () => API.get('/appointments/report/pdf', { responseType: 'blob' });
export const downloadIndividualPDF = (id) => API.get(`/appointments/${id}/pdf`, { responseType: 'blob' });

