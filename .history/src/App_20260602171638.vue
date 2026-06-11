<template>
  
  
  <div v-if="!isOnline" class="connection-overlay">
    <div class="connection-card">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #B1D70E;"></i>
      <h2>Esperando conexión...</h2>
      <p>Intentando reconectar con el servidor.</p>
    </div>
  </div>
  
  <Toast /> <router-view />

</template>

<script setup>
  import Toast from 'primevue/toast';
  import { useConnectionMonitor } from './services/composables/useConnectionMonitor.ts';
  const { isOnline } = useConnectionMonitor();

</script>


<style>
.connection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* Fondo gris oscuro semitransparente con efecto de desenfoque */
  background: rgba(31, 41, 55, 0.85); 
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  
  /* Animación suave al aparecer */
  animation: fadeIn 0.3s ease-out;
}

.connection-card {
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  max-width: 320px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.connection-card h2 {
  margin: 1rem 0 0.5rem;
  color: #1f2937;
  font-size: 1.25rem;
  font-weight: 700;
}

.connection-card p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

/* Animación de entrada */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>