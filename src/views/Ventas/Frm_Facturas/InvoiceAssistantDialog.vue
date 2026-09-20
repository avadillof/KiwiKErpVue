<template>
  <Dialog
    v-model:visible="visible"
    modal
    maximizable
    :draggable="false"
    class="kiwik-dialog invoice-assistant-dialog"
    :style="{
      width: 'min(1650px, 98vw)',
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
          ? `La pregunta se envía a ${providerName} para interpretar los filtros. No se envían los resultados ni el historial de facturas. No incluyas información sensible innecesaria.`
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
      <div class="assistant-grid">
        <section class="assistant-card chat-card" aria-label="Conversación con la IA">
          <div class="card-head">
            <h3><i class="pi pi-comments" /> Conversación</h3>
            <span class="head-actions">
              <Tag value="Usa cuota IA" severity="warn" />
              <Button
                label="Nueva conversación"
                text
                severity="secondary"
                size="small"
                :disabled="busy || !thread.length"
                @click="newConversation"
              />
            </span>
          </div>
          <div ref="threadRef" class="thread" aria-live="polite">
            <article
              v-for="(msg, index) in thread"
              :key="index"
              class="bubble"
              :class="`bubble-${msg.role}`"
            >
              <p>{{ msg.text }}</p>
              <span class="bubble-time">{{ msg.time }}</span>
            </article>
          </div>
          <div class="chat-input">
            <small class="mode-help"
              >{{ providerName }} convierte tu mensaje en filtros y lanza la
              búsqueda automáticamente. Si falta algún dato, te dirá qué necesita.</small
            >
            <label for="invoice-assistant-question">Escribe tu mensaje</label>
            <Textarea
              id="invoice-assistant-question"
              v-model="question"
              rows="2"
              maxlength="1500"
              :disabled="busy || !aiAvailable"
              placeholder="Ejemplo: facturación de agosto de 2026 del cliente C0001"
              @keydown.enter.exact.prevent="trySubmit"
            />
          <div class="examples">
            <small>Prueba con:</small>
            <Button
              v-for="ex in examples"
              :key="ex"
              :label="ex"
              text
              severity="secondary"
              size="small"
              :disabled="busy || !aiAvailable"
              @click="question = ex"
            />
          </div>
          <div class="question-actions">
            <small
              >Enter envía · Mayús+Enter salto de línea. Si te pide una
              aclaración, respóndela aquí mismo.</small
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
        <section class="assistant-card result-card" aria-label="Resultado de la consulta">
          <div class="card-head">
            <h3><i class="pi pi-receipt" /> Resultado</h3>
          </div>
          <div v-if="!result" class="result-empty">
            <i class="pi pi-inbox" />
            <p>El resultado aparecerá aquí cuando la IA lance una consulta.</p>
          </div>
          <section
            v-else
            ref="resultsSection"
            class="results"
            aria-live="polite"
          >
      <div class="kiwik-separator" />
      <h3>{{ result.answer }}</h3>
      <div v-if="spotlight" class="spotlight">
        <i class="pi pi-star-fill" />
        <div>
          <b>{{ spotlight.title }}</b>
          <p>{{ spotlight.detail }}</p>
        </div>
        <Button
          v-if="spotlight.doc"
          :label="spotlight.code"
          icon="pi pi-external-link"
          text
          @click="openDocument(spotlight.doc)"
        />
      </div>
      <div class="detail-toggle">
        <Button
          :label="detailOpen ? 'Ocultar detalle' : 'Ver detalle'"
          :icon="detailOpen ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          text
          severity="secondary"
          size="small"
          @click="detailOpen = !detailOpen"
        />
      </div>
      <div v-show="detailOpen">
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
        <div v-for="currencyTotals in result.totalsByCurrency || [result.totals]" :key="currencyTotals.currencyCode || 'total'" class="currency-summary">
          <h4 v-if="result.totalsByCurrency?.length > 1">Totales en {{ currencyTotals.currencyCode }}</h4>
          <div class="summary"><article v-for="metric in metrics" :key="metric.key"><small>{{ metric.label }}</small><strong>{{ money(currencyTotals[metric.key], currencyTotals.currencyCode) }}</strong></article></div>
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
            :header="
              result.criteria.action === 'RECTIFICATIONS'
                ? 'Rectificativas'
                : 'Facturas'
            "
          />
          <Column header="Total"
            ><template #body="{ data }">{{
              money(data.total, data.currencyCode)
            }}</template></Column
          >
          <Column
            v-if="result.criteria.action !== 'RECTIFICATIONS'"
            header="Pendiente actual"
            ><template #body="{ data }">{{
              money(data.pendingAmount, data.currencyCode)
            }}</template></Column
          >
          <Column
            v-if="result.criteria.action !== 'RECTIFICATIONS'"
            header="Vencido actual"
            ><template #body="{ data }">{{
              money(data.overdueAmount, data.currencyCode)
            }}</template></Column
          >
          <template #empty>Sin resultados.</template>
        </DataTable>
      </template>
      <template v-if="result.criteria.action !== 'RECTIFICATIONS'">
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
        /><Column field="creatorName" header="Creada por" /><Column header="Origen"
          ><template #body="{ data }">{{ documentOrigin(data) }}</template></Column
        ><Column field="state" header="Estado" /><Column
          field="verifactuStatus"
          header="VeriFactu"
        />
        <Column header="Total"
          ><template #body="{ data }">{{ money(data.total, data.currencyCode) }}</template></Column
        >
        <Column header="Impuestos"
          ><template #body="{ data }">{{ money(data.tax, data.currencyCode) }}</template></Column
        >
        <Column header="Cobrado"
          ><template #body="{ data }">{{
            money(data.collectedAmount, data.currencyCode)
          }}</template></Column
        >
        <Column header="Pendiente"
          ><template #body="{ data }">{{
            money(data.pendingAmount, data.currencyCode)
          }}</template></Column
        >
        <Column header="Vencido"
          ><template #body="{ data }">{{
            money(data.overdueAmount, data.currencyCode)
          }}</template></Column
        >
        <template #empty>Sin facturas para estos criterios.</template>
      </DataTable>
      </template>
      <template v-if="(result.rectifications || []).length">
        <h3>Rectificativas vinculadas</h3>
        <DataTable
          :value="result.rectifications"
          dataKey="pkid"
          stripedRows
          size="small"
          scrollable
          :paginator="result.rectifications.length > 10"
          :rows="10"
        >
          <Column field="code" header="Rectificativa" /><Column
            field="date"
            header="Fecha"
          />
          <Column header="Factura origen"
            ><template #body="{ data }">{{
              data.originInvoiceCode || originCode(data.originInvoiceId)
            }}</template></Column
          >
          <Column field="razon" header="Motivo" />
          <Column header="Total"
            ><template #body="{ data }">{{
              money(data.total, data.currencyCode)
            }}</template></Column
          >
          <Column field="verifactuStatus" header="VeriFactu" /><Column
            field="state"
            header="Estado"
          />
          <template #empty>Sin rectificativas vinculadas.</template>
        </DataTable>
      </template>
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
        <template v-if="result.invoices?.[0]?.verifactuChain?.length">
          <h3>Concatenación y envíos VeriFactu</h3>
          <DataTable :value="result.invoices[0].verifactuChain" stripedRows size="small" scrollable>
            <Column field="historicId" header="Registro" />
            <Column header="Fecha"><template #body="{ data }">{{ dateTime(data.date) }}</template></Column>
            <Column field="previousCode" header="Registro anterior" />
            <Column header="Tipo"><template #body="{ data }">{{ data.firstRecord ? "Primer registro" : "Encadenado" }}</template></Column>
            <Column header="Respuesta"><template #body="{ data }">{{ data.responseReceived ? "Recibida" : "Pendiente" }}</template></Column>
          </DataTable>
        </template>
      </template>
      </div>
          </section>
        </section>
      </div>
    </template>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <template #footer>
      <div class="dialog-footer">
        <!-- Separador corporativo obligatorio antes de las acciones del diálogo. -->
        <div class="kiwik-separator dialog-footer-separator" />
        <div class="dialog-footer-actions">
          <Button
            v-if="result"
            class="download-btn"
            label="Descargar respuesta en PDF"
            icon="pi pi-file-pdf"
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
import { backendUrl } from '@/services/backendUrl';
import { computed, nextTick, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
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
  highlight?: string | null;
  presentation?: "ANSWER" | "TABLE" | "ANSWER_AND_TABLE" | null;
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
  aiAvailable = ref(false),
  providerName = ref("la IA");
const loading = ref(false),
  interpreting = ref(false),
  downloadingPdf = ref(false),
  question = ref(""),
  error = ref("");
// Hilo de conversación (como un chat) y contexto para fusionar aclaraciones.
const thread = ref<Array<{ role: "user" | "assistant"; text: string; time: string }>>([]);
const threadRef = ref<HTMLElement | null>(null);
// Memoria de conversación: todo el hilo viaja como contexto hasta "Nueva conversación".
function buildContext(): string | null {
  if (!thread.value.length) return null;
  const lines = thread.value.map((m) =>
    m.role === "user" ? `Usuario: ${m.text}` : `Asistente: ${m.text}`,
  );
  let ctx = lines.join("\n");
  const MAX = 2000;
  if (ctx.length > MAX) ctx = "…" + ctx.slice(-MAX);
  return ctx;
}
const GREETING =
  "Hola. Pregúntame por facturación de un periodo, pendientes de cobro, vencidos o por una factura concreta.";
function scrollThread() {
  void nextTick(() => {
    const el = threadRef.value;
    if (el) el.scrollTop = el.scrollHeight;
  });
}
function now(): string {
  return new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}
const selectedInvoice = ref<any>(null),
  result = ref<any>(null);
const resultsSection = ref<HTMLElement | null>(null);
const criteria = ref<Criteria>(initialCriteria());
// Última consulta lanzada: ancla estructurada para los seguimientos.
const lastCriteria = ref<any>(null);
// Resaltado de superlativo (mayor/menor importe): se calcula en el navegador
// con los documentos ya recibidos, nunca lo inventa la IA.
const pendingHighlight = ref<string | null>(null);
const spotlight = ref<any>(null);
// Detalle (tablas) plegado cuando hay respuesta directa; siempre visible si no.
const detailOpen = ref(true);
function computeSpotlight(kind: string, docs: any[]) {
  if (!docs || !docs.length) return null;
  const codeOf = (d: any) => d.code || String(d.pkid);
  if (kind === "OLDEST" || kind === "NEWEST") {
    // Fechas ISO (AAAA-MM-DD): el orden lexicográfico es cronológico. Sin fecha, al final.
    const key = (d: any) => (typeof d.date === "string" && d.date ? d.date : "9999-99-99");
    let best = docs[0];
    for (const d of docs) {
      if (kind === "OLDEST" ? key(d) < key(best) : key(d) > key(best)) best = d;
    }
    const code = codeOf(best);
    const rawDate = typeof best.date === "string" ? best.date : "";
    const dateEs = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate.split("-").reverse().join("/") : rawDate;
    return {
      doc: best,
      code,
      title: `${kind === "OLDEST" ? "Más antigua" : "Más reciente"}: ${code}${dateEs ? ` (${dateEs})` : ""}`,
      detail: `${money(best.total, best.currencyCode)} · De ${docs.length} ${docs.length === 1 ? "documento consultado." : "documentos consultados."}`,
    };
  }
  const byTax = kind === "MAX_TAX" || kind === "MIN_TAX";
  const field = byTax ? "tax" : "total";
  const desc = kind === "MAX_TOTAL" || kind === "MAX_TAX";
  const label = byTax ? "impuesto" : "importe";
  let best = docs[0];
  for (const d of docs) {
    const v = Number(d[field] || 0);
    const b = Number(best[field] || 0);
    if (desc ? v > b : v < b) best = d;
  }
  const code = best.code || String(best.pkid);
  return {
    doc: best,
    code,
    title: `${desc ? "Mayor" : "Menor"} ${label}: ${money(best[field], best.currencyCode)} (${code})`,
    detail: docs.length > 1 ? `De ${docs.length} documentos consultados.` : "Único documento consultado.",
  };
}
function computeClients(customers: any[]) {
  if (!customers || !customers.length) return null;
  const names = customers
    .slice(0, 5)
    .map((c) => `${c.customer} (${c.count})`);
  const rest = customers.length > 5 ? ` y ${customers.length - 5} más` : "";
  const totalDocs = customers.reduce((n, c) => n + Number(c.count || 0), 0);
  return {
    doc: null,
    code: "",
    title: `${customers.length} ${customers.length === 1 ? "cliente ha" : "clientes han"} intervenido`,
    detail: `${names.join(", ")}${rest} · ${totalDocs} ${totalDocs === 1 ? "documento" : "documentos"} en total.`,
  };
}
function computeTopClient(customers: any[]) {
  if (!customers || !customers.length) return null;
  let best = customers[0];
  for (const c of customers) {
    if (Number(c.total || 0) > Number(best.total || 0)) best = c;
  }
  return {
    doc: null,
    code: "",
    title: `Mayor volumen: ${best.customer} — ${money(best.total, best.currencyCode)}`,
    detail: customers.length > 1 ? `De ${customers.length} clientes.` : "Único cliente.",
  };
}
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
  { label: "Rectificativas por periodo y cliente", value: "RECTIFICATIONS" },
  { label: "Explicar una factura y sus cobros", value: "EXPLAIN" },
];
// Ejemplos que enseñan el formato que la IA entiende: qué + periodo + cliente.
const examples = [
  "facturación de agosto de 2026",
  "pendientes de cobro del cliente C0001",
  "facturas vencidas este año",  
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
const verifactuLabels: Record<string, string> = {
  ACCEPTED: "aceptadas por VeriFactu",
  PENDING: "pendientes de VeriFactu",
  ATTENTION: "con incidencias de VeriFactu",
  NOT_SENT: "no enviadas a VeriFactu",
};
const amountCriteria = (c: any) => {
  if (c.minTotal == null && c.maxTotal == null) return "";
  const cur = c.currencyCode || result.value?.currencyCode;
  if (c.minTotal != null && c.maxTotal != null)
    return `; importe: entre ${money(c.minTotal, cur)} y ${money(c.maxTotal, cur)}`;
  if (c.maxTotal != null) return `; importe: hasta ${money(c.maxTotal, cur)}`;
  return `; importe: desde ${money(c.minTotal, cur)}`;
};
const resultCriteria = computed(() => {
  const c = result.value.criteria;
  return `${actions.find((a) => a.value === c.action)?.label}; ${c.from ? c.from + " a " + c.to : "sin límite de fechas"}; cliente: ${c.customer || "todos"}${c.verifactu && verifactuLabels[c.verifactu] ? "; verifactu: " + verifactuLabels[c.verifactu] : ""}${amountCriteria(c)}${c.withRectifications ? "; con rectificativas asociadas" : ""}${c.invoiceCode || c.invoiceId ? "; factura: " + (c.invoiceCode || c.invoiceId) : ""}`;
});
const money = (value: number, currencyCode?: string | null) =>
  `${new Intl.NumberFormat("de-DE", { useGrouping: true, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0))}${currencyCode || result.value?.currencyCode ? " " + (currencyCode || result.value.currencyCode) : ""}`;
const originCode = (invoiceId: number) =>
  result.value?.invoices?.find((i: any) => i.pkid === invoiceId)?.code ||
  String(invoiceId ?? "");
const documentOrigin = (invoice: any) => {
  const orders = (invoice.sourceOrders || []).map((item: any) => item.code).filter(Boolean);
  const deliveries = (invoice.sourceDeliveries || []).map((item: any) => item.code).filter(Boolean);
  if (orders.length)
    return `Pedido ${orders.join(", ")}${deliveries.length ? ` · Albarán ${deliveries.join(", ")}` : ""}`;
  if (deliveries.length) return `Albarán ${deliveries.join(", ")}`;
  return "Sin origen enlazado";
};
const dateTime = (value: string) =>
  new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Madrid",
  }).format(new Date(value));
