const jwt = require('jsonwebtoken');

// Verificar token JWT
exports.verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token inválido o expirado' 
    });
  }
};

// Verificar rol de trabajador
exports.esTrabajador = (req, res, next) => {
  if (req.usuario.rol !== 'trabajador' && req.usuario.rol !== 'empleador') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado' 
    });
  }
  next();
};

// Verificar rol de empleador
exports.esEmpleador = (req, res, next) => {
  if (req.usuario.rol !== 'empleador') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Solo empleadores' 
    });
  }
  next();
};

// Verificar rol de fiscalizador
exports.esFiscalizador = (req, res, next) => {
  if (req.usuario.rol !== 'fiscalizador') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acceso denegado. Solo fiscalizadores DT' 
    });
  }
  next();
};
