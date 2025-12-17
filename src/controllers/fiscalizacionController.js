const Marcacion = require('../models/Marcacion');

// GET /api/fiscalizacion/marcaciones
exports.marcaciones = async (req, res) => {
  try {
    const { empleador_id, desde, hasta } = req.query;

    const filtros = {};
    if (empleador_id) filtros.empleador_id = empleador_id;
    if (desde) filtros.desde = desde;
    if (hasta) filtros.hasta = hasta;

    const marcaciones = await Marcacion.listarParaFiscalizacion(filtros);

    res.json({
      success: true,
      data: marcaciones
    });
  } catch (error) {
    console.error('Error al obtener marcaciones para fiscalización:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener marcaciones' 
    });
  }
};

// GET /api/fiscalizacion/trabajador/:rut
exports.historialTrabajador = async (req, res) => {
  try {
    const { rut } = req.params;
    const { desde, hasta } = req.query;

    if (!rut) {
      return res.status(400).json({ 
        success: false, 
        message: 'RUT es requerido' 
      });
    }

    const marcaciones = await Marcacion.historialPorRut(rut, desde, hasta);

    res.json({
      success: true,
      data: marcaciones
    });
  } catch (error) {
    console.error('Error al obtener historial de trabajador:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener historial' 
    });
  }
};
