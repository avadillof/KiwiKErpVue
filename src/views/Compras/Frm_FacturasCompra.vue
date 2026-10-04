<template>
  <div class="invoice-page">
    <header class="page-header">
      <div class="page-heading">
        <div class="page-icon"><i class="pi pi-receipt"></i></div>
        <div><span class="breadcrumb">Compras / Operaciones</span><h1>Facturas de compra</h1><p>Facturas recibidas del proveedor, vencimientos y pagos. Sin VeriFactu.</p></div>
      </div>
      <nav class="header-actions"><Button type="button" label="Compras" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Compras' })" /><Button type="button" label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav>
    </header>

    <section class="list-card">
      <Toolbar class="list-toolbar">
        <template #start><div class="workspace-heading"><span>Listado de facturas</span><small>El nº de factura del proveedor se guarda en PURCHASES_INVOICES_DS_CODEPROVE.</small></div></template>
        <template #end><div class="toolbar-actions"><Message severity="info" variant="simple" icon="pi pi-info-circle">Las facturas se concilian con sus albaranes</Message><Button v-if="securityStore.hasPermission(PERM.PURCHASE_INV_EDIT)" label="Nueva factura manual" icon="pi pi-plus" size="small" @click="manualDialogRef?.open()" /></div></template>
      </Toolbar>
      <Message v-if="tableLoadError" severity="error" :closable="false" class="table-error">No se pudo cargar el listado de facturas. Comprueba que el backend esté reiniciado y vuelve a intentarlo.</Message>
      <GenericDataTable ref="tableRef" class="invoice-table" dataKey="pkid" selectionMode="single" v-model:selection="selected" endpoint="WebGetPurchasesInvoices" :params="{ state: selectedState || undefined, paid: selectedPaid ?? undefined }" :showPaginator="true" :filterable="true" :showActions="true" @data-loaded="tableLoadError=false" @load-error="tableLoadError=true">
        <template #panelOptions><div class="invoice-filters"><Select v-model="selectedState" :options="states" optionLabel="label" optionValue="value" showClear placeholder="Estado: Todos" class="state-filter"><template #value="{ value, placeholder }"><Tag v-if="value" :value="states.find(item => item.value === value)?.label ?? value" :severity="stateSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template><template #option="{ option }"><Tag :value="option.label" :severity="stateSeverity(option.value)" rounded /></template></Select><Select v-model="selectedPaid" :options="paidOptions" optionLabel="label" optionValue="value" showClear placeholder="Pago: Todas" class="paid-filter"><template #value="{ value, placeholder }"><Tag v-if="value !== null && value !== undefined" :value="value ? 'Pagadas' : 'Por pagar'" :severity="value ? 'success' : 'warn'" rounded /><span v-else>{{ placeholder }}</span></template><template #option="{ option }"><Tag :value="option.label" :severity="option.value ? 'success' : 'warn'" rounded /></template></Select></div></template>
        <template #headerActions><Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refresh" /><Button icon="pi pi-ellipsis-v" text rounded title="Opciones" @click="openMenuTable($event)" /></template>
        <Column field="code" sortField="code" header="Código" sortable style="width:13%"><template #body="{ data }"><span class="delivery-code"><span :class="{'draft-code':isDraft(data.state)}">{{ deliveryCode(data) }}</span></span></template></Column>
        <Column field="createDate" sortField="dateCreate" header="Fecha" sortable style="width:11%"><template #body="{ data }">{{ formatDate(data.createDate) }}</template></Column>
        <Column field="entityName" sortField="entitie.name" header="Proveedor" sortable style="width:15%" />
        <Column field="supplierCode" header="Nº factura proveedor" style="width:14%"><template #body="{ data }">{{ data.supplierCode || '-' }}</template></Column>
        <Column field="manual" header="Origen" style="width:14%"><template #body="{ data }"><Tag v-if="data.manual" value="Manual" icon="pi pi-file-edit" severity="secondary" rounded /><span v-else-if="deliveryCodeList(data).length" class="orders-cell"><Tag class="invoice-code-tag" :value="deliveryCodeList(data)[0]" icon="pi pi-truck" severity="success" rounded :title="data.deliveryCodes" /><Tag v-if="deliveryCodeList(data).length > 1" :value="`+${deliveryCodeList(data).length - 1}`" severity="secondary" rounded :title="data.deliveryCodes" /></span><span v-else>—</span></template></Column>
        <Column field="state" sortField="state" header="Estado" sortable style="width:10%"><template #body="{ data }"><Tag :value="stateLabel(data.state)" :severity="stateSeverity(data.state)" rounded /></template></Column>
        <Column field="vatSettlement" header="Liquidación IVA" style="width:12%;min-width:135px"><template #body="{ data }"><Tag v-if="data.vatSettlement" :value="data.vatSettlement.label" :severity="data.vatSettlement.status === 'PRESENTED' ? 'success' : 'warn'" :icon="data.vatSettlement.status === 'PRESENTED' ? 'pi pi-verified' : 'pi pi-clock'" :title="data.vatSettlement.status === 'PRESENTED' ? 'Incluida en una liquidación presentada' : 'Incluida en una preliquidación preparada'" rounded /><Tag v-else-if="data.state === 'Registrada / Registered'" value="Pendiente" severity="secondary" icon="pi pi-clock" rounded /><span v-else>—</span></template></Column>
        <Column field="paid" header="Pago" style="width:9%"><template #body="{ data }"><Tag :value="data.paid ? 'Pagada' : 'Por pagar'" :severity="data.paid ? 'success' : 'warn'" rounded /></template></Column>
        <Column field="totalTotal" sortField="totalTotal" header="Total" sortable style="width:11%;text-align:right" bodyStyle="text-align:right"><template #body="{ data }">{{ currency(data.totalTotal) }}</template></Column>
        <Column header="" style="width:4rem"><template #body="{ data }"><Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, data)" /></template></Column>
      </GenericDataTable>
      <Menu ref="rowMenu" :model="menuItems" popup />
      <Menu ref="menuTable" :model="menuItemsTable" popup />
    </section>

    <section class="stats">
      <header>
        <div>
          <b><i class="pi pi-chart-line" /> Resumen de facturación</b
          ><small>Registro, vencimientos y pagos del año seleccionado</small>
        </div>
        <div>
          <Select v-model="statsYear" :options="statsYears" /><Button
            :icon="statsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
            text
            rounded
            @click="statsExpanded = !statsExpanded"
          />
        </div>
      </header>
      <div v-if="statsExpanded" class="stats-body">
        <div v-if="loadingStats" class="loading">
          <i class="pi pi-spin pi-spinner" /> Cargando indicadores...
        </div>
        <template v-else
          ><div class="kpis">
            <article v-for="k in kpis" :key="k.label">
              <span :class="['kpi-icon', k.kind]"><i :class="k.icon" /></span>
              <div>
                <small>{{ k.label }}</small
                ><strong>{{ k.value }}</strong
                ><em>{{ k.detail }}</em>
              </div>
            </article>
          </div>
          <div class="analytics">
            <div class="chart">
              <h3>Evolución mensual registrada</h3>
              <Chart type="bar" :data="chartData" :options="chartOptions" />
            </div>
            <div class="ranking">
              <h3><i class="pi pi-trophy" /> Top 5 proveedores facturados</h3>
              <p v-if="!stats.topSuppliers.length">No hay facturas registradas.</p>
              <div v-for="(s, i) in stats.topSuppliers" :key="s.name">
                <span>{{ Number(i) + 1 }}</span>
                <section>
                  <b>{{ s.name }}</b
                  ><small
                    >{{ s.count }} factura{{ s.count === 1 ? "" : "s" }}</small
                  >
                </section>
                <strong>{{ money(s.amount) }}</strong>
              </div>
            </div>
          </div></template
        >
      </div>
    </section>

    <Dialog v-model:visible="detailVisible" modal maximizable :header="detail.code ? `Factura ${detail.code}` : 'Factura'" :style="{ width: 'min(1500px,98vw)', height: '92vh' }" :contentStyle="{ height: 'calc(92vh - 130px)', overflowY: 'auto' }" class="kiwik-dialog">
      <div v-if="detailLoading" class="loading"><i class="pi pi-spin pi-spinner"></i> Cargando factura...</div>
      <div v-else class="delivery-form">
        <div class="document-summary">
          <div><small>Proveedor</small><SupplierLookup v-if="canFullEdit" v-model="detailEntityId" :label="detailSupplierLabel" @selected="selectDetailSupplier" @cleared="detailEntityId = null" /><strong v-else>{{ detail.entityName || '-' }}</strong></div>
          <div><small>Nº factura proveedor</small><InputText v-if="isDraftDetail" v-model="detail.supplierCode" maxlength="100" fluid /><strong v-else>{{ detail.supplierCode || '-' }}</strong></div>
          <div><small>Fecha</small><DatePicker v-if="canFullEdit" v-model="detailDate" dateFormat="dd/mm/yy" showIcon iconDisplay="input" showTime showSeconds hourFormat="24" fluid /><strong v-else>{{ formatDate(detail.createDate) }}</strong></div>
          <div><small>Estado</small><Tag :value="stateLabel(detail.state)" :severity="stateSeverity(detail.state)" rounded /></div>
        </div>
        <Message v-if="isDraftDetail" severity="warn" :closable="false">Borrador sin registrar. Indica el nº de factura del proveedor y regístrala.</Message>
        <div v-if="canFullEdit" class="lines-toolbar"><Button label="Añadir línea" icon="pi pi-plus" size="small" @click="addDetailLine" /></div>
        <DataTable :value="detail.lines || []" size="small" stripedRows scrollable scrollHeight="flex" class="detail-lines">
          <Column field="productCode" header="Producto" style="width:18%"><template #body="{ data }"><ProductLookup v-if="canFullEdit" mode="purchase" v-model="data.productId" :label="data.productLabel || data.productCode" @selected="selectDetailProduct(data, $event)" @cleared="clearDetailProduct(data)" /><span v-else>{{ data.productCode }}</span></template></Column>
          <Column field="description" header="Descripción"><template #body="{ data }"><InputText v-if="canFullEdit" v-model="data.description" maxlength="165" fluid /><span v-else>{{ data.description }}</span></template></Column>
          <Column field="quantity" header="Cantidad" style="width:12%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="canFullEdit" v-model="data.quantity" :min="0.001" :maxFractionDigits="3" locale="de-DE" fluid inputClass="text-right" /><b v-else>{{ quantity(data.quantity) }}</b></template></Column>
          <Column field="priceUnit" header="Coste" style="width:13%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="canFullEdit" v-model="data.priceUnit" :min="0" :minFractionDigits="2" :maxFractionDigits="4" mode="currency" currency="EUR" locale="de-DE" fluid inputClass="text-right" /><span v-else>{{ currency(data.priceUnit) }}</span></template></Column>
          <Column field="tax" header="IVA %" style="width:10%;text-align:right" bodyStyle="text-align:right" headerStyle="text-align:right" headerClass="text-right"><template #body="{ data }"><InputNumber v-if="canFullEdit" v-model="data.tax" :min="0" :max="100" :maxFractionDigits="2" suffix=" %" fluid inputClass="text-right" /><span v-else>{{ quantity(data.tax) }} %</span></template></Column>
          <Column v-if="canFullEdit" header="" style="width:3.2rem"><template #body="{ data }"><Button icon="pi pi-trash" severity="danger" text rounded title="Eliminar línea" @click="removeDetailLine(data)" /></template></Column>
        </DataTable>
        <div class="manual-detail-invoice">
          <div><small>Referencia</small><InputText v-if="isDraftDetail" v-model="detail.reference" maxlength="145" fluid /><strong v-else>{{ detail.reference || '-' }}</strong></div>
          <div><small>Observaciones</small><Textarea v-if="isDraftDetail" v-model="detail.notes" rows="3" maxlength="500" class="w-full fixed-observations" /><p v-else>{{ detail.notes || 'Sin observaciones' }}</p></div>
        </div>
        <div class="totals"><span>Neto <b>{{ currency(detail.totalNeto) }}</b></span><span>Impuestos <b>{{ currency(detail.totalTax) }}</b></span><span class="grand-total">Total <b>{{ currency(detail.totalTotal) }}</b></span></div>
        <p v-if="detail.notes" class="detail-notes">{{ detail.notes }}</p>
      </div>
      <template #footer><div class="dialog-footer"><div class="kiwik-separator dialog-footer-separator"></div><div class="dialog-actions"><Button label="Cerrar" severity="secondary" text @click="detailVisible = false" /><Button v-if="securityStore.hasPermission(PERM.PURCHASE_INV_DOCS)" :label="`Justificantes${detail.attachmentCount ? ` (${detail.attachmentCount})` : ''}`" icon="pi pi-paperclip" outlined @click="openAttachments" /><Button v-if="isDraftDetail && securityStore.hasPermission(PERM.PURCHASE_INV_EDIT)" label="Guardar cambios" icon="pi pi-save" outlined :loading="detailSaving" @click="() => saveInvoice(true)" /><Button v-if="isDraftDetail && securityStore.hasPermission(PERM.PURCHASE_INV_ISSUE)" label="Registrar factura" icon="pi pi-check-circle" @click="registerDetail" /><Button v-if="!isCancelledDetail && !isDraftDetail && securityStore.hasPermission(PERM.PURCHASE_INV_MARK_PAID)" :label="detail.paid ? 'Marcar por pagar' : 'Marcar pagada'" :icon="detail.paid ? 'pi pi-undo' : 'pi pi-wallet'" outlined :loading="paidBusy" :disabled="paidBusy" @click="togglePaidDetail" /><Button v-if="detail.state && !isCancelledDetail && !detail.paid && securityStore.hasPermission(PERM.PURCHASE_INV_ISSUE)" label="Anular" icon="pi pi-ban" severity="danger" outlined @click="cancelDetail" /></div></div></template>
    </Dialog>

    <AttachmentsDialog :visible="showAttachments" moduleFolder="ATTACHEMENTS_PURCHASESINVOICES_JUSTIFICANTES" :title="`Justificantes · ${attachmentInvoice?.code || ''}`" :entityId="attachmentInvoice?.pkid || 0" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" :maxFileSize="15728640" @update:visible="onAttachmentsVisible" />
    <DialogNotes v-model:visible="showNotes" :request="noteRequest" :readonly="notesReadonly" @saved="refresh" />

    <Dialog v-model:visible="localConfirmVisible" modal :header="localConfirm.header || 'Confirmación'" :style="{ width: 'min(480px,94vw)' }" class="kiwik-dialog">
      <div class="local-confirm-body"><i :class="localConfirm.acceptIcon" /><p>{{ localConfirm.message }}</p></div>
      <template #footer><div class="dialog-actions"><Button label="Volver" severity="secondary" text @click="localConfirmVisible = false" /><Button :label="localConfirm.acceptLabel" :icon="localConfirm.acceptIcon" :severity="localConfirm.danger ? 'danger' : 'success'" :loading="localConfirmBusy" @click="runLocalConfirm" /></div></template>
    </Dialog>

    <ManualPurchaseInvoiceDialog ref="manualDialogRef" @saved="refresh" />
    <SalesTraceabilityDialog ref="traceabilityRef" mode="purchases" />
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
import DialogNotes from "@/components/dialogs/DialogNotes.vue";
import ProductLookup from "@/components/shared/ProductLookup.vue";
import SupplierLookup from "@/components/shared/SupplierLookup.vue";
import SalesTraceabilityDialog from "../Ventas/SalesTraceabilityDialog.vue";
import AttachmentsDialog from "@/components/attachments/AttachmentsDialog.vue";
import ManualPurchaseInvoiceDialog from "./ManualPurchaseInvoiceDialog.vue";
import { useSecurityStore } from "@/stores/securityStore";
import { PERM } from "@/services/Frm_Main/permissions";

