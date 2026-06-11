<template>
  <div class="p-4" style="height: calc(100vh - 80px); display: flex; flex-direction: column;">
    
    <div class="flex-none">
      <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
      <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big" class="mb-3">
        Configure parámetros y gestión de usuarios para KiwiKERP.
      </Message>
      <div class="mb-5">
        <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
      </div>
    </div>

    <Tabs value="0" class="flex-1 flex flex-column overflow-hidden">
      <TabList class="flex-none">
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Párametros de Sistema</Tab>
        <Tab value="2">Gestión de Usuarios</Tab>
      </TabList>

      <TabPanels class="flex-1 overflow-hidden">
        
        <TabPanel value="0" class="h-full overflow-auto">
           </TabPanel>

        <TabPanel value="1" class="h-full overflow-auto">
           </TabPanel>

        <TabPanel value="2" class="h-full overflow-hidden flex flex-column">
          <div class="p-5 surface-50 border-round border-1 surface-border flex-1 flex flex-column overflow-hidden">
            <div class="flex justify-content-between align-items-center mb-4 flex-none">
              <h5 class="text-primary m-0 flex align-items-center gap-2">
                <i class="pi pi-users"></i> Listado de Usuarios del Sistema
              </h5>
              <Button label="Nuevo Usuario" icon="pi pi-plus" size="small" @click="openUserDialog" />
            </div>
            
            <div class="flex-1 overflow-hidden">
              <UsuariosTabla @edit="openUserDialog" />
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button';
import Message from 'primevue/message';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Select from 'primevue/select';
import FloatLabel from 'primevue/floatlabel';
import Checkbox from 'primevue/checkbox';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import Textarea from 'primevue/textarea';
import UsuariosTabla from '../../../components/ajustes/UsuariosTabla.vue';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData, provincias, loadData, onUploadLogo, baseUrl, handleImageError, handleImageLoad,openUserDialog } = Frm_Ajustes();

onMounted(() => {
  loadData();
});

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>