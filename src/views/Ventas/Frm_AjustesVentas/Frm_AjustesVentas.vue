<template>
  <main class="settings-page">
    <header class="page-header">
      <div class="title-wrap"><span class="icon"><i class="pi pi-sliders-h" /></span><div><small>KiwiKERP / Ventas</small><h1>Ajustes de Ventas</h1></div></div>
      <div class="actions"><Button label="Volver" icon="pi pi-arrow-left" text severity="secondary" @click="router.push({name:'Ventas'})"/><Button label="Guardar cambios" icon="pi pi-save" :loading="saving" :disabled="loading || !loaded || !!deliveryError || !!reminderBusy || quoteBusy || !!quoteError" @click="save"/></div>
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

          <section class="settings-card">
            <div class="section-heading"><span><i class="pi pi-bell"/></span><div><h2>Recordatorio diario de entregas</h2><p>Un único correo por día y dirección de responsable, agrupando los pedidos que creó.</p></div></div>
            <div class="form-grid form-grid--three">
              <label class="switch-field"><ToggleSwitch v-model="form.deliveryReminderEnabled" aria-label="Activar recordatorio de entregas"/><span><strong>Recordatorio activado</strong><small>Puede pausarse sin cambiar el filtro de pedidos.</small></span></label>
              <label class="field"><span>Hora de envío (Europe/Madrid)</span><InputText aria-label="Hora de envío" type="time" v-model="form.deliveryReminderTime" :disabled="!form.deliveryReminderEnabled" fluid/><small class="field-help">Hora peninsular, con cambio de horario automático.</small></label>
              <label class="field"><span>Días de antelación</span><InputNumber aria-label="Días de antelación" v-model="form.deliveryReminderDays" :min="0" :max="365" :maxFractionDigits="0" :disabled="!form.deliveryReminderEnabled" fluid/><small class="field-help">0 incluye solo vencidos y los que vencen hoy.</small></label>
            </div>
            <Message severity="info" :closable="false" class="series-warning"><template v-if="form.deliveryReminderEnabled">A las <b>{{form.deliveryReminderTime}}</b>, cada responsable recibe sus pedidos vencidos, los de hoy y los previstos hasta dentro de <b>{{form.deliveryReminderDays}} días</b>.</template><template v-else>Recordatorio automático pausado. El envío manual sigue disponible.</template></Message>
            <p class="delivery-help">Solo pedidos confirmados con productos físicos pendientes. Se excluyen borradores, cancelados, completados y pedidos sin fecha prevista. El usuario creador debe estar activo y tener correo. El aviso no genera albaranes ni modifica pedidos.</p>
            <p class="delivery-help">Los cambios se aplican después de guardar, sin reiniciar. Si la hora ya pasó, el próximo aviso será al día siguiente. El servidor debe estar en marcha a la hora de envío. No se repite el envío del mismo día al cambiar la hora o reiniciar el servidor. Ante un fallo o resultado incierto del correo no se reintenta ese día para evitar duplicados; la incidencia queda en el registro del servidor.</p>
            <div class="reminder-actions">
              <Button label="Probar" icon="pi pi-eye" severity="secondary" :loading="reminderBusy==='preview'" :disabled="reminderBlocked" @click="openReminder(true)"/>
              <Button label="Enviar ahora" icon="pi pi-send" :loading="reminderBusy==='send'" :disabled="reminderBlocked" @click="openReminder(false)"/>
            </div>
            <p class="delivery-help">Probar muestra destinatarios y pedidos sin enviar correos ni comprobar SMTP. Enviar ahora utiliza la configuración guardada, incluso con el automático pausado, y respeta los envíos ya intentados hoy.</p>
            <Message v-if="reminderDirty" severity="warn" :closable="false">Guarda los cambios del recordatorio antes de probar o enviar.</Message>
            <Message v-if="reminderError" severity="error" :closable="false">{{reminderError}}</Message>
            <div v-if="reminderResult" class="reminder-results" aria-live="polite">
              <h3>{{reminderResult.preview?'Prueba sin envío':'Resultado del envío manual'}} · {{formatCalendarDate(reminderResult.date)}}</h3>
              <p>Antelación guardada: {{reminderResult.days}} días · {{reminderResult.recipients.length}} destinatarios.</p>
              <p v-if="!reminderResult.preview">Enviados: {{reminderResult.sent}} · Omitidos: {{reminderResult.skipped}} · Fallos: {{reminderResult.failed}}</p>
              <p v-if="!reminderResult.recipients.length">No hay pedidos pendientes con destinatario válido para este intervalo.</p>
              <details v-for="recipient in reminderResult.recipients" :key="recipient.email">
                <summary>{{recipient.name}} · {{recipient.email}} · {{recipient.orders.length}} pedidos · {{reminderStatus(recipient.status)}}</summary>
                <p v-if="recipient.warning">{{recipient.warning}}</p>
                <ul><li v-for="(order,index) in recipient.orders" :key="index">{{order.code}} · {{order.client}} · {{formatCalendarDate(order.deliveryDate)}} · {{order.status}} · Pendiente: {{order.pendingQuantity}}</li></ul>
              </details>
            </div>
          </section>
          <section class="settings-card">
            <div class="section-heading"><span><i class="pi pi-calendar"/></span><div><h2>Filtro «Plazo entrega» de pedidos</h2><p>Configura los dos intervalos de planificación. No cambian las fechas de los pedidos.</p></div></div>
            <div class="form-grid">
              <label class="field"><span>Primer plazo</span><InputNumber aria-label="Primer plazo" v-model="form.deliveryDeadlineShortDays" suffix=" días" :min="1" :max="364" :maxFractionDigits="0" fluid/><small class="field-help">También determina cuántos días se resaltan en ámbar.</small></label>
              <label class="field"><span>Segundo plazo</span><InputNumber aria-label="Segundo plazo" v-model="form.deliveryDeadlineLongDays" suffix=" días" :min="2" :max="365" :maxFractionDigits="0" fluid/><small class="field-help">Debe ser mayor que el primer plazo.</small></label>
            </div>
            <p class="delivery-help">El filtro ofrece: Vencidos · Vencen hoy · Próximos {{form.deliveryDeadlineShortDays}} días · Próximos {{form.deliveryDeadlineLongDays}} días · Sin fecha prevista. Los intervalos incluyen hoy y el último día completo.</p>
            <Message v-if="deliveryError" severity="error" :closable="false">{{deliveryError}}</Message>
          </section>

          <QuoteAutomationSettings :form="form" :saved="savedQuotes" :disabled="loading || !loaded || saving || !!reminderBusy" :error="quoteError" @busy="quoteBusy=$event"/>
          <Message severity="secondary" :closable="false" class="customer-note"><strong>Condiciones particulares:</strong> se configuran individualmente en la ficha de cada cliente, dentro de su pestaña de Ventas. No son un parámetro general.</Message>
          <InvoiceReminderSettings/>
          <PaymentTermsSettings/>
          <section class="settings-card">
            <div class="section-heading"><span><i class="pi pi-tags"/></span><div><h2>Tarifas de venta</h2><p>Configura la moneda base, la tarifa predeterminada y las reglas de precios desde Lista de precios.</p></div></div>
            <div class="reminder-actions"><Button label="Abrir Lista de precios" icon="pi pi-tags" @click="router.push({name:'ListaPrecios'})"/></div>
          </section>
        </TabPanel>

        <TabPanel value="verifactu">
          <Message v-if="!form.veriFactuEnabled" severity="info" :closable="false">VeriFactu está desactivado. Sus campos están deshabilitados y no son obligatorios para guardar los ajustes de Ventas.</Message>
          <Message severity="success" :closable="false"><strong>Entorno de pruebas VeriFactu.</strong> Los envíos están limitados al portal de pruebas de la AEAT. Producción permanece bloqueada.</Message>
      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-shield"/></span><div><h2>Funcionamiento de VeriFactu</h2><p>Controla la generación y el envío de los registros de facturación.</p></div></div>
        <div class="form-grid">
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuEnabled"/><span><strong>VeriFactu activo</strong><small>Prepara el registro al confirmar una factura.</small></span></label>
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuAutoSend" :disabled="!form.veriFactuEnabled"/><span><strong>Envío automático</strong><small>Procesa automáticamente la cola pendiente.</small></span></label>
          <label class="field"><span>Entorno</span><Select v-model="form.veriFactuEnvironment" :options="environments" optionLabel="label" optionValue="value" disabled fluid/></label>
          <label class="field"><span>Reintentos automáticos</span><InputNumber v-model="form.veriFactuRetries" :min="0" :max="10" fluid :disabled="!form.veriFactuEnabled"/></label>
          <label class="field"><span>Espera entre reintentos</span><InputNumber v-model="form.veriFactuRetryMinutes" suffix=" min" :min="1" :max="1440" fluid :disabled="!form.veriFactuEnabled"/></label>
          <label class="field"><span>Últimas aceptadas visibles</span><InputNumber v-model="form.veriFactuAcceptedVisible" suffix=" facturas" :min="1" :max="100" fluid :disabled="!form.veriFactuEnabled"/><small class="field-help">Límite de facturas correctas mostrado en el panel de la cola.</small></label>
        </div>
      </section>

      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-building"/></span><div><h2>Identificación del sistema informático</h2><p>Identificación del desarrollador de KiwiKERP. Estos datos son de solo lectura y se incorporan a los registros enviados a la AEAT.</p></div></div>
        <div class="form-grid form-grid--three">
          <label class="field"><span>ID del sistema</span><InputNumber v-model="form.veriFactuSystemId" :min="1" fluid disabled/></label>
          <label class="field field--wide"><span>Entidad responsable</span><InputText v-model="form.veriFactuSystemEntity" disabled fluid/></label>
          <label class="field"><span>NIF</span><InputText v-model="form.veriFactuSystemNif" disabled fluid/></label>
          <label class="field"><span>Nombre del sistema</span><InputText v-model="form.veriFactuSystemName" disabled fluid/></label>
          <label class="field"><span>Versión</span><InputText v-model="form.veriFactuSystemVersion" disabled fluid/></label>
          <label class="field"><span>Número de instalación</span><InputNumber v-model="form.veriFactuInstallationNumber" :min="1" fluid disabled/></label>
        </div>
      </section>

      <section class="settings-card">
        <div class="section-heading"><span><i class="pi pi-qrcode"/></span><div><h2>PDF y código QR</h2><p>Presentación del código VeriFactu en la factura definitiva.</p></div></div>
        <div class="form-grid form-grid--four">
          <label class="switch-field"><ToggleSwitch v-model="form.veriFactuAddQr" :disabled="!form.veriFactuEnabled"/><span><strong>Añadir QR al PDF</strong><small>Incluye también el distintivo VeriFactu.</small></span></label>
          <label class="field"><span>Tamaño</span><InputNumber v-model="form.veriFactuQrSize" suffix=" px" :min="40" :max="300" fluid :disabled="!form.veriFactuEnabled"/></label>
          <label class="field"><span>Posición X</span><InputNumber v-model="form.veriFactuQrX" :min="0" fluid :disabled="!form.veriFactuEnabled"/></label>
          <label class="field"><span>Posición Y</span><InputNumber v-model="form.veriFactuQrY" :min="0" fluid :disabled="!form.veriFactuEnabled"/></label>
        </div>
      </section>
        </TabPanel>
      </TabPanels>
    </Tabs>
    <Dialog v-model:visible="confirmReminder" modal :header="reminderPreview ? 'Probar recordatorios sin enviar' : 'Enviar recordatorios ahora'" class="kiwik-dialog" :style="{width:'min(620px, 95vw)'}">
      <p v-if="!reminderPreview">Se enviarán correos reales a los responsables con pedidos pendientes, usando la configuración guardada. El envío manual funciona aunque el automático esté pausado.</p>
      <p v-if="!reminderPreview">No se repetirán los envíos ya intentados hoy. Los destinatarios se recalculan al confirmar; puedes revisarlos antes con Probar.</p>
      <p v-if="reminderPreview">Esta prueba consulta destinatarios, pedidos y envíos de hoy. No envía correos ni comprueba la conexión SMTP.</p>
      <p>Se utiliza la sesión iniciada en el portal. No es necesario volver a introducir la contraseña.</p>
      <div class="kiwik-separator"/>
      <template #footer><Button label="Cancelar" text severity="secondary" @click="confirmReminder=false"/><Button :label="reminderPreview ? 'Ejecutar prueba' : 'Confirmar envío'" :icon="reminderPreview ? 'pi pi-eye' : 'pi pi-send'" :disabled="reminderBlocked" @click="runReminder(reminderPreview)"/></template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import PaymentTermsSettings from "./PaymentTermsSettings.vue";
