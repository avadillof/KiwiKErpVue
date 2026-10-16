<template>
  <Dialog
    :visible="visible && !invoiceCharge"
    :header="receipt ? 'Devolución registrada' : 'Tickets cobrados'"
    modal
    class="kiwik-dialog"
    :style="{ width: 'min(560px, 96vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :closable="!busy && !printing"
    :close-on-escape="!busy && !printing"
    @update:visible="$emit('close')"
  >
    <div v-if="!receipt && !selected" class="refund-list">
      <div class="refund-search">
        <label for="refund-search">Buscar ticket</label>
        <div class="refund-search-row">
          <input
            id="refund-search"
            ref="searchInput"
            v-model="search"
            data-alpha="1"
            type="search"
            autocomplete="off"
            placeholder="Número, operario, mesa o importe…"
            @keydown.enter.prevent="load(true)"
          />
          <Button
            icon="pi pi-eraser"
            aria-label="Limpiar búsqueda"
            outlined
            :disabled="!search"
            @click="
              search = '';
              searchInput?.focus();
            "
          />
          <Button
            icon="pi pi-keyboard"
            label="Teclado"
            outlined
            @click="showKeyboard"
          />
        </div>
        <div class="refund-search-row">
          <Button
            label="Buscar en histórico"
            icon="pi pi-search"
            :loading="loading"
            :disabled="loading || !search.trim()"
            @click="load(true)"
          />
          <Button
            v-if="historic"
            label="Apertura actual"
            text
            :disabled="loading"
            @click="
              search = '';
              load();
            "
          />
        </div>
        <small
          >Para tickets anteriores, escribe o escanea el número completo
          (T-123). La devolución se registra en la caja actual.</small
        >
        <small role="status"
          >{{ fmtQty(filteredCharges.length) }} de
          {{ fmtQty(charges.length) }} tickets ·
          {{
            historic ? "Histórico por número de ticket" : "Apertura actual"
          }}</small
        >
      </div>
      <div class="refund-cards">
        <p v-if="loading" role="status">
          <i class="pi pi-spin pi-spinner" /> Cargando tickets cobrados…
        </p>
        <p v-else-if="!charges.length && !error" class="refund-empty">
          {{
            historic
              ? "No se ha encontrado ese ticket en el histórico."
              : "No hay tickets cobrados en esta apertura."
          }}
        </p>
        <p v-else-if="!filteredCharges.length && !error" class="refund-empty">
          No hay tickets que coincidan con «{{ search }}».
        </p>
        <article
          v-for="charge in filteredCharges"
          :key="charge.chargeId"
          class="refund-card"
        >
          <div>
            <strong>{{ charge.code }}</strong>
            <small v-if="invoiceCode(charge)" class="invoice-code">
              <i class="pi pi-file" />
              {{
                invoiceCode(charge)?.startsWith("DRAFT")
                  ? "Borrador"
                  : "Factura"
              }}
              · {{ invoiceCode(charge) }}
            </small>
            <small>
              {{ fmtDate(charge.chargedAt) }} · {{ charge.cashier
              }}{{ charge.tableName ? ` · Mesa ${charge.tableName}` : "" }}
            </small>
            <b>{{ fmt(Number(charge.total), String(charge.currency)) }}</b>
            <small v-if="charge.fiscalCode" class="fiscal-note">
              {{ charge.fiscalCode }} · {{ fiscalLabel(charge) }}
            </small>
            <small v-if="charge.customerName">
              {{ charge.customerName
              }}{{ charge.customerNif ? ` · ${charge.customerNif}` : "" }}
            </small>
            <small
              v-if="Number(charge.refundedTotal) > 0"
              class="refunded-note"
            >
              Ya devuelto:
              {{ fmt(Number(charge.refundedTotal), String(charge.currency)) }}
            </small>
          </div>
          <div class="refund-card-actions">
            <Button
              label="Reimprimir"
              icon="pi pi-print"
              text
              severity="secondary"
              :disabled="reprinting != null"
              :loading="reprinting === charge.chargeId"
              @click="reprint(charge)"
            />
            <Button
              v-if="
                invoiceJobState(charge) === 'polling' ||
                invoiceJobState(charge) === 'issuing'
              "
              label="Generando…"
              icon="pi pi-spin pi-spinner"
              outlined
              disabled
            />
            <template v-else>
              <Button
                v-if="fiscalFailed(charge)"
                label="Reintentar envío"
                icon="pi pi-refresh"
                outlined
                severity="warn"
                :loading="retrying === charge.chargeId"
                :disabled="retrying != null"
                @click="retryFiscal(charge)"
              />
              <Button
                v-if="invoiceJobState(charge) === 'done'"
                label="Descargar"
                icon="pi pi-download"
                @click="downloadIssued(charge)"
              />
              <Button
                label="Factura"
                icon="pi pi-file"
                outlined
                @click="invoiceCharge = charge"
              />
            </template>
            <Button
              v-if="canRefund"
              label="Devolver"
              icon="pi pi-undo"
              outlined
              :disabled="busy || fullyRefunded(charge)"
              @click="select(charge)"
            />
          </div>
        </article>
        <Message v-if="error && !selected" severity="error" :closable="false">{{
          error
        }}</Message>
      </div>
    </div>

    <div v-else-if="!receipt && selected" class="refund-detail">
      <Button
        label="Tickets"
        icon="pi pi-arrow-left"
        text
        severity="secondary"
        size="small"
        :disabled="busy"
        @click="selected = null"
      />
      <div class="refund-head">
        <strong>{{ selected.code }}</strong>
        <b>{{ fmt(Number(selected.total), String(selected.currency)) }}</b>
      </div>
      <div class="pay-methods" role="group" aria-label="Tipo de devolución">
        <button
          type="button"
          :class="{ selected: mode === 'TOTAL' }"
          :aria-pressed="mode === 'TOTAL'"
          :disabled="busy"
          @click="mode = 'TOTAL'"
        >
          <span>Total</span>
        </button>
        <button
          type="button"
          :class="{ selected: mode === 'PARTIAL' }"
          :aria-pressed="mode === 'PARTIAL'"
          :disabled="busy"
          @click="mode = 'PARTIAL'"
        >
          <span>Parcial</span>
        </button>
      </div>
      <div v-if="mode === 'PARTIAL'" class="refund-lines">
        <div
          v-for="line in selected.lines ?? []"
          :key="line.productId"
          class="refund-line"
        >
          <div>
            <strong>{{ line.name }}</strong>
            <small>
              {{ fmtQty(line.quantity) }} ×
              {{ fmt(Number(line.unitGross), String(selected.currency)) }} ·
              disponible {{ fmtQty(line.remainingQty) }}
            </small>
          </div>
          <InputNumber
            :model-value="retQty[line.productId ?? -1] ?? 0"
            :min="0"
            :max="Number(line.remainingQty) || 0"
            :min-fraction-digits="0"
            :max-fraction-digits="3"
            locale="de-DE"
            show-buttons
            :disabled="busy || (Number(line.remainingQty) || 0) <= 0"
            :input-style="{ width: '90px' }"
            :aria-label="`Devolver de ${line.name}`"
            @update:model-value="setQty(line.productId, $event)"
          />
        </div>
      </div>
      <div class="pay-methods" role="group" aria-label="Método de devolución">
        <button
          type="button"
          :class="{ selected: method === 'CASH' }"
          :aria-pressed="method === 'CASH'"
          :disabled="busy"
          @click="method = 'CASH'"
        >
          <i class="pi pi-money-bill" /><span>Efectivo</span>
        </button>
        <button
          type="button"
          :class="{ selected: method === 'CARD' }"
          :aria-pressed="method === 'CARD'"
          :disabled="busy"
          @click="method = 'CARD'"
        >
          <i class="pi pi-credit-card" /><span>Tarjeta</span>
        </button>
      </div>
      <label for="refund-reason">Motivo (obligatorio)</label>
      <textarea
        id="refund-reason"
        v-model="reason"
        rows="2"
        maxlength="500"
        class="refund-reason"
        placeholder="P. ej. artículo defectuoso, cliente insatisfecho…"
        :disabled="busy"
      />
      <div class="change-box ok">
        <small>A devolver</small
        ><strong>{{ fmt(previewTotal, currencyOf) }}</strong>
      </div>
      <Message v-if="error" severity="error" :closable="false">{{
        error
      }}</Message>
    </div>

    <div v-else-if="receipt" class="pay-success" role="status">
      <span class="pay-check"><i class="pi pi-check" /></span>
      <strong
        >{{ receipt.code }} ·
        {{ fmt(Number(receipt.total), currencyOf) }}</strong
      >
      <p class="card-note">
        Devuelve {{ fmt(Number(receipt.total), currencyOf) }} en
        {{ receipt.method === "CARD" ? "tarjeta" : "efectivo" }}. Ticket origen:
        {{ receipt.chargeCode }}.
      </p>
    </div>

    <PrinterControls
      v-if="receipt"
      language="ESCPOS"
      :register-id="String(registerId ?? '')"
      :disabled="printing"
    />

    <template #footer
      ><div class="dialog-actions">
        <div class="kiwik-separator" />
        <template v-if="!receipt && !selected">
          <Button
            label="Cerrar"
            text
            severity="secondary"
            :disabled="busy"
            @click="$emit('close')"
          />
        </template>
        <template v-else-if="!receipt">
          <Button
            label="Cancelar"
            text
            severity="secondary"
            :disabled="busy"
            @click="selected = null"
          /><Button
            label="Confirmar devolución"
            icon="pi pi-undo"
            severity="danger"
            :loading="busy"
            :disabled="busy || !canConfirm"
            @click="confirm"
          />
        </template>
        <template v-else>
          <div class="success-actions">
            <Button
              label="Imprimir resguardo"
              icon="pi pi-print"
              class="print-btn"
              :loading="printing"
              :disabled="printing"
              @click="print"
            /><Button
              label="Cerrar"
              outlined
              :disabled="printing"
              @click="$emit('close')"
            />
          </div>
        </template></div
    ></template>
  </Dialog>
  <TpvInvoiceDialog
    :visible="!!invoiceCharge"
    :charge="invoiceCharge"
    :opening-id="openingId"
    @close="closeInvoice"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import TpvInvoiceDialog from "./TpvInvoiceDialog.vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
