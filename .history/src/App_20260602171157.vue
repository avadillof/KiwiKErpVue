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
  import { useConnectionMonitor } from '.';
  const { isOnline } = useConnectionMonitor();

</script>


<style>
.connection-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* Asegura que esté por encima de todo */
}

.connection-card {
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  text-align: center;
}
</style>