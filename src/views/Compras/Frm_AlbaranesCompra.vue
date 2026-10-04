<template>
  <div class="delivery-page">
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><i class="pi pi-truck"></i></div>
        <div><span class="breadcrumb">Compras / Operaciones</span><h1>Albaranes de compra</h1><p>Registro del albarán del proveedor y su recepción de mercancía.</p></div>
      </div>
      <nav class="header-actions"><Button type="button" label="Compras" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Compras' })" /><Button type="button" label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav>
    </header>

    <section class="list-card">
      <Toolbar class="list-toolbar">
        <template #start><div class="workspace-heading"><span>Listado de albaranes</span><small>Las cantidades sólo se contabilizan como entradas al confirmar.</small></div></template>
        <template #end><div class="toolbar-actions"><Message severity="info" variant="simple" icon="pi pi-info-circle">Los borradores aún no mueven almacén</Message><Button v-if="securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)" label="Nuevo albarán manual" icon="pi pi-plus" size="small" @click="manualDialogRef?.open()" /></div></template>
      </Toolbar>
      <Message v-if="tableLoadError" severity="error" :closable="false" class="table-error">No se pudo cargar el listado de albaranes. Comprueba que el backend esté reiniciado y vuelve a intentarlo.</Message>
      <GenericDataTable ref="tableRef" class="delivery-table" dataKey="pkid" selectionMode="single" v-model:selection="selected" endpoint="WebGetPurchasesDeliveries" :params="{ state: selectedState || undefined, invoiceStatus: selectedInvoiceStatus || undefined }" :showPaginator="true" :filterable="true" :showActions="true" @data-loaded="tableLoadError=false" @load-error="tableLoadError=true">
        <template #panelOptions><div class="delivery-filters"><Select v-model="selectedState" :options="states" optionLabel="label" optionValue="value" showClear placeholder="Estado: Todos" class="state-filter"><template #value="{ value, placeholder }"><Tag v-if="value" :value="states.find(item => item.value === value)?.label ?? value" :severity="stateSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template><template #option="{ option }"><Tag :value="option.label" :severity="stateSeverity(option.value)" rounded /></template></Select><Select v-model="selectedInvoiceStatus" :options="invoiceStatuses" optionLabel="label" optionValue="value" showClear placeholder="Facturación: Todos" class="invoice-filter"><template #value="{ value, placeholder }"><Tag v-if="value" :value="invoiceStatuses.find(item => item.value === value)?.label ?? value" :severity="invoiceStatusSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template><template #option="{ option }"><Tag :value="option.label" :severity="invoiceStatusSeverity(option.value)" rounded /></template></Select></div></template>
        <template #headerActions><Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refresh" /><Button icon="pi pi-ellipsis-v" text rounded title="Opciones" @click="openMenuTable($event)" /></template>
        <Column field="code" sortField="code" header="Código" sortable style="width:13%"><template #body="{ data }"><span class="delivery-code"><span :class="{'draft-code':isDraft(data.state)}">{{ deliveryCode(data) }}</span><i v-if="data.hasNotes" class="pi pi-comment notes-indicator" title="Tiene observaciones"></i></span></template></Column>
        <Column field="createDate" sortField="dateCreate" header="Fecha" sortable style="width:13%"><template #body="{ data }">{{ formatDate(data.createDate) }}</template></Column>
        <Column field="entityName" sortField="entitie.name" header="Proveedor" sortable style="width:15%" />
        <Column field="supplierCode" header="Nº albarán proveedor" style="width:13%"><template #body="{ data }">{{ data.supplierCode || '-' }}</template></Column>
        <Column field="invoiceCode" header="Factura" style="width:11%"><template #body="{ data }"><span v-if="data.invoiceCode" class="orders-cell"><Tag class="invoice-code-tag" :value="data.invoiceCode" icon="pi pi-receipt" :severity="isDraft(data.invoiceState) ? 'secondary' : 'success'" rounded /></span><span v-else>—</span></template></Column>
        <Column field="reference" header="Referencia" style="width:12%"><template #body="{ data }">{{ data.reference || '-' }}</template></Column>
        <Column field="state" sortField="state" header="Estado" sortable style="width:11%"><template #body="{ data }"><Tag :value="stateLabel(data.state)" :severity="stateSeverity(data.state)" rounded /></template></Column>
        <Column field="totalTotal" sortField="totalTotal" header="Total" sortable style="width:10%;text-align:right" bodyStyle="text-align:right"><template #body="{ data }">{{ currency(data.totalTotal) }}</template></Column>
        <Column header="" style="width:4rem"><template #body="{ data }"><Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, data)" /></template></Column>
      </GenericDataTable>
      <Menu ref="rowMenu" :model="menuItems" popup />
      <Menu ref="menuTable" :model="menuItemsTable" popup />
    </section>

    <section class="delivery-stats-card">
      <div class="stats-header"><div><h6><i class="pi pi-chart-line"></i> Resumen de albaranes de compra</h6><span>Recepciones, facturación y gasto por proveedor del año seleccionado</span></div><div class="stats-controls"><Select v-model="selectedStatisticsYear" :options="statisticsYears" class="statistics-year" /><Button :icon="statisticsExpanded?'pi pi-chevron-up':'pi pi-chevron-down'" text rounded @click="statisticsExpanded=!statisticsExpanded" /></div></div>
      <div v-if="statisticsExpanded" class="stats-body">
        <div v-if="loadingStatistics" class="stats-loading"><i class="pi pi-spin pi-spinner"></i> Cargando indicadores...</div>
        <template v-else>
          <div class="kpi-grid">
            <div class="kpi-card"><span class="kpi-icon total"><i class="pi pi-truck"></i></span><div><small>Albaranes generados</small><strong>{{ statistics.totalCount }}</strong><em>{{ currency(statistics.totalAmount) }}</em></div></div>
            <div class="kpi-card"><span class="kpi-icon draft"><i class="pi pi-clock"></i></span><div><small>Borradores pendientes</small><strong>{{ statistics.draftCount }}</strong><em>Requieren confirmación</em></div></div>
            <div class="kpi-card"><span class="kpi-icon invoice"><i class="pi pi-receipt"></i></span><div><small>Pendientes de facturar</small><strong>{{ statistics.pendingInvoiceCount }}</strong><em>Albaranes confirmados</em></div></div>
            <div class="kpi-card"><span class="kpi-icon email"><i class="pi pi-check-circle"></i></span><div><small>Facturados</small><strong>{{ statistics.invoicedCount }}</strong><em>Con factura vinculada</em></div></div>
            <div class="kpi-card"><span class="kpi-icon cancelled"><i class="pi pi-ban"></i></span><div><small>Anulados</small><strong>{{ statistics.cancelledCount }}</strong><em>{{ currency(statistics.cancelledAmount) }}</em></div></div>
          </div>
          <div class="charts-grid"><div class="chart-card"><h6>Evolución mensual</h6><div class="chart-box"><Chart type="bar" :data="monthlyChartData" :options="monthlyChartOptions" /></div></div><div class="chart-card"><h6>Distribución por estado</h6><div class="chart-box donut"><Chart type="doughnut" :data="stateChartData" :options="stateChartOptions" /></div></div></div>
          <div class="quality-strip"><div><small>Cantidad recibida</small><b>{{ quantity(statistics.receivedQuantity) }}</b></div><div><small>Confirmados</small><b>{{ statistics.confirmedCount }}</b></div></div>
          <div class="rankings-grid">
            <div class="ranking-card"><h6><i class="pi pi-trophy"></i> Top 5 proveedores por gasto</h6><div v-if="!statistics.topSuppliers.length" class="empty-ranking">No hay recepciones registradas en {{ selectedStatisticsYear }}.</div><div v-for="(supplier,index) in statistics.topSuppliers" :key="`${supplier.name}-${index}`" class="ranking-row"><span class="ranking-position">{{ index+1 }}</span><div class="ranking-main"><b>{{ supplier.name }}</b><small>{{ supplier.count }} albarán{{ supplier.count===1?'':'es' }}</small></div><strong>{{ currency(supplier.amount) }}</strong></div></div>
          </div>
        </template>
      </div>
    </section>

    <Dialog v-model:visible="detailVisible" modal maximizable :header="detail.code ? `Albarán ${detail.code}` : 'Albarán'" :style="{ width: 'min(1500px,98vw)', height: '92vh' }" :contentStyle="{ height: 'calc(92vh - 130px)', overflowY: 'auto' }" class="kiwik-dialog">
      <div v-if="detailLoading" class="loading"><i class="pi pi-spin pi-spinner"></i> Cargando albarán...</div>
      <div v-else class="delivery-form">
        <div class="document-summary">
          <div><small>Proveedor</small><SupplierLookup v-if="isDraftDetail" v-model="detailEntityId" :label="detailSupplierLabel" @selected="selectDetailSupplier" @cleared="detailEntityId = null" /><strong v-else>{{ detail.entityName || '-' }}</strong></div>
          <div><small>Nº albarán proveedor</small><InputText v-if="isDraftDetail" v-model="detail.supplierCode" maxlength="100" fluid /><strong v-else>{{ detail.supplierCode || '-' }}</strong></div>
          <div><small>Fecha</small><DatePicker v-if="isDraftDetail" v-model="detailDate" dateFormat="dd/mm/yy" showIcon iconDisplay="input" showTime showSeconds hourFormat="24" fluid /><strong v-else>{{ formatDate(detail.createDate) }}</strong></div>
          <div><small>Estado</small><Tag :value="stateLabel(detail.state)" :severity="stateSeverity(detail.state)" rounded /></div>
        </div>
        <Message v-if="isDraftDetail" severity="warn" :closable="false">Este albarán todavía no contabiliza la entrada. Se hará efectiva al confirmar.</Message>
        <div v-if="isDraftDetail" class="lines-toolbar"><Button label="Añadir línea" icon="pi pi-plus" size="small" @click="addDetailLine" /></div>
        <DataTable :value="detail.lines || []" size="small" stripedRows scrollable scrollHeight="flex" class="detail-lines">
          <Column field="productCode" header="Producto" style="width:20%"><template #body="{ data }"><ProductLookup v-if="isDraftDetail" mode="purchase" v-model="data.productId" :label="data.productLabel || data.productCode" @selected="selectDetailProduct(data, $event)" @cleared="clearDetailProduct(data)" /><span v-else>{{ data.productCode }}</span></template></Column>
          <Column field="description" header="Descripción"><template #body="{ data }"><InputText v-if="isDraftDetail" v-model="data.description" maxlength="165" fluid /><span v-else>{{ data.description }}</span></template></Column>
          <Column field="quantity" header="Cantidad" style="width:13%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="isDraftDetail" v-model="data.quantity" :min="0.001" :maxFractionDigits="3" locale="de-DE" fluid inputClass="text-right" /><span v-else><b>{{ quantity(data.quantity) }}</b></span></template></Column>
          <Column field="priceUnit" header="Coste" style="width:12%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="isDraftDetail" v-model="data.priceUnit" :min="0" :minFractionDigits="2" :maxFractionDigits="4" mode="currency" currency="EUR" locale="de-DE" fluid inputClass="text-right" /><span v-else>{{ currency(data.priceUnit) }}</span></template></Column>
          <Column field="tax" header="IVA %" style="width:10%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="isDraftDetail" v-model="data.tax" :min="0" :max="100" :maxFractionDigits="2" suffix=" %" fluid inputClass="text-right" /><span v-else>{{ quantity(data.tax) }} %</span></template></Column>
          <Column v-if="isDraftDetail" header="" style="width:3.2rem"><template #body="{ data }"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar línea" @click="removeDetailLine(data)" /></template></Column>
        </DataTable>
        <div class="manual-detail">
          <div><small>Referencia</small><InputText v-if="isDraftDetail" v-model="detail.reference" maxlength="145" fluid /><strong v-else>{{ detail.reference || '-' }}</strong></div>
          <div><small>Recibido por</small><strong>{{ detail.receiverName || '-' }}</strong></div>
          <div class="manual-observations"><small>Observaciones</small><Textarea v-if="isDraftDetail" v-model="detail.notes" rows="3" maxlength="500" class="w-full fixed-observations" /><p v-else>{{ detail.notes || 'Sin observaciones' }}</p></div>
        </div>
        <div class="totals"><span>Neto <b>{{ currency(detail.totalNeto) }}</b></span><span>Impuestos <b>{{ currency(detail.totalTax) }}</b></span><span class="grand-total">Total <b>{{ currency(detail.totalTotal) }}</b></span></div>
      </div>
      <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cerrar" severity="secondary" text :disabled="detailSaving" @click="detailVisible = false" /><Button v-if="detail.pkid && securityStore.hasPermission(PERM.PURCHASE_DELIV_DOCS)" label="Justificantes" icon="pi pi-paperclip" outlined :disabled="detailSaving" @click="openAttachments" /><Button v-if="detail.pkid && !isCancelledDetail && securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)" label="Imprimir albarán" icon="pi pi-print" outlined :disabled="detailSaving" @click="openPdf(false)" /><Button v-if="detail.pkid && !isCancelledDetail && securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)" label="Imprimir valorado" icon="pi pi-file-pdf" severity="danger" outlined :disabled="detailSaving" @click="openPdf(true)" /><Button v-if="isDraftDetail && securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)" label="Guardar cambios" icon="pi pi-save" outlined :loading="detailSaving" @click="() => saveDetail(true)" /><Button v-if="isConfirmed(detail.state) && !detail.invoiced && securityStore.hasPermission(PERM.PURCHASE_DELIV_TO_INVOICE)" label="Facturar albaranes" icon="pi pi-receipt" outlined @click="() => openInvoiceDialog(detail)" /><Button v-if="isDraftDetail && securityStore.hasPermission(PERM.PURCHASE_DELIV_STATE)" label="Confirmar albarán" icon="pi pi-check-circle" :disabled="detailSaving" @click="confirmDetail" /><Button v-if="detail.state && !isCancelledDetail && securityStore.hasPermission(PERM.PURCHASE_DELIV_STATE)" label="Anular" icon="pi pi-ban" severity="danger" outlined :disabled="detailSaving" @click="cancelDetail" /></div></div></template>
    </Dialog>
    <AttachmentsDialog :visible="showAttachments" moduleFolder="ATTACHEMENTS_PURCHASESALBARANES_JUSTIFICANTES" :title="`Justificantes · ${attachmentDelivery?.code || ''}`" :entityId="attachmentDelivery?.pkid || 0" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" :maxFileSize="15728640" @update:visible="onAttachmentsVisible" />
    <DialogNotes v-model:visible="showNotes" :request="noteRequest" :readonly="notesReadonly" @saved="refresh" />
    <SalesTraceabilityDialog ref="traceabilityRef" mode="purchases" />

    <Dialog v-model:visible="localConfirmVisible" modal :header="localConfirm.header || 'Confirmación'" :style="{ width: 'min(480px,94vw)' }" class="kiwik-dialog">
      <div class="local-confirm-body"><i :class="localConfirm.acceptIcon" /><p>{{ localConfirm.message }}</p></div>
      <template #footer><div class="dialog-actions"><Button label="Volver" severity="secondary" text @click="localConfirmVisible = false" /><Button :label="localConfirm.acceptLabel" :icon="localConfirm.acceptIcon" :severity="localConfirm.danger ? 'danger' : 'success'" :loading="localConfirmBusy" @click="runLocalConfirm" /></div></template>
    </Dialog>

    <ManualPurchaseDeliveryDialog ref="manualDialogRef" @saved="refresh" />

    <Dialog v-model:visible="invoiceDialogVisible" modal maximizable header="Facturar albaranes" :style="{width:'min(1120px,96vw)'}" :contentStyle="{height:'min(68vh,650px)',paddingBottom:'0'}" class="kiwik-dialog grouped-invoice-dialog">
      <div v-if="loadingInvoiceCandidates" class="loading"><i class="pi pi-spin pi-spinner"></i> Buscando albaranes compatibles...</div>
      <div v-else class="grouped-invoice-form">
        <Message severity="info" :closable="false">Selecciona albaranes confirmados del mismo proveedor. Se creará una factura en <b>borrador</b>; el nº de factura del proveedor se indicará al registrarla.</Message>
        <div class="invoice-customer"><i class="pi pi-user"></i><span><small>Proveedor de la factura</small><strong>{{ invoiceSupplierName||'-' }}</strong></span></div>
        <DataTable class="invoice-deliveries-table" v-model:selection="selectedInvoiceDeliveries" :value="invoiceCandidates" dataKey="pkid" size="small" stripedRows scrollable scrollHeight="flex">
          <Column selectionMode="multiple" headerStyle="width:3rem" /><Column field="code" header="Albarán" style="width:20%" /><Column field="supplierCode" header="Nº proveedor" style="width:20%" /><Column field="createDate" header="Fecha" style="width:20%"><template #body="{data}">{{ formatDate(data.createDate) }}</template></Column><Column field="lineCount" header="Líneas" style="width:10%;text-align:center" bodyStyle="text-align:center" /><Column field="totalTotal" header="Importe" style="width:22%;text-align:right" bodyStyle="text-align:right"><template #body="{data}">{{ currency(data.totalTotal) }}</template></Column>
        </DataTable>
        <div class="invoice-summary"><span>{{ selectedInvoiceDeliveries.length }} albarán{{ selectedInvoiceDeliveries.length===1?'':'es' }}</span><strong>Total: {{ currency(selectedInvoiceTotal) }}</strong></div>
        <div class="invoice-notes"><label for="purchaseInvoiceNotes"><b>Notas internas de la factura</b></label><Textarea id="purchaseInvoiceNotes" v-model="invoiceNotes" rows="3" :autoResize="false" fluid /></div>
      </div>
      <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cancelar" severity="secondary" text :disabled="creatingInvoice" @click="invoiceDialogVisible=false" /><Button label="Crear factura borrador" icon="pi pi-receipt" :loading="creatingInvoice" :disabled="!selectedInvoiceDeliveries.length" @click="createGroupedInvoice" /></div></div></template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import Button from "primevue/button";
