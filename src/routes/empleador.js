const express = require('express');
const router = express.Router();
const empleadorController = require('../controllers/empleadorController');
const { verificarToken, esEmpleador } = require('../middleware/authMiddleware');

// GET /api/empleador/marcaciones
router.get('/marcaciones', verificarToken, esEmpleador, empleadorController.marcaciones);

// GET /api/empleador/trabajadores
router.get('/trabajadores', verificarToken, esEmpleador, empleadorController.listarTrabajadores);

// POST /api/empleador/trabajadores
router.post('/trabajadores', verificarToken, esEmpleador, empleadorController.validarCrearTrabajador, empleadorController.crearTrabajador);

// PUT /api/empleador/trabajadores/:id
router.put('/trabajadores/:id', verificarToken, esEmpleador, empleadorController.validarEditarTrabajador, empleadorController.editarTrabajador);

// DELETE /api/empleador/trabajadores/:id
router.delete('/trabajadores/:id', verificarToken, esEmpleador, empleadorController.desactivarTrabajador);

// GET /api/empleador/estadisticas
router.get('/estadisticas', verificarToken, esEmpleador, empleadorController.estadisticas);

module.exports = router;
