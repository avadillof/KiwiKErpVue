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

    <Tabs value="0">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Gestión de Usuarios</Tab>
      </TabList>
      
      <TabPanels>
        <TabPanel value="0">
          <div class="p-fluid">
            <p>Aquí irá el formulario de configuración...</p>
          </div>
        </TabPanel>
        
        <TabPanel value="1">
          <div class="p-fluid">
            <p>Aquí irá la tabla de usuarios...</p>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
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