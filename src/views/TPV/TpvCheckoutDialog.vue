<template>
  <Dialog
    :visible="visible"
    :header="receipt ? 'Cobro registrado' : 'Cobrar ticket'"
    :modal="false"
    class="kiwik-dialog tpv-checkout-float"
    :style="{ width: 'min(480px, 94vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :closable="!busy && !receipt && !pendingRequest"
    :close-on-escape="!busy && !receipt && !pendingRequest"
    @update:visible="$emit('close')"
  >
    <div v-if="!receipt">
      <div class="payment-total">
        <small>Total a cobrar</small><strong>{{ fmt(total) }}</strong>
      </div>
      <Message v-if="pendingRequest && !busy" severity="warn" :closable="false"
        >La respuesta no ha llegado. Reintenta para comprobar este mismo cobro
        sin duplicarlo. Mantén esta pantalla abierta.</Message
      >
      <div class="pay-methods" role="group" aria-label="Método de pago">
        <button
          type="button"
          :class="{ selected: method === 'CASH' }"
          :aria-pressed="method === 'CASH'"
          :disabled="busy || !!pendingRequest"
          @click="method = 'CASH'"
        >
          <i class="pi pi-money-bill" /><span>Efectivo</span>
        </button>
        <button
          type="button"
          :class="{ selected: method === 'CARD' }"
          :aria-pressed="method === 'CARD'"
          :disabled="busy || !!pendingRequest"
          @click="method = 'CARD'"
        >
          <i class="pi pi-credit-card" /><span>Tarjeta</span>
        </button>
      </div>

      <template v-if="method === 'CASH'">
        <label for="tpv-tendered"
          >Entregado (usa el teclado numérico del TPV)</label
        >
        <InputNumber
          input-id="tpv-tendered"
          v-model="tendered"
          class="tendered-input"
          mode="currency"
          :currency="currency"
          locale="de-DE"
          :min="0"
          :max-fraction-digits="2"
          fluid
          :disabled="busy || !!pendingRequest"
          autofocus
          @update:modelValue="
            tenderedText =
              $event == null ? '' : String($event).replace('.', ',')
          "
        />
        <div class="quick-grid">
          <Button
            label="Exacto"
            outlined
            :disabled="busy"
            @click="tendered = total"
          />
          <Button
            v-for="bill in bills"
            :key="bill"
            :label="`${bill} €`"
            outlined
            :disabled="busy"
            @click="tendered = bill"
          />
        </div>
        <div class="change-box" :class="{ ok: change !== null && change >= 0 }">
          <small>{{
            change != null && change < 0
              ? "Falta por entregar"
              : "Cambio a devolver"
          }}</small
          ><strong>{{ change === null ? "—" : fmt(Math.abs(change)) }}</strong>
        </div>
      </template>
      <p v-else class="card-note">
        Comprueba que el datáfono ha aprobado el pago de
        <strong>{{ fmt(total) }}</strong
        >. Después, confirma el cobro aquí.
      </p>

      <Message v-if="error" severity="error" :closable="false">{{
        error
      }}</Message>
    </div>

    <div v-else class="pay-success" role="status">
      <span class="pay-check"><i class="pi pi-check" /></span>
      <strong>{{ receipt.code }} · {{ fmt(Number(receipt.total)) }}</strong>
      <div v-if="receiptChange > 0" class="change-box ok">
        <small>Devolver al cliente</small
        ><strong>{{ fmt(receiptChange) }}</strong>
      </div>
      <p v-else class="card-note">Cobro registrado correctamente.</p>
    </div>

    <PrinterControls
      v-if="receipt"
      language="ESCPOS"
      :register-id="String(registerId ?? '')"
      :disabled="printing"
    />
    <template #footer
      ><div class="checkout-footer">
        <div class="kiwik-separator" />
        <div class="checkout-buttons">
          <template v-if="!receipt">
            <Button
              label="Cancelar"
              text
              severity="secondary"
              :disabled="busy || !!pendingRequest"
              @click="$emit('close')"
            /><Button
              :label="
                pendingRequest
                  ? 'Comprobar cobro'
                  : method === 'CARD'
                    ? 'Pago con tarjeta recibido'
                    : 'Confirmar cobro'
              "
              icon="pi pi-check"
              :loading="busy"
              :disabled="busy || (!pendingRequest && !canConfirm)"
              @click="confirm"
            />
          </template>
          <template v-else>
            <div class="success-actions">
              <Button
                label="Imprimir ticket"
                :loading="printing"
                :disabled="printing"
                icon="pi pi-print"
                class="print-btn"
                @click="print"
              /><Button
                label="Nuevo ticket"
                :disabled="printing"
                icon="pi pi-arrow-right"
                icon-pos="right"
                outlined
                @click="$emit('close')"
              />
            </div>
          </template>
        </div></div
    ></template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import Message from "primevue/message";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "primevue/usetoast";
