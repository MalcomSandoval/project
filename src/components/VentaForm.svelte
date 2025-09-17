<script>
  import { productos, ventas, auth } from '../services/supabase.js';
  import { onMount, createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let productosDisponibles = [];
  let carrito = [];
  let metodoPago = 'efectivo';
  let loading = false;
  let error = '';
  let productoSeleccionado = '';
  let cantidad = 1;
  let busquedaProducto = '';
  let productosFiltrados = [];
  
  onMount(async () => {
    await cargarProductos();
  });
  
  async function cargarProductos() {
    const result = await productos.getAll();
    if (result.data) {
      productosDisponibles = result.data.filter(p => p.stock > 0);
      productosFiltrados = productosDisponibles;
    }
  }
  
  // Filtrar productos por búsqueda
  $: {
    if (busquedaProducto.trim()) {
      productosFiltrados = productosDisponibles.filter(p => 
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
        p.codigo_barras?.includes(busquedaProducto)
      );
    } else {
      productosFiltrados = productosDisponibles;
    }
  }
  
  function seleccionarProducto(producto) {
    productoSeleccionado = producto.id;
    busquedaProducto = producto.nombre;
    productosFiltrados = [];
  }
  
  function agregarAlCarrito() {
    if (!productoSeleccionado || cantidad <= 0) {
      error = 'Selecciona un producto y cantidad válida';
      return;
    }
    
    const producto = productosDisponibles.find(p => p.id === productoSeleccionado);
    if (!producto) {
      error = 'Producto no encontrado';
      return;
    }
    
    if (cantidad > producto.stock) {
      error = `Stock insuficiente. Disponible: ${producto.stock}`;
      return;
    }
    
    const itemExistente = carrito.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        error = `Stock insuficiente. Disponible: ${producto.stock}`;
        return;
      }
      itemExistente.cantidad = nuevaCantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio_unitario;
    } else {
      carrito = [...carrito, {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: parseFloat(producto.precio),
        cantidad: cantidad,
        subtotal: cantidad * parseFloat(producto.precio)
      }];
    }
    
    // Limpiar selección
    productoSeleccionado = '';
    cantidad = 1;
    busquedaProducto = '';
    error = '';
    carrito = carrito; // Trigger reactivity
  }
  
  function removerDelCarrito(index) {
    carrito = carrito.filter((_, i) => i !== index);
  }
  
  function actualizarCantidad(index, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      removerDelCarrito(index);
      return;
    }
    
    const item = carrito[index];
    const producto = productosDisponibles.find(p => p.id === item.producto_id);
    
    if (nuevaCantidad > producto.stock) {
      error = `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`;
      return;
    }
    
    carrito[index].cantidad = nuevaCantidad;
    carrito[index].subtotal = nuevaCantidad * carrito[index].precio_unitario;
    carrito = carrito; // Trigger reactivity
    error = '';
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
        loading = false;
        return;
      }
      
      const total = calcularTotal();
      const nuevaVenta = {
        usuario_id: user.id,
        total: total,
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
        // Mostrar mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300';
        successMessage.innerHTML = `
          <div class="flex items-center">
            <span class="text-2xl mr-2">✅</span>
            <div>
              <div class="font-bold">¡Venta procesada!</div>
              <div class="text-sm">Total: $${total.toFixed(2)}</div>
            </div>
          </div>
        `;
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
          if (document.body.contains(successMessage)) {
            document.body.removeChild(successMessage);
          }
        }, 4000);
        
        // Limpiar formulario
        carrito = [];
        metodoPago = 'efectivo';
        busquedaProducto = '';
        productoSeleccionado = '';
        cantidad = 1;
        
        // Recargar productos para actualizar stock
        await cargarProductos();
        
        // Notificar al componente padre
        dispatch('ventaCreada');
      }
    } catch (err) {
      error = 'Error al procesar la venta';
      console.error('Error procesando venta:', err);
    }
    
    loading = false;
  }
</script>

