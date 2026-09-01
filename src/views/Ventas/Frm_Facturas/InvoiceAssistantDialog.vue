<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :draggable="false"
    class="kiwik-dialog invoice-assistant-dialog"
    :style="{
      width: 'min(1250px, 96vw)',
      height: '92vh',
      maxHeight: '92vh',
      overflow: 'hidden',
    }"
  >
    <template #header
      ><div class="assistant-heading">
        <i class="pi pi-sparkles" />
        <div>
          <b>Asistente de consulta · Facturas</b
          ><small
            >Piloto de solo lectura · Importes calculados por KiwiKERP</small
          >
        </div>
      </div></template
    >
    <Message v-if="statusLoading" severity="info" :closable="false"
      >Comprobando sesión y permisos…</Message
    >
    <template v-if="authorized">
      <Message :severity="aiAvailable ? 'info' : 'warn'" :closable="false">{{
        aiAvailable
          ? "La pregunta se envía a OpenAI para interpretar los filtros. No se envían los resultados ni el historial de facturas. No incluyas información sensible innecesaria."
          : "La interpretación con IA aún no está configurada en el servidor. Las consultas guiadas funcionan con datos reales y no utilizan IA."
      }}</Message>
      <Button
        v-if="auth.user?.admin"
        label="Configurar IA en Ajustes"
        icon="pi pi-cog"
        text
        severity="secondary"
        @click="openAiSettings"
      />
      <section class="assistant-mode-panel">
        <button
          type="button"
          class="mode-heading mode-toggle"
          :aria-expanded="activeMode === 'AI'"
          aria-controls="invoice-assistant-ai-panel"
          @click="activeMode = 'AI'"
        >
          <span><i class="pi pi-sparkles" /> Pregunta con IA</span>
          <span class="mode-toggle-status">
            <Tag value="Utiliza saldo API" severity="warn" />
            <i
              class="pi"
              :class="activeMode === 'AI' ? 'pi-chevron-up' : 'pi-chevron-down'"
            />
          </span>
        </button>
        <div
          v-show="activeMode === 'AI'"
          id="invoice-assistant-ai-panel"
          class="mode-panel-content question-section"
        >
          <small class="mode-help"
            >Opcional. OpenAI convierte tu frase en los filtros inferiores. Si
            no tienes saldo API, utiliza directamente la consulta guiada.</small
          >
          <label for="invoice-assistant-question"
            >¿Qué quieres consultar con tus palabras?</label
          >
          <Textarea
            id="invoice-assistant-question"
            v-model="question"
            rows="2"
            maxlength="1500"
            :disabled="busy || !aiAvailable"
            placeholder="Ejemplo: facturación de agosto de 2026 del cliente C0001"
          />
          <div class="question-actions">
            <small
              >Cada pregunta es independiente; no se conserva una
              conversación.</small
            ><Button
              label="Interpretar pregunta"
              icon="pi pi-sparkles"
              :loading="interpreting"
              :disabled="busy || !aiAvailable || !question.trim()"
              @click="interpret"
            />
          </div>
        </div>
      </section>
      <Message v-if="interpretation" severity="info" :closable="false">{{
        interpretation
      }}</Message>
      <section class="assistant-mode-panel guided-panel">
        <button
          type="button"
          class="mode-heading mode-toggle"
          :aria-expanded="activeMode === 'GUIDED'"
          aria-controls="invoice-assistant-guided-panel"
          @click="activeMode = 'GUIDED'"
        >
          <span><i class="pi pi-sliders-h" /> Consulta guiada</span>
          <span class="mode-toggle-status">
            <Tag value="Sin coste API" severity="success" />
            <i
              class="pi"
              :class="
                activeMode === 'GUIDED' ? 'pi-chevron-up' : 'pi-chevron-down'
              "
            />
          </span>
        </button>
        <div
          v-show="activeMode === 'GUIDED'"
          id="invoice-assistant-guided-panel"
          class="mode-panel-content"
        >
          <small class="mode-help"
            >Selecciona la consulta y sus filtros. KiwiKERP calcula el resultado
            directamente, sin llamar a OpenAI.</small
          >
          <form class="criteria" @submit.prevent="consult">
            <div>
              <label for="assistant-action">Consulta</label
              ><Select
                inputId="assistant-action"
                v-model="criteria.action"
                :options="actions"
                optionLabel="label"
                optionValue="value"
                :disabled="busy"
                @change="changeAction"
              />
            </div>
            <template v-if="criteria.action !== 'EXPLAIN'">
              <div>
                <label for="assistant-from">Fecha de factura desde</label
                ><DatePicker
                  inputId="assistant-from"
                  v-model="fromDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  fluid
                  :disabled="busy"
                />
              </div>
              <div>
                <label for="assistant-to">Fecha de factura hasta</label
                ><DatePicker
                  inputId="assistant-to"
                  v-model="toDate"
                  dateFormat="dd/mm/yy"
                  showIcon
                  showButtonBar
                  fluid
                  :disabled="busy"
                />
              </div>
            </template>
            <div>
              <label for="assistant-customer"
                >Cliente (código o nombre exacto)</label
              ><InputText
                id="assistant-customer"
                v-model="criteria.customer"
                maxlength="150"
                :disabled="busy"
                placeholder="Todos los clientes"
              />
            </div>
            <div v-if="criteria.action === 'EXPLAIN'">
              <label for="assistant-invoice">Código exacto de factura</label
              ><InputText
                id="assistant-invoice"
                v-model="criteria.invoiceCode"
                maxlength="100"
                :disabled="busy"
                :placeholder="
                  criteria.invoiceId
                    ? `Seleccionada: ${selectedInvoice?.code || criteria.invoiceId}`
                    : 'Introduce el código'
                "
                @update:modelValue="criteria.invoiceId = null"
              />
            </div>
            <div class="criteria-actions">
              <Button
                v-if="selectedInvoice?.pkid"
                label="Usar factura seleccionada"
                text
                severity="secondary"
                :disabled="busy"
                @click="useSelected"
              /><Button
                type="submit"
                label="Consultar datos"
                icon="pi pi-search"
                :loading="loading"
                :disabled="busy"
              />
            </div>
          </form>
          <p class="scope">
            Revisa los criterios antes de consultar. En pendientes y vencidos,
            deja ambas fechas vacías para todo el histórico. Máximo 500
            documentos y 366 días por periodo. Los filtros del listado principal
            no se heredan.
          </p>
        </div>
      </section>
    </template>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <section
      v-if="result"
      ref="resultsSection"
      class="results"
      aria-live="polite"
    >
      <div class="kiwik-separator" />
      <h3>{{ result.answer }}</h3>
      <p>
        <b>Criterios de este resultado:</b> {{ resultCriteria }} · Consultado:
        {{ dateTime(result.checkedAt) }}
      </p>
      <p class="scope">{{ result.definition }}</p>
      <Message
        v-for="warning in result.warnings"
        :key="warning"
        severity="warn"
        :closable="false"
        >{{ warning }}</Message
      >
      <Message v-if="result.legacyBalance" severity="warn" :closable="false"
        >Esta factura figura cobrada mediante un saldo previo sin movimientos de
        cobro. No se conoce una fecha ni un medio de pago a partir de ese
        indicador.</Message
      >
      <div class="summary">
        <article v-for="metric in metrics" :key="metric.key">
          <small>{{ metric.label }}</small
          ><strong>{{ money(result.totals[metric.key]) }}</strong>
        </article>
      </div>
      <template v-if="result.criteria.action !== 'EXPLAIN'">
        <h3>Resumen por cliente</h3>
        <DataTable
          :value="result.customers"
          stripedRows
          size="small"
          scrollable
          :paginator="result.customers.length > 10"
          :rows="10"
        >
          <Column field="customer" header="Cliente" /><Column
            field="count"
            header="Facturas"
          />
          <Column header="Total"
            ><template #body="{ data }">{{
              money(data.total)
            }}</template></Column
          >
          <Column header="Pendiente actual"
            ><template #body="{ data }">{{
              money(data.pendingAmount)
            }}</template></Column
          >
          <Column header="Vencido actual"
            ><template #body="{ data }">{{
              money(data.overdueAmount)
            }}</template></Column
          >
          <template #empty>Sin resultados.</template>
        </DataTable>
      </template>
      <h3>Facturas que justifican el resultado</h3>
      <DataTable
        :value="result.invoices"
        dataKey="pkid"
        stripedRows
        size="small"
        scrollable
        :paginator="result.invoices.length > 10"
        :rows="10"
      >
        <Column header="Factura"
          ><template #body="{ data }"
            ><Button
              :label="data.code || String(data.pkid)"
              icon="pi pi-external-link"
              text
              @click="openDocument(data)" /></template
        ></Column>
        <Column field="date" header="Fecha" /><Column
          field="customer"
          header="Cliente"
        /><Column field="state" header="Estado" />
        <Column header="Total"
          ><template #body="{ data }">{{ money(data.total) }}</template></Column
        >
        <Column header="Cobrado"
          ><template #body="{ data }">{{
            money(data.collectedAmount)
          }}</template></Column
        >
        <Column header="Pendiente"
          ><template #body="{ data }">{{
            money(data.pendingAmount)
          }}</template></Column
        >
        <Column header="Vencido"
          ><template #body="{ data }">{{
            money(data.overdueAmount)
          }}</template></Column
        >
        <template #empty>Sin facturas para estos criterios.</template>
      </DataTable>
      <template v-if="result.criteria.action === 'EXPLAIN'">
        <h3>Cobros registrados</h3>
        <DataTable :value="result.payments" stripedRows size="small" scrollable>
          <Column field="id" header="Registro" /><Column
            field="date"
            header="Fecha"
          /><Column field="method" header="Medio" />
          <Column header="Importe"
            ><template #body="{ data }">{{
              money(data.amount)
            }}</template></Column
          >
          <Column header="Situación"
            ><template #body="{ data }">{{
              data.reversed ? "Revertido (no suma)" : "Vigente"
            }}</template></Column
          >
          <template #empty>No hay movimientos de cobro registrados.</template>
        </DataTable>
        <h3>Vencimientos</h3>
        <DataTable :value="result.dues" stripedRows size="small" scrollable>
          <Column field="position" header="Plazo" /><Column
            field="dueDate"
            header="Fecha"
          />
          <Column header="Importe"
            ><template #body="{ data }">{{
              money(data.amount)
            }}</template></Column
          >
          <Column header="Pendiente"
            ><template #body="{ data }">{{
              money(data.pendingAmount)
            }}</template></Column
          >
          <Column header="Situación"
            ><template #body="{ data }">{{
              timings[data.timing] || data.timing
            }}</template></Column
          >
          <Column field="termDescription" header="Condición" />
        </DataTable>
      </template>
    </section>
    <template #footer>
      <div class="dialog-footer">
        <!-- Separador corporativo obligatorio antes de las acciones del diálogo. -->
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-footer-actions">
          <Button
            v-if="result"
            label="Descargar respuesta en PDF"
            icon="pi pi-file-pdf"
            severity="secondary"
            :loading="downloadingPdf"
            :disabled="busy"
            @click="downloadPdf"
          />
          <Button
            label="Cerrar"
            severity="secondary"
            @click="visible = false"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Dialog from "primevue/dialog";
