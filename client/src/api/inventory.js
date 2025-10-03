import api from './axiosConfig';

// Products API
export const productsAPI = {
  // Get all products with filters (alias for getProducts)
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/inventory/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/api/inventory/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/api/inventory/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/api/inventory/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/api/inventory/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/api/inventory/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Delete product (alias)
  delete: async (id) => {
    try {
      const response = await api.delete(`/api/inventory/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get product order history
  getProductHistory: async (id, params = {}) => {
    try {
      const response = await api.get(`/api/inventory/products/${id}/history`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching product history:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/api/inventory/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/api/inventory/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (name) => {
    try {
      const response = await api.delete(`/api/inventory/categories/${name}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },
};

// Issues API
export const issuesAPI = {
  // Get all issues with filters
  getIssues: async (params = {}) => {
    try {
      const response = await api.get('/api/inventory/issues', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },

  // Get single issue by ID
  getIssue: async (id) => {
    try {
      const response = await api.get(`/api/inventory/issues/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  },

  // Get today's issues
  getTodayIssues: async () => {
    try {
      const response = await api.get('/api/inventory/issues/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today issues:', error);
      throw error;
    }
  },

  // Create new issue
  createIssue: async (issueData) => {
    try {
      const response = await api.post('/api/inventory/issues', issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  // Update issue status
  updateIssueStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/inventory/issues/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  },
};

// Alerts API
export const alertsAPI = {
  // Get all stock alerts (low-stock, out-of-stock, expiring, expired)
  getStockAlerts: async (type = null) => {
    try {
      const params = type ? { type } : {};
      const response = await api.get('/api/inventory/alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw error;
    }
  },
};

// Prescriptions API
export const prescriptionsAPI = {
  // Get all prescriptions with filters
  getPrescriptions: async (params = {}) => {
    try {
      const response = await api.get('/api/prescriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  // Get single prescription by ID
  getPrescription: async (id) => {
    try {
      const response = await api.get(`/api/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  },

  // Create new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('/api/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  // Dispense prescription
  dispensePrescription: async (id, medications) => {
    try {
      const response = await api.post(`/api/prescriptions/${id}/dispense`, { medications });
      return response.data;
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      throw error;
    }
  },

  // Update prescription status
  updatePrescriptionStatus: async (id, status) => {
    try {
      const response = await api.patch(`/api/prescriptions/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating prescription status:', error);
      throw error;
    }
  },

  // Cancel/Delete prescription
  deletePrescription: async (id) => {
    try {
      const response = await api.delete(`/api/prescriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  },
};

// Dashboard Statistics API
export const dashboardAPI = {
  // Get pharmacist dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/inventory/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10, type = null, severity = null) => {
    try {
      const params = { limit };
      if (type) params.type = type;
      if (severity) params.severity = severity;
      
      const response = await api.get('/api/inventory/dashboard/activities', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },
};

// Export all APIs as default
export default {
  products: productsAPI,
  categories: categoriesAPI,
  issues: issuesAPI,
  alerts: alertsAPI,
  prescriptions: prescriptionsAPI,
  dashboard: dashboardAPI,
};