import Chart from "primevue/chart";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import DatePicker from "primevue/datepicker";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Menu from "primevue/menu";
import Message from "primevue/message";
import Select from "primevue/select";
import Tag from "primevue/tag";
import Textarea from "primevue/textarea";
import Toolbar from "primevue/toolbar";
import { useToast } from "primevue/usetoast";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import AttachmentsDialog from "@/components/attachments/AttachmentsDialog.vue";
import DialogNotes from "@/components/dialogs/DialogNotes.vue";
import ProductLookup from "@/components/shared/ProductLookup.vue";
import SupplierLookup from "@/components/shared/SupplierLookup.vue";
import SalesTraceabilityDialog from "../Ventas/SalesTraceabilityDialog.vue";
import ManualPurchaseDeliveryDialog from "./ManualPurchaseDeliveryDialog.vue";
import { useSecurityStore } from "@/stores/securityStore";
import { useAuthStore } from "@/stores/authStore";
import { PERM } from "@/services/Frm_Main/permissions";

const securityStore = useSecurityStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();
const localConfirmVisible = ref(false);
const localConfirmBusy = ref(false);
const localConfirm = ref<{ header: string; message: string; acceptLabel: string; acceptIcon: string; danger: boolean; action: (() => Promise<void>) | null }>({
  header: '', message: '', acceptLabel: 'Aceptar', acceptIcon: 'pi pi-check', danger: false, action: null,
});
function askLocalConfirm(options: { header: string; message: string; acceptLabel: string; acceptIcon?: string; danger?: boolean; action: () => Promise<void> }) {
  localConfirm.value = { acceptIcon: 'pi pi-check', danger: false, ...options };
  localConfirmBusy.value = false;
  localConfirmVisible.value = true;
}
async function runLocalConfirm() {
  const action = localConfirm.value.action;
  if (!action) { localConfirmVisible.value = false; return; }
  localConfirmBusy.value = true;
  try { await action(); } finally { localConfirmBusy.value = false; localConfirmVisible.value = false; }
}
const tableRef = ref<any>(null);
const rowMenu = ref<any>(null);
const menuTable = ref<any>(null);
const menuItemsTable = computed(() => {
  const items: any[] = [{ label: 'Refrescar', icon: 'pi pi-refresh', command: () => refresh() }];
  if (securityStore.hasPermission(PERM.RPT_EXPORT)) items.push({ label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value?.exportToExcel() });
  return items;
});
const openMenuTable = (event: Event) => menuTable.value?.toggle(event);
const manualDialogRef = ref<any>(null);
const selected = ref<any>(null);
const selectedState = ref<string | null>(null);
const selectedInvoiceStatus = ref<string | null>(null);
const tableLoadError = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detailSaving = ref(false);
const detail = ref<any>({});
const detailDate = ref<Date | null>(null);
const detailEntityId = ref<number | null>(null);
const detailSupplierLabel = ref('');
const showAttachments = ref(false);
const attachmentDelivery = ref<any>(null);
const showNotes = ref(false);
const notesReadonly = ref(true);
const noteRequest = { table: 'PURCHASES_ALBARANES', pkField: 'PURCHASES_ALBARANES_PK_ID', field: 'PURCHASES_ALBARANES_DS_NOTES', id: -1 };
const traceabilityRef = ref<any>(null);
const isDraftDetail = computed(() => isDraft(detail.value?.state));
const isCancelledDetail = computed(() => detail.value?.state === 'Anulado / Cancelled');

