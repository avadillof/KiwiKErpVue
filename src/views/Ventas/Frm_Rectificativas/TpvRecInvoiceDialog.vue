<template>
  <Dialog
    v-model:visible="visible"
    modal
    class="kiwik-dialog"
    header="Rectificativa simplificada · R5"
    :style="{ width: 'min(920px, 96vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
  >
    <p v-if="loading" role="status">
      <i class="pi pi-spin pi-spinner" /> Consultando rectificativa…
    </p>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <template v-if="record">
      <div class="r5-heading">
        <div>
          <strong>{{ record.code }}</strong
          ><small>{{ date(record.date) }}</small>
        </div>
        <Tag
          :value="fiscalLabel(record.verifactuStatus)"
          :severity="accepted ? 'success' : 'warn'"
        />
      </div>
      <Message severity="info" :closable="false"
        >Rectificativa del TPV. El dinero ya se devolvió en caja; no hay que
        realizar otro abono.</Message
      >
      <dl class="r5-data">
        <div>
          <dt>Documento rectificado</dt>
          <dd>{{ record.sourceCode }} · Ticket T-{{ record.chargeId }}</dd>
        </div>
        <div>
          <dt>Cliente</dt>
          <dd>
            {{ record.customer
            }}<small v-if="record.customerNif">{{ record.customerNif }}</small>
          </dd>
        </div>
        <div>
          <dt>Medio de devolución</dt>
          <dd>
            {{
              record.method === "CASH"
                ? "Efectivo"
                : record.method === "CARD"
                  ? "Tarjeta"
                  : record.method
            }}
          </dd>
        </div>
        <div>
          <dt>Pago</dt>
          <dd><Tag value="Devuelta en TPV" severity="success" /></dd>
        </div>
        <div v-if="record.canjeCode">
          <dt>Factura completa de canje</dt>
          <dd>{{ record.canjeCode }} · F3</dd>
        </div>
      </dl>
      <div class="r5-reason">
        <b>Motivo de la rectificación</b>
        <p>{{ record.reason }}</p>
      </div>
      <Message v-if="record.fiscalError" severity="warn" :closable="false">{{
        record.fiscalError
      }}</Message>
      <div class="r5-lines">
        <table>
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Cantidad devuelta</th>
              <th>IVA</th>
              <th>Base</th>
              <th>Cuota</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, index) in record.lines" :key="index">
              <td>{{ line.code }} · {{ line.name }}</td>
              <td>{{ qty(line.quantity) }}</td>
              <td>{{ qty(line.tax) }} %</td>
              <td>{{ money(line.net) }}</td>
              <td>{{ money(line.taxAmount) }}</td>
              <td>{{ money(line.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="r5-totals">
        <span
          >Base <b>{{ money(record.net) }}</b></span
        ><span
          >Impuestos <b>{{ money(record.tax) }}</b></span
        ><strong>Total rectificativa {{ money(record.total) }}</strong>
      </div>
      <details v-if="record.history?.length">
        <summary>Historial VeriFactu</summary>
        <p v-for="(event, index) in record.history" :key="index">
          {{ date(event.date) }} · {{ event.actor }} · {{ event.action
          }}<br />{{ event.detail }}
        </p>
      </details>
    </template>
    <template #footer
      ><div class="r5-footer">
        <div class="kiwik-separator" />
        <div class="r5-actions">
          <Button
            label="Cerrar"
            text
            severity="secondary"
            @click="visible = false"
          />
          <Button
            label="Actualizar"
            icon="pi pi-refresh"
            outlined
            :loading="loading"
            @click="load"
          />
          <Button
            v-if="canPrint"
            label="Ver / Imprimir R5"
            icon="pi pi-print"
            :disabled="!record || !accepted || loading"
            :loading="printing"
            @click="print"
          />
        </div></div
    ></template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import axios from "axios";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import { useAuthStore } from "@/stores/authStore";
import { backendUrl } from "@/services/backendUrl";

defineProps<{ canPrint: boolean }>();
const auth = useAuthStore();
const visible = ref(false),
  loading = ref(false),
  printing = ref(false),
  error = ref("");
const record = ref<any>(null),
  refundId = ref<number | null>(null);
let generation = 0;
const accepted = computed(() =>
  ["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(record.value?.verifactuStatus),
);
const money = (value: unknown) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: record.value?.currency || "EUR",
  }).format(Number(value) || 0);
const qty = (value: unknown) =>
  new Intl.NumberFormat("es-ES", { maximumFractionDigits: 3 }).format(
    Number(value) || 0,
  );
const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleString("es-ES") : "";
const fiscalLabel = (value: string) =>
  (
    ({
      ACCEPTED: "Aceptada",
      ACCEPTED_WITH_ERRORS: "Aceptada con errores",
      PENDING: "Pendiente de envío",
      PROCESSING: "En proceso",
      ERROR: "Error técnico",
      NEEDS_CORRECTION: "Requiere corrección",
    }) as Record<string, string>
  )[value] || value;
function failure(e: unknown) {
  return axios.isAxiosError(e) &&
    typeof e.response?.data === "string" &&
    !e.response.data.trim().startsWith("<")
    ? e.response.data
    : "No se pudo consultar la rectificativa del TPV.";
}
async function load() {
  if (!refundId.value) return;
  const token = ++generation;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get(
      backendUrl(`/WebGetSalesRecInvoiceTpv/${refundId.value}`),
      auth.portalRequestConfig(),
    );
    if (token === generation) record.value = data;
  } catch (e) {
    if (token === generation) error.value = failure(e);
  } finally {
    if (token === generation) loading.value = false;
  }
}
function open(id: number) {
  refundId.value = id;
  record.value = null;
  error.value = "";
  visible.value = true;
  void load();
}
async function print() {
  if (!refundId.value || !accepted.value || printing.value) return;
  const preview = window.open("", "_blank");
  if (!preview) {
    error.value = "Permite las ventanas emergentes para abrir la R5.";
    return;
  }
  preview.opener = null;
  preview.document.title = "Cargando rectificativa R5…";
  printing.value = true;
  error.value = "";
  try {
    const { data } = await axios.get(
      backendUrl(`/WebGetSalesRecInvoiceTpvPdf/${refundId.value}`),
      { ...auth.portalRequestConfig(), responseType: "blob" },
    );
    const url = URL.createObjectURL(data);
    preview.location.replace(url);
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch {
    preview.close();
    error.value =
      "No se pudo abrir el PDF de la R5. Actualiza su estado y vuelve a intentarlo.";
  } finally {
    printing.value = false;
  }
}
defineExpose({ open });
</script>

<style scoped>
.r5-heading,
.r5-totals,
.r5-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.r5-heading {
  margin-bottom: 1rem;
}
.r5-heading strong {
  font-size: 1.2rem;
}
.r5-heading small,
dd small {
  display: block;
  color: #667085;
  margin-top: 0.3rem;
}
.r5-data {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: #f7f9f2;
  border: 1px solid #dbe4cd;
  border-radius: 10px;
}
dt {
  color: #667085;
  font-size: 0.8rem;
}
dd {
  margin: 0.3rem 0 0;
  font-weight: 600;
}
.r5-reason p {
  margin-top: 0.4rem;
}
.r5-lines {
  overflow-x: auto;
  margin-top: 1rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  padding: 0.65rem;
  border-bottom: 1px solid #e4e7ec;
  text-align: right;
  white-space: nowrap;
}
th:first-child,
td:first-child {
  text-align: left;
  white-space: normal;
  min-width: 180px;
}
th {
  background: #f7f9f2;
}
.r5-totals {
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding: 1rem;
}
.r5-totals b {
  margin-left: 0.4rem;
}
.r5-totals strong {
  color: #4a6500;
}
details {
  margin-top: 1rem;
  color: #667085;
  font-size: 0.8rem;
}
.r5-footer {
  width: 100%;
}
.r5-actions {
  justify-content: flex-end;
  flex-wrap: wrap;
}
@media (max-width: 600px) {
  .r5-data {
    grid-template-columns: 1fr;
  }
}
</style>
