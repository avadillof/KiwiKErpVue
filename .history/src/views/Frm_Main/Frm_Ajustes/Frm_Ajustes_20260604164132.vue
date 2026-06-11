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

    <div class="ahistersd-container">
      <div class="form-grid">
        <div class="field">
          <label>Location</label>
          <InputText v-model="formData.loc1" class="sketch-input" />
        </div>

        <div class="field">
          <label>Location</label>
          <InputText v-model="formData.loc2" class="sketch-input" />
        </div>

        <div class="field full-row">
          <label>Location</label>
          <InputText v-model="formData.locFull" class="sketch-input" />
        </div>
      </div>

      <div class="actions" style="margin-top: 20px;">
        <Button label="Guardar Ajustes" :loading="loading" @click="saveData" />
      </div>
    </div>
  </div>
</template>



<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
// 1. IMPORTANTE: Asegúrate de que esta ruta sea correcta
import { useAhistersdController } from '../../../';

const router = useRouter();

// 2. IMPORTANTE: Debes "ejecutar" la función para obtener sus valores
const { formData, loading, saveData } = useAhistersdController();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css?family=Architects+Daughter');

.ahistersd-container { padding: 20px; max-width: 650px; background: #fff; border-radius: 8px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.field { display: flex; flex-direction: column; gap: 5px; }
.full-row { grid-column: span 2; }

label {
  font-family: 'Architects Daughter', cursive;
  color: #596780;
  font-weight: bold;
  font-size: 11px;
}

.sketch-input {
  border: 2px solid #4C9AFF !important;
  border-radius: 9px !important;
  padding: 8px;
  font-family: 'Architects Daughter', cursive;
}
</style>