<template>
  <Dialog v-model:visible="visible" modal maximizable :style="{ width: 'min(1250px,98vw)', height: '92vh' }" :contentStyle="{ height: 'calc(92vh - 130px)', overflowY: 'auto' }" class="kiwik-dialog">
    <template #header><b><i class="pi pi-wallet" /> Pagos · {{ data?.code }}</b></template>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <p v-if="loading">Cargando pagos…</p>
    <template v-else-if="data">
      <div class="pay-summary">
        <span>Total <b>{{ amount(data.total) }}</b></span>
        <span>Pagado <b>{{ amount(data.collectedAmount) }}</b></span>
        <span>Pendiente <b>{{ amount(data.pendingAmount) }}</b></span>
        <Tag :value="statusLabel" :severity="statusSeverity" rounded />
      </div>
      <h4>Historial</h4>
      <DataTable :value="data.history || []" size="small" stripedRows>
        <Column field="paymentDate" header="Fecha"><template #body="{ data: row }">{{ formatDate(row.paymentDate) }}</template></Column>
        <Column field="amount" header="Importe" style="text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data: row }"><b>{{ amount(row.amount) }}</b></template></Column>
        <Column field="method" header="Medio"><template #body="{ data: row }">{{ methodLabel(row.method) }}</template></Column>
        <Column field="reference" header="Referencia"><template #body="{ data: row }">{{ row.reference || '-' }}</template></Column>
        <Column field="reversed" header="Estado"><template #body="{ data: row }"><Tag :value="row.reversed ? 'Revertido' : 'Válido'" :severity="row.reversed ? 'danger' : 'success'" rounded /></template></Column>
        <Column style="width:3.5rem"><template #body="{ data: row }"><Button v-if="!row.reversed" icon="pi pi-undo" severity="danger" text rounded title="Revertir pago" @click="startReverse(row)" /></template></Column>
      </DataTable>
      <div v-if="reversing" class="reverse-box">
        <span>Revertir {{ amount(reversing.amount) }} del {{ formatDate(reversing.paymentDate) }}</span>
        <InputText v-model="reverseReason" placeholder="Motivo de la reversión *" maxlength="1000" fluid />
        <div class="reverse-actions"><Button label="Cancelar" text severity="secondary" @click="reversing = null" /><Button label="Confirmar reversión" icon="pi pi-undo" severity="danger" :loading="saving" :disabled="!reverseReason.trim()" @click="confirmReverse" /></div>
      </div>
      <h4 v-if="data.canReceivePayment">Registrar pago</h4>
      <div v-if="data.canReceivePayment" class="pay-form">
        <label class="field"><span>Importe *</span><InputNumber v-model="form.amount" :min="0.01" :max="data.pendingAmount" :minFractionDigits="2" :maxFractionDigits="2" mode="currency" currency="EUR" locale="de-DE" fluid inputClass="text-right" /></label>
        <label class="field"><span>Fecha *</span><DatePicker v-model="form.date" dateFormat="dd/mm/yy" showIcon fluid /></label>
        <label class="field"><span>Medio *</span><Select v-model="form.method" :options="methods" optionLabel="label" optionValue="value" fluid /></label>
        <label class="field"><span>Referencia</span><InputText v-model="form.reference" maxlength="200" fluid /></label>
        <label class="field field--wide"><span>Notas</span><Textarea v-model="form.notes" rows="3" maxlength="1000" :autoResize="false" class="w-full fixed-notes" /></label>
      </div>
    </template>
    <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cerrar" severity="secondary" text @click="visible = false" /><Button v-if="data?.canReceivePayment" label="Registrar pago" icon="pi pi-wallet" :disabled="!validForm" :loading="saving" @click="registerPayment" /></div></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';
