<script>
  import { productos } from '../services/supabase.js';
  import { createEventDispatcher } from 'svelte';
  
  export let producto = null;
export let visible = true;
  
  const dispatch = createEventDispatcher();
  
  let formData = {
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: 'General',
    codigo_barras: '',
    // 🟢 Inicializar precio_compra
    precio_compra: '' 
  };
let loading = false;
  let error = '';
  let success = '';
// Resetear formulario cuando cambia el producto o la visibilidad
  $: if (visible && producto) {
    formData = {
      nombre: producto.nombre ||
'',
      descripcion: producto.descripcion || '',
      precio: producto.precio?.toString() ||
'',
      stock: producto.stock?.toString() || '',
      categoria: producto.categoria ||
'General',
      codigo_barras: producto.codigo_barras || '',
      // 🟢 Asignar valor si se está editando
      precio_compra: producto.precio_compra?.toString() || '' 
    };
    error = '';
    success = '';
} else if (visible && !producto) {
    resetForm();
    error = '';
    success = '';
}
// ...
  function resetForm() {
    formData = {
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: 'General',
      codigo_barras: '',
      // 🟢 Resetear el valor
      precio_compra: ''
    };
}

  async function handleSubmit() {
    if (!formData.nombre.trim() || !formData.precio) {
      error = 'Nombre y precio son requeridos';
      return;
    }
    
    if (parseFloat(formData.precio) <= 0) {
      error = 'El precio debe ser mayor a 0';
      return;
    }
    
    loading = true;
    error = '';
    success = '';
    
    try {
      let result;
      const dataToSend = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        // 🟢 Incluir y parsear precio_compra
        precio_compra: parseFloat(formData.precio_compra) || 0,
        stock: parseInt(formData.stock) ||0
      };
      
      if (producto) {
        result = await productos.update(producto.id, dataToSend);
        success = 'Producto actualizado exitosamente';
      } else {
        result = await productos.create(dataToSend);
        success = 'Producto creado exitosamente';
      }
      
      if (result.error) {
        error = result.error.message;
      } else {
        setTimeout(() => {
          dispatch('success');
          handleCancel();
        }, 1000);
      }
    } catch (err) {
      error = 'Error al guardar el producto';
      console.error('Error:', err);
    }
    
    loading = false;
  }
  
  function handleCancel() {
    resetForm();
    error = '';
    success = '';
    dispatch('cancel');
  }
    if (producto) {
      formData = {
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        precio: producto.precio || '',
        stock: producto.stock || '',
        categoria: producto.categoria || 'General',
        codigo_barras: producto.codigo_barras || ''
      };
    } else {
      resetForm();
    }
    error = '';
    success = '';

  
  function resetForm() {
    formData = {
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoria: 'General',
      codigo_barras: ''
    };
  }
  
  async function handleSubmit() {
    if (!formData.nombre.trim() || !formData.precio) {
      error = 'Nombre y precio son requeridos';
      return;
    }
    
    if (parseFloat(formData.precio) <= 0) {
      error = 'El precio debe ser mayor a 0';
      return;
    }
    
    loading = true;
    error = '';
    success = '';
    
    try {
      let result;
      const dataToSend = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0
      };
      
      if (producto) {
        result = await productos.update(producto.id, dataToSend);
        success = 'Producto actualizado exitosamente';
      } else {
        result = await productos.create(dataToSend);
        success = 'Producto creado exitosamente';
      }
      
      if (result.error) {
        error = result.error.message;
      } else {
        setTimeout(() => {
          dispatch('success');
          handleCancel();
        }, 1000);
      }
    } catch (err) {
      error = 'Error al guardar el producto';
      console.error('Error:', err);
    }
    
    loading = false;
  }
  
  function handleCancel() {
    resetForm();
    error = '';
    success = '';
    dispatch('cancel');
  }
</script>

{#if visible}
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-2xl font-bold text-bavarian-blue">
          {producto ? 'Editar Producto' : 'Nuevo Producto'}
        </h3>
        <button
          on:click={handleCancel}
          class="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
      </div>
      
      {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          <div class="flex items-center">
            <span class="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        </div>
      {/if}
      
      {#if success}
        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          <div class="flex items-center">
            <span class="text-green-500 mr-2">✅</span>
            {success}
          </div>
        </div>
      {/if}
      
      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto *
            </label>
            <input
              type="text"
              bind:value={formData.nombre}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
              placeholder="Ej: Coca Cola 600ml"
              required
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              bind:value={formData.precio}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Precio de Compra *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              bind:value={formData.precio_compra}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Stock Inicial
            </label>
            <input
              type="number"
              min="0"
              bind:value={formData.stock}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
              placeholder="0"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              bind:value={formData.categoria}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
            >
              <option value="General">General</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Snacks">Snacks</option>
              <option value="Congelados">Congelados</option>
              <option value="Lácteos">Lácteos</option>
              <option value="Dulces">Dulces</option>
              <option value="Cigarros">Cigarros</option>
            </select>
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Código de Barras
            </label>
            <input
              type="text"
              bind:value={formData.codigo_barras}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
              placeholder="Opcional"
            />
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            bind:value={formData.descripcion}
            rows="3"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent"
            placeholder="Descripción opcional del producto"
          ></textarea>
        </div>
        
        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            class="flex-1 bg-bavarian-blue hover:bg-bavarian-darkBlue text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {#if loading}
              <div class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </div>
            {:else}
              {producto ? 'Actualizar' : 'Crear'} Producto
            {/if}
          </button>
          
          <button
            type="button"
            on:click={handleCancel}
            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
{/if}