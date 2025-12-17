const supabase = require('../config/database');

class Usuario {
  // Crear usuario
  static async crear(datos) {
    const { data, error } = await supabase
      .from('usuarios')
      .insert([datos])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Buscar por RUT
  static async buscarPorRut(rut) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rut', rut)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Buscar por email
  static async buscarPorEmail(email) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Buscar por ID
  static async buscarPorId(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Actualizar usuario
  static async actualizar(id, datos) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(datos)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Listar trabajadores por empleador
  static async listarPorEmpleador(empleadorId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, rut, nombres, apellido_paterno, apellido_materno, email, telefono, rol, regimen_especial, activo')
      .eq('empleador_id', empleadorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Desactivar usuario
  static async desactivar(id) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Usuario;
