<script>
  import { auth } from '../services/supabase.js';
  
  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let isLogin = true;
  
  async function handleSubmit() {
    if (!email || !password) {
      error = 'Email y contraseña son requeridos';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      let result;
      if (isLogin) {
        result = await auth.signIn(email, password);
      } else {
        result = await auth.signUp(email, password);
      }
      
      if (result.error) {
        error = result.error.message;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      error = 'Error de conexión';
    }
    
    loading = false;
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-bavarian-blue to-bavarian-lightBlue flex items-center justify-center">
  <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-bavarian-blue flex items-center justify-center gap-2">
        🧊 Punto Frío Beto
      </h1>
      <p class="text-gray-600 mt-2">
        {isLogin ? 'Inicia sesión' : 'Crear cuenta'}
      </p>
    </div>
    
    {#if error}
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          bind:value={email}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
          required
        />
      </div>
      
      <div>
        <label class="block text-sm font-medium text-gray-700">Contraseña</label>
        <input
          type="password"
          bind:value={password}
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-bavarian-blue focus:ring-bavarian-blue"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-bavarian-blue hover:bg-bavarian-darkBlue text-white py-2 px-4 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Cargando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
      </button>
    </form>
    
    <div class="mt-4 text-center">
      <button
        on:click={() => isLogin = !isLogin}
        class="text-bavarian-blue hover:underline"
      >
        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  </div>
</div>