import { computed, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';

const emit = defineEmits<{ saved: [] }>();
const toast = useToast();
const auth = useAuthStore();
const visible = ref(false), loading = ref(false), saving = ref(false), error = ref('');
const data = ref<any>(null);
const invoiceId = ref<number | null>(null);
const reversing = ref<any>(null);
const reverseReason = ref('');
const form = ref({ amount: 0, date: new Date() as Date | null, method: 'TRANSFER', reference: '', notes: '' });
const methods = [
  { label: 'Transferencia', value: 'TRANSFER' },
  { label: 'Efectivo', value: 'CASH' },
  { label: 'Tarjeta', value: 'CARD' },
  { label: 'Domiciliación', value: 'DIRECT_DEBIT' },
  { label: 'Cheque', value: 'CHEQUE' },
  { label: 'Otro', value: 'OTHER' },
];
const amount = (v: any) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(Number(v) || 0);
const methodLabel = (v: string) => methods.find(m => m.value === v)?.label || v || '-';
const statusLabel = computed(() => ({ PAID: 'Pagada', PARTIAL: 'Parcial', PENDING: 'Por pagar', NOT_APPLICABLE: 'No aplica' } as Record<string, string>)[data.value?.paymentStatus] || data.value?.paymentStatus || '');
const statusSeverity = computed(() => data.value?.paymentStatus === 'PAID' ? 'success' : data.value?.paymentStatus === 'PARTIAL' ? 'info' : 'warn');
const validForm = computed(() => Number(form.value.amount) > 0 && form.value.date instanceof Date && !!form.value.method);
const formatDate = (v: any) => {
  if (!v) return '-';
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? String(v) : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};
const userCode = () => auth.user?.userDsCode || '';
async function open(item: any) {
  invoiceId.value = item.pkid;
  error.value = '';
  reversing.value = null;
  visible.value = true;
  await load();
}
async function load() {
  if (!invoiceId.value) return;
  loading.value = true;
  error.value = '';
  try {
    const { data: result } = await axios.get(backendUrl(`/WebGetPurchasesInvoicePayments/${invoiceId.value}`), { params: { userCode: userCode() } });
    data.value = result;
    form.value.amount = Number(result.pendingAmount || 0);
    form.value.date = new Date();
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudieron cargar los pagos.';
  } finally { loading.value = false; }
}
const pad = (n: number) => String(n).padStart(2, '0');
async function registerPayment() {
  if (!validForm.value || !invoiceId.value || saving.value) return;
  saving.value = true;
  error.value = '';
  try {
    const d = form.value.date as Date;
    const { data: result } = await axios.post(backendUrl(`/WebRegisterPurchasesInvoicePayment/${invoiceId.value}`), {
      operationKey: crypto.randomUUID(),
      amount: Math.round(Number(form.value.amount) * 100) / 100,
      paymentDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      method: form.value.method,
      reference: form.value.reference,
      notes: form.value.notes,
      userCode: userCode(),
    });
    data.value = result;
    form.value.amount = Number(result.pendingAmount || 0);
    toast.add({ severity: 'success', summary: 'Pago registrado', life: 3000 });
    emit('saved');
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo registrar el pago.';
  } finally { saving.value = false; }
}
function startReverse(row: any) {
  reversing.value = row;
  reverseReason.value = '';
}
async function confirmReverse() {
  if (!reversing.value || !reverseReason.value.trim() || !invoiceId.value || saving.value) return;
  saving.value = true;
  error.value = '';
  try {
    const { data: result } = await axios.post(backendUrl(`/WebReversePurchasesInvoicePayment/${invoiceId.value}/${reversing.value.id}`), {
      reason: reverseReason.value.trim(),
      userCode: userCode(),
    });
    data.value = result;
    reversing.value = null;
    toast.add({ severity: 'success', summary: 'Pago revertido', life: 3000 });
    emit('saved');
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo revertir el pago.';
  } finally { saving.value = false; }
}
defineExpose({ open });
</script>

<style scoped>
.pay-summary { display: flex; align-items: center; gap: 1.4rem; flex-wrap: wrap; padding: 0.7rem 1rem; background: #fffaf5; border: 1px solid #f0ddc8; border-radius: 8px; margin-bottom: 1rem; }
.pay-summary b { margin-left: 0.4rem; }
.reverse-box { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.8rem; padding: 0.8rem; border: 1px solid #f3c1c1; border-radius: 8px; background: #fff5f5; }
.reverse-actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
.pay-form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.8rem; margin-top: 0.6rem; }
.pay-form .field { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; }
.pay-form .field > span { font-size: 0.8rem; color: #55604d; }
.pay-form .field--wide { grid-column: 1 / -1; }
.fixed-notes { height: 82px !important; min-height: 82px !important; max-height: 82px !important; resize: none !important; overflow-y: auto !important; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; width: 100%; }
.dialog-footer { width: 100%; }
.dialog-footer-separator { width: 100%; min-height: 1px; margin: 0 0 0.75rem; }
h4 { margin: 1rem 0 0.5rem; }
:deep(th.text-right .p-datatable-column-header-content) { justify-content: flex-end; }
</style>
