const express = require('express');
const router = express.Router();
const UserController = require('../Controllers/UserControllers');

// CRUD
router.get('/', UserController.getAllUsers);
router.post('/', UserController.addUser);
router.get('/search', UserController.searchUsers);
router.get('/pdf', UserController.generateUsersPDF);
router.get('/:id/pdf', UserController.generateUserPDF);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Auth
router.post('/login', UserController.loginUser);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);

module.exports = router;
