const express = require('express');
const router = express.Router();
const ReportsController = require('../Controllers/ReportsController');
const { authenticate, authorize } = require('../Middleware/authMiddleware');

/**
 * GET /api/reports/stock-status
 * Generate Stock Status Report
 * Query params: category, status, stockStatus, format (json|pdf|excel)
 * Access: Pharmacist, Admin, Nurse
 */
router.get(
    '/stock-status',
    authenticate,
    authorize('pharmacist', 'admin', 'nurse'),
    ReportsController.getStockStatusReport
);

/**
 * GET /api/reports/batch-expiry
 * Generate Batch/Expiry Report
 * Query params: category, days, expiryStatus, format (json|pdf|excel)
 * Access: Pharmacist, Admin, Nurse
 */
router.get(
    '/batch-expiry',
    authenticate,
    authorize('pharmacist', 'admin', 'nurse'),
    ReportsController.getBatchExpiryReport
);

/**
 * GET /api/reports/issues
 * Generate Issues/Dispensing Report
 * Query params: startDate, endDate, type, status, format (json|pdf|excel)
 * Access: Pharmacist, Admin, Nurse
 */
router.get(
    '/issues',
    authenticate,
    authorize('pharmacist', 'admin', 'nurse'),
    ReportsController.getIssuesReport
);

/**
 * GET /api/reports/sales-revenue
 * Generate Sales/Revenue Report
 * Query params: startDate, endDate, category, groupBy, format (json|pdf|excel)
 * Access: Pharmacist, Admin
 */
router.get(
    '/sales-revenue',
    authenticate,
    authorize('pharmacist', 'admin'),
    ReportsController.getSalesRevenueReport
);

module.exports = router;
