// client/src/api/schedule.js
import axios from "./axiosConfig";

const API_BASE_URL = "/api/schedules";

// Create a new schedule
export const createSchedule = async (scheduleData) => {
  try {
    const response = await axios.post(API_BASE_URL, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all schedules (for receptionists)
export const getAllSchedules = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.date) params.append("date", filters.date);
    if (filters.doctorId) params.append("doctorId", filters.doctorId);
    if (filters.isAvailable !== undefined) params.append("isAvailable", filters.isAvailable);

    const response = await axios.get(`${API_BASE_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get schedules by doctor ID
export const getSchedulesByDoctor = async (doctorId, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.isAvailable !== undefined) params.append("isAvailable", filters.isAvailable);

    const response = await axios.get(`${API_BASE_URL}/doctor/${doctorId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a single schedule by ID
export const getScheduleById = async (scheduleId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a schedule
export const updateSchedule = async (scheduleId, scheduleData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${scheduleId}`, scheduleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Delete a schedule
export const deleteSchedule = async (scheduleId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/${scheduleId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get available slots for a doctor on a specific date
export const getAvailableSlots = async (doctorId, date) => {
  try {
    const params = new URLSearchParams();
    params.append("doctorId", doctorId);
    params.append("date", date);

    const response = await axios.get(`${API_BASE_URL}/available-slots?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get all doctors who have schedules
export const getDoctorsWithSchedules = async (date = null) => {
  try {
    const params = date ? `?date=${date}` : "";
    const response = await axios.get(`${API_BASE_URL}/doctors-with-schedules${params}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