import InvoiceReminderSettings from "./InvoiceReminderSettings.vue";
import { formatCalendarDate } from '@/libs/HelperDates';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore';
import { useToast } from 'primevue/usetoast';
import axios from 'axios';
import QuoteAutomationSettings from './QuoteAutomationSettings.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
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

const router=useRouter(),toast=useToast(),loading=ref(true),loaded=ref(false),saving=ref(false),activeTab=ref('general');
const environments=[{label:'Pruebas · AEAT preproducción',value:'PRUEBAS'}];
const currentYear=new Date().getFullYear();
const form=reactive<any>({quoteReminderEnabled:true,quoteReminderTime:'08:00',quoteReminderDays:7,quoteReminderIncludeDrafts:true,quoteCancellationEnabled:true,quoteCancellationTime:'00:10',quoteCancellationIncludeDrafts:true,quoteCancellationNotifyOwner:true,quoteCancellationNotifyCustomer:true,deliveryReminderEnabled:true,deliveryReminderTime:'08:15',deliveryReminderDays:7,deliveryDeadlineShortDays:7,deliveryDeadlineLongDays:30,invoiceSeriesPrefix:'KW',defaultTerms:'',offersMailBody:'',veriFactuEnabled:true,veriFactuEnvironment:'PRUEBAS',veriFactuAutoSend:true,veriFactuSystemId:77,veriFactuSystemEntity:'',veriFactuSystemNif:'',veriFactuSystemName:'KiwiKERP',veriFactuSystemVersion:'',veriFactuInstallationNumber:1,veriFactuAddQr:true,veriFactuQrSize:95,veriFactuQrX:350,veriFactuQrY:740,veriFactuRetries:3,veriFactuRetryMinutes:10,veriFactuAcceptedVisible:20});
const quoteBusy=ref(false),savedQuotes=ref('');
const quoteSnapshot=()=>JSON.stringify(Object.keys(form).filter(k=>k.startsWith('quote')).sort().map(k=>[k,form[k]]));
const quoteError=computed(()=>{
  if(!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(form.quoteReminderTime||'')||!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(form.quoteCancellationTime||''))return 'Indica horas válidas de presupuestos (HH:mm).';
  if(!Number.isInteger(form.quoteReminderDays)||form.quoteReminderDays<0||form.quoteReminderDays>365)return 'La antelación de presupuestos debe estar entre 0 y 365 días.';
  return '';
});
const authStore=useAuthStore();
const reminderPreview=ref(true);
const openReminder=(preview:boolean)=>{if(preview){void runReminder(true);return;}reminderPreview.value=false;confirmReminder.value=true;};
const reminderBusy=ref(''),confirmReminder=ref(false),reminderError=ref(''),reminderResult=ref<any>(null),savedReminder=ref('');
const reminderSnapshot=()=>JSON.stringify([form.deliveryReminderEnabled,form.deliveryReminderTime,form.deliveryReminderDays,form.deliveryDeadlineShortDays,form.deliveryDeadlineLongDays]);
const reminderDirty=computed(()=>loaded.value && savedReminder.value!==reminderSnapshot());
const reminderBlocked=computed(()=>!loaded.value || loading.value || saving.value || !!reminderBusy.value || reminderDirty.value || !!deliveryError.value || quoteBusy.value);
const reminderStatus=(status:string)=>({READY:'Disponible para enviar',SENT:'Enviado',CLAIMED:'Reservado o en curso; no se repetirá hoy',FAILED:'Resultado incierto o fallido; no se repetirá hoy',SKIPPED:'Omitido: ya intentado hoy',ERROR:'No se pudo reservar el envío'}[status]||status);
const runReminder=async(preview:boolean)=>{
  if(reminderBlocked.value)return;
  confirmReminder.value=false;
  reminderBusy.value=preview?'preview':'send';reminderError.value='';reminderResult.value=null;
  try {
    const request=authStore.portalRequestConfig();
    const url=`${import.meta.env.VITE_API_URL}/${preview?'WebPreviewSalesDeliveryReminders':'WebSendSalesDeliveryReminders'}`;
    reminderResult.value=(preview?await axios.get(url,request):await axios.post(url,{confirmed:true},request)).data;
  } catch(e:any) {
    reminderError.value=e.response?.status===401||!authStore.portalSession?'La sesión ha caducado o es anterior a esta actualización. Vuelve a iniciar sesión en el portal.':preview?'No se pudo obtener la prueba. Comprueba el servidor y la sesión.':'No se pudo confirmar el resultado. Puede haber correos enviados: utiliza Probar para consultar el registro antes de volver a enviar. No se repetirán los ya reservados hoy.';
  } finally {reminderBusy.value='';}
};
const deliveryError=computed(()=>{
  if(!/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(form.deliveryReminderTime||''))return 'Indica una hora válida (HH:mm).';
  if(!Number.isInteger(form.deliveryReminderDays)||form.deliveryReminderDays<0||form.deliveryReminderDays>365)return 'La antelación debe estar entre 0 y 365 días.';
  if(!Number.isInteger(form.deliveryDeadlineShortDays)||!Number.isInteger(form.deliveryDeadlineLongDays)||form.deliveryDeadlineShortDays<1||form.deliveryDeadlineLongDays>365||form.deliveryDeadlineLongDays<=form.deliveryDeadlineShortDays)return 'El segundo plazo debe ser mayor que el primero; ambos entre 1 y 365 días.';
  return '';
});
const normalizeInvoiceSeries=(value:string|undefined)=>{form.invoiceSeriesPrefix=String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,10)};
const load=async()=>{loading.value=true;loaded.value=false;try{Object.assign(form,(await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesSettings`)).data);savedReminder.value=reminderSnapshot();savedQuotes.value=quoteSnapshot();loaded.value=true}catch(e:any){toast.add({severity:'error',summary:'No se pudieron cargar los ajustes',detail:e.response?.data||'Comprueba que la migración de base de datos está aplicada.',life:5000})}finally{loading.value=false}};
const save=async()=>{if(saving.value||loading.value||!loaded.value||deliveryError.value||reminderBusy.value||quoteBusy.value||quoteError.value)return;saving.value=true;try{Object.assign(form,(await axios.post(`${import.meta.env.VITE_API_URL}/WebSaveSalesSettings`,form)).data);savedReminder.value=reminderSnapshot();savedQuotes.value=quoteSnapshot();reminderResult.value=null;toast.add({severity:'success',summary:'Ajustes guardados',detail:'La configuración de Ventas y VeriFactu ya está actualizada.',life:3500})}catch(e:any){toast.add({severity:'error',summary:'No se pudieron guardar',detail:e.response?.data||'Revisa los valores introducidos.',life:5000})}finally{saving.value=false}};
onMounted(load);
</script>

<style scoped>
.settings-page{width:100%;padding:18px 16px 90px;color:#273244}.page-header{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:14px;padding:15px 18px;border:1px solid #e1e7d4;border-radius:14px;background:#fff;box-shadow:0 5px 16px rgba(31,41,55,.05)}.title-wrap,.actions,.section-heading,.switch-field{display:flex;align-items:center}.title-wrap{gap:12px}.title-wrap .icon{display:grid;width:45px;height:45px;place-items:center;border-radius:11px;color:#fff;background:linear-gradient(135deg,#b1d70e,#719808)}.title-wrap small{color:#8b95a4}.title-wrap h1{margin:2px 0 0;font-size:1.35rem}.actions{gap:6px}.sales-tabs{overflow:hidden;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}.sales-tabs :deep(.p-tabpanels){padding:14px;background:#f7f9f5}.sales-tabs :deep(.p-tab){gap:7px}.settings-card{margin-top:14px;padding:20px;border:1px solid #e1e6eb;border-radius:13px;background:#fff;box-shadow:0 3px 11px rgba(30,41,59,.04)}.settings-card--first{margin-top:0}.section-heading{gap:11px;margin-bottom:20px}.section-heading>span{display:grid;width:37px;height:37px;place-items:center;border-radius:9px;color:#66810a;background:#eef5dc}.section-heading h2{margin:0;font-size:1rem}.section-heading p{margin:3px 0 0;color:#7c8796;font-size:.82rem}.series-row{display:grid;grid-template-columns:minmax(220px,.55fr) 1fr;gap:24px;align-items:end}.series-preview{display:flex;min-height:67px;flex-direction:column;justify-content:center;padding:10px 14px;border:1px solid #dfe8c8;border-radius:9px;background:#f8fbeF}.series-preview small{color:#7a8594}.series-preview strong{margin-top:4px;color:#607d09;font-size:1.08rem}.series-warning{margin-top:14px}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px 22px}.form-grid--three{grid-template-columns:repeat(3,minmax(0,1fr))}.form-grid--four{grid-template-columns:1.3fr repeat(3,minmax(0,1fr))}.field{display:flex;min-width:0;flex-direction:column;gap:7px}.field>span{color:#596577;font-size:.78rem;font-weight:750}.field--wide{grid-column:span 2}.field-help{color:#89929f;font-size:.72rem}.switch-field{gap:11px;min-height:55px;padding:10px 12px;border:1px solid #e7ebef;border-radius:9px;background:#fafbf9}.switch-field span{display:flex;flex-direction:column;gap:2px}.switch-field strong{font-size:.84rem}.switch-field small{color:#7c8795;font-size:.72rem}.customer-note{margin-top:14px}.loading{display:flex;justify-content:center;gap:9px;padding:60px;color:#758092}@media(max-width:900px){.form-grid,.form-grid--three,.form-grid--four{grid-template-columns:repeat(2,minmax(0,1fr))}.field--wide{grid-column:auto}}@media(max-width:620px){.page-header{align-items:flex-start;flex-direction:column}.actions{width:100%;justify-content:flex-end}.form-grid,.form-grid--three,.form-grid--four,.series-row{grid-template-columns:1fr}}
.delivery-help{margin:.9rem 0 0;color:#657084;font-size:.85rem;line-height:1.6}.reminder-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:18px}.reminder-results{margin-top:18px;padding:16px;background:#f8faf5;border:1px solid #dfe8d0;border-radius:10px;overflow-wrap:anywhere}.reminder-results details{padding:10px 0;border-top:1px solid #e0e5da}.reminder-results summary{cursor:pointer}.reminder-results li{margin:6px 0}</style>
