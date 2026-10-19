<template>
  <Dialog
    :visible="visible && !choosing"
    header="Facturar ticket cobrado"
    :modal="false"
    class="kiwik-dialog"
    :style="{ width: 'min(570px, 96vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :closable="!busy && !emailBusy"
    :close-on-escape="!busy && !emailBusy"
    @update:visible="$emit('close')"
  >
    <div class="ticket-summary">
      <strong>{{ charge?.code }}</strong
      ><strong>{{ money(charge?.total) }}</strong>
    </div>
    <p>
      El ticket ya está cobrado. La factura conserva la venta y su caja
      original.
    </p>
    <p v-if="loading" role="status">Consultando factura…</p>
    <template v-else-if="document?.invoiceId">
      <div class="document">
        <i class="pi pi-file" />
        <div>
          <strong>{{ document.code }}</strong
          ><span>{{ document.customerName }}</span
          ><span>{{ document.state }}</span>
          <span v-if="document.substitutedCode">
            Factura F3 · Sustituye al ticket {{ document.substitutedCode }}
          </span>
        </div>
      </div>
      <div
        v-for="canje in canjeDocuments.filter((item) => item.refundId)"
        :key="canje.invoiceId"
        class="document"
      >
        <i class="pi pi-file" />
        <div>
          <strong>{{ canje.code }} · {{ money(canje.total) }}</strong>
          <span>Factura F3 · Canje de {{ canje.substitutedCode }}</span>
          <span>{{
            canje.verifactuStatus === "ACCEPTED" ||
            canje.verifactuStatus === "ACCEPTED_WITH_ERRORS"
              ? "Aceptada"
              : canje.verifactuStatus || "Borrador"
          }}</span>
        </div>
      </div>
      <Message
        v-if="canjeDocuments.length > 1"
        severity="info"
        :closable="false"
      >
        {{ canjeDocuments.length }} facturas · Importe conjunto
        {{ money(canjeDocuments.reduce((sum, item) => sum + item.total, 0)) }}.
        La F3 del ticket y las F3 negativas de sus devoluciones se entregan
        juntas. No hay otro cobro ni abono.
      </Message>
      <p>
        Puedes emitirla aquí mismo con el certificado configurado para TPV y
        descargar el PDF conjunto para imprimirlo al cliente.
      </p>
      <p
        v-if="job && (job.state === 'issuing' || job.state === 'polling')"
        role="status"
      >
        <i class="pi pi-spin pi-spinner" />
        {{
          job.state === "issuing"
            ? "Solicitando la factura…"
            : "Generando en VeriFactu… puedes seguir vendiendo, te avisaremos aquí y con un aviso."
        }}
      </p>
      <Message
        v-if="job?.state === 'pending'"
        severity="warn"
        :closable="false"
        >{{ job.error }}</Message
      >
      <Message
        v-if="job?.state === 'error'"
        severity="error"
        :closable="false"
        >{{ job.error }}</Message
      >
      <ul v-if="issueErrorList.length" class="issue-errors">
        <li v-for="(item, i) in issueErrorList" :key="i">
          <strong>{{ item.location }}:</strong> {{ item.message }}
        </li>
      </ul>
      <div class="invoice-actions">
        <Button
          :label="
            pdfReady
              ? 'Descargar PDF'
              : job?.state === 'pending'
                ? 'Comprobar estado'
                : 'Solicitar factura'
          "
          :icon="pdfReady ? 'pi pi-download' : 'pi pi-send'"
          :loading="job?.state === 'issuing' || job?.state === 'polling'"
          :disabled="
            busy ||
            loading ||
            job?.state === 'issuing' ||
            job?.state === 'polling'
          "
          @click="pdfReady ? downloadAgain() : askInvoice()"
        />
      </div>
      <div v-if="pdfReady" class="email-row">
        <InputText
          v-model="emailTo"
          type="email"
          placeholder="Correo del cliente"
          :disabled="emailBusy"
          aria-label="Correo del cliente"
        />
        <Button
          :label="emailSent ? 'Enviado · reenviar' : 'Enviar por correo'"
          icon="pi pi-envelope"
          outlined
          :loading="emailBusy"
          :disabled="emailBusy || !emailTo.trim()"
          @click="sendEmail"
        />
      </div>
      <div
        v-for="rec in document.rectifications"
        :key="rec.code"
        class="document"
      >
        <i class="pi pi-replay" />
        <div>
          <strong>{{ rec.code }}</strong
          ><span>{{ rec.state }} · {{ money(rec.total) }}</span>
        </div>
      </div>
    </template>
    <template v-else-if="!loading">
      <Button
        :label="customer ? 'Cambiar contacto' : 'Seleccionar o crear contacto'"
        icon="pi pi-user"
        outlined
        :disabled="busy || uncertain"
        @click="choosing = true"
      />
      <div v-if="customer" class="document">
        <i class="pi pi-user" />
        <div>
          <strong>{{ customer.name }}</strong
          ><span>{{ customer.nif }}</span
          ><span
            >{{ customer.address }} · {{ customer.postal }}
            {{ customer.city }}</span
          >
        </div>
      </div>
      <p>
        <!-- El ticket F2 conserva su identidad y su cobro al sustituirse por F3. -->
        Se creará un borrador en el ERP. Si el ticket ya es una factura
        simplificada, se emitirá una factura completa F3 que lo sustituya, con
        los datos del cliente y la referencia al ticket original. Si tiene
        devoluciones R5, se preparará también una F3 negativa por cada una,
        conservando sus importes. No se realiza otro cobro ni abono.
      </p>
    </template>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <template #footer
      ><div class="invoice-footer">
        <div class="kiwik-separator" />
        <div>
          <Button
            label="Cerrar"
            text
            severity="secondary"
            :disabled="busy || emailBusy"
            @click="$emit('close')"
          /><Button
            v-if="!document?.invoiceId"
            :label="uncertain ? 'Comprobar y reintentar' : 'Preparar factura'"
            icon="pi pi-file"
            :loading="busy"
            :disabled="loading || !customer || busy"
            @click="prepare"
          />
        </div></div
    ></template>
  </Dialog>
  <TpvCustomerDialog
    :visible="visible && choosing"
    :customer="customer"
    @close="choosing = false"
    @clear="
      customer = null;
      choosing = false;
    "
    @save="
      customer = $event;
      choosing = false;
    "
    @keyboard="showKeyboard"
  />
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
import TpvCustomerDialog, { type TpvCustomer } from "./TpvCustomerDialog.vue";
import {
  downloadInvoicePdf,
  invoiceJobs,
  requestInvoice,
} from "./tpvInvoiceQueue";
import type { InvoiceDocument } from "./tpvInvoiceQueue";
import type { TpvCharge } from "./tpvReceipt";
interface InvoiceStatus {
  invoiceId: number | null;
  customer?: TpvCustomer;
  customerWarning?: string;
  code?: string;
  customerName?: string;
  customerEmail?: string;
  state?: string;
  verifactuStatus?: string;
  fiscalType?: "F1" | "F3";
  substitutedCode?: string;
  documents?: InvoiceDocument[];
  groupTotal?: number;
  rectifications?: { code: string; state: string; total: number }[];
}
const props = defineProps<{
  visible: boolean;
  charge: TpvCharge | null;
  openingId: number | null;
}>();
const emit = defineEmits<{ close: [] }>();
const auth = useAuthStore();
const toast = useToast();
const customer = ref<TpvCustomer | null>(null),
  document = ref<InvoiceStatus | null>(null);
