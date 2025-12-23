<script>
  import { auth } from '../services/supabase.js';
  import { onMount } from 'svelte';
  
  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let isLogin = true;
  let mounted = false;
  
  onMount(() => {
    mounted = true;
    // Verificar si ya hay una sesión activa
    checkExistingSession();
  });
  
  async function checkExistingSession() {
    const session = await auth.getSession();
    if (session) {
      window.location.href = '/dashboard';
    }
  }
  
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
        // Esperar un momento para que la sesión se establezca
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (err) {
      error = 'Error de conexión';
      console.error('Error en autenticación:', err);
    }
    
    loading = false;
  }
  
  function toggleMode() {
    isLogin = !isLogin;
    error = '';
    email = '';
    password = '';
  }
</script>

{#if mounted}
<div class="min-h-screen bg-gradient-to-br from-bavarian-blue to-bavarian-lightBlue flex items-center justify-center p-4">
  <div class="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
    <div class="text-center mb-8">
      <div class="text-4xl mb-4">🧊</div>
      <h1 class="text-3xl font-bold text-bavarian-blue">
        Punto Frío Beto
      </h1>
      <p class="text-gray-600 mt-2">
        {isLogin ? 'Inicia sesión en tu cuenta' : 'Crear nueva cuenta'}
      </p>
    </div>
    
    {#if error}
      <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-pulse">
        <div class="flex items-center">
          <span class="text-red-500 mr-2">⚠️</span>
          {error}
        </div>
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            bind:value={email}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent transition-all duration-200"
            placeholder="tu@email.com"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Contraseña
          </label>
          <input
            type="password"
            bind:value={password}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bavarian-blue focus:border-transparent transition-all duration-200"
            placeholder="••••••••"
            required
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={loading}
        class="w-full bg-bavarian-blue hover:bg-bavarian-darkBlue text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {#if loading}
          <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        {:else}
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        {/if}
      </button>
    </form>
    
    <div class="mt-6 text-center">
      <button
        type="button"
        on:click={toggleMode}
        class="text-bavarian-blue hover:text-bavarian-darkBlue font-medium transition-colors duration-200"
      >
        {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
    
    <div class="mt-8 text-center text-xs text-gray-500">
      Correo: david5557h@gmail.com <br>
      contraseña: 1234567
    </div>
  </div>
</div>
{/if}
