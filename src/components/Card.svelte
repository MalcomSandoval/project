<script>
  export let title = '';
  export let value = '';
  export let icon = '';
  export let color = 'bavarian-blue';
</script>

<div class="bg-white rounded-lg shadow-md p-6 border-l-4" class:border-bavarian-blue={color === 'bavarian-blue'} class:border-bavarian-gold={color === 'bavarian-gold'} class:border-green-500={color === 'green'}>
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-gray-500 text-sm font-medium">{title}</h3>
      <p class="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
    <div class="text-3xl opacity-80">
      {icon}
    </div>
  </div>
</div>