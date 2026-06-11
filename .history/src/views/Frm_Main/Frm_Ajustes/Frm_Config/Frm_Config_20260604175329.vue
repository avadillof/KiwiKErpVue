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
          <div class="grid">
            <div class="col-12 md:col-3">
              <div style="border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; background: #fafafa;">
                 <i class="pi pi-image" style="font-size: 3rem; color: #9ca3af; display: block; margin-bottom: 10px;"></i>
                 <Button label="Cambiar Logo" icon="pi pi-upload" size="small" class="p-button-outlined" />
              </div>
            </div>

            <div class="col-12 md:col-9">
              <div class="grid">
                
                <div class="col-12">
                  <div class="flex flex-wrap gap-3">
                    <div class="flex-auto" style="flex: 2;">
                      <label class="font-bold block mb-2">Nombre Entidad</label>
                      <InputText v-model="formData.entitie" class="w-full" />
                    </div>
                    <div class="flex-auto" style="flex: 1;">
                      <label class="font-bold block mb-2">NIF/CIF</label>
                      <InputText v-model="formData.cif" class="w-full" />
                    </div>
                    <div class="flex-auto" style="flex: 1;">
                      <label class="font-bold block mb-2">Email de Contacto</label>
                      <InputText v-model="formData.email" class="w-full" />
                    </div>
                  </div>
                </div>

                <div class="field col-12 md:col-6">
                  <label class="font-bold block mb-2">Teléfono</label>
                  <InputText v-model="formData.phone" class="w-full" />
                </div>

                <div class="col-12">
                  <h5 class="mt-4 mb-2 text-primary">Configuración SMTP</h5>
                </div>
                
                <div class="field col-12 md:col-6">
                  <label class="font-bold block mb-2">Servidor SMTP</label>
                  <InputText v-model="formData.smtpServer" class="w-full" />
                </div>
                <div class="field col-12 md:col-2">
                  <label class="font-bold block mb-2">Puerto</label>
                  <InputNumber v-model="formData.smtpPort" :useGrouping="false" class="w-full" />
                </div>
                <div class="field col-12 md:col-4">
                  <label class="font-bold block mb-2">Usuario SMTP</label>
                  <InputText v-model="formData.smtpUser" class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-content-end mt-4">
            <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" />
          </div>
        </TabPanel>
        
        <TabPanel value="1">
          <div class="p-fluid">
            <p>Aquí irá la tabla de gestión de usuarios...</p>
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
import { Frm_Ajustes } from '../../Frm_Ajustes

const router = useRouter();
const { formData, loading, saveData } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>