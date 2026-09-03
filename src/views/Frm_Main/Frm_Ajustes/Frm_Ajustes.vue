<template>
  <main class="settings-page">
    <header class="settings-header">
      <div class="settings-title">
        <div class="settings-icon"><i class="pi pi-cog"></i></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Administración</span>
          <h1>Configuración del sistema</h1>
          <p>Empresa, preferencias, usuarios, inteligencia artificial y datos maestros de la plataforma.</p>
        </div>
      </div>
      <Button label="Inicio" icon="pi pi-home" text severity="secondary" @click="volverAlDashboard" />
    </header>

    <Tabs v-model:value="activeTab">
      <TabList>
        <Tab value="0"><i class="pi pi-building"></i><span>Empresa</span></Tab>
        <Tab value="1"><i class="pi pi-sliders-h"></i><span>Preferencias</span></Tab>
        <Tab value="2"><i class="pi pi-users"></i><span>Usuarios</span></Tab>
        <Tab value="3"><i class="pi pi-database"></i><span>Datos maestros</span></Tab>
        <Tab v-if="aiAuth.user?.admin" value="4"><i class="pi pi-sparkles"></i><span>Inteligencia artificial</span></Tab>
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
                          optionLabel="nombre" optionValue="nombre" class="w-full" size="small" filter />
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
                  <div class="flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                    <h5 class="text-primary m-0 flex align-items-center gap-2">
                      <i class="pi pi-envelope"></i> Configuración SMTP
                    </h5>
                    <Button label="Verificar conexión" icon="pi pi-check-circle" severity="secondary" outlined
                      size="small" :loading="testingSmtp" :disabled="loading" @click="testSmtpConnection" />
                  </div>


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
                    <i class="pi pi-table"></i> Persistencia / Base de datos
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

                  <template v-if="aiAuth.user?.admin">
                    <h5 class="text-primary mt-5 mb-4 flex align-items-center gap-2">
                      <i class="pi pi-folder-open"></i> Repositorio documental
                    </h5>
                    <div class="grid">
                      <div class="col-12 md:col-8">
                        <FloatLabel variant="in">
                          <InputText v-model="formData.documentRoot" id="documentRoot" maxlength="1000" class="w-full" size="small" />
                          <label for="documentRoot">Ruta raíz de documentos</label>
                        </FloatLabel>
                      </div>
                    </div>
                    <div class="document-root-warning">
                      <i class="pi pi-exclamation-triangle"></i>
                      <span>Esta ruta contiene documentos históricos, facturas, adjuntos, imágenes y logotipos. Cambiarla no mueve los archivos existentes. Después de guardarla, reinicia el servidor de KiwiKERP para que las imágenes y los documentos se publiquen desde la nueva ubicación. Conserva la ruta anterior hasta comprobar que todo funciona correctamente.</span>
                    </div>
                  </template>



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
          <section class="master-data">
            <div class="master-data-header">
              <div>
                <span class="master-eyebrow">Catálogos compartidos</span>
                <h2>Datos maestros</h2>
                <p>Configura la información utilizada de forma común por los distintos módulos de KiwiKERP.</p>
              </div>
              <div class="master-summary"><i class="pi pi-database"></i><strong>3</strong><span>catálogos</span></div>
            </div>

            <div class="master-grid">
              <button type="button" class="master-card master-card--tax" @click="openSalesTax">
                <span class="master-icon"><i class="pi pi-percentage"></i></span>
                <span class="master-copy"><strong>Impuestos</strong><small>Tipos impositivos aplicables a productos, servicios, compras y ventas.</small></span>
                <span class="master-action">Gestionar <i class="pi pi-arrow-right"></i></span>
              </button>

              <button type="button" class="master-card master-card--certificate" @click="openCertificates">
                <span class="master-icon"><i class="pi pi-shield"></i></span>
                <span class="master-copy"><strong>Certificados digitales</strong><small>Firma electrónica e integración con la Agencia Tributaria y Veri*Factu.</small></span>
                <span class="master-action">Gestionar <i class="pi pi-arrow-right"></i></span>
              </button>

              <button type="button" class="master-card master-card--family" @click="openFamiliasProductos">
                <span class="master-icon"><i class="pi pi-bookmark"></i></span>
                <span class="master-copy"><strong>Familias de productos</strong><small>Clasificación común para organizar el catálogo de productos y servicios.</small></span>
                <span class="master-action">Gestionar <i class="pi pi-arrow-right"></i></span>
              </button>
            </div>

            <div class="master-note"><i class="pi pi-info-circle"></i><span>Los cambios realizados en estos catálogos se aplican a los documentos y módulos que los utilizan.</span></div>
          </section>

        </TabPanel>

        <TabPanel v-if="aiAuth.user?.admin" value="4"><AiSettingsPanel v-if="activeTab === '4'"/></TabPanel>
      </TabPanels>
    </Tabs>
  </main>

  <Frm_FamiliasProductos ref="familiasProductosRef" />
