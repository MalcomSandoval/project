<script>
  import { productos } from '../services/supabase.js';
  
  export let producto = null;
  export let onSuccess = () => {};
  export let onCancel = () => {};
  
  let formData = {
    nombre: producto?.nombre || '',
    descripcion: producto?.descripcion || '',
    precio: producto?.precio || '',
    stock: producto?.stock || '',
    categoria: producto?.categoria || 'General',
    codigo_barras: producto?.codigo_barras || ''
  };
  
  let loading = false;
  let error = '';
  
  async function handleSubmit() {
    if (!formData.nombre || !formData.precio) {
      error = 'Nombre y precio son requeridos';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      let result;
      if (producto) {
        result = await productos.update(producto.id, formData);
      } else {
        result = await productos.create(formData);
      }
      
      if (result.error) {
        error = result.error.message;
      } else {
        onSuccess();
      }
    } catch (err) {
      error = 'Error al guardar el producto';
    }
    
    loading = false;
  }
</script>

<div class="bg-white rounded-lg shadow-md p-6">
  <h3 class="text-lg font-semibold text-bavarian-blue mb-4">
    {producto ? 'Editar' : 'Nuevo'} Producto
  </h3>
  
  {#if error}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      {error}
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nombre *</label>
        <input
          type="text"
          bind:value={formData.nombre}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Precio *</label>
        <input
          type="number"
          step="0.01"
          bind:value={formData.precio}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Stock</label>
        <input
          type="number"
          bind:value={formData.stock}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Categoría</label>
        <select
          bind:value={formData.categoria}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
        >
          <option value="General">General</option>
          <option value="Bebidas">Bebidas</option>
          <option value="Snacks">Snacks</option>
          <option value="Congelados">Congelados</option>
          <option value="Lácteos">Lácteos</option>
        </select>
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Código de Barras</label>
        <input
          type="text"
          bind:value={formData.codigo_barras}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
        />
      </div>
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700">Descripción</label>
      <textarea
        bind:value={formData.descripcion}
        rows="3"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
      ></textarea>
    </div>
    
    <div class="flex gap-3">
      <button
        type="submit"
        disabled={loading}
        class="bg-bavarian-blue hover:bg-bavarian-darkBlue text-white px-4 py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
      
      <button
        type="button"
        on:click={onCancel}
        class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
      >
        Cancelar
      </button>
    </div>
  </form>
</div>