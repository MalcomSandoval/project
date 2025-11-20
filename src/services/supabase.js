import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nkqkdspbkcmzoytqjpzv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rcWtkc3Bia2Ntem95dHFqcHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzQzNDMsImV4cCI6MjA3MzMxMDM0M30.x06I44pe4t082QowK5rW0Fv9L3_fT4djlQbqailOoS0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ------------------ AUTENTICACIÓN ------------------
export const auth = {
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  },
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
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

// ------------------ PRODUCTOS ------------------
export const productos = {
  getAll: async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
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
        // 🟢 Asegurar que el precio de compra sea numérico
        precio_compra: parseFloat(producto.precio_compra) || 0,
        stock: parseInt(producto.stock) || 0,
        activo: true
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
        // 🟢 Asegurar que el precio de compra sea numérico
        precio_compra: parseFloat(producto.precio_compra) || 0,
        stock: parseInt(producto.stock) || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

 // 🔴 Desactivar producto
desactivar: async (id) => {
  const { data, error } = await supabase
    .from('productos')
    .update({ activo: false })
    .eq('id', id);
  return { data, error };
},

// 🟢 Activar producto
activar: async (id) => {
  const { data, error } = await supabase
    .from('productos')
    .update({ activo: true })
    .eq('id', id);
  return { data, error };
},


getInventarioGanancia: async () => {
    const { data: productos, error } = await supabase
      .from('productos')
      .select('precio, precio_compra, stock')
      .eq('activo', true); // Solo productos activos
    
    if (error) {
      console.error('Error al obtener productos para ganancia de stock:', error);
      return { data: 0, error };
    }

    const gananciaTotal = productos.reduce((sum, p) => {
      const precioVenta = parseFloat(p.precio) || 0;
      const precioCompra = parseFloat(p.precio_compra) || 0;
      const stock = parseInt(p.stock) || 0;
      
      // Ganancia por unidad * Stock
      const gananciaUnidad = precioVenta - precioCompra;
      return sum + (gananciaUnidad * stock);
    }, 0);

    return { data: gananciaTotal, error: null };
  },

  getStockBajo: async () => {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .lte('stock', 5)
      .order('stock');
    return { data, error };
  }
};

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
      .eq('activa', true)
      .order('fecha_venta', { ascending: false });

    return { data, error };
  },

  // 🔴 AQUÍ EMPIEZA EL CAMBIO - REEMPLAZA SOLO ESTA FUNCIÓN
  desactivar: async (id) => {
    console.log("==========================================");
    console.log("🔍 INICIANDO DESACTIVACIÓN");
    console.log("ID recibido:", id);
    console.log("Tipo de ID:", typeof id);
    console.log("==========================================");
    
    try {
      // Primero verificamos que la venta existe
      const { data: ventaActual, error: errorConsulta } = await supabase
        .from('ventas')
        .select('*')
        .eq('id', id)
        .single();
      
      console.log("📊 Venta actual:", ventaActual);
      console.log("❓ Error en consulta:", errorConsulta);
      
      if (errorConsulta) {
        console.error("❌ ERROR: No se pudo consultar la venta");
        return { data: null, error: errorConsulta };
      }
      
      // Ahora intentamos actualizar
      console.log("🔄 Intentando actualizar activa a FALSE...");
      
      const { data, error } = await supabase
        .from('ventas')
        .update({ activa: false })
        .eq('id', id)
        .select();
      
      console.log("==========================================");
      console.log("📊 RESULTADO DE LA ACTUALIZACIÓN:");
      console.log("Data devuelta:", data);
      console.log("Error:", error);
      console.log("==========================================");
      
      if (error) {
        console.error("❌ ERROR AL ACTUALIZAR:", error);
        console.error("Código de error:", error.code);
        console.error("Mensaje:", error.message);
        console.error("Detalles:", error.details);
        console.error("Hint:", error.hint);
      } else {
        console.log("✅ ACTUALIZACIÓN EXITOSA");
        console.log("Registros actualizados:", data?.length || 0);
        if (data && data.length > 0) {
          console.log("Estado final de activa:", data[0].activa);
        }
      }
      
      return { data, error };
    } catch (exception) {
      console.error("💥 EXCEPCIÓN CAPTURADA:", exception);
      return { data: null, error: exception };
    }
  },
  getVentasHoy: async () => {
    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', hoy + 'T00:00:00')
      .lte('fecha_venta', hoy + 'T23:59:59')
      .eq('activa', true);     // ← evita mostrar ventas desactivadas

    return { data, error };
  },

  create: async (venta, detalles) => {
    try {
      const { data: ventaData, error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          ...venta,
          total: parseFloat(venta.total),
          activa: true,                    // ← ventas nuevas SIEMPRE activas
          fecha_venta: new Date().toISOString()
        }])
        .select()
        .single();

      if (ventaError) throw ventaError;

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

      for (const detalle of detalles) {
        const { error: stockError } = await supabase.rpc('decrementar_stock', {
          producto_id: detalle.producto_id,
          cantidad: parseInt(detalle.cantidad)
        });
        if (stockError) console.error('Error actualizando stock:', stockError);
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
      `)
      .eq('activa', true);     // ← solo ventas activas en reportes

    return { data, error };
  },

  getVentasPorPeriodo: async (inicio, fin) => {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('fecha_venta', inicio)
      .lte('fecha_venta', fin)
      .eq('activa', true)      // ← igual aquí
      .order('fecha_venta', { ascending: false });

    return { data, error };
  }
};


// ------------------ ESTADÍSTICAS ------------------
// ------------------ ESTADÍSTICAS ------------------
export const estadisticas = {
  getResumenGeneral: async () => {
    try {
      const [
        ventasResult, 
        productosResult, 
        stockBajoResult, 
        ventasHoyResult,
        // 🟢 Incluir el nuevo cálculo
        gananciaStockResult 
      ] = await Promise.all([
        ventas.getAll(),
        productos.getAll(),
        productos.getStockBajo(),
        ventas.getVentasHoy(),
        productos.getInventarioGanancia() // 🟢 Nueva llamada
      ]);

      const totalVentas = ventasResult.data?.length || 0;
      const totalProductos = productosResult.data?.length || 0;
      const stockBajo = stockBajoResult.data?.length || 0;
      const ventasHoy = ventasHoyResult.data?.reduce((sum, v) => sum + parseFloat(v.total), 0) || 0;
      // 🟢 Nuevo valor
      const gananciaStockTotal = gananciaStockResult.data || 0; 

      return {
        data: { 
          totalVentas, 
          totalProductos, 
          stockBajo, 
          ventasHoy,
          gananciaStockTotal // 🟢 Exportar el nuevo valor
        },
        error: null
      };
    } catch (error) {
      return { data: null, error };
    }
  }
};
