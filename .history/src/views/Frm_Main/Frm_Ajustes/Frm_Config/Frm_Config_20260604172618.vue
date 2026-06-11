<template>
  <div class="p-fluid" style="padding: 20px;">
    <h1>Configuración del Sistema</h1>

    <div class="grid">
      <div class="col-12 md:col-3">
        <div class="card flex flex-column align-items-center">
          <h5>Logotipo</h5>
          <div class="logo-preview" style="width: 150px; height: 150px; border: 1px solid #ccc; margin-bottom: 10px;">
            </div>
          <Button label="Subir Logo" icon="pi pi-upload" class="p-button-outlined" />
        </div>
      </div>

      <div class="col-12 md:col-9">
        <div class="card">
          <h5>Datos de la Entidad</h5>
          <div class="formgrid grid">
            <div class="field col-12 md:col-6">
              <label>Nombre Entidad</label>
              <InputText v-model="config.entitie" />
            </div>
            <div class="field col-12 md:col-6">
              <label>NIF/CIF</label>
              <InputText v-model="config.cif" />
            </div>
            <div class="field col-12">
              <label>Firma Email (HTML)</label>
              <Textarea v-model="config.logoHtml" rows="3" />
            </div>
          </div>

          <h5>Contacto y Dirección</h5>
          <div class="formgrid grid">
            <div class="field col-12 md:col-4">
              <label>Email</label>
              <InputText v-model="config.email" />
            </div>
            <div class="field col-12 md:col-4">
              <label>Teléfono</label>
              <InputText v-model="config.phone" />
            </div>
            <div class="field col-12 md:col-4">
              <label>Portal Web</label>
              <InputText v-model="config.portalWeb" />
            </div>
          </div>

          <h5>Configuración SMTP</h5>
          <div class="formgrid grid">
            <div class="field col-12 md:col-6">
              <label>Servidor SMTP</label>
              <InputText v-model="config.smtpServer" />
            </div>
            <div class="field col-12 md:col-2">
              <label>Puerto</label>
              <InputNumber v-model="config.smtpPort" :useGrouping="false" />
            </div>
            <div class="field col-12 md:col-4">
              <label>Usuario SMTP</label>
              <InputText v-model="config.smtpUser" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-content-end mt-4">
      <Button label="Guardar Configuración" icon="pi pi-save" @click="guardarConfiguracion" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Estado del formulario
const config = ref({
  entitie: '',
  cif: '',
  logoHtml: '',
  email: '',
  phone: '',
  portalWeb: '',
  smtpServer: '',
  smtpPort: 587,
  smtpUser: ''
});

function guardarConfiguracion() {
  console.log("Guardando en backend:", config.value);
  // Aquí llamarías a tu servicio para persistir los datos
}
</script>

<style scoped>
.card { background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.logo-preview { display: flex; align-items: center; justify-content: center; }
</style>