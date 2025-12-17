const express = require('express');
const router = express.Router();
const marcacionController = require('../controllers/marcacionController');
const { verificarToken, esTrabajador } = require('../middleware/authMiddleware');

// POST /api/marcaciones - Crear marcación (requiere autenticación)
router.post('/', verificarToken, esTrabajador, marcacionController.validarCrearMarcacion, marcacionController.crear);

// GET /api/marcaciones/mis-marcaciones - Obtener mis marcaciones
router.get('/mis-marcaciones', verificarToken, esTrabajador, marcacionController.misMarcaciones);

// GET /api/marcaciones/ultima - Última marcación
router.get('/ultima', verificarToken, esTrabajador, marcacionController.ultima);

// POST /api/marcaciones/verificar - Verificar hash (público, sin autenticación)
router.post('/verificar', marcacionController.validarVerificarHash, marcacionController.verificar);

module.exports = router;
