const { body, validationResult } = require('express-validator');
const Marcacion = require('../models/Marcacion');
const Usuario = require('../models/Usuario');
const Empleador = require('../models/Empleador');
const { generarHashMarcacion, verificarHashMarcacion } = require('../services/hashService');
const { enviarComprobanteMarcacion } = require('../services/emailService');

// Validaciones
exports.validarCrearMarcacion = [
  body('tipo_marcacion').isIn(['entrada', 'salida', 'salida_almuerzo', 'entrada_almuerzo']).withMessage('Tipo de marcación inválido'),
  body('ubicacion').optional()
];

exports.validarVerificarHash = [
  body('hash').notEmpty().withMessage('Hash es requerido')
];

// POST /api/marcaciones
exports.crear = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { tipo_marcacion, ubicacion } = req.body;
    const usuarioId = req.usuario.id;

    // Obtener datos del usuario
    const usuario = await Usuario.buscarPorId(usuarioId);
    if (!usuario || !usuario.activo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuario no válido o inactivo' 
      });
    }

    // Obtener datos del empleador
    const empleador = await Empleador.buscarPorId(usuario.empleador_id);
    if (!empleador || !empleador.activo) {
      return res.status(400).json({ 
        success: false, 
        message: 'Empleador no válido o inactivo' 
      });
    }

    const timestamp = new Date().toISOString();

    // Generar hash
    const datosMarcacion = {
      usuario_rut: usuario.rut,
      usuario_nombre: `${usuario.nombres} ${usuario.apellido_paterno} ${usuario.apellido_materno}`,
      timestamp,
      tipo_marcacion,
      empleador_rut: empleador.rut,
      empleador_nombre: empleador.razon_social
    };
    const hash = generarHashMarcacion(datosMarcacion);

    // Crear marcación
    const marcacion = await Marcacion.crear({
      usuario_id: usuarioId,
      empleador_id: usuario.empleador_id,
      tipo_marcacion,
      timestamp,
      ubicacion: ubicacion || null,
      hash,
      sincronizado: true
    });

    // Enviar comprobante por email
    try {
      await enviarComprobanteMarcacion({
        tipo_marcacion,
        fecha: new Date(timestamp).toLocaleDateString('es-CL'),
        hora: new Date(timestamp).toLocaleTimeString('es-CL'),
        hash
      }, usuario);
    } catch (emailError) {
      console.error('Error al enviar email:', emailError);
      // No fallar la marcación si falla el email
    }

    res.status(201).json({
      success: true,
      message: 'Marcación registrada exitosamente',
      data: {
        id: marcacion.id,
        tipo_marcacion: marcacion.tipo_marcacion,
        timestamp: marcacion.timestamp,
        ubicacion: marcacion.ubicacion,
        hash: marcacion.hash
      }
    });
  } catch (error) {
    console.error('Error al crear marcación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar marcación' 
    });
  }
};

// GET /api/marcaciones/mis-marcaciones
exports.misMarcaciones = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { desde, hasta } = req.query;

    const marcaciones = await Marcacion.listarPorUsuario(usuarioId, desde, hasta);

    res.json({
      success: true,
      data: marcaciones
    });
  } catch (error) {
    console.error('Error al obtener marcaciones:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener marcaciones' 
    });
  }
};

// GET /api/marcaciones/ultima
exports.ultima = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const marcacion = await Marcacion.ultimaPorUsuario(usuarioId);

    if (!marcacion) {
      return res.json({
        success: true,
        data: null
      });
    }

    res.json({
      success: true,
      data: marcacion
    });
  } catch (error) {
    console.error('Error al obtener última marcación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener última marcación' 
    });
  }
};

// POST /api/marcaciones/verificar (Público)
exports.verificar = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { hash } = req.body;

    // Buscar marcación por hash
    const marcacion = await Marcacion.buscarPorHash(hash);

    if (!marcacion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Marcación no encontrada' 
      });
    }

    // Verificar hash
    const datosMarcacion = {
      usuario_rut: marcacion.usuario.rut,
      usuario_nombre: `${marcacion.usuario.nombres} ${marcacion.usuario.apellido_paterno} ${marcacion.usuario.apellido_materno}`,
      timestamp: marcacion.timestamp,
      tipo_marcacion: marcacion.tipo_marcacion,
      empleador_rut: marcacion.empleador.rut,
      empleador_nombre: marcacion.empleador.razon_social
    };

    const hashValido = verificarHashMarcacion(datosMarcacion, hash);

    res.json({
      success: true,
      data: {
        valido: hashValido,
        marcacion: {
          tipo_marcacion: marcacion.tipo_marcacion,
          timestamp: marcacion.timestamp,
          trabajador: {
            rut: marcacion.usuario.rut,
            nombre: `${marcacion.usuario.nombres} ${marcacion.usuario.apellido_paterno} ${marcacion.usuario.apellido_materno}`
          },
          empleador: {
            rut: marcacion.empleador.rut,
            razon_social: marcacion.empleador.razon_social
          }
        }
      }
    });
  } catch (error) {
    console.error('Error al verificar marcación:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al verificar marcación' 
    });
  }
};
