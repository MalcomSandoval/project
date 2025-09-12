<script>
  import { productos, ventas, auth } from '../services/supabase.js';
  import { onMount } from 'svelte';
  
  let productosDisponibles = [];
  let carrito = [];
  let metodoPago = 'efectivo';
  let loading = false;
  let error = '';
  let productoSeleccionado = '';
  let cantidad = 1;
  
  onMount(async () => {
    const result = await productos.getAll();
    if (result.data) {
      productosDisponibles = result.data;
    }
  });
  
  function agregarAlCarrito() {
    if (!productoSeleccionado || cantidad <= 0) return;
    
    const producto = productosDisponibles.find(p => p.id === productoSeleccionado);
    if (!producto) return;
    
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio_unitario;
    } else {
      carrito = [...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio,
        cantidad: cantidad,
        subtotal: cantidad * producto.precio
      }];
    }
    
    productoSeleccionado = '';
    cantidad = 1;
    carrito = carrito; // Reactivity
  }
  
  function removerDelCarrito(index) {
    carrito = carrito.filter((_, i) => i !== index);
  }
  
  function calcularTotal() {
    return carrito.reduce((sum, item) => sum + item.subtotal, 0);
  }
  
  async function procesarVenta() {
    if (carrito.length === 0) {
      error = 'Agrega productos al carrito';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const user = await auth.getUser();
      if (!user) {
        error = 'Usuario no autenticado';
        return;
      }
      
      const nuevaVenta = {
        usuario_id: user.id,
        total: calcularTotal(),
        metodo_pago: metodoPago
      };
      
      const detalles = carrito.map(item => ({
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }));
      
      const result = await ventas.create(nuevaVenta, detalles);
      
      if (result.error) {
        error = result.error.message;
      } else {
        // Limpiar formulario
        carrito = [];
        metodoPago = 'efectivo';
        alert('Venta procesada exitosamente');
      }
    } catch (err) {
      error = 'Error al procesar la venta';
    }
    
    loading = false;
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h3 class="text-lg font-semibold text-bavarian-blue mb-4">Nueva Venta</h3>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}
  
  <!-- Agregar productos -->
  <div class="mb-6">
    <h4 class="font-medium mb-2">Agregar Producto</h4>
    <div class="flex gap-2">
      <select
        bind:value={productoSeleccionado}
        class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
      >
        <option value="">Seleccionar producto...</option>
        {#each productosDisponibles as producto}
          <option value={producto.id}>{producto.nombre} - ${producto.precio}</option>
        {/each}
      </select>
      
      <input
        type="number"
        bind:value={cantidad}
        min="1"
        class="w-20 rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
        placeholder="Cant."
      />
      
      <button
        type="button"
        on:click={agregarAlCarrito}
        class="bg-bavarian-gold hover:bg-yellow-500 text-white px-4 py-2 rounded-lg"
      >
        Agregar
      </button>
    </div>
  </div>
  
  <!-- Carrito -->
  {#if carrito.length > 0}
    <div class="mb-6">
      <h4 class="font-medium mb-2">Carrito de Compra</h4>
      <div class="border rounded-lg overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">Producto</th>
              <th class="px-4 py-2 text-left">Precio</th>
              <th class="px-4 py-2 text-left">Cantidad</th>
              <th class="px-4 py-2 text-left">Subtotal</th>
              <th class="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {#each carrito as item, index}
              <tr class="border-t">
                <td class="px-4 py-2">{item.nombre}</td>
                <td class="px-4 py-2">${item.precio_unitario}</td>
                <td class="px-4 py-2">{item.cantidad}</td>
                <td class="px-4 py-2">${item.subtotal.toFixed(2)}</td>
                <td class="px-4 py-2">
                  <button
                    on:click={() => removerDelCarrito(index)}
                    class="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot class="bg-gray-50">
            <tr>
              <td colspan="3" class="px-4 py-2 font-semibold text-right">Total:</td>
              <td class="px-4 py-2 font-bold text-bavarian-blue">${calcularTotal().toFixed(2)}</td>
              <td class="px-4 py-2"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  {/if}
  
  <!-- Método de pago y finalizar -->
  <div class="flex gap-4 items-end">
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700">Método de Pago</label>
      <select
        bind:value={metodoPago}
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
      >
        <option value="efectivo">Efectivo</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>
    </div>
    
    <button
      on:click={procesarVenta}
      disabled={loading || carrito.length === 0}
      class="bg-bavarian-blue hover:bg-bavarian-darkBlue text-white px-6 py-2 rounded-lg disabled:opacity-50"
    >
      {loading ? 'Procesando...' : 'Finalizar Venta'}
    </button>
  </div>
</div>