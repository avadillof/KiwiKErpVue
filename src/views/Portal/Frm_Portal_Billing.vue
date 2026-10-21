<template>
  <main class="billing-page">
    <header class="billing-header">
      <div class="billing-title">
        <span class="billing-icon"><i class="pi pi-receipt"></i></span>
        <div>
          <span>Portal / Facturación</span>
          <h1>Facturación</h1>
          <p>
            Consulta tus facturas, vencimientos y documentos rectificativos.
          </p>
        </div>
      </div>
      <Button
        icon="pi pi-refresh"
        label="Actualizar"
        severity="secondary"
        outlined
        :loading="loading"
        @click="load"
      />
    </header>

    <section class="billing-kpis">
      <article>
        <span class="kpi-icon total"><i class="pi pi-file"></i></span>
        <div>
          <small>Total emitido</small
          ><strong>{{ money(data.summary.total) }}</strong
          ><em>{{ data.summary.invoiceCount }} facturas</em>
        </div>
      </article>
      <article>
        <span class="kpi-icon paid"><i class="pi pi-check-circle"></i></span>
        <div>
          <small>Cobrado</small
          ><strong>{{ money(data.summary.collected) }}</strong
          ><em>Pagos registrados</em>
        </div>
      </article>
      <article>
        <span class="kpi-icon pending"><i class="pi pi-clock"></i></span>
        <div>
          <small>Pendiente</small
          ><strong>{{ money(data.summary.pending) }}</strong
          ><em>Saldo abierto</em>
        </div>
      </article>
      <article>
        <span class="kpi-icon overdue"
          ><i class="pi pi-exclamation-triangle"></i
        ></span>
        <div>
          <small>Vencido</small
          ><strong>{{ money(data.summary.overdue) }}</strong
          ><em>Requiere atención</em>
        </div>
      </article>
    </section>

    <section class="billing-workspace">
      <div class="billing-switch">
        <SelectButton
          v-model="view"
          :options="views"
          optionLabel="label"
          optionValue="value"
        />
        <span>{{
          view === "invoices"
            ? `${data.invoices.length} facturas emitidas`
            : `${data.rectifications.length} rectificativas`
        }}</span>
      </div>
      <div v-if="loading" class="billing-loading">
        <i class="pi pi-spin pi-spinner"></i> Cargando facturación…
      </div>
      <div v-else class="portal-table-shell">
        <div v-if="!currentRows.length" class="empty">
          <i class="pi pi-inbox"></i>
          <strong>{{
            view === "invoices"
              ? "Sin facturas emitidas"
              : "Sin rectificativas emitidas"
          }}</strong>
        </div>
        <div v-else class="portal-table-scroll">
          <table v-if="view === 'invoices'" class="portal-table invoices-table">
            <thead>
              <tr>
                <th>Factura</th>
                <th>Fecha</th>
                <th>Referencia</th>
                <th class="num">Total</th>
                <th class="num">Pendiente</th>
                <th>Próximo vencimiento</th>
                <th>Estado</th>
                <th>Documentos</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in currentInvoiceRows" :key="row.pkid">
                <td>
                  <strong class="doc-code">{{ row.code }}</strong>
                </td>
                <td>{{ date(row.date) }}</td>
                <td>{{ row.reference || "—" }}</td>
                <td class="num">
                  <strong>{{ money(row.total, row.currency) }}</strong>
                </td>
                <td class="num">
                  {{ money(row.pendingAmount, row.currency) }}
                </td>
                <td>
                  <span :class="{ late: row.overdueAmount > 0 }">{{
                    row.nextDueDate ? date(row.nextDueDate) : "—"
                  }}</span>
                </td>
                <td>
                  <Tag
                    :value="paymentLabel(row.paymentStatus)"
                    :severity="paymentSeverity(row.paymentStatus)"
                    rounded
                  />
                </td>
                <td>
                  <div class="row-actions">
                    <Button
                      icon="pi pi-file-pdf"
                      text
                      rounded
                      severity="danger"
                      title="Descargar PDF"
                      :disabled="!row.pdfAvailable"
                      @click="downloadPdf(row)"
                    /><Button
                      icon="pi pi-code"
                      text
                      rounded
                      title="Descargar Facturae"
                      :disabled="!row.facturaeAvailable"
                      @click="downloadXml(row)"
                    /><Button
                      icon="pi pi-question-circle"
                      text
                      rounded
                      severity="warn"
                      title="Solicitar revisión"
                      @click="openCorrection(row)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <table v-else class="portal-table rectifications-table">
            <thead>
              <tr>
                <th>Rectificativa</th>
                <th>Fecha</th>
                <th>Documento corregido</th>
                <th>Motivo</th>
                <th class="num">Importe</th>
                <th>Documento</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in currentRectificationRows" :key="row.pkid">
                <td>
                  <strong class="doc-code rec">{{ row.code }}</strong>
                </td>
                <td>{{ date(row.date) }}</td>
                <td>{{ row.sourceCode || "—" }}</td>
                <td>{{ row.reason || row.reference || "—" }}</td>
                <td class="num">
                  <strong>{{ money(row.total, row.currency) }}</strong>
                </td>
                <td>
                  <Button
                    icon="pi pi-file-pdf"
                    text
                    rounded
                    severity="danger"
                    title="Descargar PDF"
                    :disabled="!row.pdfAvailable"
                    @click="downloadRec(row)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <footer v-if="totalPages > 1" class="portal-paginator">
          <Button
            icon="pi pi-angle-left"
            text
            rounded
            :disabled="page === 0"
            aria-label="Página anterior"
            @click="page--"
          />
          <span>Página {{ page + 1 }} de {{ totalPages }}</span>
          <Button
            icon="pi pi-angle-right"
            text
            rounded
            :disabled="page + 1 >= totalPages"
            aria-label="Página siguiente"
            @click="page++"
          />
        </footer>
      </div>
    </section>

    <Dialog
      v-model:visible="correctionVisible"
      modal
      header="Solicitar revisión de factura"
      class="kiwik-dialog"
      :style="{ width: 'min(620px,95vw)' }"
    >
      <div class="correction-body">
        <p>
          Se creará una incidencia asociada a
          <strong>{{ correctionInvoice?.code }}</strong
          >. El equipo revisará la solicitud antes de emitir cualquier
          rectificación.
        </p>
        <FloatLabel variant="on" class="w-full"
          ><Textarea
            id="correction-reason"
            v-model="correctionReason"
            rows="6"
            maxlength="2000"
            class="w-full"
          /><label for="correction-reason"
            >Motivo de la revisión *</label
          ></FloatLabel
        >
        <div class="correction-help">
          <small
            :class="{ invalid: correctionReason.length > 0 && correctionReason.trim().length < 10 }"
          >
            Describe el motivo con al menos 10 caracteres.
          </small>
          <small>{{ correctionReason.length }}/2000</small>
        </div>
      </div>
      <template #footer
        ><div class="dialog-footer">
          <div class="kiwik-separator"></div>
          <div>
            <Button
              label="Cancelar"
              severity="secondary"
              text
              @click="correctionVisible = false"
            /><Button
              label="Enviar solicitud"
              icon="pi pi-send"
              :loading="requesting"
              :disabled="correctionReason.trim().length < 10"
              @click="requestCorrection"
            />
          </div></div
      ></template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import SelectButton from "primevue/selectbutton";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import {
  downloadPortalInvoiceFacturae,
  downloadPortalInvoicePdf,
  downloadPortalRectificationPdf,
  portalBilling,
  requestPortalInvoiceCorrection,
  type PortalBillingData,
  type PortalInvoice,
  type PortalRectification,
} from "@/services/Portal/portalBillingService";

