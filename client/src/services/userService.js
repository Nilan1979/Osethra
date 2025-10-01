// API utility functions for user-related operations

import axios from 'axios';

// Search users by name
export const searchUsersByName = async (name) => {
  try {
    const response = await axios.get(`/users/search?name=${encodeURIComponent(name)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Search failed'
    };
  }
};

// Get all users with optional search parameter
export const getAllUsers = async (search = '') => {
  try {
    const url = search ? `/users?search=${encodeURIComponent(search)}` : '/users';
    const response = await axios.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch users'
    };
  }
};

// Download PDF report of all users
export const downloadUsersPDF = async () => {
  try {
    const response = await axios.get('/users/pdf', {
      responseType: 'blob'
    });
    
    // Create blob and download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-report-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'PDF downloaded successfully' };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to download PDF'
    };
  }
};

// Create a new user
export const createUser = async (userData) => {
  try {
    const response = await axios.post('/users', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create user'
    };
  }
};

// Update user
export const updateUser = async (userId, userData) => {
  try {
    const response = await axios.put(`/users/${userId}`, userData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update user'
    };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete user'
    };
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/users/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get user'
    };
  }
};