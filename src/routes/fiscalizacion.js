const express = require('express');
const router = express.Router();
const fiscalizacionController = require('../controllers/fiscalizacionController');
const { verificarToken, esFiscalizador } = require('../middleware/authMiddleware');

// GET /api/fiscalizacion/marcaciones
router.get('/marcaciones', verificarToken, esFiscalizador, fiscalizacionController.marcaciones);

// GET /api/fiscalizacion/trabajador/:rut
router.get('/trabajador/:rut', verificarToken, esFiscalizador, fiscalizacionController.historialTrabajador);

module.exports = router;
