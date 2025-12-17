const { body, validationResult } = require('express-validator');
const Establecimiento = require('../models/Establecimiento');

// Validaciones
exports.validarCrearEstablecimiento = [
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('direccion').optional(),
  body('comuna').optional(),
  body('region').optional()
];

// GET /api/establecimientos
exports.listar = async (req, res) => {
  try {
    const empleadorId = req.usuario.empleador_id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    const establecimientos = await Establecimiento.listarPorEmpleador(empleadorId);

    res.json({
      success: true,
      data: establecimientos
    });
  } catch (error) {
    console.error('Error al listar establecimientos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al listar establecimientos' 
    });
  }
};

// POST /api/establecimientos
exports.crear = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const empleadorId = req.usuario.empleador_id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    const { nombre, direccion, comuna, region } = req.body;

    // Crear establecimiento
    const nuevoEstablecimiento = await Establecimiento.crear({
      empleador_id: empleadorId,
      nombre,
      direccion: direccion || null,
      comuna: comuna || null,
      region: region || null,
      activo: true
    });

    res.status(201).json({
      success: true,
      message: 'Establecimiento creado exitosamente',
      data: nuevoEstablecimiento
    });
  } catch (error) {
    console.error('Error al crear establecimiento:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear establecimiento' 
    });
  }
};
