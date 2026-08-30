<template>
    <div class="sales-page">
        <header class="page-header">
            <div class="page-heading"><div class="page-icon"><i class="pi pi-file-edit"></i></div><div><span class="breadcrumb">Ventas / Operaciones</span><h1>Presupuestos</h1><p>Ofertas, borradores y presupuestos enviados a clientes.</p></div></div>
            <nav class="header-actions"><Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Ventas' })" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav>
        </header>

        <div class="card list-card">
            <Toolbar class="list-toolbar">
                <template #start><div class="workspace-heading"><span>Listado de presupuestos</span><small>Consulta, filtra y gestiona las ofertas comerciales.</small></div></template>
                <template #end><Button label="Nuevo presupuesto" icon="pi pi-plus" size="small" @click="quoteFormRef?.open(null)" /></template>
            </Toolbar>

            <GenericDataTable class="quote-table" ref="tableRef" dataKey="pkid" selectionMode="single" v-model:selection="selectedQuote"
                endpoint="WebGetSalesQuotes" :params="{ type: 'P', state: selectedState || undefined }" :showPaginator="true" :filterable="true" :showActions="true"
                @row-select="({ data }) => selectedQuote = data" @search="clearDateFilters">
                <template #panelOptions>
                    <div class="quick-filters">
                        <Select v-model="selectedState" :options="quoteStates" optionLabel="label" optionValue="value" showClear placeholder="Estado: Todos" class="state-quick-filter">
                            <template #value="{ value, placeholder }"><Tag v-if="value" :value="quoteStates.find(item => item.value === value)?.label ?? value" :severity="stateSeverity(value)" rounded /><span v-else>{{ placeholder }}</span></template>
                            <template #option="{ option }"><Tag :value="option.label" :severity="stateSeverity(option.value)" rounded /></template>
                        </Select>
                        <Select v-model="selectedExpirationFilter" :options="expirationQuickFilters" optionLabel="label" optionValue="value" showClear placeholder="Vencimiento: Todos" class="expiration-quick-filter">
                            <template #value="{ value, placeholder }"><span v-if="value"><i class="pi pi-calendar-clock mr-2 text-primary"></i>{{ expirationQuickFilters.find(item => item.value === value)?.label }}</span><span v-else>{{ placeholder }}</span></template>
                            <template #option="{ option }"><i class="pi pi-calendar-clock mr-2 text-primary"></i>{{ option.label }}</template>
                        </Select>
                    </div>
                </template>
                <template #headerActions>
                    <Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refreshTable" />
                    <Button icon="pi pi-ellipsis-v" text rounded @click="menuTable?.toggle($event)" />
                    <Menu ref="menuTable" :model="tableMenuItems" popup />
                </template>

                <Column field="code" sortField="salesOrdersDsCode" header="Código" sortable style="width:9%" bodyClass="nowrap-cell"><template #body="{ data }"><span class="code-with-attachments"><span :class="{ 'draft-code': isDraftEstimation(data.state) || data.code?.startsWith('DRAFT_') }">{{ data.code }}</span><Tag v-if="Number(data.attachmentCount || 0) > 0" :value="String(data.attachmentCount)" icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i v-if="data.hasNotes" class="pi pi-comment notes-indicator" title="Tiene observaciones"></i></span></template></Column>
                <Column field="entityName" sortField="entitie.entitieDsName" header="Cliente" sortable style="width: 16%" />
                <Column field="contact" sortField="salesOrdersDsContact" header="Contacto" sortable style="width: 10%" />
                <Column field="createDate" sortField="salesOrdersDtCreate" sortable style="width: 9%">
                    <template #header><div class="flex align-items-center justify-content-between w-full"><span><b>Fecha de creación</b></span><Button :severity="creationDateRange ? 'danger' : 'secondary'" icon="pi pi-filter" rounded size="small" @click.stop="creationDatePanel?.toggle($event)" /></div></template>
                    <template #body="{ data }">{{ formatDateTime(data.createDate) }}</template>
                </Column>
                <Column field="creatorName" header="Creado por" sortable style="width: 8%" bodyClass="nowrap-cell"><template #body="{ data }"><span class="creator-cell" :title="data.creatorName || data.creatorCode"><Avatar shape="circle" class="creator-avatar"><img v-if="data.creatorId && !creatorPhotoErrors[data.creatorId]" :src="getCreatorPhotoUrl(data.creatorId)" :alt="data.creatorName || data.creatorCode" @error="handleCreatorPhotoError(data.creatorId)" /><span v-else>{{ creatorInitials(data.creatorName || data.creatorCode) }}</span></Avatar><span>{{ data.creatorName || data.creatorCode || '-' }}</span></span></template></Column>
                <Column field="validityDate" sortField="salesOrdersDtValidity" sortable style="width: 10%">
                    <template #header><div class="flex align-items-center justify-content-between w-full"><span><b>Validez</b></span><Button :severity="validityDateRange ? 'danger' : 'secondary'" icon="pi pi-filter" rounded size="small" @click.stop="validityDatePanel?.toggle($event)" /></div></template>
                    <template #body="{ data }">{{ formatDate(data.validityDate) }}</template>
                </Column>
                <Column field="sendDate" sortField="salesOrdersDtDatesend" header="Fecha envío" sortable style="width: 10%">
                    <template #body="{ data }">{{ data.sendDate ? formatDateTime(data.sendDate) : '-' }}</template>
                </Column>
                <Column field="totalTotal" sortField="salesOrdersDbTotalTotal" header="Total" sortable style="width: 8%; text-align: right" bodyStyle="text-align: right">
                    <template #body="{ data }">{{ formatCurrency(data.totalTotal, data.currencyCode) }}</template>
                </Column>
                <Column field="state" sortField="salesOrdersDsState" header="Estado" sortable style="width: 10%">
                    <template #body="{ data }"><Tag :value="data.state" :severity="stateSeverity(data.state)" rounded /></template>
                </Column>
                <Column header="Acciones" style="width: 4%">
                    <template #body="{ data }"><Button icon="pi pi-ellipsis-v" text rounded @click="openQuoteMenu($event, data)" /></template>
                </Column>
            </GenericDataTable>
            <Menu ref="quoteMenu" :model="quoteMenuItems" popup />
        </div>

        <section class="quote-stats-card">
            <div class="stats-header"><div><h6><i class="pi pi-chart-line"></i> Resumen comercial de presupuestos</h6><span>Indicadores del año seleccionado</span></div><div class="flex align-items-center gap-2"><Select v-model="selectedStatisticsYear" :options="statisticsYears" class="statistics-year" /><Button :icon="statisticsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text rounded @click="statisticsExpanded = !statisticsExpanded" /></div></div>
            <div v-if="statisticsExpanded" class="stats-body">
                <div v-if="loadingStatistics" class="stats-loading"><i class="pi pi-spin pi-spinner"></i> Cargando indicadores...</div>
                <template v-else>
                    <div class="kpi-grid">
                        <div class="kpi-card"><span class="kpi-icon total"><i class="pi pi-file-edit"></i></span><div><small>Presupuestos</small><strong>{{ statistics.totalCount }}</strong><em>{{ formatCurrency(statistics.totalAmount) }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon approved"><i class="pi pi-check-circle"></i></span><div><small>Aprobados</small><strong>{{ statistics.approvedCount }}</strong><em>{{ formatCurrency(statistics.approvedAmount) }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon pending"><i class="pi pi-clock"></i></span><div><small>Pendientes</small><strong>{{ statistics.pendingCount }}</strong><em>{{ formatCurrency(statistics.pendingAmount) }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon rate"><i class="pi pi-percentage"></i></span><div><small>Tasa de aceptación</small><strong>{{ statistics.acceptanceRate }} %</strong><em>Sobre presupuestos creados</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon" :class="statistics.yearOverYearRate === null || statistics.yearOverYearRate >= 0 ? 'comparison-up' : 'comparison-down'"><i :class="statistics.yearOverYearRate === null || statistics.yearOverYearRate >= 0 ? 'pi pi-chart-line' : 'pi pi-arrow-down'"></i></span><div><small>Comparativa {{ selectedStatisticsYear - 1 }}</small><strong>{{ formatCurrency(statistics.previousYearAmount) }}</strong><em :class="{ 'negative-comparison': statistics.yearOverYearRate !== null && statistics.yearOverYearRate < 0 }">{{ statistics.yearOverYearRate === null ? 'Sin histórico comparable' : `${statistics.yearOverYearRate >= 0 ? '+' : ''}${statistics.yearOverYearRate} % vs. año anterior` }}</em></div></div>
                    </div>
                    <div class="charts-grid"><div class="chart-card"><h6>Evolución mensual</h6><div class="chart-box"><Chart type="bar" :data="monthlyChartData" :options="monthlyChartOptions" /></div></div><div class="chart-card"><h6>Distribución por estado</h6><div class="chart-box donut"><Chart type="doughnut" :data="stateChartData" :options="stateChartOptions" /></div></div></div>
                    <div class="top-clients-grid">
                        <div class="top-clients-card"><h6><i class="pi pi-trophy"></i> Top 5 clientes - Presupuestos aprobados</h6><div v-if="!statistics.topApprovedCustomers.length" class="empty-ranking">No hay presupuestos aprobados en {{ selectedStatisticsYear }}.</div><div v-else v-for="(customer, index) in statistics.topApprovedCustomers" :key="`approved-${customer.code}-${index}`" class="ranking-row"><span class="ranking-position">{{ index + 1 }}</span><div class="ranking-customer"><b>{{ customer.name }}</b><small>{{ customer.code || 'Sin código' }} · {{ customer.count }} presupuesto{{ customer.count === 1 ? '' : 's' }}</small></div><strong>{{ formatCurrency(customer.amount) }}</strong></div></div>
                        <div class="top-clients-card cancelled"><h6><i class="pi pi-ban"></i> Top 5 clientes - Presupuestos cancelados</h6><div v-if="!statistics.topCancelledCustomers.length" class="empty-ranking">No hay presupuestos cancelados en {{ selectedStatisticsYear }}.</div><div v-else v-for="(customer, index) in statistics.topCancelledCustomers" :key="`cancelled-${customer.code}-${index}`" class="ranking-row"><span class="ranking-position">{{ index + 1 }}</span><div class="ranking-customer"><b>{{ customer.name }}</b><small>{{ customer.code || 'Sin código' }} · {{ customer.count }} presupuesto{{ customer.count === 1 ? '' : 's' }}</small></div><strong>{{ formatCurrency(customer.amount) }}</strong></div></div>
                    </div>
                </template>
            </div>
        </section>

        <Frm_PresupuestoForm ref="quoteFormRef" @saved="onQuoteSaved" />
        <Dialog v-model:visible="showSendDialog" modal header="Enviar presupuesto por correo" :style="{ width: '34rem' }" :closable="!sendingQuote">
            <div class="send-dialog-intro"><i class="pi pi-send"></i><span>Selecciona el contacto que recibirá el presupuesto <b>{{ selectedQuote?.code }}</b>.</span></div>
            <div v-if="loadingRecipients" class="flex justify-content-center py-5"><i class="pi pi-spin pi-spinner text-primary text-2xl"></i></div>
            <Message v-else-if="!emailRecipients.length" severity="warn" :closable="false">Este cliente no tiene contactos activos con una dirección de correo válida.</Message>
            <div v-else class="recipient-list">
                <label v-for="contact in emailRecipients" :key="contact.pkid" class="recipient-item" :class="{ selected: selectedRecipientId === contact.pkid }">
                    <RadioButton v-model="selectedRecipientId" name="quoteRecipient" :value="contact.pkid" />
                    <span class="recipient-data"><b>{{ contact.name }}</b><small>{{ contact.email }}</small></span>
                    <Tag v-if="contact.defaultContact" value="Principal" severity="success" rounded />
                </label>
            </div>
            <template #footer>
                <Button label="Cancelar" severity="secondary" text :disabled="sendingQuote" @click="showSendDialog = false" />
                <Button label="Enviar presupuesto" icon="pi pi-send" :loading="sendingQuote" :disabled="!selectedRecipientId || !emailRecipients.length" @click="sendQuoteByEmail" />
            </template>
        </Dialog>
        <ConfirmDialog />
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="tableRef?.refresh()" />
        <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_SALESPRESU_DOCUMENTS"
            :title="`Documentos indexados al presupuesto ${selectedQuote?.code ?? ''}`" :entityId="selectedQuote?.pkid" @update:visible="onAttachmentsVisible" />
        <OverlayPanel ref="creationDatePanel" appendTo="body"><DateRangePicker v-model="creationDateRange" /></OverlayPanel>
        <OverlayPanel ref="validityDatePanel" appendTo="body"><DateRangePicker v-model="validityDateRange" /></OverlayPanel>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Column from 'primevue/column';
import Menu from 'primevue/menu';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import OverlayPanel from 'primevue/overlaypanel';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import Chart from 'primevue/chart';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import DateRangePicker from '@/components/shared/DateRangePicker.vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import DialogNotes from '@/components/dialogs/DialogNotes.vue';
import Frm_PresupuestoForm from './Frm_PresupuestoForm.vue';

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const tableRef = ref();
const quoteFormRef = ref();
const menuTable = ref();
const quoteMenu = ref();
const selectedQuote = ref<any>(null);
const showAttachments = ref(false);
const showNotes = ref(false);
const showSendDialog = ref(false);
const loadingRecipients = ref(false);
const sendingQuote = ref(false);
const emailRecipients = ref<Array<{ pkid: number; name: string; email: string; defaultContact: boolean }>>([]);
const selectedRecipientId = ref<number | null>(null);
const creationDatePanel = ref();
const validityDatePanel = ref();
const creationDateRange = ref<[Date | null, Date | null] | null>(null);
const validityDateRange = ref<[Date | null, Date | null] | null>(null);
const selectedState = ref<string | null>(null);
const selectedExpirationFilter = ref<string | null>(null);
const creatorPhotoErrors = ref<Record<number, boolean>>({});
const selectedStatisticsYear = ref(new Date().getFullYear());
const statisticsExpanded = ref(true);
const loadingStatistics = ref(false);
const statisticsYears = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index);
const statistics = ref({ totalCount: 0, totalAmount: 0, approvedCount: 0, approvedAmount: 0, pendingCount: 0, pendingAmount: 0, acceptanceRate: 0, previousYearAmount: 0, previousYearCount: 0, yearOverYearRate: null as number | null, topApprovedCustomers: [] as Array<{ name: string; code: string; count: number; amount: number }>, topCancelledCustomers: [] as Array<{ name: string; code: string; count: number; amount: number }>, stateCounts: {} as Record<string, number>, months: [] as string[], monthlyTotal: [] as number[], monthlyApproved: [] as number[] });
const quoteStates = [
    { label: 'Pendientes de enviar', value: 'Para Aprobar / To Approved Estimation' },
    { label: 'Enviado / Sended', value: 'Enviado / Sended' },
    { label: 'Cancelado / Canceled', value: 'Cancelado / Canceled' },
    { label: 'Aprobado / Approved', value: 'Aprobado / Approved' },
];
const expirationQuickFilters = [
    { label: 'Vencen hoy', value: 'today' },
    { label: 'Próximos 7 días', value: 'next7days' },
    { label: 'Vencidos', value: 'expired' }
];

const tableMenuItems = [
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value?.exportToExcel() }
];
const isDraftQuote = (quote: any) => quote?.state === 'Para Aprobar / To Approved Estimation';
const getCreatorPhotoUrl = (userId: number) => `${import.meta.env.VITE_API_URL.replace('/api', '')}/gestdoc/users/${userId}/photoPerfil.jpg`;
const handleCreatorPhotoError = (userId: number) => { creatorPhotoErrors.value[userId] = true; };
const creatorInitials = (creator?: string) => (creator || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('');
const stateLabels: Record<string, string> = { 'Para Aprobar / To Approved Estimation': 'Pendientes', 'Enviado / Sended': 'Enviados', 'Aprobado / Approved': 'Aprobados', 'Cancelado / Canceled': 'Cancelados' };
const stateChartData = computed(() => ({ labels: Object.keys(statistics.value.stateCounts).map(state => stateLabels[state] ?? state), datasets: [{ data: Object.values(statistics.value.stateCounts), backgroundColor: ['#f4c542', '#3b82f6', '#84cc16', '#ef4444'], borderColor: '#fff', borderWidth: 3 }] }));
const monthlyChartData = computed(() => ({ labels: statistics.value.months, datasets: [{ label: 'Importe presupuestado', data: statistics.value.monthlyTotal, backgroundColor: '#d9ef9c', borderColor: '#b1d70e', borderWidth: 1, borderRadius: 4 }, { label: 'Importe aprobado', data: statistics.value.monthlyApproved, backgroundColor: '#84cc16', borderColor: '#65a30d', borderWidth: 1, borderRadius: 4 }] }));
const monthlyChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { boxWidth: 11, usePointStyle: true } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (value: number) => `${new Intl.NumberFormat('de-DE', { notation: 'compact', maximumFractionDigits: 1 }).format(value)} €` } } } };
const stateChartOptions = { responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 11, padding: 14 } } } };
const isSentQuote = (quote: any) => quote?.state === 'Enviado / Sended';
const isPendingQuote = (quote: any) => isDraftQuote(quote) || isSentQuote(quote);
const isCancelledQuote = (quote: any) => quote?.state === 'Cancelado / Canceled';
const quoteMenuItems = computed(() => {
    const items: any[] = [{ label: 'Abrir presupuesto', icon: 'pi pi-pencil', command: () => quoteFormRef.value?.open(selectedQuote.value?.pkid) }, { label: 'Ver / imprimir PDF', icon: 'pi pi-file-pdf', command: () => openQuotePdf() }];
    if (isDraftQuote(selectedQuote.value)) {
        items.push({ separator: true });
        items.push({ label: 'Regenerar PDF', icon: 'pi pi-refresh', command: () => openQuotePdf(true) });
    }
    if (isPendingQuote(selectedQuote.value)) {
        if (selectedQuote.value?.entityId) items.push({ label: isSentQuote(selectedQuote.value) ? 'Reenviar presupuesto por correo' : 'Enviar presupuesto por correo', icon: 'pi pi-send', command: openSendDialog });
        items.push({ label: 'Aceptar presupuesto', icon: 'pi pi-check', command: () => requestQuoteAction('accept') });
        items.push({ label: 'Cancelar presupuesto', icon: 'pi pi-times', class: 'p-menuitem-danger', command: () => requestQuoteAction('cancel') });
    }
    if (isCancelledQuote(selectedQuote.value)) items.push({ label: 'Reabrir presupuesto', icon: 'pi pi-undo', command: () => requestQuoteAction('reopen') });
    items.push({ separator: true });
    items.push({ label: 'Notas', icon: 'pi pi-comments', command: () => { noteRequest.id = selectedQuote.value?.pkid ?? -1; showNotes.value = true; } });
    items.push({ label: 'Documentos', icon: 'pi pi-paperclip', command: () => { showAttachments.value = true; } });
    return items;
});
const noteRequest = { table: 'SALES_ORDERS', pkField: 'SALES_ORDERS_PK_ID', field: 'SALES_ORDERS_DS_NOTES', id: -1 };
const openQuoteMenu = (event: Event, quote: any) => {
    selectedQuote.value = quote;
    quoteMenu.value?.toggle(event);
};
const onAttachmentsVisible = (value: boolean) => { showAttachments.value = value; if (!value) tableRef.value?.refresh(); };
const openQuotePdf = (regenerate = false) => {
    if (!selectedQuote.value?.pkid) return;
    const query = regenerate ? '?regenerate=true' : '';
    window.open(`${import.meta.env.VITE_API_URL}/WebGetSalesQuotePdf/${selectedQuote.value.pkid}${query}`, '_blank', 'noopener');
};
const loadQuoteStatistics = async () => {
    loadingStatistics.value = true;
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteStatistics`, { params: { year: selectedStatisticsYear.value } });
        statistics.value = { ...statistics.value, ...data };
    } catch {
        toast.add({ severity: 'error', summary: 'No se pudieron cargar las estadísticas', life: 3000 });
    } finally {
        loadingStatistics.value = false;
    }
};
const refreshTable = async () => {
    await tableRef.value?.refresh();
    await loadQuoteStatistics();
};
const onQuoteSaved = () => { tableRef.value?.refresh(); loadQuoteStatistics(); };
const openSendDialog = async () => {
    if (!selectedQuote.value?.pkid) return;
    emailRecipients.value = [];
    selectedRecipientId.value = null;
    loadingRecipients.value = true;
    showSendDialog.value = true;
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteEmailContacts/${selectedQuote.value.pkid}`);
        emailRecipients.value = data ?? [];
        selectedRecipientId.value = emailRecipients.value.find(contact => contact.defaultContact)?.pkid ?? emailRecipients.value[0]?.pkid ?? null;
    } catch (error: any) {
        showSendDialog.value = false;
        toast.add({ severity: 'error', summary: 'No se pueden cargar los contactos', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 4000 });
    } finally {
        loadingRecipients.value = false;
    }
};
const sendQuoteByEmail = async () => {
    if (!selectedQuote.value?.pkid || !selectedRecipientId.value) return;
    sendingQuote.value = true;
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/WebSendSalesQuote/${selectedQuote.value.pkid}`, null, { params: { contactId: selectedRecipientId.value } });
        showSendDialog.value = false;
        toast.add({ severity: 'success', summary: 'Presupuesto enviado', detail: 'El PDF se ha enviado al contacto seleccionado.', life: 4000 });
        selectedQuote.value = null;
        tableRef.value?.refresh();
        loadQuoteStatistics();
    } catch (error: any) {
        toast.add({ severity: 'error', summary: 'No se pudo enviar el presupuesto', detail: error.response?.data ?? 'Revisa la configuración de correo.', life: 5000 });
    } finally {
        sendingQuote.value = false;
    }
};
const requestQuoteAction = (action: 'accept' | 'cancel' | 'reopen') => {
    const accepting = action === 'accept';
    const reopening = action === 'reopen';
    confirm.require({
        header: accepting ? 'Aceptar presupuesto' : reopening ? 'Reabrir presupuesto' : 'Cancelar presupuesto',
        message: accepting ? 'Se aprobará el presupuesto, quedará bloqueado y se creará un pedido de venta en borrador.' : reopening ? 'El presupuesto volverá a estar pendiente de aprobación y podrá modificarse.' : 'El presupuesto quedará cancelado y bloqueado. Esta acción no se puede deshacer.',
        icon: accepting ? 'pi pi-check-circle' : reopening ? 'pi pi-undo' : 'pi pi-exclamation-triangle',
        acceptClass: accepting || reopening ? '' : 'p-button-danger',
        acceptLabel: accepting ? 'Aceptar presupuesto' : reopening ? 'Reabrir presupuesto' : 'Cancelar presupuesto',
        rejectLabel: 'Volver',
        accept: async () => {
            try {
                const endpoint = accepting ? 'WebAcceptSalesQuote' : reopening ? 'WebReopenSalesQuote' : 'WebCancelSalesQuote';
                const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/${endpoint}/${selectedQuote.value.pkid}`);
                const detail = accepting ? `Pedido ${data.salesOrder?.code ?? ''} creado en borrador.` : reopening ? 'Presupuesto reabierto para su revisión.' : 'Presupuesto cancelado y bloqueado.';
                toast.add({ severity: 'success', summary: accepting ? 'Presupuesto aceptado' : reopening ? 'Presupuesto reabierto' : 'Presupuesto cancelado', detail, life: 4000 });
                selectedQuote.value = null;
                tableRef.value?.refresh();
                loadQuoteStatistics();
            } catch (error: any) {
                toast.add({ severity: 'error', summary: 'No se pudo completar la acción', detail: error.response?.data ?? 'Inténtalo de nuevo.', life: 4000 });
            }
        }
    });
};
const clearDateFilters = () => {
    creationDateRange.value = null;
    validityDateRange.value = null;
};
const applyDateFilters = () => {
    const filters: string[] = [];
    if (creationDateRange.value?.[0] && creationDateRange.value?.[1]) {
        filters.push(`[dateCreate],[${creationDateRange.value[0].toISOString()}],[${creationDateRange.value[1].toISOString()}]`);
    }
    const expirationRange = quickExpirationRange();
    if (expirationRange) {
        filters.push(`[dateValidity],[${expirationRange.start.toISOString()}],[${expirationRange.end.toISOString()}]`);
    } else if (validityDateRange.value?.[0] && validityDateRange.value?.[1]) {
        filters.push(`[dateValidity],[${validityDateRange.value[0].toISOString()}],[${validityDateRange.value[1].toISOString()}]`);
    }
    // Pasamos el estado explícitamente: el watcher puede ejecutarse antes de que
    // el hijo reciba las nuevas props y, de lo contrario, usaría el estado anterior.
    tableRef.value?.refreshWithQuery(filters.join(';'), { state: selectedState.value || undefined });
};
const quickExpirationRange = (): { start: Date; end: Date } | null => {
    if (!selectedExpirationFilter.value) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    if (selectedExpirationFilter.value === 'today') return { start: today, end: tomorrow };
    if (selectedExpirationFilter.value === 'next7days') { const end = new Date(today); end.setDate(end.getDate() + 8); return { start: today, end }; }
    if (selectedExpirationFilter.value === 'expired') return { start: new Date(2000, 0, 1), end: today };
    return null;
};
watch([creationDateRange, validityDateRange, selectedState, selectedExpirationFilter], applyDateFilters);
watch(selectedStatisticsYear, loadQuoteStatistics);
onMounted(loadQuoteStatistics);
const formatDate = (value?: string | null) => {
    if (!value) return '-';
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const date = parseServerDate(value);
    return date ? formatDateParts(date) : value;
};
const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
    const date = parseServerDate(value);
    return date ? `${formatDateParts(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` : value;
};
const pad = (value: number) => String(value).padStart(2, '0');
const formatDateParts = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
const parseServerDate = (value: string): Date | null => {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;

    const match = value.replace(/\u00a0/g, ' ').match(/^([a-záéíóú]+)\.?\s+(\d{1,2}),\s+(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+([ap])\.\s*m\.$/i);
    if (!match) return null;

    const months: Record<string, number> = { ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5, jul: 6, ago: 7, sept: 8, oct: 9, nov: 10, dic: 11 };
    const month = months[match[1].toLowerCase()];
    if (month === undefined) return null;
    let hour = Number(match[4]);
    if (match[7].toLowerCase() === 'p' && hour < 12) hour += 12;
    if (match[7].toLowerCase() === 'a' && hour === 12) hour = 0;
    return new Date(Number(match[3]), month, Number(match[2]), hour, Number(match[5]), Number(match[6]));
};
const formatCurrency = (value?: number | null, currency = 'EUR') => new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
}).format(value ?? 0);
const isDraftEstimation = (state?: string) => state === 'Para Aprobar / To Approved Estimation';
const stateSeverity = (state = '') => {
    if (state.includes('Cancel')) return 'danger';
    if (state.includes('Borrador') || state.includes('Draft')) return 'secondary';
    if (state.includes('Enviado')) return 'info';
    if (state.includes('Aprobado') || state.includes('Aceptado') || state.includes('Facturado')) return 'success';
    if (state.includes('Realizado')) return 'contrast';
    if (state.includes('A Facturar') || state.includes('Facturando')) return 'info';
    return 'warn';
};
</script>