import PrinterControls from "../../components/Printing/PrinterControls.vue";
import {
  printConfiguredReceipt,
  openCashDrawerOnce,
  printConfiguredRefund,
  refreshPrintSettings,
} from "../../services/Printing/printerService";
import { downloadInvoicePdf, invoiceJobs } from "./tpvInvoiceQueue";
import type { TpvCharge, TpvReceipt, TpvRefund } from "./tpvReceipt";

const props = defineProps<{
  visible: boolean;
  canRefund?: boolean;
  openingId: number | null;
  registerId?: number | null;
  zoneName?: string | null;
  registerName?: string | null;
}>();
const emit = defineEmits<{
  close: [];
  refunded: [receipt: TpvRefund];
}>();

const auth = useAuthStore();
const toast = useToast();
const loading = ref(false);
const busy = ref(false);
const printing = ref(false);
const reprinting = ref<number | null>(null);
const error = ref("");
const charges = ref<TpvCharge[]>([]);
const invoiceCharge = ref<TpvCharge | null>(null);
const search = ref("");
const historic = ref(false);
const searchInput = ref<HTMLInputElement | null>(null);
const normalizeSearch = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
// Filter the loaded opening only; never imply that this searches historic cash sessions.
const filteredCharges = computed(() => {
  if (historic.value) return charges.value;
  const terms = normalizeSearch(search.value)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return charges.value.filter((charge) => {
    const text = normalizeSearch(
      [
        charge.code,
        charge.cashier,
        charge.tableName,
        fmtDate(charge.chargedAt),
        charge.total,
        fmt(Number(charge.total), String(charge.currency || "EUR")),
      ].join(" "),
    );
    return terms.every((term) => text.includes(term));
  });
});
function showKeyboard() {
  searchInput.value?.focus();
  window.dispatchEvent(new CustomEvent("kiwik:alpha-show"));
}
const selected = ref<TpvCharge | null>(null);
const mode = ref<"TOTAL" | "PARTIAL">("TOTAL");
const method = ref<"CASH" | "CARD">("CASH");
const reason = ref("");
const retQty = ref<Record<number, number>>({});
const receipt = ref<TpvRefund | null>(null);

