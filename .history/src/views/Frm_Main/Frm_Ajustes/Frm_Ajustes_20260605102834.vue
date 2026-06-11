<template>


  <div class="p-4" style="padding-bottom: 80px;">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>    
    <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
           Configure parámetros y gestión de usuarios para KiwiKERP.
    </Message>


    <div class="mb-5">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    <Tabs value="0">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Párametros de Sistema</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <div class="grid">

            <div class="col-12 md:col-3 pr-0 md:pr-4">
              <div
                class="border-round border-1 surface-border p-4 flex flex-column align-items-center justify-content-center"
                style="height: 200px;">
                <i class="pi pi-image text-5xl text-400 mb-3"></i>
                <Button label="Cambiar Logo" icon="pi pi-upload" size="small" variant="outlined" />
              </div>
              <div class="mt-4">
                <FloatLabel variant="in">
                  <InputText v-model="formData.slogan" id="slogan" class="w-full" size="small" />
                  <label for="slogan">Eslogan</label>
                </FloatLabel>
              </div>
            </div>

            <div class="col-12 md:col-9 mt-4 md:mt-0">
              <div class="p-5 surface-50 border-round border-1 surface-border">

                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-building"></i> Datos Básicos
                  </h5>
                  <div class="grid">
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.entitie" id="entitie" class="w-full" size="small" /><label
                          for="entitie">Nombre Entidad</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.cif" id="cif" class="w-full" size="small" /><label
                          for="cif">NIF/CIF</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.email" id="email" class="w-full" size="small" /><label
                          for="email">Email</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.phone" id="phone" class="w-full" size="small" /><label
                          for="phone">Teléfono</label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>

                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-map-marker"></i> Dirección Fiscal
                  </h5>
                  <div class="grid">
                    <div class="col-12 md:col-6 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.address" id="address" class="w-full" size="small" /><label
                          for="address">Calle / Avenida</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.addressNumber" id="addressNumber" class="w-full" size="small" />
                        <label for="addressNumber">Número</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in"><Select v-model="formData.province" id="province" :options="provincias"
                          optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter
                          style="min-height: 40px;" /><label for="province">Provincia</label></FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.zipCode" id="zipCode" class="w-full" size="small" /><label
                          for="zipCode">CP</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.city" id="city" class="w-full" size="small" /><label
                          for="city">Localidad</label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>

                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-envelope"></i> Configuración SMTP
                  </h5>
                  <div class="grid">
                    <div class="col-12 md:col-5 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.smtpServer" id="smtpServer" class="w-full" size="small" /><label
                          for="smtpServer">Servidor SMTP</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputNumber v-model="formData.smtpPort" id="smtpPort" :useGrouping="false" class="w-full"
                          size="small" /><label for="smtpPort">Puerto</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-5 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.smtpUser" id="smtpUser" class="w-full" size="small" /><label
                          for="smtpUser">Usuario SMTP</label>
                      </FloatLabel>
                    </div>

                    <div class="col-12 grid grid-nogutter gap-2 mb-2">
                      <div class="col border-1 surface-border border-round px-3 flex align-items-center h-3rem">
                        <Checkbox v-model="formData.smtpAuth" id="smtpAuth" binary size="small" />
                        <label for="smtpAuth" class="ml-2 font-medium text-sm">SMTP Auth</label>
                      </div>
                      <div class="col border-1 surface-border border-round px-3 flex align-items-center h-3rem">
                        <Checkbox v-model="formData.starttlsEnable" id="starttlsEnable" binary size="small" />
                        <label for="starttlsEnable" class="ml-2 font-medium text-sm">StartTLS Enable</label>
                      </div>
                      <div class="col border-1 surface-border border-round px-3 flex align-items-center h-3rem">
                        <Checkbox v-model="formData.starttlsRequired" id="starttlsRequired" binary size="small" />
                        <label for="starttlsRequired" class="ml-2 font-medium text-sm">StartTLS Required</label>
                      </div>
                    </div>

                    <div class="col-12 md:col-6 mt-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.sslProtocols" id="sslProtocols" class="w-full" size="small" />
                        <label for="sslProtocols">SSL Protocols</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-6 mt-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.mailSender" id="mailSender" class="w-full" size="small" /><label
                          for="mailSender">Email Remitente (System)</label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>



                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-shield"></i> Configuración Legal (RGPD)
                  </h5>
                  <div class="grid">
                    <div class="col-12">
                        <Textarea v-model="formData.rgpdText" id="rgpdText" class="w-full pt-4" rows="6" autoResize />                        
                        <Message variant="simple" icon="pi pi-bell" severity="warn" size="small">
                            Texto de Protección de Datos (RGPD).
                        </Message>
                    </div>

                  </div>
                </div>


                <div class="flex justify-content-end mt-5 pt-4 border-top-1 surface-border">
                  <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" size="small" />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>




        
        <TabPanel value="1">
          <div class="grid">

            
            <div class="col-12 md:col-12 mt-4 md:mt-0">
              <div class="p-5 surface-50 border-round border-1 surface-border">
                
                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-desktop"></i> Preferencias de Interfaz
                  </h5>

                  
                  <div class="grid">
                    <div class="col-2">
                      <FloatLabel variant="in">
                        <InputNumber v-model="formData.toastDuration" id="toastDuration" class="w-full" size="small"
                          :step="500" suffix=" ms" />
                        <label for="toastDuration">Tiempo duración del Toast (ms)</label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>

                <div class="flex justify-content-end mt-5 pt-4 border-top-1 surface-border">
                  <Button label="Guardar Cambios" icon="pi pi-save" :loading="loading" @click="saveData" size="small" />
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
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
impor Textarea from
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';

const router = useRouter();
const { formData, loading, saveData, provincias } = Frm_Ajustes();

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}
</script>