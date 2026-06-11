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
import { useConnectionMonitor } from '../../services/composables/useConnectionMonitor
const { isOnline } = useConnectionMonitor();
</script>

<style scoped>
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

.connection-logo {
  width: 120px;       /* Ajusta el tamaño según tu logo */
  height: auto;
  margin-bottom: 1.5rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.connection-card i {
  font-size: 2.5rem;
  color: #B1D70E;
  margin-bottom: 1rem;
  display: block;
}

</style>