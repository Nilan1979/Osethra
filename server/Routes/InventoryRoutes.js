const express = require('express');
const router = express.Router();
const InventoryController = require('../Controllers/InventoryController');
const IssueController = require('../Controllers/IssueController');
const { authenticate, authorize, requirePharmacistOrAdmin, inventoryAccess } = require('../Middleware/authMiddleware');
const { 
    validateProduct, 
    validateIssue, 
    validateCategory,
    validateIssueStatus 
} = require('../Middleware/validationMiddleware');

// ==================== PRODUCT ROUTES ====================

/**
 * GET /api/inventory/products
 * Get all products with pagination, search, and filtering
 * Access: Authenticated users (pharmacist, admin, doctor, nurse)
 */
router.get('/products', authenticate, inventoryAccess(false), InventoryController.getProducts);

/**
 * GET /api/inventory/products/:id
 * Get single product by ID
 * Access: Authenticated users (pharmacist, admin, doctor, nurse)
 */
router.get('/products/:id', authenticate, inventoryAccess(false), InventoryController.getProduct);

/**
 * GET /api/inventory/products/:id/history
 * Get product order history
 * Query params: page, limit, type, startDate, endDate
 * Access: Authenticated users (pharmacist, admin)
 */
router.get(
    '/products/:id/history', 
    authenticate, 
    authorize('pharmacist', 'admin'),
    InventoryController.getProductOrderHistory
);

/**
 * POST /api/inventory/products
 * Create new product
 * Access: Pharmacist and Admin only
 */
router.post(
    '/products', 
    authenticate, 
    requirePharmacistOrAdmin,
    validateProduct,
    InventoryController.createProduct
);

/**
 * PUT /api/inventory/products/:id
 * Update existing product
 * Access: Pharmacist and Admin only
 */
router.put(
    '/products/:id', 
    authenticate, 
    requirePharmacistOrAdmin,
    validateProduct,
    InventoryController.updateProduct
);

/**
 * DELETE /api/inventory/products/:id
 * Delete product
 * Access: Pharmacist and Admin only
 */
router.delete(
    '/products/:id', 
    authenticate, 
    requirePharmacistOrAdmin,
    InventoryController.deleteProduct
);

// ==================== CATEGORY ROUTES ====================

/**
 * GET /api/inventory/categories
 * Get all categories with product counts
 * Access: Authenticated users
 */
router.get('/categories', authenticate, InventoryController.getCategories);

/**
 * POST /api/inventory/categories
 * Create new category
 * Access: Pharmacist and Admin only
 */
router.post(
    '/categories', 
    authenticate, 
    requirePharmacistOrAdmin,
    validateCategory,
    InventoryController.createCategory
);

/**
 * DELETE /api/inventory/categories/:name
 * Delete category (prevents deletion if products exist)
 * Access: Pharmacist and Admin only
 */
router.delete(
    '/categories/:name', 
    authenticate, 
    requirePharmacistOrAdmin,
    InventoryController.deleteCategory
);

// ==================== STOCK ALERTS ROUTES ====================

/**
 * GET /api/inventory/alerts
 * Get stock alerts (low-stock, out-of-stock, expiring, expired)
 * Query params: type (optional) - filter by alert type
 * Access: Authenticated users (pharmacist, admin, nurse)
 */
router.get(
    '/alerts', 
    authenticate, 
    authorize('pharmacist', 'admin', 'nurse'),
    InventoryController.getStockAlerts
);

// ==================== DASHBOARD ROUTES ====================

/**
 * GET /api/inventory/dashboard/stats
 * Get comprehensive dashboard statistics
 * Access: Authenticated users (pharmacist, admin)
 */
router.get(
    '/dashboard/stats', 
    authenticate, 
    authorize('pharmacist', 'admin'),
    InventoryController.getDashboardStats
);

/**
 * GET /api/inventory/dashboard/activities
 * Get recent activity logs
 * Query params: limit, type, severity
 * Access: Authenticated users (pharmacist, admin)
 */
router.get(
    '/dashboard/activities', 
    authenticate, 
    authorize('pharmacist', 'admin'),
    InventoryController.getRecentActivities
);

// ==================== ISSUE ROUTES ====================

/**
 * GET /api/inventory/issues
 * Get all issues with pagination and filtering
 * Query params: page, limit, type, status, startDate, endDate, search
 * Access: Authenticated users (pharmacist, admin, nurse)
 */
router.get(
    '/issues', 
    authenticate, 
    authorize('pharmacist', 'admin', 'nurse'),
    IssueController.getIssues
);

/**
 * GET /api/inventory/issues/today
 * Get today's issues count and revenue
 * Access: Authenticated users (pharmacist, admin)
 */
router.get(
    '/issues/today', 
    authenticate, 
    authorize('pharmacist', 'admin'),
    IssueController.getTodayIssues
);

/**
 * GET /api/inventory/issues/:id
 * Get single issue by ID
 * Access: Authenticated users (pharmacist, admin, nurse)
 */
router.get(
    '/issues/:id', 
    authenticate, 
    authorize('pharmacist', 'admin', 'nurse'),
    IssueController.getIssue
);

/**
 * POST /api/inventory/issues
 * Create new issue (dispense products)
 * Access: Pharmacist, Admin, and Nurse
 */
router.post(
    '/issues', 
    authenticate, 
    authorize('pharmacist', 'admin', 'nurse'),
    validateIssue,
    IssueController.createIssue
);

/**
 * PATCH /api/inventory/issues/:id/status
 * Update issue status
 * Access: Pharmacist and Admin only
 */
router.patch(
    '/issues/:id/status', 
    authenticate, 
    requirePharmacistOrAdmin,
    validateIssueStatus,
    IssueController.updateIssueStatus
);

module.exports = router;
