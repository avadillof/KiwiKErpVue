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
  
  /* El valor 0.6 define la opacidad:
     1.0 es totalmente opaco (negro sólido).
     0.0 es totalmente invisible.
     0.6 es un punto ideal para que se vea el fondo pero bloquee la interacción.
  */
  background: rgba(31, 41, 55, 0.6); 
  
  /* Mantenemos el desenfoque para dar un toque premium */
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(4px);
  
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  animation: fadeIn 0.3s ease-out;
}

.connection-card {
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  text-align: center;
  max-width: 320px;
  width: 90%;
  
  /* Borde estilo KiwiK: 
     - 4px de borde verde sólido
     - 'box-shadow' interna para crear esa "franja blanca" entre el borde y el contenido
  */
  border: 4px solid #B1D70E;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.3), /* Sombra externa */
    inset 0 0 0 4px #ffffff;            /* Franja blanca interna */

}
</style>