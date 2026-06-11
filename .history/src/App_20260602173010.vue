<template>
  
  
  <div v-if="!isOnline" class="connection-overlay">
    <div class="connection-card">
      <img src="./assets/logos/LogTras.png" alt="Logo" class="connection-logo" />
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