const states = [
  { label: 'Borrador', value: 'Borrador / Draft' },
  { label: 'Confirmado', value: 'Confirmado / Confirmed' },
  { label: 'Anulado', value: 'Anulado / Cancelled' },
];
const invoiceStatuses = [
  { label: 'Facturados', value: 'INVOICED' },
  { label: 'En factura borrador', value: 'DRAFT' },
  { label: 'Pendientes de facturar', value: 'PENDING' },
];
const isDraft = (state = '') => state === 'Borrador / Draft';
const deliveryCode = (item: any) => {
  const code = String(item?.code || '');
  return isDraft(item?.state) && !code.startsWith('DRAFT_') ? 'DRAFT_' + code : code;
};
const stateLabel = (state = '') => isDraft(state) ? 'Borrador' : state === 'Anulado / Cancelled' ? 'Anulado' : state === 'Confirmado / Confirmed' ? 'Confirmado' : state;
const stateSeverity = (state = '') => isDraft(state) ? 'warn' : state === 'Anulado / Cancelled' ? 'danger' : 'success';
const invoiceStatusSeverity = (value = '') => value === 'INVOICED' ? 'success' : value === 'DRAFT' ? 'secondary' : 'warn';
const currency = (value?: number | null) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
const quantity = (value?: number | null) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 }).format(Number(value) || 0);
const pad = (value: number) => String(value).padStart(2, '0');
const parseServerDate = (value: any): Date | null => {
  if (value == null) return null;
  if (typeof value === 'number') { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; }
  const direct = new Date(String(value));
  return Number.isNaN(direct.getTime()) ? null : direct;
};
const formatDate = (value?: any) => {
  if (value == null || value === '') return '-';
  const parsed = parseServerDate(value);
  return parsed ? `${pad(parsed.getDate())}/${pad(parsed.getMonth() + 1)}/${parsed.getFullYear()} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}` : '-';
};

