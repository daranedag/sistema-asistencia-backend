const crypto = require('crypto');

exports.generarHashMarcacion = (marcacion) => {
  const datos = [
    marcacion.usuario_rut,
    marcacion.usuario_nombre,
    marcacion.timestamp,
    marcacion.tipo_marcacion,
    marcacion.empleador_rut,
    marcacion.empleador_nombre
  ].join('|');
  
  return crypto
    .createHash('sha256')
    .update(datos)
    .digest('hex');
};

exports.verificarHashMarcacion = (marcacion, hashProporcionado) => {
  const hashCalculado = this.generarHashMarcacion(marcacion);
  return hashCalculado === hashProporcionado;
};