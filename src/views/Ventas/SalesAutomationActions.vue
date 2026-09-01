<template>
  <div class="automation-actions" :class="{ 'invoice-actions': module === 'invoices' }">
    <Button :label="module === 'invoices' ? 'Enviar recordatorio de vencimientos' : module === 'quotes' ? 'Enviar recordatorio interno' : 'Enviar recordatorio de entregas'" icon="pi pi-send" severity="secondary" outlined :size="module === 'invoices' ? undefined : 'small'" :disabled="busy || disabled" @click="open(module === 'invoices' ? 'invoice' : module === 'quotes' ? 'reminder' : 'delivery')" />
    <Button v-if="module === 'quotes'" label="Cancelar vencidos ahora" icon="pi pi-ban" severity="warn" outlined size="small" :disabled="busy" @click="open('cancellation')" />
  </div>
  <Dialog v-model:visible="visible" modal maximizable class="kiwik-dialog sales-automation-dialog" :style="{ width: 'min(1000px,95vw)', height: '82vh', maxHeight: '90vh' }" :closable="!busy" :closeOnEscape="!busy">
    <template #header><div class="automation-heading"><span><i :class="cancelling ? 'pi pi-calendar-times' : 'pi pi-bell'" /></span><div><b>{{ title }}</b><small>Automatizaciones de ventas</small></div></div></template>
    <Message severity="info" :closable="false">Se aplican los parámetros guardados en Ajustes, aunque la ejecución automática esté pausada. No se aplican los filtros ni la selección del listado. Los documentos se recalculan al confirmar.</Message>
    <Message v-if="cancelling" severity="warn" :closable="false">Se cancelarán y bloquearán los presupuestos vencidos elegibles. Los avisos habilitados se enviarán después; un fallo de correo no deshace la cancelación.</Message>
    <p v-else>El envío manual, Ajustes y la ejecución automática comparten el límite diario por destinatario. Los ya procesados o reservados no se reenvían.</p>
    <p v-if="action === 'reminder'">Este recordatorio es interno: se envía al usuario que creó el presupuesto, siempre que esté activo y tenga correo. No se envía al contacto del cliente.</p>
    <p v-if="action === 'invoice'">Aviso solo para los usuarios internos seleccionados en Ajustes. Incluye saldos pendientes de facturas aceptadas por VeriFactu y no anuladas. Nunca se envía al contacto del cliente.</p>
    <p v-if="busy" role="status"><i class="pi pi-spin pi-spinner" /> {{ executing ? 'Ejecutando…' : 'Consultando documentos y destinatarios…' }}</p>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <section v-if="result" aria-live="polite">
      <h3>{{ result.preview ? 'Consulta previa, sin cambios ni correos' : 'Resultado de la ejecución' }} · {{ formatCalendarDate(result.date) }}</h3>
      <p>{{ documentCount }} documentos evaluados · {{ recipientCount }} direcciones destinatarias.</p>
      <p v-if="result.dueCount !== undefined">{{ result.dueCount }} vencimientos con saldo pendiente.</p>
      <Message v-for="warning in result.warnings || []" :key="warning" severity="warn" :closable="false">{{ warning }}</Message>
      <p v-if="result.preview">{{ readyCount }} {{ cancelling ? 'presupuestos disponibles para cancelar' : 'destinatarios disponibles para envío' }}.</p>
      <p v-if="result.days !== undefined">Antelación guardada: {{ result.days }} días.</p>
      <p v-if="!result.preview">Enviados: {{ result.sent }} · Omitidos: {{ result.skipped }} · Fallos: {{ result.failed }}<template v-if="cancelling"> · Cancelados: {{ result.cancelled }} · Correos inciertos o fallidos: {{ result.mailFailed }}</template></p>
      <template v-if="cancelling">
        <details v-for="quote in result.quotes" :key="quote.id || quote.code">
          <summary>{{ quote.code }} · {{ quote.client }} · {{ formatCalendarDate(quote.validity) }} · {{ status(quote.status) }}</summary>
          <p v-if="quote.warning">{{ quote.warning }}</p>
          <ul><li v-for="recipient in quote.recipients" :key="recipient.email">{{ recipient.internal ? 'Responsable' : 'Cliente' }}: {{ recipient.name }} · {{ recipient.email }} · {{ recipient.status ? status(recipient.status) : 'Aviso previsto' }}</li></ul>
          <p v-if="!quote.recipients.length">Sin avisos previstos.</p>
        </details>
      </template>
      <template v-else>
        <details v-for="recipient in result.recipients" :key="recipient.email">
          <summary>{{ recipient.name }} · {{ recipient.email }} · {{ status(recipient.status) }}</summary>
          <p v-if="recipient.warning">{{ recipient.warning }}</p>
          <ul><li v-for="(document, index) in recipient.orders" :key="index">{{ document.code }} · {{ document.client }} · {{ formatCalendarDate(document.dueDate || document.validity || document.deliveryDate) }}<template v-if="action === 'invoice'"> · Plazo {{ document.position }} · {{ Number(document.pendingAmount).toLocaleString('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}) }} {{ document.currency }} pendientes · {{ document.status }}</template></li></ul>
        </details>
      </template>
      <p v-if="!(result.dueCount ?? documentCount)">No hay documentos que cumplan los criterios guardados.</p>
    </section>
    <template #footer>
      <div class="automation-footer">
        <div class="kiwik-separator" />
        <div class="automation-footer-buttons">
      <Button label="Cerrar" severity="secondary" text :disabled="busy" @click="visible = false" />
      <Button label="Actualizar consulta" icon="pi pi-refresh" severity="secondary" outlined :disabled="busy" @click="request(true)" />
      <Button v-if="result?.preview" :label="cancelling ? 'Confirmar cancelación' : 'Confirmar envío ahora'" :severity="cancelling ? 'danger' : 'primary'" :disabled="busy || !!error || !readyCount" @click="request(false)" />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatCalendarDate } from '@/libs/HelperDates';
import { computed, ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import { useAuthStore } from '@/stores/authStore';

defineProps<{ module: 'quotes' | 'orders' | 'invoices', disabled?: boolean }>();
const emit = defineEmits<{ executed: [] }>();
const auth = useAuthStore();
const visible = ref(false), busy = ref(false), executing = ref(false), error = ref('');
const action = ref<'reminder' | 'cancellation' | 'delivery' | 'invoice'>('reminder');
const result = ref<any>(null);
const cancelling = computed(() => action.value === 'cancellation');
const title = computed(() => action.value === 'invoice' ? 'Recordatorio interno de vencimientos de facturas' : cancelling.value ? 'Cancelar presupuestos vencidos' : action.value === 'delivery' ? 'Recordatorio diario de entregas' : 'Recordatorio interno de vencimiento de presupuestos');
const recipients = computed<any[]>(() => cancelling.value ? (result.value?.quotes ?? []).flatMap((quote: any) => quote.recipients) : result.value?.recipients ?? []);
const recipientCount = computed(() => new Set(recipients.value.map(recipient => recipient.email)).size);
const documentCount = computed(() => cancelling.value ? result.value?.quotes?.length ?? 0 : new Set(recipients.value.flatMap(recipient => recipient.orders.map((order: any) => order.code))).size);
const readyCount = computed(() => (cancelling.value ? result.value?.quotes ?? [] : recipients.value).filter((item: any) => item.status === 'READY').length);
const statuses: Record<string, string> = { READY: 'Disponible', SENT: 'Enviado', CLAIMED: 'Reservado o en curso', FAILED: 'Resultado incierto o fallido', SKIPPED: 'Omitido: ya procesado o no elegible', ERROR: 'No se pudo confirmar la operación', CANCELLED: 'Cancelado' };
const status = (value: string) => statuses[value] || value;

function open(kind: typeof action.value) {
  if (busy.value) return;
  action.value = kind;
  visible.value = true;
  void request(true);
}
async function request(preview: boolean) {
  if (busy.value || (!preview && (!result.value?.preview || error.value || !readyCount.value))) return;
  busy.value = true;
  executing.value = !preview;
  error.value = '';
  result.value = null;
  try {
    const endpoint = action.value === 'invoice' ? preview ? 'WebPreviewSalesInvoiceReminders' : 'WebSendSalesInvoiceReminders' : action.value === 'delivery'
      ? preview ? 'WebPreviewSalesDeliveryReminders' : 'WebSendSalesDeliveryReminders'
      : `${preview ? 'WebPreviewSalesQuoteAutomation' : 'WebRunSalesQuoteAutomation'}/${action.value}`;
    const url = `${import.meta.env.VITE_API_URL}/${endpoint}`;
    const config = auth.portalRequestConfig();
    result.value = (preview ? await axios.get(url, config) : await axios.post(url, { confirmed: true }, config)).data;
  } catch (failure: any) {
    error.value = failure.response?.status === 401 || !auth.portalSession
      ? 'La sesión ha caducado o es anterior a esta actualización. Vuelve a iniciar sesión en el portal.'
      : preview ? 'No se pudo obtener la consulta previa. Comprueba el backend y vuelve a consultar.'
        : 'Resultado no confirmado: puede haber cambios o correos enviados. Revisa los documentos y actualiza la consulta antes de repetir. Los envíos reservados no se reintentan hoy.';
  } finally {
    busy.value = false;
    executing.value = false;
    if (!preview) emit('executed');
  }
}
</script>

<style scoped>
.automation-actions { display:flex; flex-wrap:wrap; gap:.5rem; }
.invoice-actions { margin-right:.75rem; }
.automation-heading { display:flex; align-items:center; gap:11px; min-width:0; }
.automation-heading>span { display:grid; place-items:center; flex:0 0 37px; width:37px; height:37px; border-radius:9px; background:#eef5dc; color:#66810a; }
.automation-heading small { display:block; margin-top:4px; color:#7c8796; }
.automation-footer { width:100%; }
.automation-footer-buttons { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:8px; margin-top:12px; }
section { margin:1rem 0; overflow-wrap:anywhere; }
details { padding:.6rem 0; border-top:1px solid #e3e8dc; }
summary { cursor:pointer; }
li { margin:.4rem 0; }
:global(.sales-automation-dialog.kiwik-dialog .p-dialog-content){display:block!important;height:auto!important;min-height:0!important;overflow:auto!important;flex:1 1 auto!important}
:global(.sales-automation-dialog.kiwik-dialog .p-dialog-header),:global(.sales-automation-dialog.kiwik-dialog .p-dialog-footer){flex:0 0 auto!important}
</style>