import DatePicker from "primevue/datepicker";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useAuthStore } from "@/stores/authStore";

type Criteria = {
  action: string;
  from: string | null;
  to: string | null;
  customer: string | null;
  invoiceCode: string | null;
  invoiceId: number | null;
};
const emit = defineEmits<{ "open-invoice": [invoice: any] }>();
const auth = useAuthStore();
const settingsRouter = useRouter();
function openAiSettings() {
  visible.value = false;
  void settingsRouter.push({ name: "Frm_Ajustes", query: { tab: "4" } });
}
const visible = ref(false),
  statusLoading = ref(false),
  authorized = ref(false),
  aiAvailable = ref(false);
const loading = ref(false),
  interpreting = ref(false),
  downloadingPdf = ref(false),
  question = ref(""),
  interpretation = ref(""),
  error = ref("");
const selectedInvoice = ref<any>(null),
  result = ref<any>(null);
const resultsSection = ref<HTMLElement | null>(null);
// Keep the safe, no-API mode open by default and never show both modes at once.
const activeMode = ref<"AI" | "GUIDED">("GUIDED");
const criteria = ref<Criteria>(initialCriteria());
// Keep date-only API values; UTC conversion would shift days in some time zones.
function dateField(key: "from" | "to") {
  return computed<Date | null>({
    get() {
      const value = criteria.value[key];
      if (!value) return null;
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    },
    set(value) {
      criteria.value[key] =
        value && !Number.isNaN(value.getTime())
          ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
          : null;
    },
  });
}
const fromDate = dateField("from"),
  toDate = dateField("to");