const endpoint = backendUrl(`/WebInvoiceAssistant`);
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
function newConversation() {
  question.value = "";
  error.value = "";
  result.value = null;
  lastCriteria.value = null;
  spotlight.value = null;
  detailOpen.value = true;
  thread.value = [{ role: "assistant", text: GREETING, time: now() }];
  scrollThread();
}
function trySubmit() {
  if (!busy.value && aiAvailable.value && question.value.trim()) void interpret();
}
async function open(invoice: any = null) {
  invalidate();
  const current = sequence;
  visible.value = true;
  statusLoading.value = true;
  authorized.value = false;
  aiAvailable.value = false;
  selectedInvoice.value = invoice;
  providerName.value = "la IA";
  criteria.value = initialCriteria();
  result.value = null;
  lastCriteria.value = null;
  spotlight.value = null;
  detailOpen.value = true;
  error.value = "";
  question.value = "";
  thread.value = [{ role: "assistant", text: GREETING, time: now() }];
  try {
    const { data } = await axios.get(
      endpoint + "/status",
      auth.portalRequestConfig(),
    );
    if (current !== sequence) return;
    authorized.value = true;
    aiAvailable.value = data.aiAvailable;
    // El backend nuevo devuelve provider ("groq"|"openai"|...); el antiguo no.
    providerName.value =
      data.providerLabel ||
      ({ groq: "Groq", openai: "OpenAI" } as Record<string, string>)[data.provider] ||
      data.provider ||
      "la IA";
  } catch (e: any) {
    if (current === sequence) error.value = message(e);
  } finally {
    if (current === sequence) statusLoading.value = false;
  }
}
async function interpret() {
  const asked = question.value;
  // El contexto sólo contiene turnos anteriores; la pregunta actual viaja una vez.
  const priorContext = buildContext();
  const current = ++sequence;
  interpreting.value = true;
  error.value = "";
  result.value = null;
  thread.value.push({ role: "user", text: asked, time: now() });
  question.value = "";
  scrollThread();
  try {
    const { data } = await axios.post(
      endpoint + "/interpret",
      {
        question: asked,
        selectedInvoiceId: selectedInvoice.value?.pkid || null,
        context: priorContext,
        lastCriteria: lastCriteria.value,
      },
      { ...auth.portalRequestConfig(), timeout: 60000 },
    );
    if (current !== sequence) return;
    if (!data.needsClarification) {
      pendingHighlight.value = data.highlight && data.highlight !== "NONE" ? data.highlight : null;
      criteria.value = {
        ...data.criteria,
        highlight: data.criteria?.highlight ?? data.highlight ?? "NONE",
        presentation: data.criteria?.presentation ?? data.presentation ?? "ANSWER",
      };
      thread.value.push({
        role: "assistant",
        text: `${data.message} Lanzo la consulta automáticamente con estos criterios.`,
        time: now(),
      });
      scrollThread();
      await consult();
    } else {
      pendingHighlight.value = null;
      // Conserva filtros parciales ya entendidos además del texto del chat.
      lastCriteria.value = data.draftCriteria || lastCriteria.value;
      thread.value.push({ role: "assistant", text: data.message, time: now() });
      scrollThread();
    }
  } catch (e: any) {
    if (current === sequence) {
      error.value = message(e);
      thread.value.push({ role: "assistant", text: `No he podido interpretar tu mensaje: ${message(e)}`, time: now() });
      scrollThread();
    }
  } finally {
    // Sin guarda de secuencia: consult() la incrementa al auto-lanzar y con la
    // guarda este flag quedaba activo y bloqueaba el siguiente envío.
    interpreting.value = false;
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
      lastCriteria.value = data.criteria || null;
      if (pendingHighlight.value === "CLIENTS") {
        spotlight.value = computeClients(data.customers || []);
        pendingHighlight.value = null;
      } else if (pendingHighlight.value === "TOP_CLIENT") {
        spotlight.value = computeTopClient(data.customers || []);
        pendingHighlight.value = null;
      } else if (pendingHighlight.value) {
        spotlight.value = computeSpotlight(pendingHighlight.value, data.invoices || []);
        pendingHighlight.value = null;
      } else {
        spotlight.value = null;
      }
      const presentation = String(
        data.presentation || data.criteria?.presentation || criteria.value.presentation || "ANSWER",
      ).toUpperCase();
      // ANSWER: solo respuesta; TABLE / ANSWER_AND_TABLE / EXPLAIN: abre el detalle.
      detailOpen.value =
        data.criteria?.action === "EXPLAIN" ||
        presentation === "TABLE" ||
        presentation === "ANSWER_AND_TABLE";
      if (data.answer) {
        thread.value.push({ role: "assistant", text: data.answer, time: now() });
        scrollThread();
      }
      // Wait until Vue paints the tables, then reveal the result heading inside
      // the dialog's own scroll container without moving the page behind it.
      await nextTick();
      resultsSection.value?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  } catch (e: any) {
    if (current === sequence) {
      error.value = message(e);
      thread.value.push({ role: "assistant", text: `No he podido completar la consulta: ${message(e)}`, time: now() });
      scrollThread();
    }
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
 * Columna flexible: la rejilla de paneles rellena hasta el separador del pie.
 * Cada panel hace scroll interno (hilo y resultado) en lugar de alargar el diálogo.
 */
:global(.invoice-assistant-dialog.kiwik-dialog .p-dialog-content) {
  display: flex !important;
  flex-direction: column !important;
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
  gap: 10px;
}
.dialog-footer-actions .download-btn {
  background: linear-gradient(135deg, #9cc10a, #648506);
  border-color: #648506;
  color: #ffffff;
  font-weight: 700;
}
.dialog-footer-actions .download-btn:hover {
  background: linear-gradient(135deg, #8ab209, #577505);
  border-color: #577505;
  color: #ffffff;
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
.examples {
  display: flex;
  align-items: center;
  gap: 4px 8px;
  flex-wrap: wrap;
}
.examples small {
  color: #657084;
}
.assistant-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 16px;
  margin: 18px 0 4px;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 0;
}
.assistant-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid #e1e8d7;
  border-radius: 12px;
  background: #ffffff;
}
.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: #f8faf5;
  border-bottom: 1px solid #e1e8d7;
}
.card-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 1rem;
}
.head-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.thread {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  gap: 8px;
  min-height: 200px;
  padding: 14px 16px;
  overflow-y: auto;
}
.bubble {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.5;
}
.bubble p {
  margin: 0;
  white-space: pre-wrap;
}
.bubble-user {
  align-self: flex-end;
  color: #253000;
  background: #eef5dc;
  border-bottom-right-radius: 4px;
}
.bubble-assistant {
  align-self: flex-start;
  color: #243044;
  background: #f1f5f9;
  border-bottom-left-radius: 4px;
}
.bubble-time {
  display: block;
  margin-top: 4px;
  font-size: 0.72rem;
  opacity: 0.65;
}
.bubble-user .bubble-time {
  text-align: right;
}
.chat-input {
  display: grid;
  gap: 8px;
  margin-top: auto;
  padding: 12px 16px 16px;
  border-top: 1px solid #eef2e7;
}
.result-card {
  min-height: 0;
}
.result-card .results {
  flex: 1 1 auto;
  min-height: 0;
  padding: 0 16px 16px;
  overflow-y: auto;
  font-size: 0.85rem;
}
.result-card .results h3 {
  font-size: 1rem;
}
.spotlight {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0;
  padding: 12px 14px;
  border: 1px solid #d9e6b8;
  border-radius: 10px;
  background: #f8fbe9;
}
.spotlight > i {
  color: #648506;
  font-size: 1.4rem;
}
.spotlight b {
  display: block;
}
.spotlight p {
  margin: 2px 0 0 !important;
  font-size: 0.85rem;
  color: #657084;
}
.spotlight .p-button {
  margin-left: auto;
}
.detail-toggle {
  display: flex;
  justify-content: flex-end;
  margin: 6px 0 2px;
}
.result-empty {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: #7d8797;
  text-align: center;
}
.result-empty i {
  font-size: 1.8rem;
  color: #b9c4a8;
}
@media (max-width: 900px) {
  .assistant-grid {
    grid-template-columns: 1fr;
  }
  .thread {
    max-height: 36vh;
  }
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
