<template>
  <Dialog v-model:visible="visible" modal :closable="!busy" :closeOnEscape="!busy"
    :style="{ width: 'min(850px, 96vw)' }" class="kiwik-dialog">
    <template #header>
      <div class="heading"><i class="pi pi-check-circle" /><div>
        <strong>Registrar servicio realizado</strong>
        <small>{{ code }} · Incluido en mantenimiento</small>
      </div></div>
    </template>
    <div class="body">
      <Message severity="info" :closable="false">Selecciona los servicios realizados cubiertos por el mantenimiento. Se cerrarán sus cantidades pendientes sin facturación adicional.</Message>
      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <p v-if="loading">Consultando servicios…</p>
      <DataTable v-else v-model:selection="selected" :value="lines" dataKey="pkid" size="small">
        <Column selectionMode="multiple" headerStyle="width: 3rem" />
        <Column field="nameProduct" header="Servicio" />
        <Column header="Cantidad realizada"><template #body="{ data }">{{ quantity(data.quantity - (data.quantityCanceled || 0)) }} {{ data.uomDescription }}</template></Column>
      </DataTable>
      <label for="maintenance-date">Fecha de realización</label>
      <DatePicker v-model="date" inputId="maintenance-date" dateFormat="dd/mm/yy" :maxDate="new Date()" :disabled="busy" showIcon />
      <label for="maintenance-reason">Mantenimiento o contrato que cubre el servicio</label>
      <Textarea v-model="reason" id="maintenance-reason" rows="3" maxlength="1000" :disabled="busy" placeholder="Indica el contrato, bolsa de horas o motivo de cobertura." />
      <small>La fecha, el usuario y el motivo quedarán registrados en las líneas del pedido.</small>
    </div>
    <template #footer><div class="footer">
      <div class="kiwik-separator" />
      <div class="actions">
        <Button label="Cerrar" text severity="secondary" :disabled="busy" @click="visible = false" />
        <Button label="Registrar y cerrar servicios" icon="pi pi-check" :loading="busy" :disabled="loading || !valid" @click="save" />
      </div>
    </div></template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import axios from 'axios';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';
import Message from 'primevue/message';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';
import type { SalesQuoteLineDTO } from '@/models/SalesQuoteDTO';

const emit = defineEmits<{ saved: [] }>();
const auth = useAuthStore();
const visible = ref(false);
const loading = ref(false);
const busy = ref(false);
const error = ref('');
const code = ref('');
const orderId = ref<number>();
const lines = ref<SalesQuoteLineDTO[]>([]);
const selected = ref<SalesQuoteLineDTO[]>([]);
const reason = ref('');
const date = ref<Date | null>(new Date());
const valid = computed(() => selected.value.length > 0 && reason.value.trim().length > 0 && date.value);
const quantity = (value: number) => value.toLocaleString('es-ES', { maximumFractionDigits: 3 });

async function open(id: number) {
  orderId.value = id;
  error.value = '';
  reason.value = '';
  date.value = new Date();
  lines.value = [];
  selected.value = [];
  visible.value = true;
  loading.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetSalesOrder/${id}`));
    code.value = data.code;
    lines.value = data.lines.filter((line: SalesQuoteLineDTO) => line.requireDelivery === false
      && line.discountPercent === 100 && !line.maintenanceQuantity
      && line.quantity > (line.quantityCanceled || 0) && !line.quantityInvoiced && !line.quantityDelivered);
  } catch (e: any) {
    error.value = e.response?.data?.message || 'No se pudieron consultar los servicios.';
  } finally {
    loading.value = false;
  }
}

async function save() {
  if (busy.value || !valid.value) return;
  const performed = date.value!;
  const performedDate = `${performed.getFullYear()}-${String(performed.getMonth() + 1).padStart(2, '0')}-${String(performed.getDate()).padStart(2, '0')}`;
  busy.value = true;
  error.value = '';
  try {
    await axios.post(backendUrl(`/WebCompleteSalesOrderMaintenance/${orderId.value}`), {
      lineIds: selected.value.map(line => line.pkid), performedDate,
      reason: reason.value.trim(), userCode: auth.user?.userDsCode,
    }, { ...auth.portalRequestConfig(), timeout: 20000 });
    visible.value = false;
    emit('saved');
  } catch (e: any) {
    error.value = typeof e.response?.data === 'string' ? e.response.data
      : e.response?.data?.message || 'No se pudo confirmar el cierre. Puedes reintentar la misma operación.';
  } finally {
    busy.value = false;
  }
}

defineExpose({ open });
</script>

<style scoped>
.heading { display: flex; gap: .8rem; align-items: center; }
.heading i { color: #789b19; font-size: 1.5rem; }
.heading small { display: block; margin-top: .25rem; }
.body { display: flex; flex-direction: column; gap: .8rem; max-height: 65vh; overflow: auto; }
.body label { font-weight: 600; }
.footer { width: 100%; }
.actions { display: flex; justify-content: flex-end; gap: .5rem; margin-top: 1rem; }
</style>
