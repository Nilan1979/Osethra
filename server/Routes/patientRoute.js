const express = require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController');

router.get('/', patientController.getAllPatients);
router.post('/add', patientController.addPatient);
router.put('/edit/:id', patientController.updatePatient);
router.delete('/delete/:id', patientController.deletePatient);

module.exports = router;
