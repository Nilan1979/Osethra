import axios from './axiosConfig';

const API_BASE_URL = 'http://localhost:5000/api';

// Create a new treatment
export const createTreatment = async (treatmentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/treatments`, treatmentData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error creating treatment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create treatment'
    };
  }
};

// Get treatments by doctor
export const getTreatmentsByDoctor = async (doctorId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/treatments/doctor/${doctorId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching treatments by doctor:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch treatments'
    };
  }
};

// Get treatments by patient
export const getTreatmentsByPatient = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/treatments/patient/${patientId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching treatments by patient:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch treatments'
    };
  }
};

// Get treatment by appointment
export const getTreatmentByAppointment = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/treatments/appointment/${appointmentId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching treatment by appointment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch treatment'
    };
  }
};

// Get treatment by ID
export const getTreatmentById = async (treatmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/treatments/${treatmentId}`);
    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching treatment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch treatment'
    };
  }
};

// Update treatment
export const updateTreatment = async (treatmentId, updateData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/treatments/${treatmentId}`, updateData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error updating treatment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update treatment'
    };
  }
};

// Delete treatment
export const deleteTreatment = async (treatmentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/treatments/${treatmentId}`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error deleting treatment:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete treatment'
    };
  }
};