const props = defineProps<{ token: string }>();
const emit = defineEmits<{ correctionCreated: [taskPkid: number] }>();
const toast = useToast();
const empty = (): PortalBillingData => ({
  summary: {
    total: 0,
    collected: 0,
    pending: 0,
    overdue: 0,
    invoiceCount: 0,
    rectificationCount: 0,
  },
  invoices: [],
  rectifications: [],
});
const data = ref<PortalBillingData>(empty());
const loading = ref(false);
const view = ref<"invoices" | "rectifications">("invoices");
const views = [
  { label: "Facturas", value: "invoices" },
  { label: "Rectificativas", value: "rectifications" },
];
const correctionVisible = ref(false);
const correctionInvoice = ref<PortalInvoice | null>(null);
const correctionReason = ref("");
const requesting = ref(false);
const page = ref(0);
const PAGE_SIZE = 20;
const currentInvoiceRows = computed(() =>
  data.value.invoices.slice(
    page.value * PAGE_SIZE,
    (page.value + 1) * PAGE_SIZE,
  ),
);
const currentRectificationRows = computed(() =>
  data.value.rectifications.slice(
    page.value * PAGE_SIZE,
    (page.value + 1) * PAGE_SIZE,
  ),
);
const currentRows = computed(() =>
  view.value === "invoices"
    ? currentInvoiceRows.value
    : currentRectificationRows.value,
);
const totalPages = computed(() =>
  Math.max(
    1,
    Math.ceil(
      (view.value === "invoices"
        ? data.value.invoices.length
        : data.value.rectifications.length) / PAGE_SIZE,
    ),
  ),
);
watch(view, () => {
  page.value = 0;
});

