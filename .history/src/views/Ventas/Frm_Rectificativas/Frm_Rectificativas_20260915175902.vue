<template>
  <RecInvoiceEmailDialog ref="emailDialog" @sent="refresh" />
  <main class="rec-page">
    <header class="hero">
      <div class="heading">
        <span class="hero-icon"><i class="pi pi-undo" /></span>
        <div>
          <small>Ventas / Operaciones</small>
          <h1>Facturas rectificativas</h1>
          <p>
            Abonos totales o parciales con trazabilidad hasta la factura
            original.
          </p>
        </div>
      </div>
      <Button
        label="Ventas"
        icon="pi pi-arrow-left"
        text
        severity="secondary"
        @click="router.push({ name: 'Ventas' })"
      />
    </header>

    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <section class="list-card">
      <div class="toolbar">
        <div>
          <h2>Listado de rectificativas</h2>
          <small
            >Los borradores reservan las cantidades que se van a abonar.</small
          >
        </div>
        <Button
          class="corporate"
          label="Nueva rectificativa"
          icon="pi pi-plus"
          @click="openNew"
        />
      </div>
      <form class="filters" @submit.prevent="load(0)">
        <InputText
          v-model="query"
          placeholder="Código, referencia o cliente"
          aria-label="Buscar rectificativa"
        /><Select
          v-model="status"
          :options="statuses"
          optionLabel="label"
          optionValue="value"
          placeholder="Todas las situaciones"
          showClear
          aria-label="Situación"
          @change="load(0)"
        /><Button
          label="Buscar"
          icon="pi pi-search"
          type="submit"
          :loading="loading"
        /><Button
          label="Actualizar"
          icon="pi pi-refresh"
          text
          :disabled="loading"
          @click="refresh"
        />
      </form>
      <GenericDataTable
        class="table compact-table custom-header-table"
        selectionMode="single"
        v-model:selection="selected"
        dataKey="pkid"
        endpoint="WebGetSalesRecInvoices"
        :params="{ status: status || undefined }"
        :requestConfig="() => auth.portalRequestConfig()"
        :showPaginator="true"
        :filterable="true"
        :showActions="false">
        <template #empty>No hay rectificativas para estos filtros.</template>
        <Column
          field="code"
          header="Código"
          sortable
          style="min-width: 155px"
          bodyStyle="white-space:nowrap"
          ><template #body="{ data }"
            ><span class="code-with-indicators"><span :class="{ 'draft-code': data.draft }">{{
              data.code
            }}</span><span v-if="data.rectificationCount" class="rectification-indicator" :title="rectificationTooltip(data)"><Tag :value="String(data.rectificationCount)" icon="pi pi-undo" severity="warn" rounded /></span></span></template
          ></Column
        ><Column
          field="date"
          header="Fecha"
          sortable
          style="width: 8rem"
          bodyStyle="white-space:nowrap;font-variant-numeric:tabular-nums"
          ><template #body="{ data }"><span class="invoice-date-time">{{
            dateTime(data.date)
          }}</span></template></Column
        ><Column
          field="customer"
          header="Cliente"
          sortable
          style="min-width: 180px"
        /><Column field="sourceCode" header="Documento rectificado" sortable />
        <Column field="state" header="Situación" sortable
          ><template #body="{ data }"
            ><Tag
              :value="stateLabel(data.state)"
              :severity="
                data.draft ? 'warn' : data.cancelled ? 'secondary' : 'success'
              " /></template
        ></Column>
        <Column field="verifactuStatus" header="VeriFactu" sortable
          ><template #body="{ data }"
            ><Tag
              v-if="data.verifactuStatus"
              :value="fiscalLabel(data.verifactuStatus)"
              :severity="
                data.verifactuStatus === 'ACCEPTED' ? 'success' : 'warn'
              "
            /><span v-else>—</span></template
          ></Column
        >
        <Column
          field="total"
          header="Total"
          sortable
          style="width: 10%; text-align: right"
          bodyStyle="text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums"
          ><template #body="{ data }">{{
            rectMoney(data.total, data.currency)
          }}</template></Column
        >
        <Column header="" style="width: 4rem"
          ><template #body="{ data }"
            ><Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              aria-label="Acciones de la rectificativa"
              :disabled="busy"
              @click="openMenu($event, data)" /></template
        ></Column>
      </GenericDataTable>
      <Menu ref="rowMenu" :model="rowItems" popup />
    </section>

      <Dialog
        v-model:visible="pickerVisible"
        modal
        header="Nueva rectificativa · Documento de origen"
        class="rec-dialog invoice-picker-dialog"
        :style="{ width: '65rem', height: '70vh' }"
        :breakpoints="{ '900px': '96vw' }"
      >
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <form class="filters" @submit.prevent="findInvoices">
        <InputText
          v-model="invoiceQuery"
          placeholder="Código o cliente de la factura o rectificativa"
          aria-label="Buscar documento de origen"
        /><Button
          label="Buscar"
          icon="pi pi-search"
          type="submit"
          :loading="busy"
        />
      </form>
      
      <DataTable
        :value="invoiceOptions"
        :loading="busy"
        dataKey="selectionKey"
        scrollable
        scrollHeight="flex"
        ><template #empty>Busca una factura o rectificativa aceptada.</template
        ><Column field="code" header="Documento" /><Column
          field="sourceType"
          header="Tipo" /><Column field="customer" header="Cliente" /><Column
          header="Acciones"
          ><template #body="{ data }"
            ><Button
              label="Seleccionar"
              :disabled="busy"
              @click="
                prepare(data.pkid, data.sourceRecInvoiceId)
              " /></template></Column
      ></DataTable>
      <p>
        Se muestran hasta 50 resultados. Acota la búsqueda si no aparece la
        factura.
      </p>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          
            <div class="actions"></div>
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="pickerVisible = false"
          />
          
        </div>
        
        
        </template>
    </Dialog>

    <Dialog
      v-model:visible="detailVisible"
      modal
      :header="form.pkid ? `Rectificativa ${form.code}` : 'Nueva rectificativa'"
      class="rec-dialog"
      :style="{ width: '78rem' }"
      :breakpoints="{ '1100px': '96vw' }"
      :closable="!busy"
      :closeOnEscape="!busy"
    >
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <div class="origin">
        <div v-if="form.sourceRecInvoiceId">
          <small>Rectificativa rectificada</small><b>{{ form.sourceCode }}</b>
        </div>
        <div>
          <small>Factura original</small
          ><Button
            :label="form.invoiceCode"
            link
            @click="
              router.push({
                name: 'Facturas',
                query: { invoiceId: form.invoiceId },
              })
            "
          />
        </div>
        <div>
          <small>Cliente</small><b>{{ form.customer }}</b>
        </div>
        <Tag :value="form.pkid ? stateLabel(form.state) : 'Nuevo borrador'" />
      </div>
      <Message
        v-if="editable && form.mode === 'QUANTITY'"
        severity="info"
        :closable="false"
        >{{
          form.sourceRecInvoiceId
            ? "Se revierte la parte seleccionada de la rectificativa de origen."
            : "Abono por cantidades: precio, descuento, incremento e impuesto se conservan de la factura original."
        }}</Message
      >
      <Message
        v-if="editable && form.mode === 'ECONOMIC'"
        severity="warn"
        :closable="false"
        >Rectificación económica: indica el nuevo precio, descuento, incremento
        o impuesto. El PDF mostrará la diferencia frente a la factura
        original.</Message
      >
      <div class="form-grid">
        <label
          >Modalidad<Select
            v-model="form.mode"
            :options="modes"
            optionLabel="label"
            optionValue="value"
            :disabled="!!form.pkid || busy"
        /></label>
        <label
          >Fecha<DatePicker
            v-model="form.dateValue"
            dateFormat="dd/mm/yy"
            showIcon
            :disabled="!editable || busy"
            :maxDate="new Date()"
        /></label>
        <label
          >Referencia<InputText
            v-model="form.reference"
            :disabled="!editable || busy"
            maxlength="145"
        /></label>
        <label class="wide"
          >Motivo de rectificación *<InputText
            v-model="form.reason"
            :disabled="!editable || busy"
            maxlength="250"
        /></label>
      </div>
      <DataTable
        :value="form.lines"
        dataKey="sourceLineId"
        scrollable
        class="lines-table"
      >
        <Column
          field="description"
          header="Descripción"
          style="min-width: 14rem"
        />
        <Column v-if="editable" field="available" header="Disponible" />
        <Column header="Cantidad"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable"
              v-model="data.quantity"
              :disabled="busy"
              :min="0"
              :max="data.available"
              :maxFractionDigits="3"
              locale="de-DE"
              :useGrouping="true"
              class="quantity"
              aria-label="Cantidad a rectificar"
            /><span v-else>{{ numeric(data.quantity) }}</span></template
          ></Column
        >
        <Column header="Precio"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.priceUnit"
              :min="0"
              :maxFractionDigits="4"
              locale="de-DE"
              :useGrouping="true"
              class="quantity"
            /><span v-else>{{ money(data.priceUnit, form.currency) }}</span
            ><small v-if="editable && form.mode === 'ECONOMIC'"
              >Original:
              {{ money(data.originalPriceUnit, form.currency) }}</small
            ></template
          ></Column
        ><Column header="Dto."
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.discount"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.discount) }} %</span></template
          ></Column
        ><Column header="Incremento"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.increment"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.increment) }} %</span></template
          ></Column
        ><Column header="IVA"
          ><template #body="{ data }"
            ><InputNumber
              v-if="editable && form.mode === 'ECONOMIC'"
              v-model="data.tax"
              :min="0"
              :max="100"
              :maxFractionDigits="2"
              locale="de-DE"
              suffix=" %"
              class="quantity"
            /><span v-else>{{ numeric(data.tax) }} %</span></template
          ></Column
        ><Column header="Total"
          ><template #body="{ data }">{{
            money(editable ? lineTotal(data) : data.total, form.currency)
          }}</template></Column
        >
      </DataTable>
      <p class="total">
        {{
          editable
            ? "Total estimado de la rectificación"
            : "Total de la rectificación"
        }}:
        <strong>{{
          rectMoney(editable ? estimated : form.total, form.currency)
        }}</strong>
      </p>
      <div class="form-grid">
        <label class="wide"
          >Condiciones<Textarea
            v-model="form.terms"
            rows="2"
            maxlength="1000"
            :disabled="!editable || busy" /></label
        ><label class="wide"
          >Notas internas<Textarea
            v-model="form.notes"
            rows="2"
            :disabled="!editable || busy"
        /></label>
      </div>
      <section v-if="form.verifactuStatus" class="fiscal">
        <h3>Seguimiento VeriFactu</h3>
        <p>
          {{ fiscalLabel(form.verifactuStatus) }} ·
          {{ form.attempts || 0 }} intentos
        </p>
        <p v-if="form.nextAttemptAt">
          Próximo intento: {{ form.nextAttemptAt }}
        </p>
        <Message v-if="form.fiscalError" severity="warn" :closable="false">{{
          form.fiscalError
        }}</Message>
      </section>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <div class="actions">
            <Button
              label="Cerrar"
              text
              severity="secondary"
              :disabled="busy"
              @click="detailVisible = false"
            /><Button
              v-if="form.pkid"
              label="PDF"
              icon="pi pi-file-pdf"
              outlined
              :disabled="busy"
              @click="downloadPdf"
            /><Button
              v-if="form.pkid && editable"
              label="Cancelar borrador"
              severity="danger"
              text
              :disabled="busy"
              @click="cancelVisible = true"
            /><Button
              v-if="editable"
              label="Guardar borrador"
              :disabled="!hasSelectedLines"
              icon="pi pi-save"
              class="corporate"
              :loading="busy"
              @click="save"
            /><Button
              v-if="form.pkid && editable"
              label="Guardar y emitir"
              icon="pi pi-check"
              :disabled="busy || !hasSelectedLines"
              @click="issueVisible = true"
            /><Button
              v-if="form.verifactuStatus === 'REJECTED'"
              label="Reintentar VeriFactu"
              :disabled="busy"
              @click="issueVisible = true"
            /><Button
              v-if="form.pkid && !editable"
              label="Actualizar estado"
              icon="pi pi-refresh"
              text
              :disabled="busy"
              @click="openDetail(form.pkid)"
            />
          </div></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="issueVisible"
      modal
      :closable="!busy"
      :closeOnEscape="!busy"
      :style="{ width: 'min(520px,94vw)' }"
      class="kiwik-dialog issue-invoice-dialog"
      @show="validateIssueTarget"
      :pt="{
        root: { class: 'kiwik-dialog' },
        header: { class: 'kiwik-dialog-header' },
        content: { class: 'kiwik-dialog-content' },
        footer: { class: 'kiwik-dialog-footer' },
      }"
      @hide="password = ''"
    >
      <template #header>
        <div class="issue-dialog-header">
          <span><i class="pi pi-file-check"></i></span>
          <div>
            <b>{{
              editable
                ? "Emitir rectificativa definitiva"
                : "Reintentar envío VeriFactu"
            }}</b>
            <small>Facturación · VeriFactu</small>
          </div>
        </div>
      </template>
      <Message severity="warn" :closable="false">
        {{
          editable
            ? "Se asignará el número fiscal y se bloqueará la edición. El envío a VeriFactu se procesará según los Ajustes de Ventas."
            : "Se reintentará el envío de la rectificativa, conservando su número."
        }}
      </Message>
      <Message v-if="dialogError" severity="error" :closable="false">{{
        dialogError
      }}</Message>
      <Message v-if="validatingIssue" severity="info" :closable="false"
        >Comprobando datos fiscales y económicos…</Message
      >
      <Message
        v-else-if="issueValidationErrors.length"
        severity="error"
        :closable="false"
      >
        <b>No se puede emitir. Corrige estos datos:</b>
        <ul>
          <li v-for="item in issueValidationErrors" :key="item">{{ item }}</li>
        </ul>
        <Button
          label="Volver a comprobar"
          icon="pi pi-refresh"
          text
          @click="validateIssueTarget"
        />
      </Message>
      <Message
        v-else-if="issueValidated && editable"
        severity="success"
        :closable="false"
        >Datos comprobados. Al emitir se validarán de nuevo antes de asignar
        número. Esta comprobación no acredita el alta censal ni VIES.</Message
      >
      <label
        v-if="!validatingIssue && !issueValidationErrors.length"
        class="verifactu-password"
      >
        <span>Contraseña del certificado VeriFactu</span>
        <Password
          v-model="password"
          :disabled="busy"
          toggleMask
          :feedback="false"
          fluid
          autofocus
        />
      </label>
      <template #footer>
        <div class="issue-dialog-footer">
          <div class="issue-dialog-separator"></div>
          <div class="issue-dialog-actions">
            <Button
              label="Volver"
              text
              severity="secondary"
              :disabled="busy"
              @click="issueVisible = false"
            />
            <Button
              :label="editable ? 'Emitir y enviar' : 'Reintentar envío'"
              icon="pi pi-send"
              severity="success"
              :loading="busy"
              :disabled="
                !password ||
                busy ||
                validatingIssue ||
                !issueValidated ||
                issueValidationErrors.length > 0
              "
              @click="issue"
            />
          </div>
        </div>
      </template>
    </Dialog>
    <Dialog
      v-model:visible="cancelVisible"
      modal
      header="Cancelar borrador"
      class="rec-dialog"
      :closable="!busy"
      ><p>
        Se conservará el documento cancelado y se liberarán sus cantidades para
        otra rectificativa.
      </p>
      <template #footer
        ><div class="footer">
          <div class="kiwik-separator" />
          <Button
            label="Volver"
            text
            :disabled="busy"
            @click="cancelVisible = false"
          /><Button
            label="Cancelar borrador"
            severity="danger"
            :loading="busy"
            @click="cancelDraft"
          /></div></template
    ></Dialog>
    <VeriFactuQueuePanel @open-invoice="openDetail" />
    <VeriFactuChainPanel />
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Menu from "primevue/menu";
import Password from "primevue/password";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import { useAuthStore } from "@/stores/authStore";
import RecInvoiceEmailDialog from "./RecInvoiceEmailDialog.vue";
import VeriFactuQueuePanel from "./VeriFactuQueuePanel.vue";
import VeriFactuChainPanel from "./VeriFactuChainPanel.vue";
import { backendUrl } from "@/services/backendUrl";

