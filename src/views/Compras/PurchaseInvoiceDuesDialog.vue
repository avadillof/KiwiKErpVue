<template>
  <Dialog v-model:visible="visible" modal maximizable :style="{ width: 'min(860px,96vw)' }" class="kiwik-dialog">
    <template #header><b><i class="pi pi-calendar" /> Vencimientos · {{ invoice?.code }}</b></template>
    <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
    <p v-if="loading">Cargando vencimientos…</p>
    <template v-else-if="!error">
      <Message v-if="locked" severity="info" :closable="false">{{ lockedMessage }}</Message>
      <Message v-else severity="info" :closable="false">Fracciona el total en plazos. La suma debe cuadrar con el total de la factura; el último plazo fija su vencimiento.</Message>
      <DataTable :value="rows" size="small" stripedRows>
        <Column header="#" style="width:3rem"><template #body="{ index }">{{ index + 1 }}</template></Column>
        <Column header="Fecha" style="width:220px"><template #body="{ data }"><DatePicker v-if="!locked" v-model="data.dueDate" dateFormat="dd/mm/yy" showIcon fluid /><span v-else>{{ formatDate(data.dueDate) }}</span></template></Column>
        <Column header="Importe" style="text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="!locked" v-model="data.amount" :min="0.01" :minFractionDigits="2" :maxFractionDigits="2" mode="currency" currency="EUR" locale="de-DE" fluid inputClass="text-right" /><b v-else>{{ amount(data.amount) }}</b></template></Column>
        <Column v-if="!locked" style="width:3.5rem"><template #body="{ data }"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar plazo" :disabled="rows.length <= 1" @click="removeRow(data)" /></template></Column>
      </DataTable>
      <div v-if="!locked" class="dues-actions"><Button label="Añadir plazo" icon="pi pi-plus" size="small" text @click="addRow" /><span class="dues-sum" :class="{ 'dues-sum--error': !sumsUp }">Suma {{ amount(sum) }} / Total {{ amount(invoice?.totalTotal) }}</span></div>
    </template>
    <template #footer><div class="dialog-actions"><Button label="Cerrar" severity="secondary" text @click="visible = false" /><Button v-if="!locked" label="Guardar vencimientos" icon="pi pi-save" :disabled="!sumsUp || !rows.length" :loading="saving" @click="save" /></div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import { computed, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import InputNumber from 'primevue/inputnumber';
import Message from 'primevue/message';

const emit = defineEmits<{ saved: [invoice: any] }>();
const toast = useToast();
const visible = ref(false), loading = ref(false), saving = ref(false), error = ref('');
const invoice = ref<any>(null), rows = ref<any[]>([]);
const locked = computed(() => invoice.value?.state === 'Cancelada / Canceled' || invoice.value?.paid === true);
const lockedMessage = computed(() => invoice.value?.state === 'Cancelada / Canceled' ? 'Factura anulada: los vencimientos son de solo lectura.' : 'Factura pagada: los vencimientos son de solo lectura.');
const formatDate = (v: any) => {
  const d = toDate(v);
  return d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '-';
};
const amount = (v: any) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(Number(v) || 0);
const toDate = (v: any): Date | null => {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  if (typeof v === 'number') { const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
};
const sum = computed(() => rows.value.reduce((total, row) => total + Number(row.amount || 0), 0));
const sumsUp = computed(() => rows.value.length > 0 && rows.value.every(row => toDate(row.dueDate) !== null && Number(row.amount) > 0) && Math.abs(sum.value - Number(invoice.value?.totalTotal || 0)) < 0.015);
const addRow = () => {
  const remaining = Number(invoice.value?.totalTotal || 0) - sum.value;
  rows.value.push({ dueDate: new Date(), amount: Math.max(0, Math.round(remaining * 100) / 100) });
};
const removeRow = (row: any) => { rows.value = rows.value.filter(r => r !== row); };
async function open(item: any) {
  invoice.value = item;
  error.value = '';
  rows.value = [];
  visible.value = true;
  loading.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetPurchasesInvoiceDues/${item.pkid}`));
    rows.value = (data.dues || []).map((row: any) => ({ dueDate: toDate(row.due), amount: Number(row.amount || 0) }));
    if (!rows.value.length) rows.value = [{ dueDate: new Date(), amount: Number(item.totalTotal || 0) }];
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudieron consultar los vencimientos.';
  } finally { loading.value = false; }
}
async function save() {
  if (!sumsUp.value || saving.value) return;
  saving.value = true;
  error.value = '';
  try {
    const pad = (n: number) => String(n).padStart(2, '0');
    const { data } = await axios.post(backendUrl(`/WebSavePurchasesInvoiceDues`), {
      invoiceId: invoice.value.pkid,
      dues: rows.value.map((row: any) => {
        const d: Date = toDate(row.dueDate) as Date;
        return { due: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, amount: Math.round(Number(row.amount) * 100) / 100 };
      }),
    });
    toast.add({ severity: 'success', summary: 'Vencimientos guardados', life: 3000 });
    visible.value = false;
    emit('saved', data);
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudieron guardar los vencimientos.';
  } finally { saving.value = false; }
}
defineExpose({ open });
</script>

<style scoped>
.dues-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 0.7rem; }
.dues-sum { font-weight: 700; }
.dues-sum--error { color: #b93a3a; }
.dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; width: 100%; }
:deep(th.text-right .p-datatable-column-header-content) { justify-content: flex-end; }
</style>
