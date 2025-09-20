import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkqkdspbkcmzoytqjpzv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcWtkc3Bia2Ntem95dHFqcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzQzNDMsImV4cCI6MjA3MzMxMDM0M30.x06I44pe4t082QowK5rW0Fv9L3_fT4djlQbqailOoS0';


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
      .insert([{
        ...producto,
        precio: parseFloat(producto.precio),
        stock: parseInt(producto.stock) || 0
      }])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, producto) => {
    const { data, error } = await supabase
      .from('productos')
      .update({
        ...producto,
        precio: parseFloat(producto.precio),
        stock: parseInt(producto.stock) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  getStockBajo: async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('activo', true)
      .lte('stock', 5)
      .order('stock');
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
    // ⬇️ AQUI agregas la nueva función
  delete: async (id) => {
    try {
      // 1. Borrar detalles de la venta
      const { error: detallesError } = await supabase
        .from('detalles_venta')
        .delete()
        .eq('venta_id', id);

      if (detallesError) throw detallesError;

      // 2. Borrar la venta
      const { error: ventaError } = await supabase
        .from('ventas')
        .delete()
        .eq('id', id);

      if (ventaError) throw ventaError;

      return { error: null };
    } catch (error) {
      return { error };
    }
  },
  
  getVentasHoy: async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', hoy + 'T00:00:00')
      .lte('fecha_venta', hoy + 'T23:59:59');
    return { data, error };
  },

  create: async (venta, detalles) => {
    try {
      // Crear la venta
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          ...venta,
          total: parseFloat(venta.total),
          fecha_venta: new Date().toISOString()
        }])
        .select()
        .single();

      if (ventaError) throw ventaError;

      // Crear los detalles
      const detallesConVentaId = detalles.map(detalle => ({
        venta_id: ventaData.id,
        producto_id: detalle.producto_id,
        cantidad: parseInt(detalle.cantidad),
        precio_unitario: parseFloat(detalle.precio_unitario),
        subtotal: parseFloat(detalle.subtotal)
      }));

      const { error: detallesError } = await supabase
        .from('detalles_venta')
        .insert(detallesConVentaId);

      if (detallesError) throw detallesError;

      // Actualizar stock de productos
      for (const detalle of detalles) {
        const { error: stockError } = await supabase.rpc('decrementar_stock', {
          producto_id: detalle.producto_id,
          cantidad: parseInt(detalle.cantidad)
        });
        if (stockError) {
          console.error('Error actualizando stock:', stockError);
        }
      }

      return { data: ventaData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  },

  getReporte: async () => {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        total, 
        fecha_venta, 
        metodo_pago,
        detalles_venta (
          cantidad,
          productos (nombre)
        )
      `);
    return { data, error };
  },

  getVentasPorPeriodo: async (fechaInicio, fechaFin) => {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', fechaInicio)
      .lte('fecha_venta', fechaFin)
      .order('fecha_venta', { ascending: false });
    return { data, error };
  }
};

// Funciones para estadísticas
export const estadisticas = {
  getResumenGeneral: async () => {
    try {
      const [ventasResult, productosResult, stockBajoResult, ventasHoyResult] = await Promise.all([
        ventas.getAll(),
        productos.getAll(),
        productos.getStockBajo(),
        ventas.getVentasHoy()
      ]);

      const totalVentas = ventasResult.data?.length || 0;
      const totalProductos = productosResult.data?.length || 0;
      const stockBajo = stockBajoResult.data?.length || 0;
      const ventasHoy = ventasHoyResult.data?.reduce((sum, v) => sum + parseFloat(v.total), 0) || 0;

      return {
        data: {
          totalVentas,
          totalProductos,
          stockBajo,
          ventasHoy
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};