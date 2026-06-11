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

    







<div class="grid">
    <!-- Fila 1: Dos campos al 50% -->
    <div class="col-6">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.loc1" style="width: 100%" />
        </div>
    </div>

    <div class="col-6">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.loc2" style="width: 100%" />
        </div>
    </div>

    <!-- Fila 2: Campo al 100% -->
    <div class="col-12">
        <div class="field">
            <label>Location</label>
            <InputText v-model="formData.locFull" style="width: 100%" />
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