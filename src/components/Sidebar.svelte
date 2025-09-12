<script>
  export let currentPage = '';
  
  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/dashboard' },
    { icon: '🛒', label: 'Ventas', href: '/ventas' },
    { icon: '📦', label: 'Inventario', href: '/inventario' },
    { icon: '📈', label: 'Reportes', href: '/reportes' }
  ];
</script>

<aside class="bg-bavarian-blue w-64 min-h-screen p-4">
  <div class="mb-8">
    <h1 class="text-white text-xl font-bold flex items-center gap-2">
      🧊 Punto Frío Beto
    </h1>
  </div>
  
  <nav>
    <ul class="space-y-2">
      {#each menuItems as item}
        <li>
          <a 
            href={item.href} 
            class="flex items-center gap-3 text-white hover:bg-bavarian-lightBlue p-3 rounded-lg transition-colors"
            class:bg-bavarian-lightBlue={currentPage === item.href}
          >
            <span class="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>

<style>
  aside {
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }
</style>