async function load() {
  loading.value = true;
  try {
    data.value = await portalBilling(props.token);
    if (page.value >= totalPages.value) page.value = totalPages.value - 1;
  } catch (e: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo cargar la facturación",
      detail: e.response?.data?.message,
      life: 4000,
    });
  } finally {
    loading.value = false;
  }
}
const currencyCodes: Record<string, string> = {
  "€": "EUR",
  EURO: "EUR",
  EUROS: "EUR",
  $: "USD",
  "US$": "USD",
  "£": "GBP",
  "¥": "JPY",
};

function normalizeCurrency(currency?: string) {
  const value = String(currency || "EUR").trim().toUpperCase();
  const code = currencyCodes[value] || value;
  return /^[A-Z]{3}$/.test(code) ? code : "EUR";
}

const money = (value: unknown, currency = "EUR") => {
  const parsed = Number(value || 0);
  const amount = Number.isFinite(parsed) ? parsed : 0;

  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: normalizeCurrency(currency),
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }
};
const date = (value: string) =>
  value ? new Date(value).toLocaleDateString("es-ES") : "—";
const paymentLabel = (status: string) =>
  status === "PAID"
    ? "Cobrada"
    : status === "PARTIAL"
      ? "Parcial"
      : "Pendiente";
const paymentSeverity = (status: string) =>
  status === "PAID" ? "success" : status === "PARTIAL" ? "warn" : "danger";
async function action(run: () => Promise<void>) {
  try {
    await run();
  } catch (e: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo descargar",
      detail: e.response?.data?.message,
      life: 4000,
    });
  }
}
const downloadPdf = (row: PortalInvoice) =>
  action(() => downloadPortalInvoicePdf(props.token, row));
const downloadXml = (row: PortalInvoice) =>
  action(() => downloadPortalInvoiceFacturae(props.token, row));
const downloadRec = (row: PortalRectification) =>
  action(() => downloadPortalRectificationPdf(props.token, row));
function openCorrection(row: PortalInvoice) {
  correctionInvoice.value = row;
  correctionReason.value = "";
  correctionVisible.value = true;
}
async function requestCorrection() {
  if (!correctionInvoice.value || correctionReason.value.trim().length < 10)
    return;
  requesting.value = true;
  try {
    const task = await requestPortalInvoiceCorrection(
      props.token,
      correctionInvoice.value.pkid,
      correctionReason.value.trim(),
    );
    correctionVisible.value = false;
    toast.add({
      severity: "success",
      summary: "Solicitud registrada",
      detail: "Puedes seguirla desde Tareas.",
      life: 4000,
    });
    emit("correctionCreated", Number(task.taskKyId));
  } catch (e: any) {
    toast.add({
      severity: "error",
      summary: "No se pudo registrar",
      detail: e.response?.data?.message,
      life: 4000,
    });
  } finally {
    requesting.value = false;
  }
}
onMounted(load);
</script>