const busy = computed(
  () =>
    loading.value ||
    interpreting.value ||
    downloadingPdf.value ||
    statusLoading.value,
);
const actions = [
  { label: "Facturación por periodo y cliente", value: "BILLING" },
  { label: "Pendientes de cobro", value: "PENDING" },
  { label: "Vencidos", value: "OVERDUE" },
  { label: "Explicar una factura y sus cobros", value: "EXPLAIN" },
];
const metrics = [
  { key: "net", label: "Base registrada" },
  { key: "tax", label: "Impuestos" },
  { key: "retention", label: "Retención" },
  { key: "total", label: "Total documentos" },
  { key: "collectedAmount", label: "Cobrado actual" },
  { key: "pendingAmount", label: "Pendiente actual" },
  { key: "overdueAmount", label: "Vencido actual" },
];
const timings: Record<string, string> = {
  PAID: "Cobrado",
  OVERDUE: "Vencido",
  TODAY: "Vence hoy",
  UPCOMING: "Próximos 7 días",
  PENDING: "Pendiente",
  UNKNOWN: "Sin fecha",
  DRAFT: "Borrador",
  CANCELLED: "No exigible",
};
const resultCriteria = computed(() => {
  const c = result.value.criteria;
  return `${actions.find((a) => a.value === c.action)?.label}; ${c.from ? c.from + " a " + c.to : "sin límite de fechas"}; cliente: ${c.customer || "todos"}${c.invoiceCode || c.invoiceId ? "; factura: " + (c.invoiceCode || c.invoiceId) : ""}`;
});
const money = (value: number) =>
  `${new Intl.NumberFormat("de-DE", { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))}${result.value?.currencyCode ? " " + result.value.currencyCode : ""}`;
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
const endpoint = `${import.meta.env.VITE_API_URL}/WebInvoiceAssistant`;
let sequence = 0;
watch(
  visible,
  (value) => {
    if (!value) invalidate();
  },
  { flush: "sync" },
);
watch(
  () => auth.user?.pkid,
  () => {
    invalidate();
    visible.value = false;
    result.value = null;
    authorized.value = false;
  },
);
function initialCriteria(): Criteria {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return {
    action: "BILLING",
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, "0")}`,
    customer: null,
    invoiceCode: null,
    invoiceId: null,
  };
}
function invalidate() {
  sequence++;
  loading.value = false;
  interpreting.value = false;
  statusLoading.value = false;
}
function message(e: any) {
  return typeof e.response?.data === "string"
    ? e.response.data
    : e.response?.status === 401
      ? "Vuelve a iniciar sesión en el portal."
      : e.message ===
          "Vuelve a iniciar sesión en el portal para autorizar esta acción."
        ? e.message
        : "No se pudo completar la consulta. Comprueba el backend y las migraciones de cobros y vencimientos.";
}
function changeAction() {
  criteria.value.invoiceId = null;
  criteria.value.invoiceCode = null;
  if (criteria.value.action !== "BILLING") {
    criteria.value.from = null;
    criteria.value.to = null;
  } else {
    const initial = initialCriteria();
    criteria.value.from = initial.from;
    criteria.value.to = initial.to;
  }
}
function useSelected() {
  criteria.value = {
    action: "EXPLAIN",
    from: null,
    to: null,
    customer: null,
    invoiceCode: null,
    invoiceId: selectedInvoice.value.pkid,
  };
}
async function open(invoice: any = null) {
  invalidate();
  const current = sequence;
  visible.value = true;
  statusLoading.value = true;
  authorized.value = false;
  aiAvailable.value = false;
  selectedInvoice.value = invoice;
  activeMode.value = "GUIDED";
  criteria.value = initialCriteria();
  result.value = null;
  error.value = "";
  question.value = "";
  interpretation.value = "";
  try {
    const { data } = await axios.get(
      endpoint + "/status",
      auth.portalRequestConfig(),
    );
    if (current !== sequence) return;
    authorized.value = true;
    aiAvailable.value = data.aiAvailable;
  } catch (e: any) {
    if (current === sequence) error.value = message(e);
  } finally {
    if (current === sequence) statusLoading.value = false;
  }
}
async function interpret() {
  const current = ++sequence;
  interpreting.value = true;
  error.value = "";
  interpretation.value = "";
  result.value = null;
  try {
    const { data } = await axios.post(
      endpoint + "/interpret",
      {
        question: question.value,
        selectedInvoiceId: selectedInvoice.value?.pkid || null,
      },
      { ...auth.portalRequestConfig(), timeout: 60000 },
    );
    if (current !== sequence) return;
    interpretation.value = data.message;
    if (!data.needsClarification) {
      criteria.value = { ...data.criteria };
      interpretation.value += " Revisa los filtros y pulsa Consultar datos.";
      activeMode.value = "GUIDED";
    }
  } catch (e: any) {
    if (current === sequence) error.value = message(e);
  } finally {
    if (current === sequence) interpreting.value = false;
  }
}
async function consult() {
  const current = ++sequence;
  loading.value = true;
  error.value = "";
  result.value = null;
  try {
    const { data } = await axios.post(
      endpoint + "/query",
      { ...criteria.value },
      { ...auth.portalRequestConfig(), timeout: 60000 },
    );
    if (current === sequence) {
      result.value = data;
      // Wait until Vue paints the tables, then reveal the result heading inside
      // the dialog's own scroll container without moving the page behind it.
      await nextTick();
      resultsSection.value?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  } catch (e: any) {
    if (current === sequence) error.value = message(e);
  } finally {
    if (current === sequence) loading.value = false;
  }
}
async function downloadPdf() {
  if (!result.value) return;
  downloadingPdf.value = true;
  error.value = "";
  try {
    // El servidor repite la consulta validada para que el PDF no confíe en
    // importes manipulables del navegador.
    const response = await axios.post(
      endpoint + "/pdf",
      result.value.criteria,
      {
        ...auth.portalRequestConfig(),
        responseType: "blob",
        timeout: 60000,
      },
    );
    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = `consulta-facturas-${new Date().toISOString().slice(0, 10)}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e: any) {
    error.value = message(e);
  } finally {
    downloadingPdf.value = false;
  }
}
function openDocument(invoice: any) {
  visible.value = false;
  emit("open-invoice", invoice);
}
defineExpose({ open });
</script>