import { type CheckoutLine, type TpvReceipt } from "./tpvReceipt";
import type { TpvCustomer } from "./TpvCustomerDialog.vue";
import PrinterControls from "../../components/Printing/PrinterControls.vue";
import {
  printConfiguredReceipt,
  openCashDrawerOnce,
  refreshPrintSettings,
} from "../../services/Printing/printerService";

const props = defineProps<{
  visible: boolean;
  total: number;
  currency: string;
  openingId: number | null;
  registerId: number | null;
  tableId?: number | null;
  partial?: boolean;
  revision?: string;
  lines: CheckoutLine[];
  customer?: TpvCustomer | null;
}>();
const emit = defineEmits<{
  close: [];
  paid: [receipt: TpvReceipt];
  pending: [value: boolean];
}>();

const auth = useAuthStore();
const toast = useToast();
const method = ref<"CASH" | "CARD">("CASH");
const tendered = ref<number | null>(null);
/** Texto del entregado (coma decimal): lo escriben el InputNumber y el teclado del TPV. */
const tenderedText = ref("");
function syncTenderedFromText() {
  tendered.value = tenderedText.value
    ? Number(tenderedText.value.replace(",", ".")) || 0
    : null;
}
/** Teclas del teclado numérico principal mientras el diálogo está abierto. */
function pressKey(digit: string) {
  if (method.value !== "CASH" || busy.value || pendingRequest.value) return;
  if (digit === ",") {
    if (tenderedText.value.includes(",")) return;
    tenderedText.value += tenderedText.value ? "," : "0,";
  } else {
    if (tenderedText.value.replace(/[^0-9]/g, "").length >= 7) return;
    const next = tenderedText.value + digit;
    if (Number(next.replace(",", ".")) > 999999.99) return;
    tenderedText.value = next;
  }
  syncTenderedFromText();
}
function pressBack() {
  if (method.value !== "CASH" || busy.value || pendingRequest.value) return;
  tenderedText.value = tenderedText.value.slice(0, -1);
  syncTenderedFromText();
}
function pressClear() {
  if (method.value !== "CASH" || busy.value || pendingRequest.value) return;
  tenderedText.value = "";
  syncTenderedFromText();
}
defineExpose({ pressKey, pressBack, pressClear });
const busy = ref(false);
const error = ref("");
const receipt = ref<TpvReceipt | null>(null);
const printing = ref(false);
const bills = computed(() =>
  [5, 10, 20, 50, 100, 200].filter((value) => value >= props.total).slice(0, 4),
);
// Retain the exact request until its outcome is known. Retrying must not create another charge.
const pendingRequest = ref<Record<string, unknown> | null>(null);
watch(pendingRequest, (value) => emit("pending", !!value), { flush: "sync" });

function fmt(value: number): string {
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: props.currency || "EUR",
    }).format(value || 0);
  } catch {
    return `${(value || 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${props.currency || "EUR"}`;
  }
}

const change = computed(() =>
  method.value !== "CASH" || tendered.value == null
    ? method.value === "CARD"
      ? 0
      : null
    : Math.round((tendered.value - props.total) * 100) / 100,
);
const canConfirm = computed(
  () =>
    props.openingId != null &&
    props.currency === "EUR" &&
    props.total > 0 &&
    Number.isFinite(props.total) &&
    (method.value === "CARD" ||
      (change.value != null &&
        Number.isFinite(change.value) &&
        change.value >= 0)),
);
const receiptChange = computed(() => Number(receipt.value?.change) || 0);