const refresh = () => { selected.value = null; tableLoadError.value = false; tableRef.value?.refresh(); loadStatistics(); };
const selectedStatisticsYear = ref(new Date().getFullYear());
const statisticsYears = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);
const statisticsExpanded = ref(true);
const loadingStatistics = ref(false);
const statistics = ref({ totalCount: 0, totalAmount: 0, draftCount: 0, confirmedCount: 0, pendingInvoiceCount: 0, invoicedCount: 0, withoutReceiptCount: 0, cancelledCount: 0, cancelledAmount: 0, receivedQuantity: 0, signedRate: 0, months: [] as string[], monthlyCreated: [] as number[], monthlyConfirmed: [] as number[], monthlyQuantity: [] as number[], stateCounts: {} as Record<string, number>, topSuppliers: [] as any[] });
const monthlyChartData = computed(() => ({ labels: statistics.value.months, datasets: [{ label: 'Generados', data: statistics.value.monthlyCreated, backgroundColor: '#f2c078', borderColor: '#c96a1e', borderWidth: 1, borderRadius: 4 }, { label: 'Confirmados', data: statistics.value.monthlyConfirmed, backgroundColor: '#70b7a3', borderColor: '#16846e', borderWidth: 1, borderRadius: 4 }] }));
const stateChartData = computed(() => ({ labels: Object.keys(statistics.value.stateCounts), datasets: [{ data: Object.values(statistics.value.stateCounts), backgroundColor: ['#f4c95d', '#57ad91', '#e26b6b', '#6ca9dc'], borderColor: ['#c79419', '#16846e', '#b93a3a', '#2875b6'], borderWidth: 2 }] }));
const monthlyChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 11, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } } };
const stateChartOptions = { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 11, padding: 14 } } } };
const loadStatistics = async () => {
  loadingStatistics.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetPurchasesDeliveryStatistics`), { params: { year: selectedStatisticsYear.value } });
    statistics.value = { ...statistics.value, ...data };
  } catch {
    toast.add({ severity: 'error', summary: 'No se pudieron cargar los indicadores', life: 3000 });
  } finally { loadingStatistics.value = false; }
};
watch(selectedStatisticsYear, loadStatistics);
onMounted(loadStatistics);
const applyFilters = () => { selected.value = null; tableLoadError.value = false; tableRef.value?.refreshWithQuery('', { state: selectedState.value || undefined, invoiceStatus: selectedInvoiceStatus.value || undefined }); };
watch([selectedState, selectedInvoiceStatus], applyFilters);
const openDetail = async (item: any) => {
  if (!item?.pkid) return;
  detailVisible.value = true; detailLoading.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetPurchasesDelivery/${item.pkid}`));
    data.hasNotes = !!data.notes?.trim();
    detail.value = data;
    detailDate.value = data.createDate ? parseServerDate(data.createDate) : new Date();
    detailEntityId.value = data.entityId ?? null;
    detailSupplierLabel.value = data.entityName ? `${data.entityName}` : '';
    for (const line of detail.value.lines || []) {
      line.productLabel = line.productCode ? `${line.productCode} — ${line.description || ''}` : '';
    }
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo abrir el albarán', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4000 });
    detailVisible.value = false;
  } finally { detailLoading.value = false; }
};
const menuItems = computed(() => {
  const groups: any[][] = [];
  const base: any[] = [
    { label: 'Abrir albarán', icon: 'pi pi-eye', command: () => openDetail(selected.value) },
    { label: 'Trazabilidad comercial', icon: 'pi pi-sitemap', command: () => traceabilityRef.value?.open('PURCHASE_DELIVERY', selected.value?.pkid) },
  ];
  if (securityStore.hasPermission(PERM.PURCHASE_DELIV_DOCS)) base.push({ label: `Fotografías y justificantes${selected.value?.attachmentCount ? ` (${selected.value.attachmentCount})` : ''}`, icon: 'pi pi-paperclip', command: () => openAttachmentsRow(selected.value) });
  if (securityStore.hasPermission(PERM.PURCHASE_DELIV_NOTES)) base.push({ label: 'Notas', icon: 'pi pi-comments', command: () => openNotesRow(selected.value) });
  groups.push(base);
  if (selected.value && !isCancelled(selected.value.state) && securityStore.hasPermission(PERM.PURCHASE_DELIV_EDIT)) groups.push([
    { label: 'Imprimir albarán', icon: 'pi pi-print', command: () => openPdfRow(selected.value, false) },
    { label: 'Imprimir albarán valorado', icon: 'pi pi-file-pdf', command: () => openPdfRow(selected.value, true) },
  ]);
  if (selected.value && isConfirmed(selected.value.state) && !selected.value.invoiced && securityStore.hasPermission(PERM.PURCHASE_DELIV_TO_INVOICE)) groups.push([
    { label: 'Facturar albaranes', icon: 'pi pi-receipt', command: () => openInvoiceDialog(selected.value) },
  ]);
  if (selected.value && !isCancelled(selected.value.state) && securityStore.hasPermission(PERM.PURCHASE_DELIV_STATE)) groups.push([
    { label: 'Anular albarán', icon: 'pi pi-ban', command: () => cancelRow(selected.value) },
  ]);
  return groups.filter(group => group.length).flatMap((group, index) => index ? [{ separator: true }, ...group] : group);
});
const openMenu = (event: Event, item: any) => { selected.value = item; rowMenu.value?.toggle(event); };
const isCancelled = (state = '') => state === 'Anulado / Cancelled';
const isConfirmed = (state = '') => state === 'Confirmado / Confirmed';
const invoiceDialogVisible = ref(false);
const loadingInvoiceCandidates = ref(false);
const creatingInvoice = ref(false);
const invoiceCandidates = ref<any[]>([]);
const selectedInvoiceDeliveries = ref<any[]>([]);
const invoiceNotes = ref('');
const invoiceSupplierName = ref('');
const selectedInvoiceTotal = computed(() => selectedInvoiceDeliveries.value.reduce((total, item) => total + Number(item.totalTotal || 0), 0));
const openInvoiceDialog = async (item: any) => {
  if (!item?.pkid) return;
  invoiceSupplierName.value = item.entityName || '';
  invoiceDialogVisible.value = true;
  loadingInvoiceCandidates.value = true;
  invoiceCandidates.value = [];
  selectedInvoiceDeliveries.value = [];
  invoiceNotes.value = '';
  try {
    const { data } = await axios.get(backendUrl(`/WebGetCompatiblePurchasesDeliveries/${item.pkid}`));
    invoiceCandidates.value = data || [];
    selectedInvoiceDeliveries.value = invoiceCandidates.value.filter((row: any) => row.pkid === item.pkid);
  } catch (e: any) {
    invoiceDialogVisible.value = false;
    toast.add({ severity: 'error', summary: 'No se pueden agrupar los albaranes', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4500 });
  } finally { loadingInvoiceCandidates.value = false; }
};
const createGroupedInvoice = async () => {
  if (!selectedInvoiceDeliveries.value.length) return;
  creatingInvoice.value = true;
  try {
    const { data } = await axios.post(backendUrl(`/WebCreatePurchasesInvoiceFromDeliveries`), {
      userId: authStore.user?.pkid ?? null,
      deliveryIds: selectedInvoiceDeliveries.value.map(item => item.pkid),
      notes: invoiceNotes.value,
    });
    invoiceDialogVisible.value = false;
    toast.add({ severity: 'success', summary: 'Factura borrador creada', detail: `${data.code} · ${data.deliveryCount} albarán${data.deliveryCount === 1 ? '' : 'es'} · ${currency(data.totalTotal)}`, life: 5500 });
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo crear la factura', detail: e.response?.data || 'Revisa la selección.', life: 5500 });
  } finally { creatingInvoice.value = false; }
};
const invoiceFromDelivery = async (item: any) => {
  if (!item?.pkid) return;
  try {
    const { data } = await axios.post(backendUrl(`/WebCreatePurchasesInvoiceFromDeliveries`), {
      userId: authStore.user?.pkid ?? null,
      deliveryIds: [item.pkid],
    });
    toast.add({ severity: 'success', summary: 'Factura borrador creada', detail: `${data.code} · ${currency(data.totalTotal)}`, life: 5000 });
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo facturar', detail: e.response?.data || 'Inténtalo de nuevo.', life: 5000 });
  }
};
const openPdf = (valued = false) => {
  openPdfRow(detail.value, valued);
};
const openPdfRow = (item: any, valued = false) => {
  if (item?.pkid) window.open(backendUrl(`/WebGetPurchasesDeliveryPdf/${item.pkid}?valued=${valued}`), '_blank', 'noopener');
};
const openAttachments = () => {
  openAttachmentsRow(detail.value);
};
const openAttachmentsRow = (item: any) => {
  if (!item?.pkid) return;
  attachmentDelivery.value = item;
  showAttachments.value = true;
};
const onAttachmentsVisible = (value: boolean) => {
  showAttachments.value = value;
  if (!value) refresh();
};
const openNotesRow = (item: any) => {
  if (!item?.pkid) return;
  noteRequest.id = item.pkid;
  notesReadonly.value = !isDraft(item.state);
  showNotes.value = true;
};
const selectDetailSupplier = (supplier: any) => {
  detailEntityId.value = supplier.pkid;
  detailSupplierLabel.value = `${supplier.code ? `${supplier.code} — ` : ''}${supplier.name}`;
};
const selectDetailProduct = (line: any, product: any) => {
  line.productId = product.pkid;
  line.productLabel = `${product.code} — ${product.description}`;
  line.productCode = product.code;
  line.description = product.description || '';
  line.priceUnit = Number(product.costPrice ?? 0);
  line.tax = Number(product.purchaseTaxValue ?? product.taxValue ?? 0);
  line.uomId = product.uomId ?? null;
};
const clearDetailProduct = (line: any) => {
  line.productId = null;
  line.productLabel = '';
};
const addDetailLine = () => {
  if (!Array.isArray(detail.value.lines)) detail.value.lines = [];
  detail.value.lines.push({ pkid: null, productId: null, productLabel: '', productCode: '', uomId: null, description: '', quantity: 1, priceUnit: 0, tax: 0 });
};
const removeDetailLine = (line: any) => {
  detail.value.lines = (detail.value.lines || []).filter((l: any) => l !== line);
};
const saveDetail = async (showSuccess = true) => {
  if (!detail.value?.pkid || !detailDate.value || detailSaving.value) return false;
  if (!detailEntityId.value) {
    toast.add({ severity: 'error', summary: 'Proveedor obligatorio', detail: 'Selecciona el proveedor del albarán.', life: 4000 });
    return false;
  }
  if (!String(detail.value.supplierCode || '').trim()) {
    toast.add({ severity: 'error', summary: 'Nº de albarán obligatorio', detail: 'Indica el número de albarán del proveedor.', life: 4000 });
    return false;
  }
  const invalid = (detail.value.lines || []).find((line: any) => !line.productId || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0);
  if (invalid || !(detail.value.lines || []).length) {
    toast.add({ severity: 'error', summary: 'Líneas no válidas', detail: 'Todas las líneas deben tener producto y una cantidad mayor que cero.', life: 4000 });
    return false;
  }
  detailSaving.value = true;
  try {
    const { data } = await axios.put(backendUrl(`/WebUpdatePurchasesDelivery/${detail.value.pkid}`), {
      dateCreate: detailDate.value.toISOString(),
      entityId: detailEntityId.value,
      supplierCode: String(detail.value.supplierCode || '').trim(),
      reference: detail.value.reference || '',
      notes: detail.value.notes || '',
      lines: detail.value.lines.map((line: any) => ({
        deliveryLineId: line.pkid ?? null,
        productId: line.productId,
        description: line.description || '',
        quantity: Number(line.quantity),
        priceUnit: Number(line.priceUnit || 0),
        tax: Number(line.tax || 0),
        uomId: line.uomId ?? null,
      })),
    });
    await openDetail(data);
    if (showSuccess) {
      toast.add({ severity: 'success', summary: 'Borrador guardado', detail: 'Se han actualizado la fecha, las cantidades y los totales.', life: 3500 });
      detailVisible.value = false;
    }
    refresh();
    return true;
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: e.response?.data || 'Revisa las cantidades.', life: 5000 });
    return false;
  } finally { detailSaving.value = false; }
};
const confirmDetail = () => askLocalConfirm({
  header: 'Confirmar albarán',
  message: 'Las cantidades se contabilizarán como entradas y el documento quedará bloqueado. Después no podrá editarse.',
  acceptLabel: 'Confirmar albarán',
  acceptIcon: 'pi pi-check-circle',
  action: async () => {
    try {
      const saved = await saveDetail(false);
      if (!saved) return;
      await axios.post(backendUrl(`/WebConfirmPurchasesDelivery/${detail.value.pkid}`));
      toast.add({ severity: 'success', summary: 'Albarán confirmado', detail: 'Las cantidades ya constan como entradas.', life: 4000 });
      detailVisible.value = false;
      refresh();
    } catch (e: any) {
      toast.add({ severity: 'error', summary: 'No se pudo confirmar', detail: e.response?.data || 'Inténtalo de nuevo.', life: 5000 });
    }
  },
});
const cancelDetail = () => cancelRow(detail.value);
const cancelRow = (item: any) => {
  if (!item?.pkid) return;
  askLocalConfirm({
    header: 'Anular albarán',
    message: 'El albarán quedará anulado y no podrá facturarse.',
    acceptLabel: 'Anular albarán',
    acceptIcon: 'pi pi-ban',
    danger: true,
    action: async () => {
      try {
        await axios.post(backendUrl(`/WebCancelPurchasesDelivery/${item.pkid}`));
        toast.add({ severity: 'success', summary: 'Albarán anulado', life: 3500 });
        if (detail.value?.pkid === item.pkid) detailVisible.value = false;
        refresh();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'No se pudo anular', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4500 });
      }
    },
  });
};
</script>

