<script>
  export let title = '';
  export let value = '';
  export let icon = '';
  export let color = 'bavarian-blue';
  export let loading = false;
</script>

<div class="bg-white rounded-xl shadow-lg p-6 border-l-4 transform transition-all duration-200 hover:scale-105 hover:shadow-xl" 
     class:border-bavarian-blue={color === 'bavarian-blue'} 
     class:border-bavarian-gold={color === 'bavarian-gold'} 
     class:border-green-500={color === 'green'}
     class:border-red-500={color === 'red'}>
  <div class="flex items-center justify-between">
    <div class="flex-1">
      <h3 class="text-gray-500 text-sm font-medium uppercase tracking-wide">{title}</h3>
      {#if loading}
        <div class="mt-2 flex items-center">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-bavarian-blue mr-2"></div>
          <span class="text-gray-400">Cargando...</span>
        </div>
      {:else}
        <p class="text-3xl font-bold text-gray-900 mt-2">{value}</p>
      {/if}
    </div>
    <div class="text-4xl opacity-80 ml-4">
      {icon}
    </div>
  </div>
</div>