const securityStore = useSecurityStore();
const router = useRouter();
const toast = useToast();
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
const selectedPaid = ref<boolean | null>(null);
const traceabilityRef = ref<any>(null);
const tableLoadError = ref(false);
const detailVisible = ref(false);
const detailLoading = ref(false);
const detail = ref<any>({});
const detailSaving = ref(false);
const paidBusy = ref(false);
const detailDate = ref<Date | null>(null);
const detailEntityId = ref<number | null>(null);
const detailSupplierLabel = ref('');
const canFullEdit = computed(() => isDraftDetail.value && !!detail.value?.manual && !detail.value?.fromDeliveries);
const showAttachments = ref(false);
const attachmentInvoice = ref<any>(null);
const showNotes = ref(false);
const notesReadonly = ref(true);
const noteRequest = { table: 'PURCHASES_INVOICES', pkField: 'PURCHASES_INVOICES_PK_ID', field: 'PURCHASES_INVOICES_DS_NOTES', id: -1 };
const openNotesRow = (item: any) => {
  if (!item?.pkid) return;
  noteRequest.id = item.pkid;
  notesReadonly.value = item.state !== 'Borrador / Draft';
  showNotes.value = true;
};
const isDraftDetail = computed(() => detail.value?.state === 'Borrador / Draft');
const isCancelledDetail = computed(() => detail.value?.state === 'Cancelada / Canceled');

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