watch(
  () => props.visible,
  (open) => {
    if (open && !pendingRequest.value) {
      method.value = "CASH";
      tendered.value = Math.round(props.total * 100) / 100;
      tenderedText.value = String(Math.round(props.total * 100) / 100).replace(
        ".",
        ",",
      );
      busy.value = false;
      error.value = "";
      receipt.value = null;
      focusTendered();
    }
  },
);

watch(method, () => {
  if (props.visible) focusTendered();
});

/** El entregado coge el foco solo para que el TPV sin teclado físico vea dónde escribe. */
function focusTendered() {
  if (method.value !== "CASH") return;
  nextTick(() => document.getElementById("tpv-tendered")?.focus?.());
}

async function confirm() {
  if (busy.value || (!pendingRequest.value && !canConfirm.value)) return;
  busy.value = true;
  error.value = "";
  try {
    const payments =
      method.value === "CARD"
        ? [{ method: "CARD", amount: Math.round(props.total * 100) / 100 }]
        : [{ method: "CASH", amount: tendered.value }];
    if (!pendingRequest.value)
      pendingRequest.value = {
        operationKey: crypto.randomUUID(),
        openingId: props.openingId,
        tableId: props.tableId ?? null,
        partial: props.partial === true,
        revision: props.revision,
        expectedTotal: props.total,
        currency: props.currency,
        lines: props.lines.map((line) => ({ ...line })),
        payments,
        customer: props.customer ? { id: props.customer.id } : null,
      };
    const { data } = await axios.post<TpvReceipt>(
      backendUrl("/WebTpv/checkout"),
      pendingRequest.value,
      { ...auth.portalRequestConfig(), timeout: 20000 },
    );
    pendingRequest.value = null;
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
    emit("paid", data);
  } catch (e) {
    const status = axios.isAxiosError(e) ? e.response?.status : undefined;
    // A validation response is definitive; network errors and server failures are ambiguous.
    if (status != null && [400, 401, 403, 404, 409, 422].includes(status))
      pendingRequest.value = null;
    const detail = axios.isAxiosError(e) ? e.response?.data : null;
    error.value =
      typeof detail === "string" && !detail.includes("<")
        ? detail
        : detail?.message ||
          (pendingRequest.value
            ? "No se ha podido confirmar el resultado. Usa Comprobar cobro para recuperar la respuesta."
            : "No se pudo registrar el cobro. Revisa el ticket e inténtalo de nuevo.");
  } finally {
    busy.value = false;
  }
}

async function print() {
  if (!receipt.value || printing.value) return;
  printing.value = true;
  try {
    refreshPrintSettings();
    const message = await printConfiguredReceipt(
      receipt.value,
      String(props.registerId ?? ""),
    );
    toast.add({ severity: "success", summary: message, life: 4000 });
  } catch (e) {
    toast.add({
      severity: "error",
      summary: e instanceof Error ? e.message : "No se pudo enviar el ticket.",
      life: 5000,
    });
  } finally {
    printing.value = false;
  }
}
</script>

<style scoped>
.checkout-footer {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
}
.checkout-footer .kiwik-separator {
  width: 100%;
  height: 1.5px;
  background: #9cc10a;
  flex: 0 0 1.5px;
}
.checkout-buttons {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
}
.checkout-buttons :deep(.p-button) {
  white-space: nowrap;
}
.payment-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 20px;
  padding: 16px;
  border-radius: 12px;
  background: #f2f6e7;
  color: #253000;
}
.payment-total strong {
  font-size: 44px;
  letter-spacing: -0.5px;
}

.pay-methods {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 14px;
}
.pay-methods button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
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
  font-size: 20px;
}
.tendered-input:deep(.p-inputnumber-input) {
  font-size: 34px;
  font-weight: 800;
  text-align: right;
  min-height: 68px;
}
label {
  display: block;
  margin: 10px 0 6px;
  font-weight: 700;
  color: #253000;
}
.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 12px 0;
}
.quick-grid :deep(.p-button) {
  min-height: 62px;
  font-size: 19px;
  font-weight: 800;
  border-width: 2px;
}
.change-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f5f8ef;
  color: #69765b;
}
.change-box strong {
  font-size: 34px;
}
.change-box.ok {
  background: #eef6d7;
  color: #405a00;
}
.card-note {
  margin: 12px 0;
  color: #647064;
  line-height: 1.55;
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
  font-size: 28px;
  color: #253000;
}
.pay-success .change-box {
  width: 100%;
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