const loading = ref(false),
  busy = ref(false),
  choosing = ref(false),
  uncertain = ref(false),
  error = ref("");
const money = (value: unknown) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Number(value) || 0,
  );
const showKeyboard = () =>
  window.dispatchEvent(new CustomEvent("kiwik:alpha-show"));
function detail(e: unknown) {
  if (axios.isAxiosError(e)) {
    const body = e.response?.data;
    if (typeof body === "string" && body.trim() && !body.trim().startsWith("<"))
      return body;
    // Accept both Spring error responses and ProblemDetail without losing the business reason.
    if (body && typeof body === "object") {
      for (const key of ["detail", "message", "reason"]) {
        if (typeof body[key] === "string" && body[key].trim()) return body[key];
      }
    }
    if (e.response?.status === 401)
      return "La sesión ha caducado. Vuelve a identificarte.";
    if (e.response?.status === 403)
      return "No tienes permiso para preparar esta factura.";
    if (e.response?.status === 404)
      return "No se encuentra el ticket o la función de facturación en el servidor. Comprueba que el backend esté actualizado.";
    if (e.response)
      return `No se pudo preparar la factura (HTTP ${e.response.status}). Consulta el registro del servidor y reintenta para comprobar su estado.`;
  }
  return "No se pudo contactar con el servidor. Reintenta para comprobar si se creó la factura.";
}
let generation = 0;
const issueErrorList = ref<Array<{ message: string; location: string }>>([]);
const emailTo = ref("");
const emailBusy = ref(false);
const emailSent = ref(false);
/** Trabajo en segundo plano de este ticket (sobrevive al cierre del diálogo). */
const canjeDocuments = computed(() => {
  const saved = document.value?.documents ?? [];
  const current = job.value?.documents;
  if (
    current?.length &&
    saved.every((item) =>
      current.some((candidate) => candidate.invoiceId === item.invoiceId),
    )
  )
    return current;
  return saved;
});
const pdfReady = computed(() =>
  canjeDocuments.value.length
    ? canjeDocuments.value.every((item) =>
        ["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(
          item.verifactuStatus ?? "",
        ),
      )
    : job.value?.state === "done" ||
      ["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(
        document.value?.verifactuStatus ?? "",
      ),
);
const job = computed(
  () => invoiceJobs.value.get(props.charge?.chargeId ?? -1) ?? null,
);
watch(
  () => [props.visible, props.charge?.chargeId],
  async () => {
    const token = ++generation;
    if (!props.visible) return;
    if (!props.charge?.chargeId) return;
    document.value = null;
    customer.value = null;
    choosing.value = false;
    uncertain.value = false;
    error.value = "";
    issueErrorList.value = [];
    emailTo.value = "";
    emailSent.value = false;
    loading.value = true;
    try {
      const { data } = await axios.get<InvoiceStatus>(
        backendUrl(`/WebTpv/charges/${props.charge.chargeId}/invoice`),
        {
          ...auth.portalRequestConfig(),
          params: { openingId: props.openingId },
          timeout: 15000,
        },
      );
      if (token === generation) {
        if (
          job.value?.state === "done" &&
          !["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(
            data.verifactuStatus ?? "",
          )
        )
          invoiceJobs.value.delete(props.charge!.chargeId!);
        document.value = data;
        customer.value = data.customer ?? null;
        error.value = data.customerWarning ?? "";
        emailTo.value = data.customerEmail || data.customer?.email || "";
      }
    } catch (e) {
      if (token === generation) error.value = detail(e);
    } finally {
      if (token === generation) loading.value = false;
    }
  },
);
async function prepare() {
  if (!customer.value || !props.charge?.chargeId || busy.value) return;
  busy.value = true;
  error.value = "";
  try {
    const { data } = await axios.post<InvoiceStatus>(
      backendUrl(`/WebTpv/charges/${props.charge.chargeId}/invoice`),
      { openingId: props.openingId, contactId: customer.value.id },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    document.value = data;
    emailTo.value = data.customerEmail || customer.value?.email || "";
    uncertain.value = false;
  } catch (e) {
    error.value = detail(e);
    uncertain.value =
      !axios.isAxiosError(e) || !e.response || e.response.status >= 500;
  } finally {
    busy.value = false;
  }
}

/** Pide la factura y sigue vendiendo: la cola avisa al terminar. */
async function askInvoice() {
  if (
    !props.charge?.chargeId ||
    props.openingId == null ||
    !document.value?.invoiceId
  )
    return;
  issueErrorList.value = [];
  // The shared queue owns the request; closing or changing the ticket cannot overwrite this dialog.
  void requestInvoice(props.charge.chargeId, props.openingId, (notice) =>
    toast.add(notice),
  );
}

async function downloadAgain() {
  if (!props.charge?.chargeId) return;
  try {
    await downloadInvoicePdf(
      props.charge.chargeId,
      props.openingId ?? undefined,
    );
    toast.add({
      severity: "success",
      summary: "Factura descargada",
      detail: "Imprímela para el cliente desde el visor.",
      life: 6000,
    });
  } catch {
    toast.add({
      severity: "error",
      summary: "No se pudo descargar el PDF.",
      life: 5000,
    });
  }
}

async function sendEmail() {
  if (
    !props.charge?.chargeId ||
    props.openingId == null ||
    emailBusy.value ||
    !emailTo.value.trim()
  )
    return;
  emailBusy.value = true;
  error.value = "";
  const token = generation;
  const recipient = emailTo.value.trim();
  try {
    const { data } = await axios.post(
      backendUrl(`/WebTpv/charges/${props.charge.chargeId}/email`),
      { openingId: props.openingId, email: emailTo.value.trim() },
      { ...auth.portalRequestConfig(), timeout: 30000 },
    );
    if (token !== generation) return;
    emailSent.value = true;
    toast.add({
      severity: "success",
      summary: `Factura enviada a ${data?.email ?? recipient}`,
      life: 5000,
    });
    emit("close");
  } catch (e) {
    if (token === generation) error.value = detail(e);
  } finally {
    emailBusy.value = false;
  }
}
</script>
<style scoped>
p {
  color: #647064;
  line-height: 1.5;
}
.ticket-summary {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
}
.document {
  display: flex;
  gap: 12px;
  border: 1px solid #dbe4cd;
  background: #f7f9f2;
  border-radius: 10px;
  padding: 16px;
  margin-top: 16px;
}
.document div {
  display: grid;
  gap: 5px;
}
.document i {
  color: #799509;
}
.invoice-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}
.email-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}
.email-row :deep(.p-inputtext) {
  flex: 1;
  min-width: 0;
}
.issue-errors {
  margin: 8px 0 0;
  padding-left: 20px;
  color: #9a3c3c;
  font-size: 13px;
  line-height: 1.5;
}
.invoice-footer {
  width: 100%;
}
.invoice-footer > div:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
