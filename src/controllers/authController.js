const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');
const Empleador = require('../models/Empleador');

// Validaciones
exports.validarLogin = [
  body('rut').notEmpty().withMessage('RUT es requerido'),
  body('password').notEmpty().withMessage('Contraseña es requerida')
];

exports.validarRegistro = [
  body('rut').notEmpty().withMessage('RUT es requerido'),
  body('nombres').notEmpty().withMessage('Nombres son requeridos'),
  body('apellido_paterno').notEmpty().withMessage('Apellido paterno es requerido'),
  body('apellido_materno').notEmpty().withMessage('Apellido materno es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('telefono').optional(),
  body('empleador_id').notEmpty().withMessage('Empleador es requerido')
];

exports.validarCambioPassword = [
  body('password_actual').notEmpty().withMessage('Contraseña actual es requerida'),
  body('password_nueva').isLength({ min: 6 }).withMessage('Contraseña nueva debe tener al menos 6 caracteres')
];

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { rut, password } = req.body;

    // Buscar usuario
    const usuario = await Usuario.buscarPorRut(rut);
    if (!usuario) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuario inactivo' 
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ 
        success: false, 
        message: 'Credenciales inválidas' 
      });
    }

    // Obtener datos del empleador si existe
    let empleador = null;
    if (usuario.empleador_id) {
      empleador = await Empleador.buscarPorId(usuario.empleador_id);
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        rut: usuario.rut, 
        rol: usuario.rol,
        empleador_id: usuario.empleador_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        usuario: {
          id: usuario.id,
          rut: usuario.rut,
          nombres: usuario.nombres,
          apellido_paterno: usuario.apellido_paterno,
          apellido_materno: usuario.apellido_materno,
          email: usuario.email,
          telefono: usuario.telefono,
          rol: usuario.rol,
          regimen_especial: usuario.regimen_especial,
          empleador
        }
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al iniciar sesión' 
    });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { rut, nombres, apellido_paterno, apellido_materno, email, password, telefono, empleador_id } = req.body;

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

    // Verificar que el empleador existe
    const empleador = await Empleador.buscarPorId(empleador_id);
    if (!empleador) {
      return res.status(400).json({ 
        success: false, 
        message: 'Empleador no encontrado' 
      });
    }

    // Hash de contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await Usuario.crear({
      rut,
      nombres,
      apellido_paterno,
      apellido_materno,
      email,
      password_hash,
      telefono,
      rol: 'trabajador',
      empleador_id
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: nuevoUsuario.id,
        rut: nuevoUsuario.rut,
        nombres: nuevoUsuario.nombres,
        apellido_paterno: nuevoUsuario.apellido_paterno,
        apellido_materno: nuevoUsuario.apellido_materno,
        email: nuevoUsuario.email
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al registrar usuario' 
    });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  try {
    // En una implementación real con tokens de refresh, aquí se invalidaría el token
    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cerrar sesión' 
    });
  }
};

// PUT /api/auth/change-password
exports.cambiarPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { password_actual, password_nueva } = req.body;
    const usuarioId = req.usuario.id;

    // Buscar usuario
    const usuario = await Usuario.buscarPorId(usuarioId);
    if (!usuario) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(password_actual, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ 
        success: false, 
        message: 'Contraseña actual incorrecta' 
      });
    }

    // Hash de nueva contraseña
    const password_hash = await bcrypt.hash(password_nueva, 10);

    // Actualizar contraseña
    await Usuario.actualizar(usuarioId, { password_hash });

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al cambiar contraseña' 
    });
  }
};
