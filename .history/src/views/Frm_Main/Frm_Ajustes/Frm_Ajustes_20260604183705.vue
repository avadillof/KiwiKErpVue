<template>
  <div class="p-4" style="padding-bottom: 80px;">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
    <p class="text-gray-500 mb-6">Configure parámetros y gestión de usuarios para KiwiKERP.</p>

    <div class="mb-5">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    <Tabs value="0">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Gestión de Usuarios</Tab>
      </TabList>
      
      <TabPanels>
        <TabPanel value="0">
          <div class="grid">
            
            <div class="col-12 md:col-3 pr-0 md:pr-4">
              <div class="border-round border-1 surface-border p-4 flex flex-column align-items-center justify-content-center" style="height: 200px;">
                 <i class="pi pi-image text-5xl text-400 mb-3"></i>
                 <Button label="Cambiar Logo" icon="pi pi-upload" size="small" variant="outlined" />
              </div>
              <div class="mt-4">
                <label class="font-bold block mb-2">Eslogan</label>
                <InputText v-model="formData.slogan" class="w-full" placeholder="Tu eslogan aquí..." />
              </div>
            </div>

            <div class="col-12 md:col-9 mt-4 md:mt-0">
              <div class="p-5 surface-50 border-round border-1 surface-border">
                <div class="grid">
                  <div class="col-12 md:col-4"><label class="font-bold block mb-2">Nombre Entidad</label><InputText v-model="formData.entitie" class="w-full" /></div>
                  <div class="col-12 md:col-2"><label class="font-bold block mb-2">NIF/CIF</label><InputText v-model="formData.cif" class="w-full" /></div>
                  <div class="col-12 md:col-4"><label class="font-bold block mb-2">Email de Contacto</label><InputText v-model="formData.email" class="w-full" /></div>
                  <div class="col-12 md:col-2"><label class="font-bold block mb-2">Teléfono</label><InputText v-model="formData.phone" class="w-full" /></div>

                  <div class="col-12 mt-4"><h5 class="text-primary m-0 mb-3">Dirección Fiscal</h5></div>
                  <div class="col-12 md:col-6"><label class="font-bold block mb-2">Calle / Avenida</label><InputText v-model="formData.address" class="w-full" /></div>
                  <div class="col-12 md:col-2"><label class="font-bold block mb-2">Número</label><InputText v-model="formData.addressNumber" class="w-full" /></div>
                  <div class="col-12 md:col-4"><label class="font-bold block mb-2">Provincia</label><Select v-model="formData.province" :options="provincias" optionLabel="nombre" optionValue="nombre" placeholder="Selecciona..." class="w-full" filter /></div>
                  <div class="col-12 md:col-2"><label class="font-bold block mb-2">CP</label><InputText v-model="formData.zipCode" class="w-full" /></div>
                  <div class="col-12 md:col-4"><label class="font-bold block mb-2">Localidad</label><InputText v-model="formData.city" class="w-full" /></div>

                  <div class="col-12 mt-4"><h5 class="text-primary m-0 mb-3">Configuración SMTP</h5></div>
                  <div class="col-12 md:col-6"><label class="font-bold block mb-2">Servidor SMTP</label><InputText v-model="formData.smtpServer" class="w-full" /></div>
                  <div class="col-12 md:col-2"><label class="font-bold block mb-2">Puerto</label><InputNumber v-model="formData.smtpPort" :useGrouping="false" class="w-full" /></div>
                  <div class="col-12 md:col-4"><label class="font-bold block mb-2">Usuario SMTP</label><InputText v-model="formData.smtpUser" class="w-full" /></div>
                </div>

                <div class="flex justify-content-end mt-6 pt-4 border-top-1 surface-border">
                  <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" size="large" />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        
        <TabPanel value="1">
          <p class="text-gray-500">Gestión de usuarios...</p>
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
import Select from 'primevue/select';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData, provincias } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>