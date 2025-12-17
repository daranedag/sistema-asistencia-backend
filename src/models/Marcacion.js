const supabase = require('../config/database');

class Marcacion {
  // Crear marcación
  static async crear(datos) {
    const { data, error } = await supabase
      .from('marcaciones')
      .insert([datos])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Buscar por hash
  static async buscarPorHash(hash) {
    const { data, error } = await supabase
      .from('marcaciones')
      .select(`
        *,
        usuario:usuarios(rut, nombres, apellido_paterno, apellido_materno, email),
        empleador:empleadores(rut, razon_social)
      `)
      .eq('hash', hash)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Última marcación de usuario
  static async ultimaPorUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('marcaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Marcaciones de usuario
  static async listarPorUsuario(usuarioId, desde, hasta) {
    let query = supabase
      .from('marcaciones')
      .select('*')
      .eq('usuario_id', usuarioId);

    if (desde) {
      query = query.gte('timestamp', desde);
    }
    if (hasta) {
      query = query.lte('timestamp', hasta);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Marcaciones de empleador
  static async listarPorEmpleador(empleadorId, desde, hasta) {
    let query = supabase
      .from('marcaciones')
      .select(`
        *,
        usuario:usuarios(rut, nombres, apellido_paterno, apellido_materno, email)
      `)
      .eq('empleador_id', empleadorId);

    if (desde) {
      query = query.gte('timestamp', desde);
    }
    if (hasta) {
      query = query.lte('timestamp', hasta);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Marcaciones para fiscalización
  static async listarParaFiscalizacion(filtros) {
    let query = supabase
      .from('marcaciones')
      .select(`
        *,
        usuario:usuarios(rut, nombres, apellido_paterno, apellido_materno, email),
        empleador:empleadores(rut, razon_social)
      `);

    if (filtros.empleador_id) {
      query = query.eq('empleador_id', filtros.empleador_id);
    }
    if (filtros.desde) {
      query = query.gte('timestamp', filtros.desde);
    }
    if (filtros.hasta) {
      query = query.lte('timestamp', filtros.hasta);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Historial trabajador por RUT
  static async historialPorRut(rut, desde, hasta) {
    let query = supabase
      .from('marcaciones')
      .select(`
        *,
        usuario:usuarios!inner(rut, nombres, apellido_paterno, apellido_materno, email),
        empleador:empleadores(rut, razon_social)
      `)
      .eq('usuarios.rut', rut);

    if (desde) {
      query = query.gte('timestamp', desde);
    }
    if (hasta) {
      query = query.lte('timestamp', hasta);
    }

    const { data, error } = await query.order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

module.exports = Marcacion;
