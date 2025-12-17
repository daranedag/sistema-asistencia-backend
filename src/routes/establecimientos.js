const express = require('express');
const router = express.Router();
const establecimientoController = require('../controllers/establecimientoController');
const { verificarToken, esEmpleador } = require('../middleware/authMiddleware');

// GET /api/establecimientos
router.get('/', verificarToken, esEmpleador, establecimientoController.listar);

// POST /api/establecimientos
router.post('/', verificarToken, esEmpleador, establecimientoController.validarCrearEstablecimiento, establecimientoController.crear);

module.exports = router;
