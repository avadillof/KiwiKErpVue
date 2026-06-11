<template>
  <div style="padding: 20px;">
    <h1 style="color: #374151; margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -0.5px;">
      Ajustes del Sistema
    </h1>
    <p style="color: #6b7280; margin: 5px 0 20px 0;">
      Configure parámetros y gestión de usuarios para KiwiKERP.
    </p>

    <div style="margin-bottom: 20px;">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    <Tabs value="0">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Gestión de Usuarios</Tab>
      </TabList>
      
      <TabPanels>
        <TabPanel value="0">
  <div class="p-fluid">
    <div class="grid">
      <div class="col-12 md:col-3">
        <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; background: #fafafa; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
           <i class="pi pi-image" style="font-size: 3rem; color: #9ca3af; margin-bottom: 10px;"></i>
           <Button label="Cambiar Logo" icon="pi pi-upload" size="small" class="p-button-outlined" />
        </div>
      </div>

      <div class="col-12 md:col-9">
        <div class="grid formgrid">
          
          <div class="field col-12 md:col-6">
            <label class="font-bold block mb-2">Nombre Entidad</label>
            <InputText v-model="formData.entitie" placeholder="Ej: Mi Empresa S.L." />
          </div>
          <div class="field col-12 md:col-6">
            <label class="font-bold block mb-2">NIF/CIF</label>
            <InputText v-model="formData.cif" />
          </div>

          <div class="field col-12">
            <label class="font-bold block mb-2">Firma Email (HTML)</label>
            <Textarea v-model="formData.logoHtml" rows="3" />
          </div>

          <div class="col-12"><hr style="border:0; border-top: 1px solid #e5e7eb; margin: 15px 0;"></div>
          
          <div class="field col-12 md:col-5">
            <label class="font-bold block mb-2">Servidor SMTP</label>
            <InputText v-model="formData.smtpServer" />
          </div>
          <div class="field col-12 md:col-2">
            <label class="font-bold block mb-2">Puerto</label>
            <InputNumber v-model="formData.smtpPort" :useGrouping="false" />
          </div>
          <div class="field col-12 md:col-5">
            <label class="font-bold block mb-2">Usuario SMTP</label>
            <InputText v-model="formData.smtpUser" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex justify-content-end mt-4 pt-4 border-top-1 border-gray-200">
      <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" />
    </div>
  </div>
</TabPanel>



        
        <TabPanel value="1">
          <div class="p-fluid">
            <p>Tabla de gestión de usuarios...</p>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>