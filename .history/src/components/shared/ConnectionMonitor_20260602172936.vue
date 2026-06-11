<template>
  <div v-if="!isOnline" class="connection-overlay">
    <div class="connection-card">
      <img src="../assets/logos/LogTras.png" alt="Logo" class="connection-logo" />
      <i class="pi pi-spin pi-spinner"></i>
      <h2>Esperando conexión...</h2>
      <p>Intentando reconectar con el servidor.</p>
    </div>
  </div>
</template>

<script setup>
import { useConnectionMonitor } from '../services/composables/useConnectionMonitor.ts';
const { isOnline } = useConnectionMonitor();
</script>

<style scoped>
/* Copia aquí todos los estilos .connection-overlay, .connection-card, etc. */
/* Al usar 'scoped', los estilos no afectarán a otros componentes */
</style>