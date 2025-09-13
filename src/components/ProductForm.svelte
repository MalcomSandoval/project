<script>
  import { createEventDispatcher } from 'svelte';
  import { productos } from '../services/supabase.js';

  export let producto = null; // si viene algo, es edición
  const dispatch = createEventDispatcher();

  let nombre = producto?.nombre || '';
  let precio = producto?.precio || '';
  let stock = producto?.stock || '';
  let categoria = producto?.categoria || '';

  const guardarProducto = async () => {
    if (producto) {
      // Editar producto existente
      const { error } = await productos.update(producto.id, {
        nombre,
        precio,
        stock,
        categoria
      });
      if (!error) {
        dispatch('saved');
      } else {
        console.error(error);
      }
    } else {
      // Crear nuevo producto
      const { error } = await productos.create({
        nombre,
        precio,
        stock,
        categoria,
        activo: true
      });
      if (!error) {
        dispatch('saved');
      } else {
        console.error(error);
      }
    }
  };
</script>

<div class="bg-white p-6 rounded-lg shadow-md">
  <h2 class="text-lg font-semibold text-bavarian-blue mb-4">
    {producto ? 'Editar Producto' : 'Nuevo Producto'}
  </h2>

  <form on:submit|preventDefault={guardarProducto} class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Nombre</label>
      <input
        type="text"
        bind:value={nombre}
        class="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Precio</label>
      <input
        type="number"
        bind:value={precio}
        class="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Stock</label>
      <input
        type="number"
        bind:value={stock}
        class="w-full border rounded px-3 py-2"
        required
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700">Categoría</label>
      <input
        type="text"
        bind:value={categoria}
        class="w-full border rounded px-3 py-2"
      />
    </div>

    <button
      type="submit"
      class="bg-bavarian-blue hover:bg-bavarian-darkBlue text-white px-4 py-2 rounded"
    >
      {producto ? 'Actualizar' : 'Guardar'}
    </button>
  </form>
</div>
