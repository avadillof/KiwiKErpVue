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
          
          
          <div>
          
          
            
          </div>

          <div class="flex justify-content-end mt-4">
            <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" />
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
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
// Asegúrate de que Frm_Ajustes devuelva las propiedades correctas
const { formData, loading, saveData } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>