<template>
  <main class="settings-page">
    <header class="page-header">
      <div class="title-wrap"><span class="icon"><i class="pi pi-sliders-h" /></span><div><small>KiwiKERP / Ventas</small><h1>Ajustes de Ventas</h1></div></div>
      <div class="actions"><Button label="Volver" icon="pi pi-arrow-left" text severity="secondary" @click="router.push({name:'Ventas'})"/><Button label="Guardar cambios" icon="pi pi-save" :loading="saving" @click="save"/></div>
    </header>

    <div v-if="loading" class="loading"><i class="pi pi-spin pi-spinner"/> Cargando ajustes…</div>
    <Tabs v-else v-model:value="activeTab" class="sales-tabs">
      <TabList>
        <Tab value="general"><i class="pi pi-cog"/> Parámetros generales</Tab>
        <Tab value="verifactu"><i class="pi pi-shield"/> Parámetros VeriFactu</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="general">
          <section class="settings-card settings-card--first">
            <div class="section-heading"><span><i class="pi pi-hashtag"/></span><div><h2>Numeración de facturas</h2><p>Serie utilizada al emitir una factura definitiva.</p></div></div>
            <div class="series-row"><label class="field"><span>Prefijo de serie</span><InputText v-model="form.invoiceSeriesPrefix" maxlength="10" @update:modelValue="normalizeInvoiceSeries" fluid/></label><div class="series-preview"><small>Ejemplo del número resultante</small><strong>FC-{{ form.invoiceSeriesPrefix || 'KW' }}-{{ currentYear }}/0001</strong></div></div>
            <Message severity="warn" :closable="false" class="series-warning">Cambiar la serie solo afecta a las facturas que se emitan después de guardar. Las facturas ya emitidas conservan su número.</Message>
          </section>

          <section class="settings-card">
            <div class="section-heading"><span><i class="pi pi-file-edit"/></span><div><h2>Condiciones generales de venta</h2><p>Texto predeterminado que se incorpora al crear un presupuesto y continúa en el circuito comercial.</p></div></div>
            <label class="field"><span>Condiciones generales</span><Textarea v-model="form.defaultTerms" rows="9" autoResize fluid placeholder="Condiciones generales aplicables a los documentos de venta"/><small class="field-help">Modificar este texto afecta a los nuevos documentos. Los documentos ya creados conservan su copia.</small></label>
          </section>

          <section class="settings-card">
            <div class="section-heading"><span><i class="pi pi-envelope"/></span><div><h2>Comunicación de presupuestos</h2><p>Contenido predeterminado utilizado al enviar un presupuesto por correo.</p></div></div>
            <label class="field"><span>Cuerpo del correo de presupuestos</span><Textarea v-model="form.offersMailBody" rows="5" maxlength="500" autoResize fluid placeholder="Si se deja vacío se utilizará el texto estándar del sistema."/><small class="field-help">{{ (form.offersMailBody || '').length }}/500 caracteres</small></label>
          </section>

          <Message severity="secondary" :closable="false" class="customer-note"><strong>Condiciones particulares:</strong> se configuran individualmente en la ficha de cada cliente, dentro de su pestaña de Ventas. No son un parámetro general.</Message>
        </TabPanel>

        <TabPanel value="verifactu">
          <Message severity="success" :closable="false"><strong>Entorno de pruebas VeriFactu.</strong> Los envíos están limitados al portal de pruebas de la AEAT. Producción permanece bloqueada.</Message>
      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-shield"/></span><div><h2>Funcionamiento de VeriFactu</h2><p>Controla la generación y el envío de los registros de facturación.</p></div></div>
        <div class="form-grid">
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuEnabled"/><span><strong>VeriFactu activo</strong><small>Prepara el registro al confirmar una factura.</small></span></label>
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuAutoSend" :disabled="!form.veriFactuEnabled"/><span><strong>Envío automático</strong><small>Procesa automáticamente la cola pendiente.</small></span></label>
          <label class="field"><span>Entorno</span><Select v-model="form.veriFactuEnvironment" :options="environments" optionLabel="label" optionValue="value" disabled fluid/></label>
          <label class="field"><span>Reintentos automáticos</span><InputNumber v-model="form.veriFactuRetries" :min="0" :max="10" fluid/></label>
          <label class="field"><span>Espera entre reintentos</span><InputNumber v-model="form.veriFactuRetryMinutes" suffix=" min" :min="1" :max="1440" fluid/></label>
          <label class="field"><span>Últimas aceptadas visibles</span><InputNumber v-model="form.veriFactuAcceptedVisible" suffix=" facturas" :min="1" :max="100" fluid/><small class="field-help">Límite de facturas correctas mostrado en el panel de la cola.</small></label>
        </div>
      </section>

      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-building"/></span><div><h2>Identificación del sistema informático</h2><p>Datos que KiwiKERP incorpora a los registros enviados a la AEAT.</p></div></div>
        <div class="form-grid form-grid--three">
          <label class="field"><span>ID del sistema</span><InputNumber v-model="form.veriFactuSystemId" :min="1" fluid/></label>
          <label class="field field--wide"><span>Entidad responsable</span><InputText v-model="form.veriFactuSystemEntity" fluid/></label>
          <label class="field"><span>NIF</span><InputText v-model="form.veriFactuSystemNif" fluid/></label>
          <label class="field"><span>Nombre del sistema</span><InputText v-model="form.veriFactuSystemName" fluid/></label>
          <label class="field"><span>Versión</span><InputText v-model="form.veriFactuSystemVersion" fluid/></label>
          <label class="field"><span>Número de instalación</span><InputNumber v-model="form.veriFactuInstallationNumber" :min="1" fluid/></label>
        </div>
      </section>

      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-qrcode"/></span><div><h2>PDF y código QR</h2><p>Presentación del código VeriFactu en la factura definitiva.</p></div></div>
        <div class="form-grid form-grid--four">
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuAddQr"/><span><strong>Añadir QR al PDF</strong><small>Incluye también el distintivo VeriFactu.</small></span></label>
          <label class="field"><span>Tamaño</span><InputNumber v-model="form.veriFactuQrSize" suffix=" px" :min="40" :max="300" fluid/></label>
          <label class="field"><span>Posición X</span><InputNumber v-model="form.veriFactuQrX" :min="0" fluid/></label>
          <label class="field"><span>Posición Y</span><InputNumber v-model="form.veriFactuQrY" :min="0" fluid/></label>
        </div>
      </section>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Select from 'primevue/select';