const states = [
  { label: 'Borrador', value: 'Borrador / Draft' },
  { label: 'Registrada', value: 'Registrada / Registered' },
  { label: 'Anulada', value: 'Cancelada / Canceled' },
];
const paidOptions = [
  { label: 'Por pagar', value: false },
  { label: 'Pagadas', value: true },
];
const isDraft = (state = '') => state === 'Borrador / Draft';
const deliveryCode = (item: any) => {
  const code = String(item?.code || '');
  return isDraft(item?.state) && !code.startsWith('DRAFT_') ? 'DRAFT_' + code : code;
};
const stateLabel = (state = '') => isDraft(state) ? 'Borrador' : state === 'Cancelada / Canceled' ? 'Anulada' : state === 'Registrada / Registered' ? 'Registrada' : state;
const stateSeverity = (state = '') => isDraft(state) ? 'warn' : state === 'Cancelada / Canceled' ? 'danger' : 'success';
const deliveryCodeList = (data: any): string[] => String(data?.deliveryCodes || '').split(',').map((code: string) => code.trim()).filter(Boolean);
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

const refresh = () => { selected.value = null; tableLoadError.value = false; tableRef.value?.refresh(); loadStats(); };
const statsYear = ref(new Date().getFullYear());
const statsYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
const statsExpanded = ref(true);
const loadingStats = ref(false);
const stats = ref({ draftCount: 0, draftAmount: 0, registeredCount: 0, registeredAmount: 0, paidCount: 0, paidAmount: 0, pendingCount: 0, pendingAmount: 0, overdueCount: 0, cancelledCount: 0, monthlyRegistered: [] as number[], topSuppliers: [] as any[] });
const money = (value?: number | null) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
const kpis = computed(() => [
  { label: 'Borradores', value: stats.value.draftCount, detail: money(stats.value.draftAmount), icon: 'pi pi-file-edit', kind: 'draft' },
  { label: 'Facturas registradas', value: stats.value.registeredCount, detail: money(stats.value.registeredAmount), icon: 'pi pi-check-circle', kind: 'issued' },
  { label: 'Importe pagado', value: money(stats.value.paidAmount), detail: `${stats.value.paidCount} facturas totalmente pagadas`, icon: 'pi pi-wallet', kind: 'paid' },
  { label: 'Pendientes de pago', value: stats.value.pendingCount, detail: money(stats.value.pendingAmount), icon: 'pi pi-clock', kind: 'pending' },
  { label: 'Vencidas', value: stats.value.overdueCount, detail: 'Pendientes de pago', icon: 'pi pi-exclamation-triangle', kind: 'overdue' },
  { label: 'Anuladas', value: stats.value.cancelledCount, detail: `Año ${statsYear.value}`, icon: 'pi pi-ban', kind: 'cancelled' },
]);
const chartData = computed(() => ({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  datasets: [{ label: 'Registrado', data: stats.value.monthlyRegistered, backgroundColor: '#e8a4b8', borderColor: '#b74267', borderWidth: 1, borderRadius: 4 }],
}));
const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 11, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } };
const loadStats = async () => {
  loadingStats.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetPurchasesInvoiceStatistics`), { params: { year: statsYear.value } });
    stats.value = { ...stats.value, ...data };
  } finally { loadingStats.value = false; }
};
watch(statsYear, loadStats);
onMounted(loadStats);
const applyFilters = () => { selected.value = null; tableLoadError.value = false; tableRef.value?.refreshWithQuery('', { state: selectedState.value || undefined, paid: selectedPaid.value ?? undefined }); };
watch([selectedState, selectedPaid], applyFilters);

const openDetail = async (item: any) => {
  if (!item?.pkid) return;
  detailVisible.value = true; detailLoading.value = true;
  try {
    const { data } = await axios.get(backendUrl(`/WebGetPurchasesInvoice/${item.pkid}`));
    detail.value = data;
    detailDate.value = data.createDate ? parseServerDate(data.createDate) : new Date();
    detailEntityId.value = data.entityId ?? null;
    detailSupplierLabel.value = data.entityName || '';
    for (const line of data.lines || []) {
      line.productLabel = line.productCode ? `${line.productCode} — ${line.description || ''}` : '';
    }
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo abrir la factura', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4000 });
    detailVisible.value = false;
  } finally { detailLoading.value = false; }
};
const openAttachments = () => {
  if (!detail.value?.pkid) return;
  attachmentInvoice.value = detail.value;
  showAttachments.value = true;
};
const openAttachmentsRow = (item: any) => {
  if (!item?.pkid) return;
  attachmentInvoice.value = item;
  showAttachments.value = true;
};
const onAttachmentsVisible = (value: boolean) => {
  showAttachments.value = value;
  if (!value) {
    refresh();
    if (detail.value?.pkid === attachmentInvoice.value?.pkid) openDetail(detail.value);
  }
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
const saveInvoice = async (showSuccess = true) => {
  if (!detail.value?.pkid || detailSaving.value) return false;
  if (canFullEdit.value && !detailEntityId.value) {
    toast.add({ severity: 'error', summary: 'Proveedor obligatorio', detail: 'Selecciona el proveedor de la factura.', life: 4000 });
    return false;
  }
  if (canFullEdit.value) {
    const invalid = (detail.value.lines || []).find((line: any) => !line.productId || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0);
    if (invalid || !(detail.value.lines || []).length) {
      toast.add({ severity: 'error', summary: 'Líneas no válidas', detail: 'Todas las líneas deben tener producto y una cantidad mayor que cero.', life: 4000 });
      return false;
    }
  }
  detailSaving.value = true;
  try {
    const { data } = await axios.put(backendUrl(`/WebUpdatePurchasesInvoice/${detail.value.pkid}`), {
      entityId: canFullEdit.value ? detailEntityId.value : undefined,
      dateCreate: canFullEdit.value && detailDate.value ? detailDate.value.toISOString() : undefined,
      supplierCode: detail.value.supplierCode || '',
      reference: detail.value.reference || '',
      notes: detail.value.notes || '',
      lines: canFullEdit.value ? detail.value.lines.map((line: any) => ({
        invoiceLineId: line.pkid ?? null,
        productId: line.productId,
        description: line.description || '',
        quantity: Number(line.quantity),
        priceUnit: Number(line.priceUnit || 0),
        tax: Number(line.tax || 0),
        uomId: line.uomId ?? null,
      })) : undefined,
    });
    detail.value = data;
    detailEntityId.value = data.entityId ?? detailEntityId.value;
    if (showSuccess) {
      toast.add({ severity: 'success', summary: 'Borrador guardado', life: 3500 });
      detailVisible.value = false;
    }
    refresh();
    return true;
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: e.response?.data || 'Revisa los datos.', life: 5000 });
    return false;
  } finally { detailSaving.value = false; }
};
const registerDetail = () => {
  if (!String(detail.value.supplierCode || '').trim()) {
    toast.add({ severity: 'error', summary: 'Nº de factura obligatorio', detail: 'Indica el número de factura del proveedor.', life: 4000 });
    return;
  }
  askLocalConfirm({
    header: 'Registrar factura',
    message: `Se registrará la factura con el nº ${detail.value.supplierCode} y se generará su vencimiento.`,
    acceptLabel: 'Registrar factura',
    acceptIcon: 'pi pi-check-circle',
    action: async () => {
      try {
        const { data } = await axios.post(backendUrl(`/WebConfirmPurchasesInvoice/${detail.value.pkid}`), { supplierCode: detail.value.supplierCode });
        detail.value = data;
        toast.add({ severity: 'success', summary: 'Factura registrada', life: 3500 });
        refresh();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'No se pudo registrar', detail: e.response?.data || 'Inténtalo de nuevo.', life: 5000 });
      }
    },
  });
};
const togglePaidDetail = async () => {
  if (paidBusy.value) return;
  paidBusy.value = true;
  try {
    await axios.post(backendUrl(`/WebMarkPurchasesInvoicePaid/${detail.value.pkid}`), { paid: !detail.value.paid });
    await openDetail({ pkid: detail.value.pkid });
    toast.add({ severity: 'success', summary: detail.value.paid ? 'Factura pagada' : 'Factura por pagar', life: 3000 });
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo actualizar', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4500 });
  } finally { paidBusy.value = false; }
};
const cancelDetail = () => {
  const item = detail.value;
  askLocalConfirm({
    header: 'Anular factura',
    message: 'La factura quedará anulada.',
    acceptLabel: 'Anular factura',
    acceptIcon: 'pi pi-ban',
    danger: true,
    action: async () => {
      try {
        await axios.post(backendUrl(`/WebCancelPurchasesInvoice/${item.pkid}`));
        toast.add({ severity: 'success', summary: 'Factura anulada', life: 3500 });
        detailVisible.value = false;
        refresh();
      } catch (e: any) {
        toast.add({ severity: 'error', summary: 'No se pudo anular', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4500 });
      }
    },
  });
};
const menuItems = computed(() => {
  const groups: any[][] = [];
  const base: any[] = [
    { label: 'Abrir factura', icon: 'pi pi-eye', command: () => openDetail(selected.value) },
    { label: 'Trazabilidad comercial', icon: 'pi pi-sitemap', command: () => traceabilityRef.value?.open('PURCHASE_INVOICE', selected.value?.pkid) },
  ];
  if (securityStore.hasPermission(PERM.PURCHASE_INV_DOCS)) base.push({ label: `Justificantes${selected.value?.attachmentCount ? ` (${selected.value.attachmentCount})` : ''}`, icon: 'pi pi-paperclip', command: () => openAttachmentsRow(selected.value) });
  if (securityStore.hasPermission(PERM.PURCHASE_INV_NOTES)) base.push({ label: 'Notas', icon: 'pi pi-comments', command: () => openNotesRow(selected.value) });
  groups.push(base);
  if (selected.value && !isCancelledDetailFunc(selected.value.state) && !isDraft(selected.value.state) && securityStore.hasPermission(PERM.PURCHASE_INV_MARK_PAID)) groups.push([
    { label: selected.value.paid ? 'Marcar por pagar' : 'Marcar pagada', icon: 'pi pi-wallet', command: () => togglePaidRow(selected.value) },
  ]);
  if (selected.value && !isCancelledDetailFunc(selected.value.state) && !selected.value.paid && securityStore.hasPermission(PERM.PURCHASE_INV_ISSUE)) groups.push([
    { label: 'Anular factura', icon: 'pi pi-ban', command: () => cancelRow(selected.value) },
  ]);
  return groups.filter(group => group.length).flatMap((group, index) => index ? [{ separator: true }, ...group] : group);
});
const isCancelledDetailFunc = (state = '') => state === 'Cancelada / Canceled';
const openMenu = (event: Event, item: any) => { selected.value = item; rowMenu.value?.toggle(event); };
const togglePaidRow = async (item: any) => {
  if (!item?.pkid || paidBusy.value) return;
  paidBusy.value = true;
  try {
    await axios.post(backendUrl(`/WebMarkPurchasesInvoicePaid/${item.pkid}`), { paid: !item.paid });
    toast.add({ severity: 'success', summary: !item.paid ? 'Factura pagada' : 'Factura por pagar', life: 3000 });
    refresh();
  } catch (e: any) {
    toast.add({ severity: 'error', summary: 'No se pudo actualizar', detail: e.response?.data || 'Inténtalo de nuevo.', life: 4500 });
  } finally { paidBusy.value = false; }
};
const cancelRow = (item: any) => {
  if (!item?.pkid) return;
  askLocalConfirm({
    header: 'Anular factura',
    message: 'La factura quedará anulada.',
    acceptLabel: 'Anular factura',
    acceptIcon: 'pi pi-ban',
    danger: true,
    action: async () => {
      try {
        await axios.post(backendUrl(`/WebCancelPurchasesInvoice/${item.pkid}`));
        toast.add({ severity: 'success', summary: 'Factura anulada', life: 3500 });
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
.invoice-page { width: 100%; padding: 18px 16px 94px; color: #243044; background: linear-gradient(180deg,#fdf8f4 0%,#fff 32%); }
.page-header { position: relative; isolation: isolate; overflow: hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 15px 20px; border: 1px solid #f0ddc8; border-radius: 15px; background: #fff; box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055); margin-bottom: 14px; }
.page-header::after { content: ""; position: absolute; z-index: 0; width: 300px; height: 300px; right: 20px; top: 50%; transform: translateY(-50%); background: url("/logos/logo512.png") center/contain no-repeat; filter: grayscale(1); opacity: 0.075; pointer-events: none; }
.page-header > * { position: relative; z-index: 1; }
.page-heading { display: flex; align-items: center; gap: 14px; }
.page-icon { display: grid; width: 48px; height: 48px; place-items: center; border-radius: 12px; color: #fff; background: linear-gradient(135deg, #e46e8e, #b74267); box-shadow: 0 7px 16px rgba(183, 66, 103, 0.22); }
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
.invoice-table { min-height: 480px; }
.invoice-filters { display: flex; align-items: center; gap: 0.55rem; }
.state-filter { width: 220px; }
.paid-filter { width: 200px; }
.delivery-code { display: inline-flex; align-items: center; gap: 0.4rem; white-space: nowrap; }
.draft-code { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 5px; background: #fff3cd; color: #8a5a00; font-weight: 700; border: 1px solid #ffe08a; }
.table-error { margin: 10px 12px 0; }
.loading { display: flex; align-items: center; justify-content: center; gap: 0.55rem; padding: 2rem; color: #687386; }
.delivery-form { display: flex; flex-direction: column; gap: 1rem; }
.document-summary { display: grid; grid-template-columns: 1.4fr 1.2fr 0.8fr 0.8fr; gap: 0.8rem; padding: 1rem; background: #fffaf5; border: 1px solid #f0ddc8; border-radius: 10px; }
.document-summary small, .document-summary strong { display: block; }
.document-summary small { margin-bottom: 0.3rem; color: #7b8492; }
.document-summary strong { color: #303b32; }
.detail-lines { flex: 1 1 auto; min-height: 220px; overflow: hidden; border: 1px solid #e5e7eb; border-radius: 8px; }
.totals { display: flex; justify-content: flex-end; gap: 1.2rem; align-items: center; }
.totals span { color: #687386; }
.totals b { margin-left: 0.3rem; color: #26312a; }
.grand-total { padding: 0.6rem 0.8rem; border-radius: 8px; background: #fdf0e3; font-size: 1.05rem; }
.dialog-footer { width: 100%; }
.dialog-footer-separator { width: 100%; min-height: 1px; margin: 0 0 0.75rem; border-top: 1px solid var(--surface-300); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 0.5rem; width: 100%; }
.detail-notes { margin: 0; color: #4b5563; white-space: pre-wrap; line-height: 1.5; }
.manual-detail-invoice { display: grid; grid-template-columns: 1fr; gap: 0.85rem; padding: 1rem; background: #fffdf8; border: 1px solid #f0ddc8; border-left: 4px solid #b74267; border-radius: 8px; }
.manual-detail-invoice small, .manual-detail-invoice strong { display: block; }
.manual-detail-invoice small { margin-bottom: 0.3rem; color: #7b8492; }
.manual-detail-invoice strong { color: #303b32; }
.manual-detail-invoice p { margin: 0.2rem 0 0; color: #4b5563; white-space: pre-wrap; line-height: 1.5; }
.lines-toolbar { display: flex; justify-content: flex-end; margin-bottom: 0.5rem; }
.fixed-observations { height: 82px !important; min-height: 82px !important; max-height: 82px !important; resize: none !important; overflow-y: auto !important; }
.local-confirm-body { display: flex; align-items: flex-start; gap: 0.8rem; }
.local-confirm-body i { font-size: 1.6rem; color: #c96a1e; margin-top: 0.15rem; }
.local-confirm-body p { margin: 0; line-height: 1.5; }
.stats { margin-top: 14px; overflow: hidden; border: 1px solid #dfe4ea; border-radius: 14px; background: #fff; }
.stats > header { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid #e8ecf0; }
.stats > header > div:last-child { display: flex; gap: 0.4rem; }
.stats > header .p-select { width: 105px; }
.stats > header i { color: #b74267; }
.stats > header b { display: flex; align-items: center; gap: 0.5rem; }
.stats > header small { display: block; color: #7d8797; font-size: 0.82rem; font-weight: 400; }
.stats-body { padding: 14px 16px 18px; }
.kpis { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 0.7rem; }
.kpis article { display: flex; align-items: center; gap: 0.7rem; min-width: 0; padding: 0.8rem; border: 1px solid #f0ddc8; border-radius: 9px; background: #fffdf9; }
.kpi-icon { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border-radius: 9px; }
.kpi-icon.draft { background: #f5ebfb; color: #9253b5; }
.kpi-icon.issued { background: #e8f3ff; color: #2875b6; }
.kpi-icon.paid { background: #e7f5f1; color: #16846e; }
.kpi-icon.pending { background: #fff3d6; color: #a66c00; }
.kpi-icon.overdue, .kpi-icon.cancelled { background: #fdeaea; color: #c33f3f; }
.kpis small, .kpis strong, .kpis em { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpis strong { margin: 0.12rem 0; font-size: 1.1rem; }
.kpis em { color: #899184; font-size: 0.68rem; font-style: normal; }
.analytics { display: grid; grid-template-columns: 1.7fr 1fr; gap: 0.8rem; margin-top: 0.8rem; }
.chart, .ranking { height: 285px; padding: 0.9rem; border: 1px solid #f0ddc8; border-radius: 9px; overflow: auto; }
.chart h3, .ranking h3 { margin: 0 0 0.6rem; font-size: 0.88rem; }
.chart > .p-chart { height: 240px; }
.ranking > div { display: flex; align-items: center; gap: 0.7rem; padding: 0.45rem 0; border-bottom: 1px solid #f3efe9; }
.ranking > div:last-child { border-bottom: 0; }
.ranking > div > span:first-child { display: grid; place-items: center; width: 24px; height: 24px; flex: 0 0 24px; border-radius: 50%; background: #fdf0e3; color: #c96a1e; font-weight: 800; font-size: 0.75rem; }
.ranking section { flex: 1; min-width: 0; }
.ranking section b, .ranking section small { display: block; }
.ranking section small { color: #788071; font-size: 0.72rem; }
:deep(th.text-right .p-datatable-column-header-content) { justify-content: flex-end; }
</style>
