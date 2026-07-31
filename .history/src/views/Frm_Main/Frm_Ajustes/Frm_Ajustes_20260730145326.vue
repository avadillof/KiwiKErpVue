<template>
  <div class="p-4" style="padding-bottom: 80px;">
    <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
    <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
      Configure parámetros y gestión de usuarios para KiwiKERP.
    </Message>

    <div class="mb-5">
      <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
    </div>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0">Configuración General</Tab>
        <Tab value="1">Párametros de Sistema</Tab>
        <Tab value="2">Gestión de Usuarios</Tab>
        <Tab value="3">Datos Maestros</Tab>
      </TabList>

      <TabPanels>
        <TabPanel value="0">
          <div class="grid">
            <div class="col-12 md:col-3 pr-0 md:pr-4">
              <div
                class="border-round border-1 surface-border p-4 flex flex-column align-items-center justify-content-center"
                style="height: 200px;">

                <img v-if="formData.urlLogo" :key="formData.urlLogo" :src="formData.urlLogo"
                  style="max-height: 120px; object-fit: contain;" @error="handleImageError" @load="handleImageLoad" />

                <i v-else class="pi pi-image text-5xl text-400 mb-3"></i>

                <FileUpload mode="basic" name="logo" accept="image/png, image/jpeg" :maxFileSize="1000000"
                  @select="onUploadLogo" chooseLabel="Cambiar Logo" class="mt-3" />
              </div>

              <div class="mt-4">
                <FloatLabel variant="in">
                  <InputText v-model="formData.sloganCompany" id="slogan" maxlength="500" class="w-full" size="small" />
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
                        <InputText v-model="formData.nameCompany" maxlength="300" id="entitie" class="w-full"
                          size="small" /><label for="entitie">Nombre Entidad</label>
                      </FloatLabel>
                    </div>



                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.cifCompany" id="cif" maxlength="500" class="w-full" size="small" />
                        <label for="cif">NIF/CIF</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.email" id="email" maxlength="255" class="w-full" size="small" />
                        <label for="email">Email</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.phone" id="phone" maxlength="50" class="w-full" size="small" />
                        <label for="phone">Teléfono</label>
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
                        <InputText v-model="formData.address" id="address" maxlength="500" class="w-full"
                          size="small" /><label for="address">Calle / Avenida</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.addressNumber" id="addressNumber" maxlength="20" class="w-full"
                          size="small" />
                        <label for="addressNumber">Número</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <Select v-model="formData.province" id="province" :options="provincias" maxlength="200"
                          optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter
                          :pt="{ root: { style: 'padding-top: 1.25rem' } }" />
                        <label for="province">Provincia</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-2 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.zipCode" id="zipCode" maxlength="20" class="w-full" size="small" />
                        <label for="zipCode">CP</label>
                      </FloatLabel>
                    </div>
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.city" id="city" maxlength="200" class="w-full" size="small" />
                        <label for="city">Localidad</label>
                      </FloatLabel>
                    </div>
                  </div>
                </div>



                <div class="bg-white p-4 border-round-md shadow-sm border-1 surface-border mb-4">
                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-envelope"></i> Configuración SMTP
                  </h5>


                  <div class="grid">
                    <div class="col-12 md:col-3 mb-">
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
                    <div class="col-12 md:col-4 mb-2">
                      <FloatLabel variant="in">
                        <InputText v-model="formData.smtpUser" id="smtpUser" class="w-full" size="small" /><label
                          for="smtpUser">Usuario SMTP</label>
                      </FloatLabel>
                    </div>

                    <div class="col-12 md:col-3 mb-1">
                      <FloatLabel variant="in">
                        <Password v-model="formData.smtpPasswordCountSmtp" id="smtpPasswordUser" class="w-full"
                          size="small" toggleMask /><label for="smtpPasswordUser">Password</label>
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
                      <Textarea v-model="formData.reportRgpd" id="rgpdText" class="w-full pt-4" rows="6" autoResize />
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


                  <h5 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                    <i class="pi pi-table"></i> Persintencia / Base de datos
                  </h5>


                  <div class="flex flex-column gap-1">

                    <div class="col-2 mt-0">
                      <FloatLabel variant="in">
                        <InputNumber v-model="formData.paginationTable" id="paginationTable" class="w-full" size="small"
                          :step="500" suffix=" registros" />
                        <label for="paginationTable">Cantidad de registros por Página</label>
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

        <TabPanel value="2">
          <div class="p-5 surface-50 border-round border-1 surface-border" style="margin-bottom: 100px;">
            <div class="flex justify-content-between align-items-center mb-4">
              <h5 class="text-primary m-0 flex align-items-center gap-2">
                <i class="pi pi-users"></i> Listado de Usuarios del Sistema
              </h5>
            </div>
            <UsuariosTabla @edit="openUserDialog" />
          </div>
        </TabPanel>



        <TabPanel value="3">

          <div class="grid mt-1">

            <!-- Impuestos -->
            <div class="col-12 md:col-2">

              <div class="tax-card-wrapper" @click="openSalesTax">

                <Card class="tax-card"
                  onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';">

                  <template #content>

                    <div class="flex flex-column gap-1">

                      <div class="tax-icon">
                        <i class="pi pi-percentage"></i>
                      </div>

                      <div class="flex align-items-center gap-3">

                        <div>
                          <h3 class="m-0 text-lg font-semibold">
                            Impuestos
                          </h3>
                          <small class="text-color-secondary">
                            Impuestos esque se aplican en Productos y servicios dentro de los módulos de Compras y Ventas.
                          </small>
                        </div>

                      </div>

                      <div class="kiwik-separator"></div>

                      <div class="flex justify-content-end">
                        <Button label="Gestionar" icon="pi pi-arrow-right" iconPos="right" text size="small"
                          style="padding: 5px 10px; font-weight: 600; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #9cc10a; transition: background-color 0.2s, color 0.2s;"
                          onmouseover="this.style.backgroundColor='#f9fbe7'; this.style.color='#648506';"
                          onmouseout="this.style.backgroundColor='transparent'; this.style.color='#9cc10a';"
                          @click="openSalesTax" />
                      </div>

                    </div>

                  </template>

                </Card>

              </div>

            </div>

            <!-- Certificados -->
            <div class="col-12 md:col-2">

              <div class="tax-card-wrapper" @click="openCertificates">

                <Card class="tax-card"
                  onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';">

                  <template #content>

                    <div class="flex flex-column gap-1">

                      <div class="tax-icon">
                        <i class="pi pi-shield"></i>
                      </div>

                      <div class="flex align-items-center gap-3">

                        <div>
                          <h3 class="m-0 text-lg font-semibold">
                            Certificados
                          </h3>
                          <small class="text-color-secondary">
                            Gestión de certificados digitales para la firma electrónica y la integración con servicios
                            externos como Veri*Factu.
                          </small>
                        </div>

                      </div>

                      <div class="kiwik-separator"></div>

                      <div class="flex justify-content-end">
                        <Button label="Gestionar" icon="pi pi-arrow-right" iconPos="right" text size="small"
                          style="padding: 5px 10px; font-weight: 600; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #9cc10a; transition: background-color 0.2s, color 0.2s;"
                          onmouseover="this.style.backgroundColor='#f9fbe7'; this.style.color='#648506';"
                          onmouseout="this.style.backgroundColor='transparent'; this.style.color='#9cc10a';"
                          @click="openCertificates" />
                      </div>

                    </div>

                  </template>

                </Card>

              </div>

            </div>

          </div>

        </TabPanel>

      </TabPanels>
    </Tabs>
  </div>
