import api from './axiosConfig';

// Products API
export const productsAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/inventory/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID
  getProduct: async (id) => {
    try {
      const response = await api.get(`/inventory/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Create new product
  createProduct: async (productData) => {
    try {
      const response = await api.post('/inventory/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/inventory/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Delete product
  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/inventory/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/inventory/products/low-stock');
      return response.data;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/inventory/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create new category
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/inventory/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Update category
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/inventory/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  // Delete category
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/inventory/categories/${id}`);
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
      const response = await api.get('/inventory/issues', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching issues:', error);
      throw error;
    }
  },

  // Get single issue by ID
  getIssue: async (id) => {
    try {
      const response = await api.get(`/inventory/issues/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching issue:', error);
      throw error;
    }
  },

  // Create new issue
  createIssue: async (issueData) => {
    try {
      const response = await api.post('/inventory/issues', issueData);
      return response.data;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  },

  // Update issue status
  updateIssueStatus: async (id, status) => {
    try {
      const response = await api.patch(`/inventory/issues/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
  },

  // Delete issue
  deleteIssue: async (id) => {
    try {
      const response = await api.delete(`/inventory/issues/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  },
};

// Alerts API
export const alertsAPI = {
  // Get all stock alerts
  getStockAlerts: async () => {
    try {
      const response = await api.get('/inventory/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching stock alerts:', error);
      throw error;
    }
  },

  // Get expiry alerts
  getExpiryAlerts: async (daysThreshold = 30) => {
    try {
      const response = await api.get('/inventory/alerts/expiry', { 
        params: { daysThreshold } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching expiry alerts:', error);
      throw error;
    }
  },

  // Get expired products
  getExpiredProducts: async () => {
    try {
      const response = await api.get('/inventory/alerts/expired');
      return response.data;
    } catch (error) {
      console.error('Error fetching expired products:', error);
      throw error;
    }
  },
};

// Reports API
export const reportsAPI = {
  // Get inventory report
  getInventoryReport: async (params = {}) => {
    try {
      const response = await api.get('/inventory/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      throw error;
    }
  },

  // Get stock movement report
  getStockMovementReport: async (startDate, endDate) => {
    try {
      const response = await api.get('/inventory/reports/movement', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movement report:', error);
      throw error;
    }
  },

  // Get valuation report
  getValuationReport: async () => {
    try {
      const response = await api.get('/inventory/reports/valuation');
      return response.data;
    } catch (error) {
      console.error('Error fetching valuation report:', error);
      throw error;
    }
  },

  // Export report
  exportReport: async (reportType, format = 'pdf') => {
    try {
      const response = await api.get(`/inventory/reports/export/${reportType}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  },
};

// Dashboard Statistics API
export const dashboardAPI = {
  // Get pharmacist dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/inventory/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get('/inventory/dashboard/activities', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  },
};

export default {
  products: productsAPI,
  categories: categoriesAPI,
  issues: issuesAPI,
  alerts: alertsAPI,
  reports: reportsAPI,
  dashboard: dashboardAPI,
};
