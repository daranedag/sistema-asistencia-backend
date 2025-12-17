const supabase = require('../config/database');

class Empleador {
  // Crear empleador
  static async crear(datos) {
    const { data, error } = await supabase
      .from('empleadores')
      .insert([datos])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Buscar por ID
  static async buscarPorId(id) {
    const { data, error } = await supabase
      .from('empleadores')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Buscar por RUT
  static async buscarPorRut(rut) {
    const { data, error } = await supabase
      .from('empleadores')
      .select('*')
      .eq('rut', rut)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Actualizar empleador
  static async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('empleadores')
      .update(datos)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Empleador;
