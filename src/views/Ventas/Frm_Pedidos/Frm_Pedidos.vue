<template>
    <div class="sales-page">
        <header class="page-header">
            <div class="page-heading"><div class="page-icon"><i class="pi pi-shopping-cart"></i></div><div><span class="breadcrumb">Ventas / Operaciones</span><h1>Pedidos de venta</h1><p>Pedidos confirmados, preparación de entregas y seguimiento de sus líneas.</p></div></div>
            <nav class="header-actions"><Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Ventas' })" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav>
        </header>

        <div class="card list-card">
            <Toolbar class="list-toolbar"><template #start><div class="workspace-heading"><span>Listado de pedidos</span><small>Controla el estado y avance de cada operación de venta.</small></div></template><template #end><div class="module-actions"><SalesAutomationActions module="orders" @executed="refreshTable" /><Button class="new-document" label="Nuevo pedido" icon="pi pi-plus" size="small" @click="orderFormRef?.open(null)" /></div></template></Toolbar>
            <GenericDataTable class="orders-table" ref="tableRef" dataKey="pkid" selectionMode="single" v-model:selection="selectedOrder"
                endpoint="WebGetSalesOrders" :params="{ state: selectedState || undefined, pendingFlow: selectedPendingFlow || undefined, deliveryDeadline: selectedDeliveryDeadline || undefined }" :showPaginator="true" :filterable="true" :showActions="true"
                @row-select="({ data }) => selectedOrder = data" @search="clearDateFilters">
                <template #panelOptions>
                  <div class="order-quick-filters">
                    <Select v-model="selectedState" :options="orderStates" optionLabel="label" optionValue="value" showClear placeholder="Situación: Todas" class="state-quick-filter">
                        <template #value="{ value, placeholder }"><Tag v-if="value" :value="orderStates.find(item => item.value === value)?.label ?? value" :severity="stateSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template>
                        <template #option="{ option }"><Tag :value="option.label" :severity="stateSeverity(option.value)" rounded /></template>
                    </Select>
                    <Select v-model="selectedPendingFlow" :options="pendingFlowOptions" optionLabel="label" optionValue="value" showClear placeholder="Pendiente de: Todo" class="pending-quick-filter">
                        <template #value="{ value, placeholder }"><Tag v-if="value" :value="pendingFlowOptions.find(item => item.value === value)?.label ?? value" :severity="pendingFlowSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template>
                        <template #option="{ option }"><Tag :value="option.label" :severity="pendingFlowSeverity(option.value)" rounded /></template>
                    </Select>
                    <Select :disabled="deliverySettingsLoading || deliverySettingsError" aria-label="Plazo entrega" v-model="selectedDeliveryDeadline" :options="deliveryDeadlineOptions" optionLabel="label" optionValue="value" showClear placeholder="Plazo entrega: Todos" class="deadline-quick-filter">
                        <template #value="{ value, placeholder }"><Tag v-if="value" :value="deliveryDeadlineOptions.find(item => item.value === value)?.label ?? value" :severity="deliveryDeadlineSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template>
                        <template #option="{ option }"><Tag :value="option.label" :severity="deliveryDeadlineSeverity(option.value)" rounded /></template>
                    </Select>
                  </div>
                </template>
                <template #headerActions><Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refreshTable" /><Button icon="pi pi-ellipsis-v" text rounded @click="tableMenu?.toggle($event)" /><Menu ref="tableMenu" :model="tableMenuItems" popup /></template>
                <Column field="code" sortField="code" header="Código" sortable style="width: 11%" bodyClass="nowrap-cell"><template #body="{ data }"><span class="code-with-attachments"><span :class="{ 'draft-code': isDraft(data.state) }">{{ data.code }}</span><Tag v-if="Number(data.attachmentCount || 0) > 0" :value="String(data.attachmentCount)" icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i v-if="data.hasNotes" class="pi pi-comment notes-indicator" title="Tiene observaciones"></i></span></template></Column>
                <Column field="entityName" sortField="entitie.name" header="Cliente" sortable style="width: 15%" bodyClass="nowrap-cell" />
                <Column field="reference" sortField="reference" header="Referencia" sortable style="width: 11%" bodyClass="nowrap-cell"><template #body="{ data }">{{ data.reference || '-' }}</template></Column>
                <Column field="contact" sortField="contact" header="Contacto" sortable style="width: 11%" bodyClass="nowrap-cell" />
                <Column field="createDate" sortField="dateCreate" sortable style="width: 10%" bodyClass="nowrap-cell"><template #header><div class="flex align-items-center justify-content-between w-full"><span><b>Fecha de creación</b></span><Button :severity="creationDateRange ? 'danger' : 'secondary'" icon="pi pi-filter" rounded size="small" @click.stop="creationDatePanel?.toggle($event)" /></div></template><template #body="{ data }">{{ formatDateTime(data.createDate) }}</template></Column>
                <Column field="validityDate" sortField="dateValidity" header="Entrega prevista" sortable style="width: 10%" bodyClass="nowrap-cell"><template #body="{ data }"><Tag v-if="data.validityDate && !isDraft(data.state) && Number(data.deliveryPendingLines || 0) > 0" :value="formatDate(data.validityDate)" :severity="deliveryDateSeverity(data.validityDate)" rounded /><span v-else>{{ data.validityDate ? formatDate(data.validityDate) : '-' }}</span></template></Column>
                <Column field="creatorName" header="Creado por" sortable style="width: 10%" bodyClass="nowrap-cell"><template #body="{ data }"><span class="creator-cell" :title="data.creatorName || data.creatorCode"><Avatar shape="circle" class="creator-avatar"><img v-if="data.creatorId && !creatorPhotoErrors[data.creatorId]" :src="getCreatorPhotoUrl(data.creatorId)" :alt="data.creatorName || data.creatorCode" @error="handleCreatorPhotoError(data.creatorId)" /><span v-else>{{ creatorInitials(data.creatorName || data.creatorCode) }}</span></Avatar><span>{{ data.creatorName || data.creatorCode || '-' }}</span></span></template></Column>
                <Column field="state" sortField="state" header="Estado" sortable style="width: 11%" bodyClass="nowrap-cell"><template #body="{ data }"><div class="order-state-line"><Tag :value="stateLabel(data.state)" :severity="stateSeverity(data.state)" rounded /><i v-if="data.locked" class="pi pi-lock order-lock" title="Pedido bloqueado"></i></div></template></Column>
                <Column header="Seguimiento" style="width: 11%"><template #body="{ data }"><Tag v-if="isDraft(data.state)" value="Sin iniciar" severity="secondary" rounded /><div v-else class="list-progress" :title="progressTooltip(data)"><span class="delivery"><i class="pi pi-truck"></i>{{ data.deliveryPendingLines ?? 0 }}</span><span class="invoice"><i class="pi pi-receipt"></i>{{ data.directInvoiceLines ?? 0 }}</span><span class="complete"><i class="pi pi-check-circle"></i>{{ data.completedLines ?? 0 }}</span></div></template></Column>
                <Column field="totalTotal" sortField="totalTotal" header="Total" sortable style="width: 10%; text-align: right" bodyStyle="text-align: right"><template #body="{ data }">{{ formatCurrency(data.totalTotal) }}</template></Column>
                <Column header="Acciones" style="width: 4%"><template #body="{ data }"><Button icon="pi pi-ellipsis-v" text rounded @click="openOrderMenu($event, data)" /></template></Column>
            </GenericDataTable>
            <Menu ref="orderMenu" :model="orderMenuItems" popup />
        </div>

        <section class="order-stats-card">
            <div class="stats-header"><div><h6><i class="pi pi-chart-line"></i> Resumen operativo de pedidos</h6><span>Indicadores de ejecución del año seleccionado</span></div><div class="flex align-items-center gap-2"><Select v-model="selectedStatisticsYear" :options="statisticsYears" class="statistics-year" /><Button :icon="statisticsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text rounded @click="statisticsExpanded = !statisticsExpanded" /></div></div>
            <div v-if="statisticsExpanded" class="stats-body">
                <div v-if="loadingStatistics" class="stats-loading"><i class="pi pi-spin pi-spinner"></i> Cargando indicadores...</div>
                <template v-else>
                    <div class="kpi-grid">
                        <div class="kpi-card"><span class="kpi-icon total"><i class="pi pi-shopping-cart"></i></span><div><small>Pedidos creados</small><strong>{{ statistics.totalCount }}</strong><em>{{ formatCurrency(statistics.totalAmount) }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon draft"><i class="pi pi-clock"></i></span><div><small>Pendientes de confirmar</small><strong>{{ statistics.draftCount }}</strong><em>{{ formatCurrency(statistics.draftAmount) }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon delivery"><i class="pi pi-truck"></i></span><div><small>Pendientes de entrega</small><strong>{{ statistics.deliveryPendingLines }} líneas</strong><em>{{ formatQuantity(statistics.deliveryPendingQuantity) }} uds. pendientes</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon invoice"><i class="pi pi-receipt"></i></span><div><small>Pendientes de facturación</small><strong>{{ statistics.directInvoiceLines }} líneas</strong><em>Bienes y servicios</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon completed"><i class="pi pi-check-circle"></i></span><div><small>Pedidos completados</small><strong>{{ statistics.completedOrders }}</strong><em>{{ formatCurrency(statistics.completedAmount) }}</em></div></div>
                    </div>
                    <div class="comparison-line"><i :class="statistics.yearOverYearRate === null || statistics.yearOverYearRate >= 0 ? 'pi pi-chart-line' : 'pi pi-arrow-down'"></i><span>Comparativa {{ selectedStatisticsYear - 1 }}:</span><b>{{ formatCurrency(statistics.previousYearAmount) }}</b><em :class="{ negative: statistics.yearOverYearRate !== null && statistics.yearOverYearRate < 0 }">{{ statistics.yearOverYearRate === null ? 'Sin histórico comparable' : `${statistics.yearOverYearRate >= 0 ? '+' : ''}${statistics.yearOverYearRate} %` }}</em></div>
                    <div class="charts-grid"><div class="chart-card"><h6>Evolución mensual</h6><div class="chart-box"><Chart type="bar" :data="monthlyChartData" :options="monthlyChartOptions" /></div></div><div class="chart-card"><h6>Situación de las líneas</h6><div class="chart-box donut"><Chart type="doughnut" :data="flowChartData" :options="flowChartOptions" /></div></div></div>
                    <div class="top-customers-card"><h6><i class="pi pi-trophy"></i> Top 5 clientes por importe de pedidos</h6><div v-if="!statistics.topCustomers.length" class="empty-ranking">No hay pedidos registrados en {{ selectedStatisticsYear }}.</div><div v-else v-for="(customer, index) in statistics.topCustomers" :key="`${customer.code}-${index}`" class="ranking-row"><span class="ranking-position">{{ index + 1 }}</span><div class="ranking-customer"><b>{{ customer.name }}</b><small>{{ customer.code || 'Sin código' }} · {{ customer.count }} pedido{{ customer.count === 1 ? '' : 's' }}</small></div><strong>{{ formatCurrency(customer.amount) }}</strong></div></div>
                </template>
            </div>
        </section>

        <Frm_PresupuestoForm ref="orderFormRef" document-type="order" @saved="onOrderSaved" />
        <OrderInvoiceDialog ref="orderInvoiceDialogRef" @generated="onOrderInvoiceGenerated" />
        <DeliveryPreparationDialog ref="deliveryDialogRef" :order-id="selectedOrder?.pkid" @generated="onDeliveryGenerated" />
        <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_SALESPEDIDOS_DOCUMENTS" :title="`Documentos indexados al pedido ${selectedOrder?.code ?? ''}`" :entityId="selectedOrder?.pkid" @update:visible="onAttachmentsVisible" />
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="onNotesSaved" />
        <Dialog v-model:visible="showProformas" modal maximizable header="Proformas del pedido" :style="{ width: '42rem' }" :contentStyle="{ padding: '1.25rem', minHeight: '260px' }" :pt="{ root: { class: 'kiwik-dialog' }, header: { class: 'kiwik-dialog-header' }, content: { class: 'kiwik-dialog-content' }, footer: { class: 'kiwik-dialog-footer' } }"><div v-if="loadingProformas" class="flex justify-content-center py-5"><i class="pi pi-spin pi-spinner text-primary text-2xl"></i></div><Message v-else-if="!proformas.length" severity="info" :closable="false">Este pedido todavía no tiene proformas generadas.</Message><DataTable v-else :value="proformas" size="small" stripedRows><Column field="code" header="Código" /><Column field="state" header="Estado"><template #body="{ data }"><Tag :value="data.state" :severity="data.state?.includes('Reemplazada') ? 'secondary' : 'info'" rounded /></template></Column><Column field="createDate" header="Fecha"><template #body="{ data }">{{ formatDateTime(data.createDate) }}</template></Column><Column field="totalTotal" header="Total" bodyStyle="text-align:right"><template #body="{ data }">{{ formatCurrency(data.totalTotal) }}</template></Column><Column header="PDF" style="width:4rem" bodyStyle="text-align:center"><template #body="{ data }"><Button icon="pi pi-download" text rounded severity="danger" v-tooltip.top="'Descargar PDF'" @click="downloadProforma(data)" /></template></Column></DataTable><template #footer><div class="dialog-footer"><div class="kiwik-separator"></div><div class="dialog-footer-actions"><Button label="Cerrar" severity="secondary" text @click="showProformas = false" /></div></div></template></Dialog>
        <ConfirmDialog />
        <OverlayPanel ref="creationDatePanel" appendTo="body"><DateRangePicker v-model="creationDateRange" /></OverlayPanel>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Chart from 'primevue/chart';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Menu from 'primevue/menu';
import Message from 'primevue/message';
import OverlayPanel from 'primevue/overlaypanel';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import SalesAutomationActions from '../SalesAutomationActions.vue';
import DateRangePicker from '@/components/shared/DateRangePicker.vue';
import Frm_PresupuestoForm from '../Frm_Presupuestos/Frm_PresupuestoForm.vue';
import DeliveryPreparationDialog from '../Frm_Albaranes/DeliveryPreparationDialog.vue';
import OrderInvoiceDialog from './OrderInvoiceDialog.vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import DialogNotes from '@/components/dialogs/DialogNotes.vue';

const orderInvoiceDialogRef = ref<any>();
const onOrderInvoiceGenerated = (invoice:any) => { tableRef.value?.refresh(); loadOrderStatistics(); router.push({name:'Facturas',query:{invoiceId:String(invoice.pkid)}}); };
const router = useRouter(); const toast = useToast(); const confirm = useConfirm();
const tableRef = ref<any>(); const tableMenu = ref(); const orderMenu = ref(); const orderFormRef = ref<any>(); const deliveryDialogRef = ref<any>(); const selectedOrder = ref<any>(null); const selectedState = ref<string | null>(null); const selectedPendingFlow = ref<string | null>(null); const selectedDeliveryDeadline = ref<string | null>(null); const creationDatePanel = ref(); const creationDateRange = ref<[Date | null, Date | null] | null>(null);
const creatorPhotoErrors = ref<Record<number, boolean>>({});
const showProformas = ref(false); const loadingProformas = ref(false); const generatingProforma = ref(false); const proformas = ref<any[]>([]);
const showAttachments = ref(false);
const showNotes = ref(false);
const noteRequest = { table: 'SALES_ORDERS', pkField: 'SALES_ORDERS_PK_ID', field: 'SALES_ORDERS_DS_NOTES', id: -1 };
const selectedStatisticsYear = ref(new Date().getFullYear()); const statisticsExpanded = ref(true); const loadingStatistics = ref(false);
const statisticsYears = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);
const statistics = ref({ totalCount: 0, totalAmount: 0, draftCount: 0, draftAmount: 0, deliveryPendingLines: 0, deliveryPendingQuantity: 0, directInvoiceLines: 0, completedLines: 0, completedOrders: 0, completedAmount: 0, previousYearAmount: 0, yearOverYearRate: null as number | null, months: [] as string[], monthlyTotal: [] as number[], monthlyCompleted: [] as number[], flowCounts: {} as Record<string, number>, topCustomers: [] as Array<{ name: string; code: string; count: number; amount: number }> });
const orderStates = [
    { label: 'Borradores', value: 'Para Aprobar / To Approved Sale' },
    { label: 'En curso', value: 'Para Generar Albarán / To Make Delivery Note' },
    { label: 'Parcialmente completados', value: 'Parcialmente completado / Partially completed' },
    { label: 'Entregados · pendientes de facturación', value: 'Entregado / Delivered' },
    { label: 'Completados', value: 'Completado / Completed' },
    { label: 'Cancelados', value: 'Cancelado / Canceled' }
];
const pendingFlowOptions = [{ label: 'Generar albarán', value: 'delivery' }, { label: 'Facturación', value: 'invoice' }];
const deliverySettings=ref({deliveryDeadlineShortDays:7,deliveryDeadlineLongDays:30});
const deliverySettingsLoading=ref(true),deliverySettingsError=ref(false);
const loadDeliverySettings=async()=>{deliverySettingsLoading.value=true;try{const{data}=await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesDeliverySettings`);deliverySettings.value=data;deliverySettingsError.value=false}catch{deliverySettingsError.value=true;toast.add({severity:'error',summary:'No se pudieron cargar los plazos de entrega',detail:'Actualiza el backend y vuelve a refrescar el listado.',life:5000})}finally{deliverySettingsLoading.value=false}};
const deliveryDeadlineOptions = computed(()=>[{ label: 'Vencidos', value: 'OVERDUE' }, { label: 'Vencen hoy', value: 'TODAY' }, { label: `Próximos ${deliverySettings.value.deliveryDeadlineShortDays} días`, value: 'NEXT_7' }, { label: `Próximos ${deliverySettings.value.deliveryDeadlineLongDays} días`, value: 'NEXT_30' }, { label: 'Sin fecha prevista', value: 'NO_DATE' }]);
const isDraft = (state?: string) => state === 'Para Aprobar / To Approved Sale';
const stateLabel = (state = '') => ({ 'Para Aprobar / To Approved Sale': 'Borrador', 'Confirmado / In Progress': 'En curso', 'Para Generar Albarán / To Make Delivery Note': 'En curso', 'Parcialmente completado / Partially completed': 'Parcial', 'Entregado / Delivered': 'Entregado', 'Completado / Completed': 'Completado', 'Cancelado / Canceled': 'Cancelado' }[state] ?? state);
const getCreatorPhotoUrl = (userId: number) => `${import.meta.env.VITE_API_URL.replace('/api', '')}/gestdoc/users/${userId}/photoPerfil.jpg`;
const handleCreatorPhotoError = (userId: number) => { creatorPhotoErrors.value[userId] = true; };
const creatorInitials = (creator?: string) => (creator || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
const progressTooltip = (order: any) => `${order.deliveryPendingLines ?? 0} líneas pendientes de entrega — ${order.deliveryPendingQuantity ?? 0} uds.\n${order.directInvoiceLines ?? 0} líneas pendientes de facturación\n${order.completedLines ?? 0} líneas entregadas y facturadas`;
const stateSeverity = (state = '') => { if (state.includes('Completado')) return 'success'; if (state.includes('Entregado')) return 'info'; if (state.includes('Parcialmente')) return 'warn'; if (state.includes('Cancelado')) return 'danger'; if (state.includes('Confirmado') || state.includes('Albarán')) return 'info'; return 'secondary'; };
const pendingFlowSeverity = (value = '') => value === 'delivery' ? 'info' : 'warn';
const deliveryDeadlineSeverity = (value = '') => value === 'OVERDUE' ? 'danger' : value === 'TODAY' ? 'warn' : value === 'NO_DATE' ? 'secondary' : 'info';
const canGenerateDelivery = (order: any) => ['Para Generar Albarán / To Make Delivery Note', 'Confirmado / In Progress', 'Parcialmente completado / Partially completed'].includes(order?.state)
    && Number(order?.deliveryPendingLines ?? 0) > 0 && Number(order?.deliveryPendingQuantity ?? 0) > 0.0001;
const monthlyChartData = computed(() => ({ labels: statistics.value.months, datasets: [{ label: 'Pedidos creados', data: statistics.value.monthlyTotal, backgroundColor: '#d9ef9c', borderColor: '#b1d70e', borderWidth: 1, borderRadius: 4 }, { label: 'Pedidos completados', data: statistics.value.monthlyCompleted, backgroundColor: '#5aa2de', borderColor: '#2875b6', borderWidth: 1, borderRadius: 4 }] }));
const flowChartData = computed(() => ({ labels: Object.keys(statistics.value.flowCounts), datasets: [{ data: Object.values(statistics.value.flowCounts), backgroundColor: ['#dcebfa', '#f2e6f8', '#e4f5dd'], borderColor: ['#2875b6', '#9253b5', '#569419'], borderWidth: 2 }] }));
const monthlyChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 11, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (value: number) => new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value) } } } };
const flowChartOptions = { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 11, padding: 14 } } } };
const tableMenuItems = [{ label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() }, { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value?.exportToExcel() }];
const orderMenuItems = computed(() => {
    const items: any[] = [{ label: 'Abrir pedido', icon: 'pi pi-pencil', command: () => orderFormRef.value?.open(selectedOrder.value?.pkid) }];
    if (isDraft(selectedOrder.value?.state)) items.push({ separator: true }, { label: 'Confirmar pedido', icon: 'pi pi-check-circle', command: confirmOrder });
    if (!isDraft(selectedOrder.value?.state)) {
        items.push({ separator: true }, { label: 'Generar proforma', icon: 'pi pi-file', command: generateProforma });
        if (Number(selectedOrder.value?.proformaCount ?? 0) > 0) items.push({ label: 'Ver proformas', icon: 'pi pi-folder-open', command: openProformas });
        if (!['Completado / Completed', 'Cancelado / Canceled'].includes(selectedOrder.value?.state)) {
            items.push({ separator: true }, { label: selectedOrder.value?.locked ? 'Desbloquear pedido' : 'Bloquear pedido', icon: selectedOrder.value?.locked ? 'pi pi-lock-open' : 'pi pi-lock', command: toggleOrderLock });
            if (!selectedOrder.value?.locked && Number(selectedOrder.value?.cancellablePendingQuantity ?? 0) > 0) items.push({ label: 'Cancelar cantidades pendientes', icon: 'pi pi-ban', command: cancelPendingOrder });
        }
    }
    if (selectedOrder.value?.canInvoiceFromOrder) items.push({label:'Facturar desde pedido',icon:'pi pi-receipt',command:()=>orderInvoiceDialogRef.value?.open(selectedOrder.value.pkid)});
    if (canGenerateDelivery(selectedOrder.value)) items.push({ label: 'Generar albarán', icon: 'pi pi-truck', command: () => deliveryDialogRef.value?.open(selectedOrder.value?.pkid) });
    items.push({ separator: true },
        { label: 'Notas', icon: 'pi pi-comments', command: openNotes },
        { label: `Documentos${selectedOrder.value?.attachmentCount ? ` (${selectedOrder.value.attachmentCount})` : ''}`, icon: 'pi pi-paperclip', command: () => { showAttachments.value = true; } });
    return items;
});
const openNotes = () => { if (!selectedOrder.value?.pkid) return; noteRequest.id = selectedOrder.value.pkid; showNotes.value = true; };
const onNotesSaved = () => { tableRef.value?.refresh(); loadOrderStatistics(); };
const onAttachmentsVisible = (value: boolean) => { showAttachments.value = value; if (!value) tableRef.value?.refresh(); };
const openOrderMenu = (event: Event, order: any) => { selectedOrder.value = order; orderMenu.value?.toggle(event); };
const toggleOrderLock = async () => { if (!selectedOrder.value?.pkid) return; const locked = !Boolean(selectedOrder.value.locked); try { await axios.post(`${import.meta.env.VITE_API_URL}/WebSetSalesOrderLock/${selectedOrder.value.pkid}/${locked}`); toast.add({ severity: 'success', summary: locked ? 'Pedido bloqueado' : 'Pedido desbloqueado', detail: locked ? 'El pedido queda protegido frente a modificaciones.' : 'El pedido vuelve a admitir cambios controlados.', life: 3500 }); selectedOrder.value = null; tableRef.value?.refresh(); } catch (error: any) { toast.add({ severity: 'error', summary: 'No se pudo cambiar el bloqueo', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 4500 }); } };
const cancelPendingOrder = () => { if (!selectedOrder.value?.pkid) return; confirm.require({ header: 'Cancelar cantidades pendientes', message: 'Se conservará todo lo ya entregado o facturado y sólo se cancelará lo que todavía esté pendiente. Esta operación mantiene la trazabilidad del pedido.', icon: 'pi pi-exclamation-triangle', acceptLabel: 'Cancelar pendientes', rejectLabel: 'Volver', acceptClass: 'p-button-danger', accept: async () => { try { await axios.post(`${import.meta.env.VITE_API_URL}/WebCancelSalesOrderPending/${selectedOrder.value.pkid}`); toast.add({ severity: 'success', summary: 'Pendientes cancelados', detail: 'El estado del pedido se ha recalculado conservando lo ya ejecutado.', life: 4000 }); selectedOrder.value = null; tableRef.value?.refresh(); loadOrderStatistics(); } catch (error: any) { toast.add({ severity: 'error', summary: 'No se pudo cancelar', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 4500 }); } } }); };
const confirmOrder = () => {
    if (!selectedOrder.value?.pkid) return;
    confirm.require({ header: 'Confirmar pedido de venta', message: 'El pedido pasará a “Confirmado / En curso”. Podrá modificarse de forma controlada y seguirá por separado su entrega y facturación.', icon: 'pi pi-check-circle', acceptLabel: 'Confirmar pedido', rejectLabel: 'Volver', accept: async () => {
        try { await axios.post(`${import.meta.env.VITE_API_URL}/WebConfirmSalesOrder/${selectedOrder.value.pkid}`); toast.add({ severity: 'success', summary: 'Pedido confirmado', detail: 'Ya está preparado para el siguiente paso del circuito.', life: 4000 }); selectedOrder.value = null; tableRef.value?.refresh(); loadOrderStatistics(); }
        catch (error: any) { toast.add({ severity: 'error', summary: 'No se pudo confirmar el pedido', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 5000 }); }
    }});
};
const generateProforma = async () => {
    if (!selectedOrder.value?.pkid || generatingProforma.value) return;
    generatingProforma.value = true;
    const reportWindow = window.open('', '_blank');
    try { const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/WebGenerateSalesProforma/${selectedOrder.value.pkid}`); selectedOrder.value.proformaCount = Number(selectedOrder.value.proformaCount ?? 0) + 1; tableRef.value?.refresh(); toast.add({ severity: 'success', summary: 'Proforma generada', detail: `Se ha creado la proforma ${data.code}.`, life: 4000 }); const reportUrl = `${import.meta.env.VITE_API_URL}/WebGetSalesProformaPdf/${data.pkid}`; if (reportWindow) reportWindow.location.href = reportUrl; else window.open(reportUrl, '_blank', 'noopener'); }
    catch (error: any) { reportWindow?.close(); toast.add({ severity: 'error', summary: 'No se pudo generar la proforma', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 5000 }); }
    finally { generatingProforma.value = false; }
};
const openProformas = async () => { if (!selectedOrder.value?.pkid) return; showProformas.value = true; loadingProformas.value = true; try { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesOrderProformas/${selectedOrder.value.pkid}`); proformas.value = data ?? []; } catch { toast.add({ severity: 'error', summary: 'No se pudieron cargar las proformas', life: 3000 }); } finally { loadingProformas.value = false; } };
const downloadProforma = (proforma: any) => window.open(`${import.meta.env.VITE_API_URL}/WebGetSalesProformaPdf/${proforma.pkid}`, '_blank', 'noopener');
const onDeliveryGenerated = () => { selectedOrder.value = null; tableRef.value?.refresh(); loadOrderStatistics(); };
const loadOrderStatistics = async () => { loadingStatistics.value = true; try { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesOrderStatistics`, { params: { year: selectedStatisticsYear.value } }); statistics.value = { ...statistics.value, ...data }; } catch { toast.add({ severity: 'error', summary: 'No se pudieron cargar las estadísticas', life: 3000 }); } finally { loadingStatistics.value = false; } };
const refreshTable = async () => { await loadDeliverySettings();await tableRef.value?.refresh(); await loadOrderStatistics(); };
const onOrderSaved = () => { tableRef.value?.refresh(); loadOrderStatistics(); };
const clearDateFilters = () => { creationDateRange.value = null; };
const applyFilters = () => {
    const filters: string[] = [];
    if (creationDateRange.value?.[0] && creationDateRange.value?.[1]) filters.push(`[dateCreate],[${creationDateRange.value[0].toISOString()}],[${creationDateRange.value[1].toISOString()}]`);
    tableRef.value?.refreshWithQuery(filters.join(';'), { state: selectedState.value || undefined, pendingFlow: selectedPendingFlow.value || undefined, deliveryDeadline: selectedDeliveryDeadline.value || undefined });
};
watch([selectedState, selectedPendingFlow, selectedDeliveryDeadline, creationDateRange], applyFilters);
watch(selectedStatisticsYear, loadOrderStatistics);
onMounted(()=>{void loadOrderStatistics();void loadDeliverySettings()});
const pad = (value: number) => String(value).padStart(2, '0');
const formatDateParts = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
const parseServerDate = (value: string): Date | null => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
    const sql = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/.exec(value);
    if (sql) return new Date(Number(sql[1]), Number(sql[2]) - 1, Number(sql[3]), Number(sql[4] ?? 0), Number(sql[5] ?? 0), Number(sql[6] ?? 0));
    const localized = value.replace(/\u00a0/g, ' ').match(/^([a-záéíóú]+)\.?\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+([ap])\.\s*m\.$/i);
    if (!localized) return null;
    const months: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sept: 8, oct: 9, nov: 10, dic: 11 };
    const month = months[localized[1].toLowerCase()];
    if (month === undefined) return null;
    let hour = Number(localized[4]);
    if (localized[7].toLowerCase() === 'p' && hour < 12) hour += 12;
    if (localized[7].toLowerCase() === 'a' && hour === 12) hour = 0;
    return new Date(Number(localized[3]), month, Number(localized[2]), hour, Number(localized[5]), Number(localized[6]));
};
const formatDateTime = (value?: string | null) => { if (!value) return '-'; if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(value)) return value; const date = parseServerDate(value); return date ? `${formatDateParts(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : value; };
const formatDate = (value?: string | null) => { if (!value) return '-'; if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value; const date = parseServerDate(value); return date ? formatDateParts(date) : value; };
const deliveryDateSeverity = (value?: string | null) => {
    if (!value) return 'secondary';
    const date = parseServerDate(value); if (!date) return 'secondary';
    const today = new Date(); today.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0);
    const days = Math.round((date.getTime() - today.getTime()) / 86400000);
    return days < 0 ? 'danger' : days <= deliverySettings.value.deliveryDeadlineShortDays ? 'warn' : 'success';
};
const formatCurrency = (value?: number | null) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0);
const formatQuantity = (value?: number | null) => new Intl.NumberFormat('de-DE', { maximumFractionDigits: 3 }).format(value ?? 0);
</script>

<style scoped>
.sales-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; background:#f7f8fa; min-height:calc(100dvh - 66px); box-sizing:border-box; padding:18px 16px 72px; display:flex; flex-direction:column; }
.page-header { position:relative; isolation:isolate; overflow:hidden; background:#fff; padding:15px 20px; border-radius:15px; border:1px solid #e3e8d2; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; gap:24px; box-shadow:0 6px 18px rgba(31,41,55,.055); }
.page-header::after { content:""; position:absolute; z-index:0; width:150px; height:150px; right:42px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.page-header > * { position:relative; z-index:1; }
.page-heading { display:flex; align-items:center; gap:14px; }.page-icon { display:grid; width:50px; height:50px; flex:0 0 auto; place-items:center; border-radius:13px; color:#fff; background:linear-gradient(135deg,#f3ae48,#dc7c22); box-shadow:0 7px 15px rgba(220,124,34,.22); }.page-icon i { font-size:1.3rem; }.breadcrumb { color:#8791a0; font-size:.8rem; font-weight:700; }.page-heading h1 { margin:3px 0 2px; color:#202939; font-size:1.38rem; }.page-heading p { margin:0; color:#7a8494; font-size:.92rem; }.header-actions { display:flex; align-items:center; gap:3px; }
.list-card { flex:0 0 auto; height:clamp(500px,calc(100dvh - 330px),700px); min-height:0; display:flex; flex-direction:column; background:#fff; padding:20px; border-radius:12px; border:1px solid #e5e7eb; }.orders-table { flex:1 1 auto; min-height:0; }.order-quick-filters{display:flex;align-items:center;gap:.55rem;flex-wrap:wrap}.state-quick-filter{width:310px}.pending-quick-filter{width:235px}.deadline-quick-filter{width:220px}.draft-code { display:inline-block; padding:.25rem .5rem; border-radius:5px; background:#fff3cd; color:#8a5a00; font-weight:700; border:1px solid #ffe08a; }.nowrap-cell { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.creator-cell { display:inline-flex; align-items:center; gap:.4rem; max-width:100%; overflow:hidden; text-overflow:ellipsis; color:#596554; font-weight:600; }.creator-cell i { display:grid; place-items:center; width:24px; height:24px; flex:0 0 24px; border-radius:50%; background:#eef6da; color:#66910f; font-size:.72rem; }.creator-cell span { overflow:hidden; text-overflow:ellipsis; }.list-progress { display:inline-flex; align-items:center; gap:.35rem; cursor:help; }.list-progress span { min-width:34px; min-height:30px; display:inline-flex; align-items:center; justify-content:center; gap:.2rem; padding:.3rem .34rem; border-radius:6px; font-weight:700; font-size:.83rem; }.list-progress span i { font-size:.8rem; }.list-progress .delivery { color:#2875b6; background:#e8f3ff; }.list-progress .invoice { color:#9253b5; background:#f5ebfb; }.list-progress .complete { color:#569419; background:#ebf8e5; }
.code-with-attachments { display:inline-flex; align-items:center; gap:.4rem; max-width:100%; }.code-with-attachments :deep(.p-tag) { flex:0 0 auto; font-size:.72rem; padding:.15rem .4rem; }
.notes-indicator { flex:0 0 auto; color:#7b8f22; font-size:.95rem; }
.order-state-line { display:flex; align-items:center; gap:.4rem; }.order-lock { color:#687386; font-size:.8rem; }
.list-card { height:clamp(500px,calc(100dvh - 270px),720px); overflow:hidden; padding:0; border-radius:14px; border-color:#dfe4ea; box-shadow:0 5px 18px rgba(30,41,59,.055); }
.list-toolbar { padding:13px 17px; border:0; border-bottom:1px solid #e8ecf0; border-radius:0; background:#fff; }.workspace-heading { display:flex; flex-direction:column; gap:3px; }.workspace-heading span { color:#344054; font-size:1rem; font-weight:800; }.workspace-heading small { color:#8a93a2; font-size:.82rem; }.list-toolbar :deep(.new-document) { border-color:var(--kiwi); background:var(--kiwi); color:#253000; }.list-toolbar :deep(.new-document:hover) { border-color:#8bad09; background:#8bad09; color:#253000; }.list-card :deep(.table-container) { border:0; border-radius:0; }
.module-actions { display:flex; align-items:center; justify-content:flex-end; flex-wrap:wrap; gap:.5rem; }
.creator-avatar { width:24px; height:24px; flex:0 0 24px; overflow:hidden; background:#eef6da; color:#66910f; font-size:.67rem; font-weight:700; }
.creator-avatar img { width:100%; height:100%; object-fit:cover; }
.creator-cell > span { overflow:hidden; text-overflow:ellipsis; }
.dialog-footer { width:100%; }.dialog-footer-actions { display:flex; justify-content:flex-end; padding-top:.7rem; }
.order-stats-card { margin:1.25rem 0 100px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }.stats-header { min-height:66px; display:flex; justify-content:space-between; align-items:center; padding:.85rem 1.1rem; border-bottom:1px solid #edf0e7; }.stats-header h6 { margin:0; font-size:1rem; color:#354000; }.stats-header h6 i { color:#84a800; margin-right:.45rem; }.stats-header span { display:block; margin-top:.25rem; font-size:.78rem; color:var(--text-color-secondary); }.statistics-year { width:105px; }.stats-body { padding:1rem 1.1rem 1.2rem; }.stats-loading { height:260px; display:flex; align-items:center; justify-content:center; color:var(--text-color-secondary); gap:.6rem; }.kpi-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.85rem; }.kpi-card { min-width:0; display:flex; gap:.75rem; align-items:center; padding:.9rem; border:1px solid #edf0e7; border-radius:10px; background:linear-gradient(135deg,#fff,#fbfdf5); }.kpi-icon { width:38px; height:38px; flex:0 0 38px; display:grid; place-items:center; border-radius:10px; }.kpi-icon.total { background:#eef6d5; color:#6f9410; }.kpi-icon.draft { background:#fff5d8; color:#d19315; }.kpi-icon.delivery { background:#e8f3ff; color:#2875b6; }.kpi-icon.invoice { background:#f5ebfb; color:#9253b5; }.kpi-icon.completed { background:#e4f5dd; color:#569419; }.kpi-card small,.kpi-card em { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.kpi-card small { color:var(--text-color-secondary); font-size:.75rem; }.kpi-card strong { display:block; color:#30352b; font-size:1.04rem; margin:.1rem 0; }.kpi-card em { color:#74806a; font-size:.72rem; font-style:normal; }.comparison-line { display:flex; align-items:center; gap:.45rem; padding:.85rem 0 .1rem; color:#617052; font-size:.82rem; }.comparison-line i { color:#6f9410; }.comparison-line b { color:#354000; }.comparison-line em { color:#579419; font-style:normal; font-weight:700; }.comparison-line em.negative { color:#d13d3d; }.charts-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(280px,1fr); gap:1rem; margin-top:.85rem; }.chart-card,.top-customers-card { border:1px solid #edf0e7; border-radius:10px; padding:.85rem 1rem; }.chart-card h6,.top-customers-card h6 { margin:0 0 .65rem; color:#455238; font-size:.88rem; }.chart-box { height:250px; }.chart-box.donut { max-width:350px; margin:auto; }.top-customers-card { margin-top:1rem; border-color:#dceab9; border-top:3px solid #84cc16; }.top-customers-card h6 i { color:#76ad16; margin-right:.4rem; }.ranking-row { display:flex; align-items:center; gap:.65rem; padding:.55rem 0; border-top:1px solid #eff2e8; }.ranking-position { width:22px; height:22px; flex:0 0 22px; display:grid; place-items:center; background:#eef6d5; border-radius:50%; color:#63880d; font-size:.72rem; font-weight:bold; }.ranking-customer { min-width:0; flex:1; }.ranking-customer b,.ranking-customer small { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.ranking-customer b { color:#3e4638; font-size:.8rem; }.ranking-customer small,.empty-ranking { color:var(--text-color-secondary); font-size:.71rem; margin-top:.12rem; }.ranking-row strong { color:#354000; font-size:.82rem; white-space:nowrap; }.empty-ranking { padding:.7rem 0; }
@media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media (max-width:900px) { .kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.charts-grid { grid-template-columns:1fr; } }
@media (max-width:900px) { .sales-page { padding:12px; }.page-header { padding:12px; }.list-card { height:560px; } }
.list-card :deep(.p-datatable-thead > tr > th),.list-card :deep(.p-datatable-tbody > tr > td) { font-size:.875rem; }
.stats-header span { font-size:.88rem; }.kpi-card small { font-size:.84rem; }.kpi-card em { font-size:.8rem; }.comparison-line { font-size:.92rem; }.chart-card h6,.top-customers-card h6 { font-size:.96rem; }.ranking-customer b { font-size:.9rem; }.ranking-customer small,.empty-ranking { font-size:.82rem; }.ranking-row strong { font-size:.9rem; }
@media (max-width:700px) { .page-header { align-items:flex-start; }.page-header::after { width:110px; height:110px; right:18px; opacity:.035; }.page-heading p { display:none; }.header-actions :deep(.p-button-label) { display:none; }.workspace-heading small { display:none; } }
</style>
