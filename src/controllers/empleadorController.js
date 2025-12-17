const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const Marcacion = require('../models/Marcacion');
const supabase = require('../config/database');

// Validaciones
exports.validarCrearTrabajador = [
  body('rut').notEmpty().withMessage('RUT es requerido'),
  body('nombres').notEmpty().withMessage('Nombres son requeridos'),
  body('apellido_paterno').notEmpty().withMessage('Apellido paterno es requerido'),
  body('apellido_materno').notEmpty().withMessage('Apellido materno es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('telefono').optional(),
  body('regimen_especial').optional().isBoolean()
];

exports.validarEditarTrabajador = [
  body('nombres').optional().notEmpty(),
  body('apellido_paterno').optional().notEmpty(),
  body('apellido_materno').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('telefono').optional(),
  body('regimen_especial').optional().isBoolean()
];

// GET /api/empleador/marcaciones
exports.marcaciones = async (req, res) => {
  try {
    const empleadorId = req.usuario.empleador_id;
    const { desde, hasta } = req.query;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    const marcaciones = await Marcacion.listarPorEmpleador(empleadorId, desde, hasta);

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

// GET /api/empleador/trabajadores
exports.listarTrabajadores = async (req, res) => {
  try {
    const empleadorId = req.usuario.empleador_id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    const trabajadores = await Usuario.listarPorEmpleador(empleadorId);

    res.json({
      success: true,
      data: trabajadores
    });
  } catch (error) {
    console.error('Error al listar trabajadores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al listar trabajadores' 
    });
  }
};

// POST /api/empleador/trabajadores
exports.crearTrabajador = async (req, res) => {
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

    const { rut, nombres, apellido_paterno, apellido_materno, email, password, telefono, regimen_especial } = req.body;

    // Verificar si el RUT ya existe
    const usuarioExistente = await Usuario.buscarPorRut(rut);
    if (usuarioExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'El RUT ya está registrado' 
      });
    }

    // Verificar si el email ya existe
    const emailExistente = await Usuario.buscarPorEmail(email);
    if (emailExistente) {
      return res.status(400).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear trabajador
    const nuevoTrabajador = await Usuario.crear({
      rut,
      nombres,
      apellido_paterno,
      apellido_materno,
      email,
      password_hash,
      telefono,
      rol: 'trabajador',
      regimen_especial: regimen_especial || false,
      empleador_id: empleadorId
    });

    res.status(201).json({
      success: true,
      message: 'Trabajador creado exitosamente',
      data: {
        id: nuevoTrabajador.id,
        rut: nuevoTrabajador.rut,
        nombres: nuevoTrabajador.nombres,
        apellido_paterno: nuevoTrabajador.apellido_paterno,
        apellido_materno: nuevoTrabajador.apellido_materno,
        email: nuevoTrabajador.email,
        telefono: nuevoTrabajador.telefono,
        regimen_especial: nuevoTrabajador.regimen_especial
      }
    });
  } catch (error) {
    console.error('Error al crear trabajador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al crear trabajador' 
    });
  }
};

// PUT /api/empleador/trabajadores/:id
exports.editarTrabajador = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const empleadorId = req.usuario.empleador_id;
    const trabajadorId = req.params.id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    // Verificar que el trabajador pertenece al empleador
    const trabajador = await Usuario.buscarPorId(trabajadorId);
    if (!trabajador || trabajador.empleador_id !== empleadorId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trabajador no encontrado' 
      });
    }

    const { nombres, apellido_paterno, apellido_materno, email, telefono, regimen_especial } = req.body;

    // Si se quiere cambiar el email, verificar que no exista
    if (email && email !== trabajador.email) {
      const emailExistente = await Usuario.buscarPorEmail(email);
      if (emailExistente) {
        return res.status(400).json({ 
          success: false, 
          message: 'El email ya está registrado' 
        });
      }
    }

    // Actualizar trabajador
    const datosActualizar = {};
    if (nombres) datosActualizar.nombres = nombres;
    if (apellido_paterno) datosActualizar.apellido_paterno = apellido_paterno;
    if (apellido_materno) datosActualizar.apellido_materno = apellido_materno;
    if (email) datosActualizar.email = email;
    if (telefono !== undefined) datosActualizar.telefono = telefono;
    if (regimen_especial !== undefined) datosActualizar.regimen_especial = regimen_especial;

    const trabajadorActualizado = await Usuario.actualizar(trabajadorId, datosActualizar);

    res.json({
      success: true,
      message: 'Trabajador actualizado exitosamente',
      data: {
        id: trabajadorActualizado.id,
        rut: trabajadorActualizado.rut,
        nombres: trabajadorActualizado.nombres,
        apellido_paterno: trabajadorActualizado.apellido_paterno,
        apellido_materno: trabajadorActualizado.apellido_materno,
        email: trabajadorActualizado.email,
        telefono: trabajadorActualizado.telefono,
        regimen_especial: trabajadorActualizado.regimen_especial
      }
    });
  } catch (error) {
    console.error('Error al editar trabajador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al editar trabajador' 
    });
  }
};

// DELETE /api/empleador/trabajadores/:id
exports.desactivarTrabajador = async (req, res) => {
  try {
    const empleadorId = req.usuario.empleador_id;
    const trabajadorId = req.params.id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    // Verificar que el trabajador pertenece al empleador
    const trabajador = await Usuario.buscarPorId(trabajadorId);
    if (!trabajador || trabajador.empleador_id !== empleadorId) {
      return res.status(404).json({ 
        success: false, 
        message: 'Trabajador no encontrado' 
      });
    }

    // Desactivar trabajador
    await Usuario.desactivar(trabajadorId);

    res.json({
      success: true,
      message: 'Trabajador desactivado exitosamente'
    });
  } catch (error) {
    console.error('Error al desactivar trabajador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al desactivar trabajador' 
    });
  }
};

// GET /api/empleador/estadisticas
exports.estadisticas = async (req, res) => {
  try {
    const empleadorId = req.usuario.empleador_id;

    if (!empleadorId) {
      return res.status(403).json({ 
        success: false, 
        message: 'No tiene un empleador asociado' 
      });
    }

    // Total de trabajadores
    const { count: totalTrabajadores } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('empleador_id', empleadorId)
      .eq('activo', true);

    // Trabajadores activos hoy (que han marcado entrada hoy)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const { data: marcacionesHoy } = await supabase
      .from('marcaciones')
      .select('usuario_id')
      .eq('empleador_id', empleadorId)
      .gte('timestamp', hoy.toISOString())
      .eq('tipo_marcacion', 'entrada');
    
    const trabajadoresActivosHoy = new Set(marcacionesHoy?.map(m => m.usuario_id) || []).size;

    // Total de marcaciones del mes
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const { count: marcacionesMes } = await supabase
      .from('marcaciones')
      .select('*', { count: 'exact', head: true })
      .eq('empleador_id', empleadorId)
      .gte('timestamp', inicioMes.toISOString());

    // Total de marcaciones hoy
    const { count: marcacionesHoy2 } = await supabase
      .from('marcaciones')
      .select('*', { count: 'exact', head: true })
      .eq('empleador_id', empleadorId)
      .gte('timestamp', hoy.toISOString());

    res.json({
      success: true,
      data: {
        total_trabajadores: totalTrabajadores || 0,
        trabajadores_activos_hoy: trabajadoresActivosHoy || 0,
        marcaciones_hoy: marcacionesHoy2 || 0,
        marcaciones_mes: marcacionesMes || 0
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas' 
    });
  }
};
