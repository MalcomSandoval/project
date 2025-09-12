<script>
  import { auth } from '../services/supabase.js';
  import { onMount } from 'svelte';
  
  let user = null;
  
  onMount(async () => {
    user = await auth.getUser();
  });
  
  async function handleLogout() {
    await auth.signOut();
    window.location.href = '/login';
  }
</script>

<nav class="bg-white shadow-md p-4 flex justify-between items-center">
  <div class="flex items-center gap-4">
    <h2 class="text-bavarian-blue font-semibold text-lg">Panel de Control</h2>
  </div>
  
  <div class="flex items-center gap-4">
    <div class="text-right">
      <p class="text-sm text-gray-600">Bienvenido,</p>
      <p class="font-semibold text-bavarian-blue">
        {user?.email || 'Usuario'}
      </p>
    </div>
    <button 
      on:click={handleLogout}
      class="bg-bavarian-gold hover:bg-yellow-500 text-white px-4 py-2 rounded-lg transition-colors"
    >
      Cerrar Sesión
    </button>
  </div>
</nav>