</template>


<style scoped>
.tax-card {
  height: 170px;
  cursor: pointer;
  transition: all .25s ease;

  box-shadow: 0 4px 12px rgba(0, 0, 0, .10);
}

.tax-card:hover {
  transform: translateY(-4px);

  box-shadow: 0 14px 32px rgba(0, 0, 0, .18);
}


.tax-card :deep(.p-card-body) {

  padding: 1.25rem;

}


.tax-card :deep(.p-card-content) {

  padding: 0;

}


.tax-icon {

  width: 45px;
  height: 45px;

  border-radius: 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--p-primary-100);
  color: var(--p-primary-700);

  font-size: 1.4rem;

}


.description {

  min-height: 40px;

  color: var(--text-color-secondary);

}
</style>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Password from 'primevue/password';
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
import UsuariosTabla from "../../../components/Frm_Ajustes/ListGridUsers.vue";
import { useRoute } from 'vue-router';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';
import Frm_SalesTax from '@/views/Frm_SalexTax/Frm_SalesTax.vue'
import Card from 'primevue/card';
import Divider from 'primevue/divider';
import 'primeicons/primeicons.css';


const activeTab = ref<string>('0');
const route = useRoute();
const router = useRouter();
const { formData, loading, saveData, provincias, loadData, onUploadLogo, baseUrl, handleImageError, handleImageLoad, openUserDialog } = Frm_Ajustes();

onMounted(() => {
  loadData();
});


const updateActiveTab = function (queryTab: any): void {
  if (queryTab) {
    activeTab.value = String(queryTab);
  }
};

function volverAlDashboard() {
  router.push({ name: 'Dashboard' });
}

watch(
  function () { return route.query.tab; },
  function (newTab) {
    updateActiveTab(newTab);
  },
  { immediate: true }
);


function openSalesTax() {

  router.push({
    name: 'Taxas'
  });

}


const openCertificates = () => {
  //  router.push("/Frm_Certificates");
};



</script>