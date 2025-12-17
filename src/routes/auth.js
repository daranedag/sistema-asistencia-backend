const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', authController.validarLogin, authController.login);

// POST /api/auth/register
router.post('/register', authController.validarRegistro, authController.register);

// POST /api/auth/logout
router.post('/logout', verificarToken, authController.logout);

// PUT /api/auth/change-password
router.put('/change-password', verificarToken, authController.validarCambioPassword, authController.cambiarPassword);

module.exports = router;
