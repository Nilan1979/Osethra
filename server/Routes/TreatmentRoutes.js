const express = require('express');
const router = express.Router();
const {
  createTreatment,
  getTreatmentsByDoctor,
  getTreatmentsByPatient,
  getTreatmentById,
  updateTreatment,
  deleteTreatment,
  getTreatmentByAppointment
} = require('../Controllers/TreatmentController');

// POST /api/treatments - Create a new treatment
router.post('/', createTreatment);

// GET /api/treatments/doctor/:doctorId - Get all treatments by a doctor
router.get('/doctor/:doctorId', getTreatmentsByDoctor);

// GET /api/treatments/patient/:patientIdentifier - Get all treatments for a patient (by name or contact)
router.get('/patient/:patientIdentifier', getTreatmentsByPatient);

// GET /api/treatments/appointment/:appointmentId - Get treatment by appointment
router.get('/appointment/:appointmentId', getTreatmentByAppointment);

// GET /api/treatments/:treatmentId - Get treatment by ID
router.get('/:treatmentId', getTreatmentById);

// PUT /api/treatments/:treatmentId - Update treatment
router.put('/:treatmentId', updateTreatment);

// DELETE /api/treatments/:treatmentId - Delete treatment
router.delete('/:treatmentId', deleteTreatment);

module.exports = router;