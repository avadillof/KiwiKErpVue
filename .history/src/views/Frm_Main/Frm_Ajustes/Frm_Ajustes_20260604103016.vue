<!-- Frm_Ajustes.vue -->
<template>
  <div style="padding: 20px;">
    <h1>Ajustes del Sistema</h1>
    <p>Configuración general y gestión de usuarios.</p>
    <!-- Aquí puedes añadir tus formularios de configuración -->
  </div>

  <div style="margin-bottom: 20px;">
  <Button 
    label="Volver al Panel" 
    icon="pi pi-arrow-left" 
    class="p-button-text" 
    @click="volverAlDashboard" 
  />
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Frm_Ajustes'
});
</script>