<div class="bg-white rounded-xl shadow-lg p-6">
  <h3 class="text-2xl font-bold text-bavarian-blue mb-6 flex items-center">
    <span class="text-3xl mr-2">🛒</span>
    Nueva Venta
  </h3>
  
  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
      <div class="flex items-center">
        <span class="text-red-500 mr-2">⚠️</span>
        {error}
      </div>
    </div>
  {/if}
  
  <!-- Búsqueda y selección de productos -->
  <div class="mb-8">
    <h4 class="font-semibold text-gray-800 mb-4">Agregar Producto</h4>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2 relative">
        <input
          type="text"
          bind:value={busquedaProducto}
          placeholder="Buscar producto por nombre o código..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
        />
        
        {#if productosFiltrados.length > 0 && busquedaProducto.trim()}
          <div class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
            {#each productosFiltrados.slice(0, 10) as producto}
              <button
                type="button"
                on:click={() => seleccionarProducto(producto)}
                class="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div class="font-medium">{producto.nombre}</div>
                <div class="text-sm text-gray-600">
                  ${producto.precio} - Stock: {producto.stock}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
      
      <div>
        <input
          type="number"
          bind:value={cantidad}
          min="1"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
          placeholder="Cantidad"
        />
      </div>
      
      <div>
        <button
          type="button"
          on:click={agregarAlCarrito}
          disabled={!productoSeleccionado}
          class="w-full bg-bavarian-gold hover:bg-yellow-500 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Agregar
        </button>
      </div>
    </div>
  </div>
  
  <!-- Carrito de compras -->
  {#if carrito.length > 0}
    <div class="mb-8">
      <h4 class="font-semibold text-gray-800 mb-4">Carrito de Compra</h4>
      <div class="bg-gray-50 rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-bavarian-blue text-white">
              <tr>
                <th class="px-4 py-3 text-left">Producto</th>
                <th class="px-4 py-3 text-left">Precio</th>
                <th class="px-4 py-3 text-left">Cantidad</th>
                <th class="px-4 py-3 text-left">Subtotal</th>
                <th class="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white">
              {#each carrito as item, index}
                <tr class="border-b border-gray-200">
                  <td class="px-4 py-3 font-medium">{item.nombre}</td>
                  <td class="px-4 py-3">${item.precio_unitario.toFixed(2)}</td>
                  <td class="px-4 py-3">
                    <input
                      type="number"
                      min="1"
                      value={item.cantidad}
                      on:change={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                      class="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </td>
                  <td class="px-4 py-3 font-bold text-bavarian-blue">${item.subtotal.toFixed(2)}</td>
                  <td class="px-4 py-3 text-center">
                    <button
                      on:click={() => removerDelCarrito(index)}
                      class="text-red-500 hover:text-red-700 font-bold text-lg"
                      title="Eliminar producto"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
            <tfoot class="bg-bavarian-blue text-white">
              <tr>
                <td colspan="3" class="px-4 py-4 font-bold text-right text-lg">Total:</td>
                <td class="px-4 py-4 font-bold text-xl">${calcularTotal().toFixed(2)}</td>
                <td class="px-4 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Método de pago y finalizar venta -->
  <div class="flex flex-col md:flex-row gap-6 items-end">
    <div class="flex-1">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Método de Pago
      </label>
      <select
        bind:value={metodoPago}
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
      >
        <option value="efectivo">💵 Efectivo</option>
        <option value="tarjeta">💳 Tarjeta</option>
        <option value="transferencia">🏦 Transferencia</option>
      </select>
    </div>
    
    <div class="flex gap-4">
      <button
        on:click={procesarVenta}
        disabled={loading || carrito.length === 0}
        class="bg-bavarian-blue hover:bg-bavarian-darkBlue text-white px-8 py-3 rounded-lg font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
      >
        {#if loading}
          <div class="flex items-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        {:else}
          Finalizar Venta ${calcularTotal().toFixed(2)}
        {/if}
      </button>
    </div>
  </div>
</div>