<style scoped>
.sales-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; background:#f7f8fa; height:auto; min-height:calc(100dvh - 66px); box-sizing:border-box; padding:18px 16px 72px; display:flex; flex-direction:column; overflow:visible; }
.page-header { position:relative; isolation:isolate; overflow:hidden; background:#fff; padding:15px 20px; border-radius:15px; border:1px solid #e3e8d2; margin-bottom:18px; display:flex; align-items:center; justify-content:space-between; gap:24px; box-shadow:0 6px 18px rgba(31,41,55,.055); }
.page-header::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.page-header > * { position:relative; z-index:1; }
.page-heading { display:flex; align-items:center; gap:14px; }.page-icon { display:grid; width:50px; height:50px; flex:0 0 auto; place-items:center; border-radius:13px; color:#fff; background:linear-gradient(135deg,#8d78dc,#6250ad); box-shadow:0 7px 15px rgba(98,80,173,.22); }.page-icon i { font-size:1.3rem; }.breadcrumb { color:#8791a0; font-size:.8rem; font-weight:700; }.page-heading h1 { margin:3px 0 2px; color:#202939; font-size:1.38rem; }.page-heading p { margin:0; color:#7a8494; font-size:.92rem; }.header-actions { display:flex; align-items:center; gap:3px; }
.list-card { flex:0 0 auto; height:clamp(500px,calc(100dvh - 270px),720px); min-height:0; display:flex; flex-direction:column; overflow:hidden; background:#fff; padding:0; border-radius:14px; border:1px solid #dfe4ea; box-shadow:0 5px 18px rgba(30,41,59,.055); }
.list-toolbar { padding:13px 17px; border:0; border-bottom:1px solid #e8ecf0; border-radius:0; background:#fff; }.workspace-heading { display:flex; flex-direction:column; gap:3px; }.workspace-heading span { color:#344054; font-size:1rem; font-weight:800; }.workspace-heading small { color:#8a93a2; font-size:.82rem; }.list-toolbar :deep(.p-button) { border-color:var(--kiwi-dark); background:var(--kiwi-dark); }.list-toolbar :deep(.p-button:hover) { border-color:#526f04; background:#526f04; }.list-card :deep(.table-container) { border:0; border-radius:0; }
.quote-table { flex: 1 1 auto; min-height: 0; }
.quick-filters { display:flex; align-items:center; gap:.65rem; }.state-quick-filter { width: 340px; }.expiration-quick-filter { width: 205px; }
.draft-code { display: inline-block; padding: .25rem .5rem; border-radius: 5px; background: #fff3cd; color: #8a5a00; font-weight: 700; border: 1px solid #ffe08a; }
.nowrap-cell { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.code-with-attachments { display:inline-flex; align-items:center; gap:.4rem; max-width:100%; }
.code-with-attachments :deep(.p-tag) { flex:0 0 auto; font-size:.72rem; padding:.15rem .4rem; }
.notes-indicator { flex:0 0 auto; color:#7b8f22; font-size:.95rem; }
.creator-cell { display:inline-flex; align-items:center; gap:.4rem; max-width:100%; overflow:hidden; text-overflow:ellipsis; color:#596554; font-weight:600; }
.creator-avatar { width:24px; height:24px; flex:0 0 24px; overflow:hidden; background:#eef6da; color:#66910f; font-size:.67rem; font-weight:700; }
.creator-avatar img { width:100%; height:100%; object-fit:cover; }
.creator-cell > span { overflow:hidden; text-overflow:ellipsis; }
.quote-stats-card { margin:1.25rem 0 100px; background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.04); }.stats-header { min-height:66px; display:flex; justify-content:space-between; align-items:center; padding:.85rem 1.1rem; border-bottom:1px solid #edf0e7; }.stats-header h6 { margin:0; font-size:1rem; color:#354000; }.stats-header h6 i { color:#84a800; margin-right:.45rem; }.stats-header span { display:block; margin-top:.25rem; font-size:.78rem; color:var(--text-color-secondary); }.statistics-year { width:105px; }.stats-body { padding:1rem 1.1rem 1.2rem; }.stats-loading { height:260px; display:flex; align-items:center; justify-content:center; color:var(--text-color-secondary); gap:.6rem; }.kpi-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:.85rem; }.kpi-card { min-width:0; display:flex; gap:.75rem; align-items:center; padding:.9rem; border:1px solid #edf0e7; border-radius:10px; background:linear-gradient(135deg,#fff,#fbfdf5); }.kpi-icon { width:38px; height:38px; flex:0 0 38px; display:grid; place-items:center; border-radius:10px; }.kpi-icon.total { background:#eef6d5; color:#6f9410; }.kpi-icon.approved,.comparison-up { background:#e6f8e7; color:#22a25a; }.kpi-icon.pending { background:#fff5d8; color:#d19315; }.kpi-icon.rate { background:#e7f0ff; color:#3478d5; }.comparison-down { background:#feeaea; color:#dc4545; }.kpi-card small,.kpi-card em { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.kpi-card small { color:var(--text-color-secondary); font-size:.75rem; }.kpi-card strong { display:block; color:#30352b; font-size:1.1rem; margin:.1rem 0; }.kpi-card em { color:#74806a; font-size:.72rem; font-style:normal; }.kpi-card em.negative-comparison { color:#d13d3d; }.charts-grid { display:grid; grid-template-columns:minmax(0,2fr) minmax(280px,1fr); gap:1rem; margin-top:1rem; }.chart-card { border:1px solid #edf0e7; border-radius:10px; padding:.85rem 1rem; }.chart-card h6 { margin:0 0 .65rem; color:#455238; font-size:.88rem; }.chart-box { height:250px; }.chart-box.donut { max-width:350px; margin:auto; } @media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } } @media (max-width:900px) { .kpi-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }.charts-grid { grid-template-columns:1fr; }.list-card { height:560px; } } @media (max-width:560px) { .sales-page { padding:12px; }.page-header { padding:12px; }.kpi-grid { grid-template-columns:1fr; }.stats-header { align-items:flex-start; }.chart-box { height:220px; } }
.top-clients-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1rem; margin-top:1rem; }.top-clients-card { border:1px solid #dceab9; border-top:3px solid #84cc16; border-radius:10px; padding:.9rem 1rem; }.top-clients-card.cancelled { border-color:#f3d0d0; border-top-color:#ef4444; }.top-clients-card h6 { margin:0 0 .6rem; font-size:.88rem; color:#4c6530; }.top-clients-card h6 i { color:#76ad16; margin-right:.4rem; }.top-clients-card.cancelled h6 { color:#8f3d3d; }.top-clients-card.cancelled h6 i { color:#df4b4b; }.ranking-row { display:flex; align-items:center; gap:.65rem; padding:.55rem 0; border-top:1px solid #eff2e8; }.ranking-position { width:22px; height:22px; flex:0 0 22px; display:grid; place-items:center; background:#eef6d5; border-radius:50%; color:#63880d; font-size:.72rem; font-weight:bold; }.cancelled .ranking-position { background:#fff0f0; color:#ce4141; }.ranking-customer { min-width:0; flex:1; }.ranking-customer b,.ranking-customer small { display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }.ranking-customer b { color:#3e4638; font-size:.8rem; }.ranking-customer small { color:var(--text-color-secondary); font-size:.71rem; margin-top:.12rem; }.ranking-row strong { color:#354000; font-size:.82rem; white-space:nowrap; }.cancelled .ranking-row strong { color:#ba3d3d; }.empty-ranking { color:var(--text-color-secondary); font-size:.8rem; padding:.7rem 0; } @media (max-width:900px) { .top-clients-grid { grid-template-columns:1fr; } }
.send-dialog-intro { display: flex; align-items: flex-start; gap: .7rem; color: var(--text-color-secondary); margin-bottom: 1rem; line-height: 1.4; }.send-dialog-intro i { color: var(--primary-color); margin-top: .15rem; }.recipient-list { border: 1px solid var(--surface-200); border-radius: 8px; overflow: hidden; }.recipient-item { display: flex; align-items: center; gap: .75rem; padding: .8rem .9rem; cursor: pointer; border-bottom: 1px solid var(--surface-200); }.recipient-item:last-child { border-bottom: 0; }.recipient-item.selected { background: var(--primary-50); }.recipient-data { display: flex; flex: 1; flex-direction: column; min-width: 0; }.recipient-data small { color: var(--text-color-secondary); margin-top: .15rem; }
.list-card :deep(.p-datatable-thead > tr > th),.list-card :deep(.p-datatable-tbody > tr > td) { font-size:.875rem; }
.stats-header span { font-size:.88rem; }.kpi-card small { font-size:.84rem; }.kpi-card em { font-size:.8rem; }.chart-card h6,.top-clients-card h6 { font-size:.96rem; }.ranking-customer b { font-size:.9rem; }.ranking-customer small { font-size:.82rem; }.ranking-row strong,.empty-ranking { font-size:.9rem; }
@media (max-width:700px) { .page-header { align-items:flex-start; }.page-heading p { display:none; }.header-actions :deep(.p-button-label) { display:none; }.workspace-heading small { display:none; } }
</style>