<style scoped>
.delivery-page { width: 100%; padding: 18px 16px 94px; color: #243044; background: linear-gradient(180deg,#fdf8f4 0%,#fff 32%); }
.page-header { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 15px 20px; border: 1px solid #f0ddc8; border-radius: 15px; background: #fff; box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055); margin-bottom: 14px; }
.page-header::after { content: ""; position: absolute; z-index: 0; width: 300px; height: 300px; right: 20px; top: 50%; transform: translateY(-50%); background: url("/logos/logo512.png") center/contain no-repeat; filter: grayscale(1); opacity: 0.075; pointer-events: none; }
.page-header > * { position: relative; z-index: 1; }
.page-heading { display: flex; align-items: center; gap: 14px; }
.page-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 12px; color: #fff; background: linear-gradient(135deg, #e8a25c, #c96a1e); box-shadow: 0 7px 16px rgba(201, 106, 30, 0.22); }
.page-icon i { font-size: 1.25rem; }
.breadcrumb { color: #8a93a2; font-size: 0.82rem; font-weight: 650; }
.page-heading h1 { margin: 3px 0 0; color: #202939; font-size: 1.45rem; }
.page-heading p { margin: 2px 0 0; color: #778192; font-size: 0.85rem; }
.header-actions { display: flex; gap: 4px; }
.list-card { border: 1px solid #dfe4ea; border-radius: 14px; background: #fff; box-shadow: 0 5px 18px rgba(30, 41, 59, 0.055); overflow: hidden; }
.list-toolbar { padding: 12px 16px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; }
.workspace-heading { display: flex; flex-direction: column; gap: 3px; }
.workspace-heading span { color: #344054; font-size: 1rem; font-weight: 800; }
.workspace-heading small { color: #7d8797; font-size: 0.84rem; }
.toolbar-actions { display: flex; align-items: center; gap: 0.8rem; }
.delivery-table { min-height: 480px; }
.delivery-filters { display: flex; align-items: center; gap: 0.55rem; }
.state-filter { width: 220px; }
.invoice-filter { width: 230px; }
.delivery-code { display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; }
.orders-cell { display: inline-flex; align-items: center; gap: 0.3rem; max-width: 100%; font-size: 0.78rem; }
.invoice-code-tag { font-size: 0.72rem !important; }
.draft-code { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 5px; background: #fff3cd; color: #8a5a00; font-weight: 700; border: 1px solid #ffe08a; }
.notes-indicator { color: #7b8f22; font-size: 0.95rem; }
.table-error { margin: 10px 12px 0; }
.loading { display: flex; align-items: center; justify-content: center; gap: 0.55rem; padding: 2rem; color: #687386; }
.delivery-form { display: flex; flex-direction: column; gap: 1rem; }
.document-summary { display: grid; grid-template-columns: 1.4fr 1.2fr 0.8fr 0.8fr; gap: 0.8rem; padding: 1rem; background: #fffaf5; border: 1px solid #f0ddc8; border-radius: 10px; }
.document-summary small, .document-summary strong { display: block; }
.document-summary small { margin-bottom: 0.3rem; color: #7b8492; }
.document-summary strong { color: #303b32; }
.manual-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; padding: 1rem; background: #fffdf8; border: 1px solid #f0ddc8; border-left: 4px solid #dc7c22; border-radius: 8px; }
.manual-detail small, .manual-detail strong { display: block; }
.manual-detail small { margin-bottom: 0.3rem; color: #7b8492; }
.manual-detail strong { color: #303b32; }
.manual-observations { grid-column: 1 / -1; }
.manual-observations p { margin: 0.2rem 0 0; color: #4b5563; white-space: pre-wrap; line-height: 1.5; }
.detail-lines { flex: 1 1 auto; min-height: 220px; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 8px; }
.lines-toolbar { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
.totals { display: flex; justify-content: flex-end; gap: 1.2rem; align-items: center; }
.totals span { color: #687386; }
.totals b { margin-left: 0.3rem; color: #26312a; }
.grand-total { padding: 0.6rem 0.8rem; border-radius: 8px; background: #fdf0e3; font-size: 1.05rem; }
.dialog-footer { width: 100%; }
.dialog-footer-separator { width: 100%; min-height: 1px; margin: 0 0 0.75rem; border-top: 1px solid var(--surface-300); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; width: 100%; }
.fixed-observations { height: 82px !important; min-height: 82px !important; max-height: 82px !important; resize: none !important; overflow-y: auto !important; }
.local-confirm-body { display: flex; align-items: flex-start; gap: 0.8rem; }
.local-confirm-body i { font-size: 1.6rem; color: #c96a1e; margin-top: 0.15rem; }
.local-confirm-body p { margin: 0; line-height: 1.5; }
.delivery-stats-card { margin-top: 14px; background: #fff; border: 1px solid #dfe4ea; border-radius: 14px; box-shadow: 0 5px 18px rgba(30,41,59,.045); overflow: hidden; }
.stats-header { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid #e8ecf0; }
.stats-header h6 { margin: 0 0 0.2rem; color: #344054; font-size: 0.98rem; }
.stats-header h6 i { margin-right: 0.45rem; color: #c96a1e; }
.stats-header span { color: #7d8797; font-size: 0.82rem; }
.stats-controls { display: flex; align-items: center; gap: 0.4rem; }
.statistics-year { width: 105px; }
.stats-body { padding: 14px 16px 18px; }
.stats-loading { min-height: 160px; display: flex; align-items: center; justify-content: center; gap: 0.55rem; color: #687386; }
.kpi-grid { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem; }
.kpi-card { display: flex; align-items: center; gap: 0.7rem; min-width: 0; padding: 0.8rem; border: 1px solid #e7eadf; border-radius: 9px; background: #fffdf9; }
.kpi-icon { display: grid; place-items: center; width: 35px; height: 35px; flex: 0 0 35px; border-radius: 9px; }
.kpi-icon.total { background: #fdf0e3; color: #c96a1e; }
.kpi-icon.draft { background: #fff3d6; color: #a66c00; }
.kpi-icon.invoice { background: #f5ebfb; color: #9253b5; }
.kpi-icon.receipt { background: #e7f5f1; color: #16846e; }
.kpi-icon.email { background: #edf5d9; color: #66880c; }
.kpi-icon.cancelled { background: #fdeaea; color: #c33f3f; }
.kpi-card small, .kpi-card strong, .kpi-card em { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-card small { color: #788071; font-size: 0.72rem; }
.kpi-card strong { margin: 0.12rem 0; color: #303b32; font-size: 1.15rem; }
.kpi-card em { color: #899184; font-size: 0.68rem; font-style: normal; }
.charts-grid { display: grid; grid-template-columns: 1.7fr 1fr; gap: 0.8rem; margin-top: 0.8rem; }
.chart-card, .ranking-card { padding: 0.9rem; border: 1px solid #e7eadf; border-radius: 9px; background: #fff; }
.chart-card h6, .ranking-card h6 { margin: 0 0 0.65rem; color: #465143; }
.chart-box { height: 240px; }
.chart-box.donut { height: 240px; }
.quality-strip { display: grid; grid-template-columns: repeat(2, 1fr); margin-top: 0.8rem; border: 1px solid #f0ddc8; border-left: 4px solid #dc7c22; border-radius: 8px; background: #fffaf5; }
.quality-strip div { padding: 0.75rem 0.85rem; border-right: 1px solid #f0e4d3; }
.quality-strip div:last-child { border-right: 0; }
.quality-strip small, .quality-strip b { display: block; }
.quality-strip small { color: #788071; font-size: 0.72rem; }
.quality-strip b { margin-top: 0.25rem; color: #35442e; font-size: 0.92rem; }
.rankings-grid { display: grid; margin-top: 0.8rem; }
.ranking-row { display: flex; align-items: center; gap: 0.7rem; padding: 0.5rem 0; border-bottom: 1px solid #f0f2ec; }
.ranking-row:last-child { border-bottom: 0; }
.ranking-position { display: grid; place-items: center; width: 26px; height: 26px; flex: 0 0 26px; border-radius: 50%; background: #fdf0e3; color: #c96a1e; font-weight: 800; font-size: 0.8rem; }
.ranking-main { flex: 1; min-width: 0; }
.ranking-main b, .ranking-main small { display: block; }
.ranking-main small { color: #788071; font-size: 0.72rem; }
.empty-ranking { color: #899184; font-size: 0.85rem; }
.grouped-invoice-form { display: flex; height: 100%; min-height: 0; flex-direction: column; gap: 0.75rem; }
.invoice-customer { display: flex; align-items: center; gap: 0.65rem; padding: 0.65rem 0.85rem; border: 1px solid #f0ddc8; border-radius: 8px; background: #fffaf5; color: #5c4326; }
.invoice-customer > i { color: #c96a1e; font-size: 1.25rem; }
.invoice-customer span, .invoice-customer small, .invoice-customer strong { display: block; }
.invoice-customer small { color: #8a93a2; font-size: 0.75rem; }
.invoice-deliveries-table { flex: 1 1 auto; min-height: 220px; overflow: hidden; }
.invoice-summary { display: flex; justify-content: flex-end; align-items: center; gap: 1.5rem; padding: 0.6rem 1rem; border-radius: 8px; background: #fdf6ee; color: #5c4326; }
.invoice-summary strong { font-size: 1.05rem; }
.invoice-notes { flex: 0 0 auto; margin-top: auto; }
.invoice-notes label { display: block; margin-bottom: 0.35rem; }
.invoice-notes :deep(textarea) { height: 72px !important; min-height: 72px !important; max-height: 72px !important; resize: none !important; overflow-y: auto; }
:deep(th.text-right .p-datatable-column-header-content) { justify-content: flex-end; }
</style>