const currencyOf = computed(() =>
  String(selected.value?.currency || receipt.value?.currency || "EUR"),
);

function fmt(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currency || "EUR",
    }).format(value || 0);
  } catch {
    return `${(value || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || "EUR"}`;
  }
}
function fmtQty(value: unknown): string {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 }).format(
    Number(value) || 0,
  );
}
function fmtDate(raw: unknown): string {
  if (!raw) return "";
  const date = new Date(
    String(raw).includes("T") ? String(raw) : `${raw}T00:00:00`,
  );
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
function fullyRefunded(charge: TpvCharge): boolean {
  return (
    Number(charge.refundedTotal) >= Number(charge.total) &&
    Number(charge.total) > 0
  );
}
/** Estado fiscal F2 del ticket para el distintivo de la tarjeta. */
function fiscalLabel(charge: TpvCharge): string {
  switch (charge.verifactuStatus) {
    case "ACCEPTED":
    case "ACCEPTED_WITH_ERRORS":
      return "Aceptada";
    case "NEEDS_CORRECTION":
    case "ERROR":
      return "Error de envío";
    default:
      return "Pendiente de envío";
  }
}
function fiscalFailed(charge: TpvCharge): boolean {
  return (
    charge.verifactuStatus === "NEEDS_CORRECTION" ||
    charge.verifactuStatus === "ERROR"
  );
}
const retrying = ref<number | null>(null);
async function retryFiscal(charge: TpvCharge) {
  if (charge.chargeId == null || retrying.value != null) return;
  retrying.value = charge.chargeId;
  try {
    await axios.post(
      backendUrl(`/WebTpv/charges/${charge.chargeId}/verifactu-retry`),
      {},
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    toast.add({
      severity: "success",
      summary: "Reencolado para envío",
      life: 4000,
    });
    await load();
  } catch (e) {
    toast.add({ severity: "error", summary: detailOf(e), life: 6000 });
  } finally {
    retrying.value = null;
  }
}
function detailOf(e: unknown): string {
  if (
    axios.isAxiosError(e) &&
    typeof e.response?.data === "string" &&
    !e.response.data.includes("<")
  )
    return e.response.data;
  return e instanceof Error ? e.message : "No se pudo reencolar el envío.";
}
/** Estado de generación de factura de cada ticket (cola compartida). */
function invoiceCode(charge: TpvCharge): string | null {
  return (
    invoiceJobs.value.get(charge.chargeId ?? -1)?.invoiceCode ||
    charge.invoiceCode ||
    null
  );
}
function closeInvoice() {
  invoiceCharge.value = null;
  void load(historic.value);
}
function invoiceJobState(charge: TpvCharge): string | null {
  if (charge.chargeId == null) return null;
  return invoiceJobs.value.get(charge.chargeId)?.state ?? null;
}
/** Descarga directa cuando la factura ya quedó lista en segundo plano. */
async function downloadIssued(charge: TpvCharge) {
  if (charge.chargeId == null) return;
  try {
    await downloadInvoicePdf(charge.chargeId);
    toast.add({
      severity: "success",
      summary: "Factura descargada",
      detail: "Imprímela para el cliente desde el visor.",
      life: 6000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "Aún no está disponible. Abre Factura para ver su estado.",
      life: 5000,
    });
  }
}

/** Total previsto prorrateando como el servidor (orientativo; manda el back). */
const previewTotal = computed(() => {
  if (!selected.value) return 0;
  if (mode.value === "TOTAL")
    return (
      Number(selected.value.total) - Number(selected.value.refundedTotal || 0)
    );
  let sum = 0;
  for (const line of selected.value.lines ?? []) {
    const pid = line.productId ?? -1;
    const qty = retQty.value[pid] ?? 0;
    const chargedQty = Number(line.quantity) || 0;
    if (qty > 0 && chargedQty > 0)
      sum += (Number(line.total) * qty) / chargedQty;
  }
  return Math.round(sum * 100) / 100;
});

const canConfirm = computed(() => {
  if (!selected.value || !reason.value.trim()) return false;
  if (mode.value === "TOTAL") return !fullyRefunded(selected.value);
  return previewTotal.value > 0;
});

watch(
  () => props.visible,
  (open) => {
    if (open) {
      search.value = "";
      charges.value = [];
      selected.value = null;
      receipt.value = null;
      error.value = "";
      void load();
    }
  },
);

async function load(history = false) {
  if (props.openingId == null || loading.value) return;
  const code = search.value.trim().toUpperCase();
  if (history && !/^T-[1-9][0-9]{0,18}$/.test(code)) {
    error.value = "Indica el número completo del ticket, por ejemplo T-123.";
    return;
  }
  historic.value = history;
  charges.value = [];
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get<TpvCharge[]>(
      backendUrl(`/WebTpv/openings/${props.openingId}/charges`),
      {
        ...auth.portalRequestConfig(),
        params: history ? { code } : {},
        timeout: 15000,
      },
    );
    charges.value = Array.isArray(data) ? data : [];
  } catch (e) {
    charges.value = [];
    error.value =
      axios.isAxiosError(e) &&
      typeof e.response?.data === "string" &&
      !e.response.data.includes("<")
        ? e.response.data
        : "No se pudieron cargar los tickets cobrados.";
  } finally {
    loading.value = false;
  }
}

function select(charge: TpvCharge) {
  selected.value = charge;
  mode.value = "TOTAL";
  method.value = "CASH";
  reason.value = "";
  error.value = "";
  retQty.value = {};
}

function setQty(productId: number | undefined, value: number | null) {
  if (productId == null) return;
  retQty.value = { ...retQty.value, [productId]: value ?? 0 };
}

async function confirm() {
  if (
    busy.value ||
    !canConfirm.value ||
    !selected.value ||
    props.openingId == null
  )
    return;
  busy.value = true;
  error.value = "";
  try {
    const payload: Record<string, unknown> = {
      operationKey: crypto.randomUUID(),
      openingId: props.openingId,
      chargeId: selected.value.chargeId,
      method: method.value,
      reason: reason.value.trim(),
    };
    if (mode.value === "PARTIAL") {
      payload.lines = (selected.value.lines ?? [])
        .filter((l) => (retQty.value[l.productId ?? -1] ?? 0) > 0)
        .map((l) => ({
          productId: l.productId,
          quantity: retQty.value[l.productId ?? -1] ?? 0,
        }));
    }
    const { data } = await axios.post<TpvRefund>(
      backendUrl("/WebTpv/refund"),
      payload,
      { ...auth.portalRequestConfig(), timeout: 20000 },
    );
    receipt.value = data;
    // Hardware failures must not turn a successful payment into a failed checkout.
    void openCashDrawerOnce(data, String(props.registerId ?? "")).catch((e) => {
      toast.add({
        severity: "warn",
        summary: "Operación registrada · revisa el cajón",
        detail:
          (e instanceof Error ? e.message : "No se confirmó la apertura.") +
          " Comprueba el cajón; no se repetirá automáticamente.",
        life: 9000,
      });
    });
    emit("refunded", data);
  } catch (e) {
    const detail = axios.isAxiosError(e) ? e.response?.data : null;
    error.value =
      typeof detail === "string" && !detail.includes("<")
        ? detail
        : detail?.message || "No se pudo registrar la devolución.";
  } finally {
    busy.value = false;
  }
}

async function print() {
  if (!receipt.value || printing.value) return;
  printing.value = true;
  try {
    refreshPrintSettings();
    const message = await printConfiguredRefund(
      receipt.value,
      String(props.registerId ?? ""),
    );
    toast.add({ severity: "success", summary: message, life: 4000 });
  } catch (e) {
    toast.add({
      severity: "error",
      summary:
        e instanceof Error ? e.message : "No se pudo enviar el resguardo.",
      life: 5000,
    });
  } finally {
    printing.value = false;
  }
}

/** Reimprime el ticket original cobrado (no la devolución). */
async function reprint(charge: TpvCharge) {
  if (reprinting.value != null || charge.chargeId == null) return;
  reprinting.value = charge.chargeId;
  try {
    refreshPrintSettings();
    const currency = String(charge.currency || "EUR");
    const receipt: TpvReceipt = {
      chargeId: charge.chargeId,
      code: charge.code,
      chargedAt: charge.chargedAt,
      currency,
      cashier: charge.cashier,
      zoneName: props.zoneName ?? undefined,
      registerName: props.registerName ?? undefined,
      tableName: charge.tableName,
      customerName: charge.customerName,
      customerNif: charge.customerNif,
      fiscalCode: charge.fiscalCode,
      qrUrl: charge.qrUrl,
      qrPng: charge.qrPng,
      verifactuStatus: charge.verifactuStatus,
      net: charge.net,
      tax: charge.tax,
      total: charge.total,
      paid: charge.paid,
      change: charge.change,
      lines: (charge.lines ?? []).map((l) => ({
        productId: l.productId,
        code: l.code,
        name: l.name,
        quantity: l.quantity,
        unitGross: l.unitGross,
        tax: l.tax,
        total: l.total,
      })),
      payments: (charge.payments ?? []).map((p) => ({
        method: p.method,
        amount: p.amount,
      })),
    };
    const message = await printConfiguredReceipt(
      receipt,
      String(props.registerId ?? ""),
    );
    toast.add({ severity: "success", summary: message, life: 4000 });
  } catch (e) {
    toast.add({
      severity: "error",
      summary:
        e instanceof Error ? e.message : "No se pudo reimprimir el ticket.",
      life: 5000,
    });
  } finally {
    reprinting.value = null;
  }
}
</script>

<style scoped>
.invoice-code {
  color: #526600;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.dialog-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
.dialog-actions > .kiwik-separator {
  flex-basis: 100%;
  width: 100%;
}
.refund-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.refund-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(46vh, 420px);
  overflow-y: auto;
  padding-right: 4px;
}
.refund-card-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 0 0 auto;
}
.refund-search {
  position: sticky;
  top: 0;
  z-index: 1;
  background: white;
  padding-bottom: 12px;
  display: grid;
  gap: 8px;
}
.refund-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.refund-search-row input {
  flex: 1;
  min-width: 0;
  padding: 12px;
  border: 1px solid #dce4d5;
  border-radius: 8px;
  font: inherit;
}
.refund-search-row input:focus {
  outline: 2px solid #9cc10a;
  outline-offset: 1px;
}
.refund-search small {
  color: #647064;
}
.refund-empty {
  color: #647064;
}
.refund-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid #dce4d5;
  border-radius: 12px;
  background: #fafbf8;
}
.refund-card > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.refund-card small {
  color: #69765b;
}
.refund-card b {
  color: #253000;
  font-size: 17px;
}
.refunded-note {
  color: #9a4c4c !important;
  font-weight: 700;
}
.fiscal-note {
  color: #405a00 !important;
  font-weight: 700;
}
.refund-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.refund-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f2f6e7;
  color: #253000;
}
.refund-head b {
  font-size: 24px;
}
.pay-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.pay-methods button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px;
  border: 1px solid #dce4d5;
  border-radius: 12px;
  background: #fafbf8;
  color: #253000;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
