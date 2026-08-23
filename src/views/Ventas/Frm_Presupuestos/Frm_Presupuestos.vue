<template>
    <div class="sales-page">
        <div class="page-header">
            <div>
                <h5 class="page-title"><i class="pi pi-file-edit"></i> Presupuestos</h5>
                <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
                    Gestión de ofertas, borradores y presupuestos enviados a clientes.
                </Message>
            </div>
            <div class="flex align-items-center gap-2">
                <Button label="Volver" icon="pi pi-arrow-left" severity="secondary" text @click="router.push({ name: 'Ventas' })" />
                <div class="header-divider"></div>
                <Button label="Inicio" icon="pi pi-home" severity="info" outlined @click="router.push({ name: 'Dashboard' })" />
            </div>
        </div>

        <div class="card list-card">
            <Toolbar class="mb-3">
                <template #start>
                    <Button label="Nuevo presupuesto" icon="pi pi-plus" size="small" variant="text" outlined @click="quoteFormRef?.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable ref="tableRef" dataKey="pkid" selectionMode="single" v-model:selection="selectedQuote"
                endpoint="WebGetSalesQuotes" :params="{ type: 'P' }" :showPaginator="true" :filterable="true" :showActions="true"
                @row-select="({ data }) => selectedQuote = data" @search="clearDateFilters">
                <template #headerActions>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="menuTable?.toggle($event)" />
                    <Menu ref="menuTable" :model="tableMenuItems" popup />
                </template>

                <Column field="code" sortField="salesOrdersDsCode" header="Código" sortable style="width: 16%" />
                <Column field="entityName" sortField="entitie.entitieDsName" header="Cliente" sortable style="width: 28%" />
                <Column field="createDate" sortField="salesOrdersDtCreate" sortable style="width: 12%">
                    <template #header><div class="flex align-items-center justify-content-between w-full"><span><b>Fecha de creación</b></span><Button :severity="creationDateRange ? 'danger' : 'secondary'" icon="pi pi-filter" rounded size="small" @click.stop="creationDatePanel?.toggle($event)" /></div></template>
                    <template #body="{ data }">{{ formatDateTime(data.createDate) }}</template>
                </Column>
                <Column field="validityDate" sortField="salesOrdersDtValidity" sortable style="width: 12%">
                    <template #header><div class="flex align-items-center justify-content-between w-full"><span><b>Validez</b></span><Button :severity="validityDateRange ? 'danger' : 'secondary'" icon="pi pi-filter" rounded size="small" @click.stop="validityDatePanel?.toggle($event)" /></div></template>
                    <template #body="{ data }">{{ formatDate(data.validityDate) }}</template>
                </Column>
                <Column field="totalTotal" sortField="salesOrdersDbTotalTotal" header="Total" sortable style="width: 12%">
                    <template #body="{ data }">{{ formatCurrency(data.totalTotal) }}</template>
                </Column>
                <Column field="state" sortField="salesOrdersDsState" header="Estado" sortable style="width: 15%">
                    <template #body="{ data }"><Tag :value="data.state" :severity="stateSeverity(data.state)" rounded /></template>
                </Column>
                <Column header="Acciones" style="width: 5%">
                    <template #body="{ data }"><Button icon="pi pi-ellipsis-v" text rounded @click="openQuoteMenu($event, data)" /></template>
                </Column>
            </GenericDataTable>
            <Menu ref="quoteMenu" :model="quoteMenuItems" popup />
        </div>

        <Frm_PresupuestoForm ref="quoteFormRef" @saved="tableRef?.refresh()" />
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="tableRef?.refresh()" />
        <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_SALESPRESU_DOCUMENTS"
            :title="`Documentos indexados al presupuesto ${selectedQuote?.code ?? ''}`" :entityId="selectedQuote?.pkid" />
        <OverlayPanel ref="creationDatePanel" appendTo="body"><DateRangePicker v-model="creationDateRange" /></OverlayPanel>
        <OverlayPanel ref="validityDatePanel" appendTo="body"><DateRangePicker v-model="validityDateRange" /></OverlayPanel>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import Menu from 'primevue/menu';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import Toolbar from 'primevue/toolbar';
import OverlayPanel from 'primevue/overlaypanel';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import DateRangePicker from '@/components/shared/DateRangePicker.vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import DialogNotes from '@/components/dialogs/DialogNotes.vue';
import Frm_PresupuestoForm from './Frm_PresupuestoForm.vue';

const router = useRouter();
const tableRef = ref();
const quoteFormRef = ref();
const menuTable = ref();
const quoteMenu = ref();
const selectedQuote = ref<any>(null);
const showAttachments = ref(false);
const showNotes = ref(false);
const creationDatePanel = ref();
const validityDatePanel = ref();
const creationDateRange = ref<[Date | null, Date | null] | null>(null);
const validityDateRange = ref<[Date | null, Date | null] | null>(null);

const tableMenuItems = [
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => tableRef.value?.refresh() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value?.exportToExcel() }
];
const quoteMenuItems = computed(() => [
    { label: 'Abrir presupuesto', icon: 'pi pi-pencil', command: () => quoteFormRef.value?.open(selectedQuote.value?.pkid) },
    { separator: true },
    { label: 'Notas', icon: 'pi pi-comments', command: () => { noteRequest.id = selectedQuote.value?.pkid ?? -1; showNotes.value = true; } },
    { label: 'Documentos', icon: 'pi pi-paperclip', command: () => { showAttachments.value = true; } }
]);
const noteRequest = { table: 'SALES_ORDERS', pkField: 'SALES_ORDERS_PK_ID', field: 'SALES_ORDERS_DS_NOTES', id: -1 };
const openQuoteMenu = (event: Event, quote: any) => {
    selectedQuote.value = quote;
    quoteMenu.value?.toggle(event);
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
    if (validityDateRange.value?.[0] && validityDateRange.value?.[1]) {
        filters.push(`[dateValidity],[${validityDateRange.value[0].toISOString()}],[${validityDateRange.value[1].toISOString()}]`);
    }
    tableRef.value?.refreshWithQuery(filters.join(';'));
};
watch([creationDateRange, validityDateRange], applyDateFilters);
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
const formatCurrency = (value?: number | null) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value ?? 0);
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
.sales-page { background: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px; }
.page-header { background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
.page-title { color: var(--primary-color); margin: 0; font-weight: 700; font-size: 1.25rem; display: flex; align-items: center; gap: .5rem; }
.header-divider { width: 1px; height: 20px; background-color: #e5e7eb; margin: 0 5px; }
.list-card { height: 650px; display: flex; flex-direction: column; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
</style>
