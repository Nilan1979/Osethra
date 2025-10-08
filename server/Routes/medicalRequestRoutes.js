const express = require('express');
const router = express.Router();
const controller = require('../Controllers/medicalRequestController');

// CRUD routes
router.get('/', controller.getAllRequests);
router.post('/add', controller.addRequest);
router.put('/update/:id', controller.updateRequest);
router.delete('/delete/:id', controller.deleteRequest);

module.exports = router;
