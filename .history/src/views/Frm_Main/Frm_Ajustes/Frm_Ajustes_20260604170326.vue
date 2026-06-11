<template>
  <div style="padding: 20px;">
    <h1 style="color: #C0C0C0; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px;">
      Ajustes del Sistema
    </h1>
    <p style="color: #6b7280; margin: 5px 0 20px 0;">
      Configure parámetros, usuarios establecidos para KiwiKERP.
    </p>

    <div style="margin-bottom: 20px;">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    







<div class="grid p-fluid">
  <!-- Pestañas de Navegación -->
  <div class="col-12">
    <div class="p-tabview">
      <ul class="p-tabview-nav" style="list-style: none; display: flex; padding: 0; border-bottom: 1px solid #dddddd;">
        <li style="margin-right: 20px; padding: 10px; cursor: pointer; color: #4B5259;">Home</li>
        <li style="margin-right: 20px; padding: 10px; cursor: pointer; color: #0085FC; border-bottom: 2px solid #0085FC;">Profile</li>
        <li style="margin-right: 20px; padding: 10px; cursor: pointer; color: #0085FC;">Contact</li>
      </ul>
    </div>
  </div>

  <!-- Bloque de Texto -->
  <div class="col-12">
    <p style="color: #596780; line-height: 1.6;">
      Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth master cleanse. 
      Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh dreamcatcher synth.
    </p>
  </div>

  <!-- Grupo de Botones -->
  <div class="col-12">
    <div class="p-button-group" style="display: flex;">
      <Button label="Active" class="p-button-raised" style="border-radius: 5px 0 0 5px;" />
      <Button label="Link" class="p-button-outlined" style="border-radius: 0;" />
      <Button label="Link" class="p-button-outlined" style="border-radius: 0;" />
      <Button label="Disabled" disabled class="p-button-outlined" style="border-radius: 0 5px 5px 0; color: #7D868C;" />
    </div>
  </div>
</div>










   
  </div>
</template>



<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
// 1. IMPORTANTE: Asegúrate de que esta ruta sea correcta
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();

// 2. IMPORTANTE: Debes "ejecutar" la función para obtener sus valores
const { formData, loading, saveData } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>





<style scoped>
/* Contenedor que limita el ancho al tamaño que definiste en tu dibujo */
.grid {
    max-width: 600px; /* Ajusta este valor al ancho total de tus cajas en el dibujo */
    margin: 0;
}

.field {
    margin-bottom: 1rem;
}

label {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
    color: #596780; /* El color gris que tenías en el draw.io */
    font-weight: bold;
}
</style>