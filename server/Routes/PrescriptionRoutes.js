const express = require('express');
const router = express.Router();
const PrescriptionController = require('../Controllers/PrescriptionController');
const { authenticate, authorize, requirePharmacistOrAdmin } = require('../Middleware/authMiddleware');
const { 
    validatePrescription,
    validateDispensePrescription 
} = require('../Middleware/validationMiddleware');

// ==================== PRESCRIPTION ROUTES ====================

/**
 * GET /api/prescriptions
 * Get all prescriptions with pagination, search, and filtering
 * Query params: page, limit, status, search, date
 * Access: Authenticated users (pharmacist, admin, doctor, nurse)
 */
router.get(
    '/', 
    authenticate, 
    authorize('pharmacist', 'admin', 'doctor', 'nurse'),
    PrescriptionController.getPrescriptions
);

/**
 * GET /api/prescriptions/:id
 * Get single prescription by ID
 * Access: Authenticated users (pharmacist, admin, doctor, nurse)
 */
router.get(
    '/:id', 
    authenticate, 
    authorize('pharmacist', 'admin', 'doctor', 'nurse'),
    PrescriptionController.getPrescription
);

/**
 * POST /api/prescriptions
 * Create new prescription
 * Access: Doctor, Admin
 */
router.post(
    '/', 
    authenticate, 
    authorize('doctor', 'admin'),
    validatePrescription,
    PrescriptionController.createPrescription
);

/**
 * POST /api/prescriptions/:id/dispense
 * Dispense prescription (creates issue and updates stock)
 * Access: Pharmacist and Admin only
 */
router.post(
    '/:id/dispense', 
    authenticate, 
    requirePharmacistOrAdmin,
    validateDispensePrescription,
    PrescriptionController.dispensePrescription
);

/**
 * PATCH /api/prescriptions/:id/status
 * Update prescription status
 * Access: Pharmacist and Admin only
 */
router.patch(
    '/:id/status', 
    authenticate, 
    requirePharmacistOrAdmin,
    PrescriptionController.updatePrescriptionStatus
);

/**
 * DELETE /api/prescriptions/:id
 * Cancel/delete prescription (soft delete - sets status to 'cancelled')
 * Access: Doctor (who created it), Admin
 */
router.delete(
    '/:id', 
    authenticate, 
    authorize('doctor', 'admin'),
    PrescriptionController.deletePrescription
);

module.exports = router;
