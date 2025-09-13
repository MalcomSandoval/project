<script>
  import { createEventDispatcher } from 'svelte';
  import { productos } from '../services/supabase.js';

  export let producto = null; // recibe el producto a editar si existe
  const dispatch = createEventDispatcher();

  let nombre = producto?.nombre || '';
  let precio = producto?.precio || '';
  let stock = producto?.stock || '';
  let categoria = producto?.categoria || '';

  const guardarProducto = async () => {
    if (producto) {
      // Editar
      const { error } = await productos.update(producto.id, {
        nombre, precio, stock, categoria
      });
      if (!error) {
        dispatch('saved');
      } else {
        console.error(error);
      }
    } else {
      // Crear
      const { error } = await productos.create({
        nombre, precio, stock, categoria, activo: true
      });
      if (!error) {
        dispatch('saved');
      } else {
        console.error(error);
      }
    }
  };
</script>

<div class="bg-gray-50 p-4 rounded-lg shadow-md">
  <h2 class="text-lg font-semibold text-bavarian-blue mb-3">
    {producto ? 'Editar Producto' : 'Nuevo Producto'}
  </h2>
  <form on:submit|preventDefault={guardarProducto} class="space-y-3">
    <input
      type="text"
      placeholder="Nombre"
      bind:value={nombre}
      class="w-full border px-3 py-2 rounded"
      required
    />
    <input
      type="number"
      placeholder="Precio"
      bind:value={precio}
      class="w-full border px-3 py-2 rounded"
      required
    />
    <input
      type="number"
      placeholder="Stock"
      bind:value={stock}
      class="w-full border px-3 py-2 rounded"
      required
    />
    <input
      type="text"
      placeholder="Categoría"
      bind:value={categoria}
      class="w-full border px-3 py-2 rounded"
    />

    <button type="submit" class="bg-bavarian-blue hover:bg-bavarian-darkBlue text-white px-4 py-2 rounded">
      {producto ? 'Actualizar' : 'Guardar'}
    </button>
  </form>
</div>