<style scoped>
/*
 * PrimeVue aplica el scroll al contenido, no al diálogo completo. El min-height
 * permite que este hijo flex reduzca su tamaño y que los resultados no queden
 * ocultos debajo del pie fijo.
 */
:global(.invoice-assistant-dialog.kiwik-dialog .p-dialog-content) {
  display: block !important;
  flex: 1 1 auto !important;
  height: auto !important;
  min-height: 0 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
}

:global(.invoice-assistant-dialog.kiwik-dialog .p-dialog-header),
:global(.invoice-assistant-dialog.kiwik-dialog .p-dialog-footer) {
  flex: 0 0 auto !important;
}

.dialog-footer {
  width: 100%;
}

.dialog-footer-separator {
  width: 100%;
  min-height: 1px;
  margin: 0 0 0.75rem;
}

.dialog-footer-actions {
  display: flex;
  justify-content: flex-end;
}

.assistant-heading {
  display: flex;
  align-items: center;
  gap: 12px;
}
.assistant-heading > i {
  padding: 12px;
  border-radius: 9px;
  color: #648506;
  background: #eef5dc;
}
.assistant-heading small {
  display: block;
  margin-top: 4px;
  color: #657084;
}
.question-section {
  display: grid;
  gap: 8px;
}
.assistant-mode-panel {
  margin-top: 18px;
  overflow: hidden;
  border: 1px solid #e1e8d7;
  border-radius: 10px;
  background: #ffffff;
}
.guided-panel {
  margin-bottom: 18px;
}
.mode-toggle {
  width: 100%;
  padding: 14px 16px;
  border: 0;
  color: inherit;
  background: #f8faf5;
  font: inherit;
  cursor: pointer;
}
.mode-toggle:hover,
.mode-toggle:focus-visible {
  background: #f1f6e8;
}
.mode-toggle:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}
.mode-toggle-status {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.mode-panel-content {
  padding: 16px;
}
.mode-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 700;
}
.mode-heading span {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mode-help {
  display: block;
  color: #657084;
  line-height: 1.5;
  margin: 5px 0 10px;
}
.question-actions,
.criteria-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
.question-actions small {
  margin-right: auto;
  color: #657084;
}
.criteria {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  background: #f8faf5;
  border: 1px solid #e1e8d7;
  padding: 16px;
  border-radius: 10px;
}
.criteria > div {
  display: grid;
  gap: 6px;
}
.criteria .criteria-actions {
  display: flex;
  grid-column: 1/-1;
}
label {
  font-weight: 600;
  font-size: 0.9rem;
}
input[type="date"] {
  padding: 9px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: white;
  font: inherit;
  min-width: 0;
}
.scope,
.results p {
  font-size: 0.9rem;
  color: #657084;
  line-height: 1.5;
}
.results h3 {
  margin: 22px 0 10px;
}
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(135px, 1fr));
  gap: 10px;
  margin: 18px 0;
}
.summary article {
  padding: 14px;
  border: 1px solid #e1e8d7;
  border-radius: 9px;
  background: white;
}
.summary small {
  display: block;
  color: #657084;
  margin-bottom: 6px;
}
.summary strong {
  font-size: 1.1rem;
}
@media (max-width: 650px) {
  .criteria {
    grid-template-columns: 1fr;
  }
  .assistant-heading small {
    font-size: 0.75rem;
  }
}
</style>