</template>


<style scoped>
.settings-page {
  --kiwi: #9cc10a;
  --kiwi-dark: #648506;
  width: 100%;
  padding: 18px 16px 96px;
  color: #243044;
}

.settings-header {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 22px;
  padding: 16px 22px;
  border: 1px solid #e4e9d2;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(31, 41, 55, .06);
}

.settings-header::after {
  content: "";
  position: absolute;
  z-index: 0;
  width: 300px;
  height: 300px;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: url('/logos/logo512.png') center/contain no-repeat;
  filter: grayscale(1);
  opacity: .075;
  pointer-events: none;
}
.settings-header > * { position: relative; z-index: 1; }

.settings-title { display: flex; align-items: center; gap: 15px; }
.settings-icon {
  display: grid;
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #b1d70e, #719808);
  box-shadow: 0 7px 16px rgba(113, 152, 8, .22);
}
.settings-icon i { font-size: 1.35rem; }
.breadcrumb { color: #8a93a2; font-size: .8rem; font-weight: 700; }
.settings-title h1 { margin: 3px 0 2px; color: #202939; font-size: 1.4rem; }
.settings-title p { margin: 0; color: #7a8494; font-size: .92rem; }

.settings-page :deep(.p-tabs) { gap: 0; }
.settings-page :deep(.p-tablist) {
  overflow: hidden;
  border: 1px solid #e1e6ec;
  border-radius: 13px 13px 0 0;
  background: #fff;
  box-shadow: 0 4px 14px rgba(30, 41, 59, .045);
}
.settings-page :deep(.p-tablist-tab-list) { border: 0; background: transparent; }
.settings-page :deep(.p-tab) {
  display: flex;
  min-width: 155px;
  justify-content: center;
  gap: 8px;
  padding: 15px 20px;
  border-width: 0 0 3px;
  color: #707b8d;
  font-size: .92rem;
  font-weight: 700;
}
.settings-page :deep(.p-tab:hover) { color: var(--kiwi-dark); background: #fbfdef; }
.settings-page :deep(.p-tab-active) { color: var(--kiwi-dark); border-color: var(--kiwi); background: #f8fbe9; }
.settings-page :deep(.p-tabpanels) {
  padding: 22px;
  border: 1px solid #e1e6ec;
  border-top: 0;
  border-radius: 0 0 13px 13px;
  background: #f6f8fa;
}

.settings-page :deep(.surface-50) { background: transparent !important; }
.settings-page :deep(.surface-border) { border-color: #e1e6ec !important; }
.settings-page :deep(.shadow-sm) { box-shadow: 0 3px 12px rgba(30, 41, 59, .045) !important; }
.settings-page :deep(.bg-white) { border-radius: 12px !important; }
.settings-page :deep(h5.text-primary) {
  padding-bottom: 11px;
  border-bottom: 1px solid #edf0f3;
  color: #445064 !important;
  font-size: 1rem;
  letter-spacing: .01em;
}
.settings-page :deep(h5.text-primary i) { color: var(--kiwi-dark); }
.settings-page :deep(.p-inputtext),
.settings-page :deep(.p-inputnumber),
.settings-page :deep(.p-select),
.settings-page :deep(.p-password) { border-radius: 8px; }
.settings-page :deep(.p-inputtext:focus),
.settings-page :deep(.p-select.p-focus) { border-color: var(--kiwi); box-shadow: 0 0 0 2px rgba(156, 193, 10, .13); }
.settings-page :deep(.p-button:not(.p-button-text)) { border-color: var(--kiwi-dark); background: var(--kiwi-dark); }
.settings-page :deep(.p-button:not(.p-button-text):hover) { border-color: #526f04; background: #526f04; }

.master-data { min-height: 410px; }
.master-data-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 22px; padding: 22px 24px; border: 1px solid #e5ead4; border-radius: 14px; background: linear-gradient(135deg,#fff 0%,#fbfdef 100%); }
.master-eyebrow { color: var(--kiwi-dark); font-size: .76rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.master-data-header h2 { margin: 5px 0 4px; color: #263144; font-size: 1.3rem; }
.master-data-header p { margin: 0; color: #7b8595; font-size: .92rem; }
.master-summary { display: grid; grid-template-columns: auto auto; align-items: center; column-gap: 8px; min-width: 118px; padding: 11px 15px; border-radius: 11px; color: var(--kiwi-dark); background: #f0f7d5; }
.master-summary i { grid-row: 1 / 3; font-size: 1.25rem; }
.master-summary strong { font-size: 1.05rem; line-height: 1; }
.master-summary span { color: #77805d; font-size: .73rem; }
.master-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 16px; }
.master-card { --card-color: #648506; display: flex; min-height: 225px; flex-direction: column; align-items: flex-start; padding: 20px; border: 1px solid #e0e5eb; border-radius: 14px; color: #263144; background: #fff; text-align: left; cursor: pointer; box-shadow: 0 4px 14px rgba(30,41,59,.055); transition: transform 180ms ease,border-color 180ms ease,box-shadow 180ms ease; }
.master-card:hover { transform: translateY(-4px); border-color: var(--card-color); box-shadow: 0 14px 27px rgba(30,41,59,.11); }
.master-card:focus-visible { outline: 2px solid var(--card-color); outline-offset: 2px; }
.master-card--tax { --card-color: #dc7c22; }
.master-card--certificate { --card-color: #2875b6; }
.master-card--family { --card-color: #719808; }
.master-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 12px; color: #fff; background: var(--card-color); box-shadow: 0 6px 13px color-mix(in srgb,var(--card-color) 28%,transparent); }
.master-icon i { font-size: 1.25rem; }
.master-copy { display: flex; flex: 1; flex-direction: column; gap: 7px; margin-top: 17px; }
.master-copy strong { font-size: 1.05rem; }
.master-copy small { color: #778192; font-size: .88rem; line-height: 1.48; }
.master-action { display: flex; width: 100%; align-items: center; justify-content: space-between; margin-top: 17px; padding-top: 13px; border-top: 1px solid #edf0f3; color: var(--card-color); font-size: .84rem; font-weight: 800; }
.master-action i { font-size: .7rem; transition: transform 150ms ease; }
.master-card:hover .master-action i { transform: translateX(3px); }
.master-note { display: flex; align-items: center; gap: 9px; margin-top: 18px; padding: 12px 15px; border: 1px dashed #d8dee6; border-radius: 10px; color: #7d8797; background: #fafbfc; font-size: .84rem; }
.master-note i { color: var(--kiwi-dark); }
.document-root-warning { display:flex; align-items:flex-start; gap:9px; margin-top:12px; padding:12px 14px; border:1px solid #efd99d; border-radius:9px; color:#735b18; background:#fff9e8; font-size:.84rem; line-height:1.45; }
.document-root-warning i { margin-top:2px; color:#a97800; }

@media (max-width: 760px) {
  .settings-page { padding: 16px 14px 84px; }
  .settings-header { align-items: flex-start; }
  .settings-title p { display: none; }
  .settings-page :deep(.p-tab) { min-width: auto; flex: 1; padding: 13px 9px; }
  .settings-page :deep(.p-tab span) { display: none; }
  .settings-page :deep(.p-tabpanels) { padding: 12px; }
  .master-data-header { align-items: flex-start; }
  .master-summary { display: none; }
  .master-grid { grid-template-columns: 1fr; }
  .master-card { min-height: 190px; }
}
</style>

<script setup lang="ts">
import AiSettingsPanel from './AiSettingsPanel.vue';
import { useAuthStore } from '@/stores/authStore';
const aiAuth=useAuthStore();
import { onMounted, ref, watch } from 'vue';
import Password from 'primevue/password';
import { useRouter } from 'vue-router';
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button';
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
import 'primeicons/primeicons.css';
import Frm_FamiliasProductos from '../../Frm_Products/Frm_FamiliasProductos/Frm_FamiliaProductos.vue';


const activeTab = ref<string>('0');
const route = useRoute();
const router = useRouter();
const { formData, loading, testingSmtp, testSmtpConnection, saveData, provincias, loadData, onUploadLogo, baseUrl, handleImageError, handleImageLoad, openUserDialog } = Frm_Ajustes();
const familiasProductosRef = ref<InstanceType<typeof Frm_FamiliasProductos> | null>(null);

onMounted(() => {
  loadData();
});


const updateActiveTab = function (queryTab: any): void {
  if (queryTab) {
    const requested=String(queryTab);
    activeTab.value=requested==='4'&&!aiAuth.user?.admin?'0':requested;
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
watch(() => aiAuth.user?.admin, isAdmin => { if(!isAdmin&&activeTab.value==='4')activeTab.value='0'; });


function openSalesTax() {

  router.push({
    name: 'Taxas'
  });

}


const openCertificates = () => {
  router.push('/security/Frm_Certificates');
};






const openFamiliasProductos = () => {
    router.push({
        name: 'FamiliasProductos'       
    });
};

</script>
