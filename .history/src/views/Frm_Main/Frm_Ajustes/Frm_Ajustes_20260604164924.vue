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
    <!-- Fila 1: Dos campos -->
    <div class="col-12 md:col-6">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.loc1" />
        </div>
    </div>

    <div class="col-12 md:col-6">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.loc2" />
        </div>
    </div>

    <!-- Fila 2: Campo ancho -->
    <div class="col-12">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.locFull" />
        </div>
    </div>

    <!-- Botón -->
    <div class="col-12">
        <Button 
            label="Guardar Ajustes" 
            icon="pi pi-save" 
            :loading="loading" 
            @click="saveData" 
        />
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
/* 
   Usamos las utilidades de PrimeVue. 
   Este estilo solo asegura el espaciado correcto de los campos (labels y inputs).
*/

.field {
    margin-bottom: 1.5rem; /* Separación entre filas */
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #4b5563; /* Color gris estándar para etiquetas */
}

/* 
   Opcional: Si quieres que el contenedor tenga un margen máximo 
   para que no se estire demasiado en pantallas ultra-anchas 
*/
.grid {
    max-width: 800px;
    margin: 0 auto;
}
</style>