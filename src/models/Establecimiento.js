const supabase = require('../config/database');

class Establecimiento {
  // Crear establecimiento
  static async crear(datos) {
    const { data, error } = await supabase
      .from('establecimientos')
      .insert([datos])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Listar por empleador
  static async listarPorEmpleador(empleadorId) {
    const { data, error } = await supabase
      .from('establecimientos')
      .select('*')
      .eq('empleador_id', empleadorId)
      .eq('activo', true)
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Buscar por ID
  static async buscarPorId(id) {
    const { data, error } = await supabase
      .from('establecimientos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Actualizar establecimiento
  static async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('establecimientos')
      .update(datos)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Establecimiento;