const router = useRouter();
const emailDialog = ref<InstanceType<typeof RecInvoiceEmailDialog> | null>(
  null,
);
const auth = useAuthStore();
const api = axios.create();
api.interceptors.request.use((config) => {
  Object.assign(config.headers, auth.portalRequestConfig().headers);
  return config;
});
const rows = ref<any[]>([]),
  statistics = ref<any[]>([]),
  invoiceOptions = ref<any[]>([]);
const query = ref(""),
  status = ref<string | null>(null),
  invoiceQuery = ref("");
const page = ref(0),
  total = ref(0),
  loading = ref(false),
  busy = ref(false);
const error = ref(""),
  dialogError = ref(""),
  password = ref("");
const pickerVisible = ref(false),
  detailVisible = ref(false),
  issueVisible = ref(false),
  cancelVisible = ref(false);
const form = ref<any>({ lines: [] });
const hasSelectedLines = computed(() =>
  form.value.lines.some(
    (line: any) => Number.isFinite(line.quantity) && line.quantity > 0,
  ),
);
const selected = ref<any>(null),
  rowMenu = ref<any>(null);
const openMenu = (event: Event, item: any) => {
  selected.value = item;
  rowMenu.value?.toggle(event);
};
const rowItems = computed(() => [
  {
    label: "Ver / Imprimir rectificativa",
    icon: "pi pi-print",
    disabled: selected.value?.verifactuStatus !== "ACCEPTED" || busy.value,
    command: () => openRecInvoicePdf(selected.value),
  },
  {
    label: "Abrir rectificativa",
    icon: "pi pi-eye",
    command: () => openDetail(selected.value?.pkid),
  },
  {
    label: selected.value?.dateSend
      ? "Reenviar por correo"
      : "Enviar por correo",
    icon: "pi pi-envelope",
    command: () => emailDialog.value?.open(selected.value),
  },
  {
    label: "Historial de correo",
    icon: "pi pi-history",
    command: () => emailDialog.value?.open(selected.value, "history"),
  },
]);
const validatingIssue = ref(false);
const issueValidated = ref(false);
const issueValidationErrors = ref<string[]>([]);
async function validateIssueTarget() {
  if (busy.value || validatingIssue.value) return;
  issueValidated.value = false;
  issueValidationErrors.value = [];
  validatingIssue.value = true;
  busy.value = true;
  try {
    if (editable.value) {
      // Validar los valores editados, no una versión anterior del borrador.
      await persist();
      const { data } = await api.get(
        backendUrl("/WebValidateSalesRecInvoice/" + form.value.pkid),
      );
      issueValidationErrors.value = data.errors || [];
      issueValidated.value = data.valid === true;
      if (!issueValidated.value && !issueValidationErrors.value.length)
        issueValidationErrors.value = ["No se pudo confirmar la validación."];
    } else {
      issueValidated.value = true;
    }
  } catch (e) {
    issueValidationErrors.value = [message(e)];
  } finally {
    busy.value = false;
    validatingIssue.value = false;
  }
}
let listVersion = 0;
const statuses = [
  { label: "Borradores", value: "DRAFT" },
  { label: "Emitidas", value: "ISSUED" },
  { label: "Canceladas", value: "CANCELLED" },
];
const modes = [
  { label: "Abono por cantidades", value: "QUANTITY" },
  { label: "Rectificación económica", value: "ECONOMIC" },
];
const editable = computed(
  () => !form.value.pkid || (form.value.draft && !form.value.verifactuStatus),
);
const estimated = computed(() =>
  form.value.lines.reduce((sum: number, line: any) => sum + lineTotal(line), 0),
);
function numeric(n: number) {
  return new Intl.NumberFormat("de-DE", { maximumFractionDigits: 3 }).format(
    n || 0,
  );
}
function money(n: number, currency: string) {
  return `${new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0)} ${currency || ""}`;
}
function rectMoney(n: number, currency: string) {
  const value = Number(n || 0);
  return money(value > 0 ? -value : value, currency);
}
function rectificationTooltip(item: any) {
  const rows = item?.rectifications ?? [];
  return rows.length ? `Rectificaciones asociadas (${rows.length})\n${rows.map((row: any) => `${row.code}: ${rectMoney(row.total, item.currency)}`).join("\n")}\nTotal: ${rectMoney(item.rectificationTotal, item.currency)}` : "Sin rectificaciones asociadas";
}
function dateLabel(date: string) {
  return date ? new Date(date).toLocaleDateString("es-ES") : "—";
}
function dateTime(value: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function stateLabel(state: string) {
  return state?.split(" / ")[0] || "Borrador";
}
function fiscalLabel(state: string) {
  return (
    (
      {
        PENDING: "Pendiente",
        PROCESSING: "En proceso",
        ACCEPTED: "Aceptada",
        ACCEPTED_WITH_ERRORS: "Aceptada con errores",
        REJECTED: "Error técnico",
        NEEDS_CORRECTION: "Requiere revisión fiscal",
      } as Record<string, string>
    )[state] || state
  );
}
function lineTotal(l: any) {
  if (form.value.sourceRecInvoiceId) {
    const round = (value: number) =>
      (Math.sign(value) * Math.round(Math.abs(value) * 100)) / 100;
    const oldNet = round((l.quantity || 0) * l.sourceNetUnit);
    const oldTax = round((l.quantity || 0) * l.sourceTaxUnit);
    const target =
      form.value.mode === "ECONOMIC"
        ? round(
            Math.sign(l.sourceNetUnit) *
              (l.quantity || 0) *
              l.priceUnit *
              (1 - (l.discount || 0) / 100) *
              (1 + (l.increment || 0) / 100),
          )
        : 0;
    return round(target - oldNet + round((target * l.tax) / 100) - oldTax);
  }
  const net =
    Math.round(
      (l.quantity || 0) *
        l.priceUnit *
        (1 - (l.discount || 0) / 100) *
        (1 + (l.increment || 0) / 100) *
        100,
    ) / 100;
  return -(net + Math.round(net * l.tax) / 100);
}
function message(e: any) {
  const d = e.response?.data;
  return typeof d === "string"
    ? d
    : d?.message ||
        d?.detail ||
        e.message ||
        "No se pudo completar la operación.";
}
async function load(index = 0) {
  const version = ++listVersion;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await api.get(backendUrl("/WebGetSalesRecInvoices"), {
      params: {
        page: index,
        size: 20,
        query: query.value,
        status: status.value,
      },
      timeout: 20000,
    });
    if (version !== listVersion) return;
    rows.value = data.content;
    total.value = data.totalElements;
    page.value = index;
  } catch (e) {
    if (version === listVersion) error.value = message(e);
  } finally {
    if (version === listVersion) loading.value = false;
  }
}
async function refresh() {
  await load(page.value);
  try {
    statistics.value = (
      await api.get(backendUrl("/WebGetSalesRecInvoiceStatistics"))
    ).data;
  } catch (e) {
    error.value = message(e);
  }
}
function openNew() {
  dialogError.value = "";
  invoiceOptions.value = [];
  invoiceQuery.value = "";
  pickerVisible.value = true;
}
async function findInvoices() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const invoicesFound = (
      await api.get(backendUrl("/WebGetSalesInvoices"), {
        params: { status: "ISSUED", query: invoiceQuery.value, size: 50 },
      })
    ).data.content.map((i: any) => ({ ...i, customer: i.entityName }));
    const rectifications = (
      await api.get(backendUrl("/WebGetSalesRecInvoices"), {
        params: {
          page: 0,
          size: 50,
          query: invoiceQuery.value,
          status: "ISSUED",
        },
      })
    ).data.content
      .filter((i: any) =>
        ["ACCEPTED", "ACCEPTED_WITH_ERRORS"].includes(i.verifactuStatus),
      )
      .map((i: any) => ({ ...i, sourceRecInvoiceId: i.pkid }));
    // Consultar disponibilidad antes de ofrecer el documento; al seleccionarlo
    // se vuelve a comprobar por si otro usuario ha reservado sus cantidades.
    const candidates = [...invoicesFound, ...rectifications];
    const available = [];
    for (const item of candidates) {
      const path = item.sourceRecInvoiceId
        ? `/WebPrepareSalesRecInvoiceFromRectification/${item.sourceRecInvoiceId}`
        : `/WebPrepareSalesRecInvoice/${item.pkid}`;
      try {
        const { data } = await api.get(backendUrl(path));
        if (data.lines?.some((line: any) => line.quantity > 0))
          available.push(item);
      } catch (e: any) {
        if (e.response?.status !== 400) throw e;
      }
    }
    invoiceOptions.value = available.map((item: any) => ({
      ...item,
      selectionKey: `${item.sourceRecInvoiceId ? "REC" : "INV"}-${item.pkid}`,
      sourceType: item.sourceRecInvoiceId ? "Rectificativa" : "Factura",
    }));
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function prepare(id: number, sourceRecInvoiceId?: number) {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const { data } = await api.get(
      backendUrl(
        sourceRecInvoiceId
          ? `/WebPrepareSalesRecInvoiceFromRectification/${sourceRecInvoiceId}`
          : `/WebPrepareSalesRecInvoice/${id}`,
      ),
    );
    if (!data.lines?.some((line: any) => line.quantity > 0)) {
      invoiceOptions.value = invoiceOptions.value.filter(
        (item: any) =>
          !(item.pkid === id && item.sourceRecInvoiceId === sourceRecInvoiceId),
      );
      throw new Error(
        "Este documento ya no tiene cantidades disponibles para rectificar.",
      );
    }
    form.value = {
      ...data,
      mode: "QUANTITY",
      operationKey: crypto.randomUUID(),
      dateValue: new Date(),
      reason: "",
      reference: "",
      notes: "",
      lines: data.lines
        .filter((l: any) => l.quantity > 0)
        .map((l: any) => ({ ...l, available: l.quantity })),
    };
    pickerVisible.value = false;
    detailVisible.value = true;
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
function setDetail(data: any) {
  const savedLines = new Map<number, any>(
    data.lines.map((l: any) => [l.sourceLineId, l]),
  );
  form.value = {
    ...data,
    mode: data.mode || "QUANTITY",
    dateValue: new Date(data.date),
    lines:
      data.draft && data.availableLines
        ? data.availableLines.map((l: any) => ({
            ...l,
            // La disponibilidad procede del origen; los valores económicos,
            // del borrador guardado, para no sobrescribirlos al emitir.
            ...savedLines.get(l.sourceLineId),
            available: l.quantity,
            quantity: savedLines.get(l.sourceLineId)?.quantity ?? 0,
          }))
        : data.lines,
  };
}
async function openDetail(id: number) {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    setDetail((await api.get(backendUrl(`/WebGetSalesRecInvoice/${id}`))).data);
    detailVisible.value = true;
  } catch (e) {
    error.value = message(e);
  } finally {
    busy.value = false;
  }
}
function request() {
  const d = form.value.dateValue;
  if (!(d instanceof Date) || Number.isNaN(d.getTime()))
    throw new Error("Seleccione una fecha válida.");
  if (!form.value.reason?.trim())
    throw new Error("Indique el motivo de rectificación.");
  const lines = form.value.lines
    .filter((l: any) => (l.quantity || 0) > 0)
    .map((l: any) => ({
      sourceLineId: l.sourceLineId,
      quantity: l.quantity,
      priceUnit: form.value.mode === "ECONOMIC" ? l.priceUnit : undefined,
      discount: form.value.mode === "ECONOMIC" ? l.discount : undefined,
      increment: form.value.mode === "ECONOMIC" ? l.increment : undefined,
      tax: form.value.mode === "ECONOMIC" ? l.tax : undefined,
    }));
  if (!lines.length) throw new Error("Indique alguna cantidad a abonar.");
  return {
    version: form.value.version,
    mode: form.value.mode || "QUANTITY",
    operationKey: form.value.operationKey,
    invoiceId: form.value.invoiceId,
    sourceRecInvoiceId: form.value.sourceRecInvoiceId,
    date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
    reference: form.value.reference,
    reason: form.value.reason,
    terms: form.value.terms,
    notes: form.value.notes,
    lines,
  };
}
async function persist() {
  const body = request();
  const response = form.value.pkid
    ? await api.put(
        backendUrl(`/WebSaveSalesRecInvoice/${form.value.pkid}`),
        body,
      )
    : await api.post(backendUrl("/WebCreateSalesRecInvoice"), body);
  setDetail(response.data);
}
async function save() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    await persist();
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function issue() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    const retry = form.value.verifactuStatus === "REJECTED";
    if (!retry) await persist();
    const endpoint = retry
      ? "WebRetrySalesRecInvoiceVeriFactu"
      : "WebIssueSalesRecInvoice";
    setDetail(
      (
        await api.post(backendUrl(`/${endpoint}/${form.value.pkid}`), {
          certificatePassword: password.value,
        })
      ).data,
    );
    issueVisible.value = false;
    password.value = "";
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
async function cancelDraft() {
  if (busy.value) return;
  busy.value = true;
  dialogError.value = "";
  try {
    setDetail(
      (
        await api.post(
          backendUrl(`/WebCancelSalesRecInvoice/${form.value.pkid}`),
        )
      ).data,
    );
    cancelVisible.value = false;
    await refresh();
  } catch (e) {
    dialogError.value = message(e);
    cancelVisible.value = false;
  } finally {
    busy.value = false;
  }
}
async function downloadPdf() {
  await openRecInvoicePdf(form.value);
}
async function openRecInvoicePdf(item: any) {
  if (!item?.pkid || busy.value) return;
  // Abrir durante el clic para que el navegador no bloquee la vista PDF;
  // la descarga autenticada conserva las cabeceras de la sesión del portal.
  const preview = window.open("", "_blank");
  if (!preview) {
    error.value = "Permite las ventanas emergentes para ver e imprimir el PDF.";
    return;
  }
  preview.opener = null;
  preview.document.title = "Cargando rectificativa…";
  busy.value = true;
  try {
    const { data } = await api.get(
      backendUrl(`/WebGetSalesRecInvoicePdf/${item.pkid}`),
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(data);
    preview.location.replace(url);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (e) {
    preview.close();
    error.value = message(e);
    dialogError.value = message(e);
  } finally {
    busy.value = false;
  }
}
onMounted(refresh);
</script>

<style scoped>
.rec-page {
  padding: 18px 18px 90px;
  color: #243044;
  display: grid;
  gap: 18px;
}
.hero,
.list-card {
  background: white;
  border: 1px solid #e3e8d2;
  border-radius: 15px;
  padding: 20px;
  min-width: 0;
}
.list-card {
  height: clamp(500px, calc(100dvh - 330px), 700px);
  min-height: 480px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
  border-color: #dfe4ea;
  border-radius: 14px;
}
.list-card > .table { flex: 1 1 auto; min-height: 0; }
.list-card .toolbar {
  flex: 0 0 auto;
  min-height: 62px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf0;
}
.list-card .toolbar h2 { margin: 0 0 3px; font-size: 1rem; }
.list-card .toolbar small { font-size: .75rem; }
.list-card .filters {
  flex: 0 0 auto;
  margin: 0;
  padding: 12px 16px;
  border-bottom: 1px solid #e8ecf0;
  background: #fff;
}
.invoice-date-time {
  font-size: 0.78rem;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.list-card :deep(.table-container) { width: 100%; }
.list-card :deep(.table-container),
.list-card :deep(.datatable-wrapper),
.list-card :deep(.p-datatable-wrapper) { max-width: 100%; min-width: 0; }
.list-card :deep(.p-datatable-table) { min-width: 0; }
.hero,
.heading,
.toolbar,
.filters,
.actions {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.hero,
.toolbar {
  justify-content: space-between;
}
.hero h1 {
  margin: 5px 0;
  font-size: 1.55rem;
}
.hero p,
small {
  color: #667085;
}
.hero p {
  margin: 0;
}
.hero-icon {
  background: #9cc10a;
  color: #253000;
  padding: 16px;
  border-radius: 12px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.stats article {
  display: grid;
  gap: 8px;
  background: white;
  border: 1px solid #e3e8d2;
  border-radius: 12px;
  padding: 18px;
}
.stats strong {
  font-size: 1.4rem;
}
.stats span {
  color: #667085;
  font-size: 0.85rem;
}
.toolbar h2 {
  margin: 0 0 5px;
  font-size: 1.15rem;
}
.filters {
  margin: 18px 0;
}
.filters > input {
  flex: 1;
  min-width: 200px;
}
.origin {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px;
  background: #f4f7ea;
  border-radius: 10px;
  margin-bottom: 16px;
}
.origin > div {
  display: grid;
  gap: 4px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 18px 0;
}
.form-grid label,
.password {
  display: grid;
  gap: 6px;
  font-weight: 600;
}
.wide {
  grid-column: 1 / -1;
}
.quantity {
  width: 110px;
}
.quantity :deep(input) {
  width: 100%;
}
.total {
  text-align: right;
  font-size: 1.1rem;
}
.footer {
  width: 100%;
}
.kiwik-separator {
  height: 2px;
  background: linear-gradient(90deg, #9cc10a, #edf3d3);
  margin: 0 0 14px;
  width: 100%;
}
.actions {
  justify-content: flex-end;
}
.corporate {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.corporate:hover {
  background: #8bad09 !important;
  border-color: #8bad09 !important;
  color: #253000 !important;
}

:global(.rec-dialog .p-dialog-header) {
  background: #f1f6df;
  border-bottom: 2px solid #9cc10a;

  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}


:global(.rec-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 700px) {
  .rec-page {
    padding: 12px 8px 90px;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .origin {
    align-items: flex-start;
    flex-direction: column;
  }
}
.issue-dialog-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}
.issue-dialog-header > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  background: #eaf2d2;
  color: #648506;
}
.issue-dialog-header b,
.issue-dialog-header small {
  display: block;
}
.issue-dialog-header b {
  color: #344054;
  font-size: 1rem;
}
.issue-dialog-header small {
  margin-top: 0.15rem;
  color: #7d8797;
  font-size: 0.72rem;
}
.issue-dialog-footer {
  width: 100%;
}
.issue-dialog-separator {
  width: 100%;
  min-height: 1px;
  margin: 0 0 0.75rem;
  border-top: 1px solid #9cc10a;
}
.issue-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.verifactu-password {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}
.draft-code {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: #fff3cd;
  color: #8a5a00;
  font-weight: 700;
  border: 1px solid #ffe08a;
}



  :global(.invoice-picker-dialog .p-dialog-content) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .invoice-picker-dialog .filters {
    flex: 0 0 auto;
  }

  .invoice-picker-dialog .p-datatable {
    flex: 1 1 auto;
    min-height: 0;
  }
</style>
