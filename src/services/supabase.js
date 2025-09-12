import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tmivysbysrtukcnuapax.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtaXZ5c2J5c3J0dWtjbnVhcGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTEwNzksImV4cCI6MjA3MzI2NzA3OX0.wKwwm9mNREXqq3FP-CnUbarV1PX54Fv7Li0LXwXEn30';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funciones de autenticación
export const auth = {
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};

// Funciones para productos
export const productos = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .order('nombre');
    return { data, error };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  create: async (producto) => {
    const { data, error } = await supabase
      .from('productos')
      .insert([producto])
      .select();
    return { data, error };
  },

  update: async (id, producto) => {
    const { data, error } = await supabase
      .from('productos')
      .update(producto)
      .eq('id', id)
      .select();
    return { data, error };
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('productos')
      .update({ activo: false })
      .eq('id', id);
    return { data, error };
  }
};

// Funciones para ventas
export const ventas = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        *,
        detalles_venta (
          *,
          productos (nombre, precio)
        )
      `)
      .order('fecha_venta', { ascending: false });
    return { data, error };
  },

  create: async (venta, detalles) => {
    // Crear la venta
    const { data: ventaData, error: ventaError } = await supabase
      .from('ventas')
      .insert([venta])
      .select()
      .single();

    if (ventaError) return { data: null, error: ventaError };

    // Crear los detalles
    const detallesConVentaId = detalles.map(detalle => ({
      ...detalle,
      venta_id: ventaData.id
    }));

    const { data: detallesData, error: detallesError } = await supabase
      .from('detalles_venta')
      .insert(detallesConVentaId);

    if (detallesError) return { data: null, error: detallesError };

    // Actualizar stock de productos
    for (const detalle of detalles) {
      await supabase.rpc('decrementar_stock', {
        producto_id: detalle.producto_id,
        cantidad: detalle.cantidad
      });
    }

    return { data: ventaData, error: null };
  },

  getReporte: async () => {
    const { data, error } = await supabase
      .from('ventas')
      .select('total, fecha_venta, metodo_pago');
    return { data, error };
  }
};
