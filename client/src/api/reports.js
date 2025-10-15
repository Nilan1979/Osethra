import axiosInstance from './axiosConfig';

const reportsAPI = {
    // Stock Status Report
    getStockStatusReport: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/stock-status', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching stock status report:', error);
            throw error;
        }
    },

    // Batch/Expiry Report
    getBatchExpiryReport: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/batch-expiry', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching batch/expiry report:', error);
            throw error;
        }
    },

    // Issues/Dispensing Report
    getIssuesReport: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/issues', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching issues report:', error);
            throw error;
        }
    },

    // Sales/Revenue Report
    getSalesRevenueReport: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/sales-revenue', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching sales/revenue report:', error);
            throw error;
        }
    },

    // Download PDF reports
    downloadStockStatusPDF: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/stock-status', {
                params: { ...params, format: 'pdf' },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading stock status PDF:', error);
            throw error;
        }
    },

    downloadBatchExpiryPDF: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/batch-expiry', {
                params: { ...params, format: 'pdf' },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading batch/expiry PDF:', error);
            throw error;
        }
    },

    downloadIssuesPDF: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/issues', {
                params: { ...params, format: 'pdf' },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading issues PDF:', error);
            throw error;
        }
    },

    downloadSalesRevenuePDF: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/reports/sales-revenue', {
                params: { ...params, format: 'pdf' },
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Error downloading sales/revenue PDF:', error);
            throw error;
        }
    }
};

export default reportsAPI;