<style scoped>
.billing-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: #243044;
  min-height: calc(100vh - 150px);
}
.billing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e3e8d2;
  border-radius: 15px;
}
.billing-title {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.billing-title > div > span {
  color: #788071;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.billing-title h1 {
  margin: 0.12rem 0;
  font-size: 1.45rem;
}
.billing-title p {
  margin: 0;
  color: #667085;
}
.billing-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #eef6d2;
  color: #648506;
  font-size: 1.25rem;
}
.billing-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}
.billing-kpis article {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fff;
  border: 1px solid #e6eadc;
  border-radius: 12px;
}
.billing-kpis small,
.billing-kpis strong,
.billing-kpis em {
  display: block;
}
.billing-kpis small {
  color: #6f7785;
}
.billing-kpis strong {
  margin: 0.12rem 0;
  font-size: 1.2rem;
}
.billing-kpis em {
  color: #8b93a1;
  font-size: 0.75rem;
  font-style: normal;
}
.kpi-icon {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
}
.kpi-icon.total {
  background: #edf4ff;
  color: #3974aa;
}
.kpi-icon.paid {
  background: #eaf7dd;
  color: #648506;
}
.kpi-icon.pending {
  background: #fff3d6;
  color: #a66c00;
}
.kpi-icon.overdue {
  background: #fde8e8;
  color: #c43f3f;
}
.billing-workspace {
  display: flex;
  flex: 1;
  min-height: 430px;
  flex-direction: column;
  padding: 14px;
  background: #fff;
  border: 1px solid #e3e8d2;
  border-radius: 15px;
}
.billing-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.8rem;
}
.billing-switch > span {
  color: #7b8492;
  font-size: 0.82rem;
}
.portal-table-shell {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e5e9f0;
  border-radius: 11px;
}
.portal-table-scroll {
  min-height: 0;
  max-height: 470px;
  overflow: auto;
}
.portal-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  color: #344054;
  font-size: 0.86rem;
}
.invoices-table {
  min-width: 1050px;
}
.rectifications-table {
  min-width: 920px;
}
.portal-table th {
  position: sticky;
  z-index: 1;
  top: 0;
  padding: 0.72rem 0.8rem;
  border-bottom: 1px solid #dfe5eb;
  background: #f5f7f9;
  color: #596579;
  font-size: 0.8rem;
  font-weight: 800;
  text-align: left;
  white-space: nowrap;
}
.portal-table td {
  padding: 0.64rem 0.8rem;
  border-bottom: 1px solid #eef1f4;
  background: #fff;
  vertical-align: middle;
}
.portal-table tbody tr:nth-child(even) td {
  background: #fafbfc;
}
.portal-table tbody tr:hover td {
  background: #fbfdef;
}
.portal-paginator {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  border-top: 1px solid #e5e9f0;
  background: #fff;
  color: #697386;
  font-size: 0.8rem;
  font-weight: 700;
}
.doc-code {
  color: #527207;
}
.doc-code.rec {
  color: #a44964;
}
.num {
  text-align: right !important;
  font-variant-numeric: tabular-nums;
}
.late {
  color: #c53030;
  font-weight: 700;
}
.row-actions {
  display: flex;
  align-items: center;
  gap: 0.1rem;
}
.empty,
.billing-loading {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  color: #788071;
}
.empty {
  flex-direction: column;
}
.empty i {
  font-size: 1.6rem;
}
.correction-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.correction-body p {
  margin: 0;
  color: #556070;
  line-height: 1.5;
}

.correction-help {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: #667085;
}

.correction-help .invalid {
  color: #c62828;
}
.dialog-footer > div:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
@media (max-width: 900px) {
  .billing-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .billing-header {
    align-items: flex-start;
  }
}
@media (max-width: 560px) {
  .billing-kpis {
    grid-template-columns: 1fr;
  }
  .billing-title p {
    display: none;
  }
  .billing-header {
    flex-direction: column;
  }
}
</style>