import Message from 'primevue/message';
import Textarea from 'primevue/textarea';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';

const router=useRouter(),toast=useToast(),loading=ref(true),saving=ref(false),activeTab=ref('general');
const environments=[{label:'Pruebas · AEAT preproducción',value:'PRUEBAS'}];
const currentYear=new Date().getFullYear();
const form=reactive<any>({invoiceSeriesPrefix:'KW',defaultTerms:'',offersMailBody:'',veriFactuEnabled:true,veriFactuEnvironment:'PRUEBAS',veriFactuAutoSend:true,veriFactuSystemId:77,veriFactuSystemEntity:'',veriFactuSystemNif:'',veriFactuSystemName:'KiwiKERP',veriFactuSystemVersion:'',veriFactuInstallationNumber:300,veriFactuAddQr:true,veriFactuQrSize:95,veriFactuQrX:350,veriFactuQrY:740,veriFactuRetries:3,veriFactuRetryMinutes:10,veriFactuAcceptedVisible:20});
const normalizeInvoiceSeries=(value:string|undefined)=>{form.invoiceSeriesPrefix=String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)};
const load=async()=>{loading.value=true;try{Object.assign(form,(await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesSettings`)).data)}catch(e:any){toast.add({severity:'error',summary:'No se pudieron cargar los ajustes',detail:e.response?.data||'Comprueba que la migración de base de datos está aplicada.',life:5000})}finally{loading.value=false}};
const save=async()=>{saving.value=true;try{Object.assign(form,(await axios.post(`${import.meta.env.VITE_API_URL}/WebSaveSalesSettings`,form)).data);toast.add({severity:'success',summary:'Ajustes guardados',detail:'La configuración de Ventas y VeriFactu ya está actualizada.',life:3500})}catch(e:any){toast.add({severity:'error',summary:'No se pudieron guardar',detail:e.response?.data||'Revisa los valores introducidos.',life:5000})}finally{saving.value=false}};
onMounted(load);
</script>

<style scoped>
.settings-page{width:100%;padding:18px 16px 90px;color:#273244}.page-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:14px;padding:15px 18px;border:1px solid #e1e7d4;border-radius:14px;background:#fff;box-shadow:0 5px 16px rgba(31,41,55,.05)}.title-wrap,.actions,.section-heading,.switch-field{display:flex;align-items:center}.title-wrap{gap:12px}.title-wrap .icon{display:grid;width:45px;height:45px;place-items:center;border-radius:11px;color:#fff;background:linear-gradient(135deg,#b1d70e,#719808)}.title-wrap small{color:#8b95a4}.title-wrap h1{margin:2px 0 0;font-size:1.35rem}.actions{gap:6px}.sales-tabs{overflow:hidden;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}.sales-tabs :deep(.p-tabpanels){padding:14px;background:#f7f9f5}.sales-tabs :deep(.p-tab){gap:7px}.settings-card{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}.settings-card--first{margin-top:0}.section-heading{gap:11px;margin-bottom:20px}.section-heading>span{display:grid;width:37px;height:37px;place-items:center;border-radius:9px;color:#66810a;background:#eef5dc}.section-heading h2{margin:0;font-size:1rem}.section-heading p{margin:3px 0 0;color:#7c8796;font-size:.82rem}.series-row{display:grid;grid-template-columns:minmax(220px,.55fr) 1fr;gap:24px;align-items:end}.series-preview{display:flex;min-height:67px;flex-direction:column;justify-content:center;padding:10px 14px;border:1px solid #dfe8c8;border-radius:9px;background:#f8fbeF}.series-preview small{color:#7a8594}.series-preview strong{margin-top:4px;color:#607d09;font-size:1.08rem}.series-warning{margin-top:14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 22px}.form-grid--three{grid-template-columns:repeat(3,minmax(0,1fr))}.form-grid--four{grid-template-columns:1.3fr repeat(3,minmax(0,1fr))}.field{display:flex;min-width:0;flex-direction:column;gap:7px}.field>span{color:#596577;font-size:.78rem;font-weight:750}.field--wide{grid-column:span 2}.field-help{color:#89929f;font-size:.72rem}.switch-field{gap:11px;min-height:55px;padding:10px 12px;border:1px solid #e7ebef;border-radius:9px;background:#fafbf9}.switch-field span{display:flex;flex-direction:column;gap:2px}.switch-field strong{font-size:.84rem}.switch-field small{color:#7c8795;font-size:.72rem}.customer-note{margin-top:14px}.loading{display:flex;justify-content:center;gap:9px;padding:60px;color:#758092}@media(max-width:900px){.form-grid,.form-grid--three,.form-grid--four{grid-template-columns:repeat(2,minmax(0,1fr))}.field--wide{grid-column:auto}}@media(max-width:620px){.page-header{align-items:flex-start;flex-direction:column}.actions{width:100%;justify-content:flex-end}.form-grid,.form-grid--three,.form-grid--four,.series-row{grid-template-columns:1fr}}
</style>