.pay-methods button.selected {
  background: #eef6d7;
  border-color: #9cc10a;
  box-shadow: inset 3px 0 #9cc10a;
}
.pay-methods button:disabled {
  opacity: 0.6;
  cursor: default;
}
.pay-methods .pi {
  font-size: 18px;
}
.refund-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}
.refund-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid #dce4d5;
  border-radius: 10px;
}
.refund-line > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.refund-line small {
  color: #69765b;
}
label {
  display: block;
  margin-top: 4px;
  font-weight: 700;
  color: #253000;
}
.refund-reason {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid #dce4d5;
  border-radius: 8px;
  font: inherit;
  resize: vertical;
}
.change-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f5f8ef;
  color: #69765b;
}
.change-box strong {
  font-size: 30px;
}
.change-box.ok {
  background: #eef6d7;
  color: #405a00;
}
.card-note {
  color: #647064;
  line-height: 1.55;
  text-align: center;
}
.pay-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  text-align: center;
}
.pay-check {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #9cc10a;
  color: #253000;
  font-size: 26px;
}
.pay-success > strong {
  font-size: 22px;
  color: #253000;
}
.success-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
.success-actions :deep(.p-button) {
  width: 100%;
  min-height: 58px;
  font-size: 17px;
  font-weight: 800;
}
.success-actions :deep(.p-button.print-btn) {
  min-height: 72px;
  font-size: 20px;
}
</style>
