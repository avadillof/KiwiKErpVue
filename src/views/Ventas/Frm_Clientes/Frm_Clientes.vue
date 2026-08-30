<template>
    <main class="entities-page">
        <header class="entities-header">
            <div class="entities-title">
                <div class="entities-icon"><i class="pi pi-users"></i></div>
                <div>
                    <span class="breadcrumb">Ventas / Datos maestros</span>
                    <h1>Entidades</h1>
                    <p>Clientes, proveedores, fabricantes y sus contactos en un directorio común.</p>
                </div>
            </div>

            <nav class="header-actions" aria-label="Navegación">
                <Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text
                    @click="router.push({ name: 'Ventas' })" />
                <Button label="Inicio" icon="pi pi-home" severity="secondary" text
                    @click="router.push({ name: 'Dashboard' })" />
            </nav>
        </header>

        <section class="entities-workspace">
            <Toolbar class="entities-toolbar">
                <template #start>
                    <div class="workspace-heading">
                        <span>Directorio de entidades</span>
                        <small>Selecciona una fila para consultar o gestionar su información.</small>
                    </div>
                </template>
                <template #end>
                    <Button v-if="securityStore.hasPermission('ENTI_GEN_0001')" label="Nueva entidad" icon="pi pi-plus"
                        size="small" @click="clientFormRef.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable class="entities-table" ref="tableRef" dataKey="pkid" selectionMode="single"
                v-model:selection="clientSelected" :endpoint="apiUrl" :showPaginator="true" :filterable="true"
                @row-select="handleRowSelect" @search="handledAfterSearch" :showActions="true">
                <template #headerActions>
                    <Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refreshTable" />
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>

                <Column field="code" sortField="entitieDsCode" header="Código" sortable style="width: 18%">
                    <template #body="{ data }"><span class="code-with-attachments"><span class="entity-code">{{ data.code }}</span><Tag v-if="Number(data.attachmentCount || 0) > 0" :value="String(data.attachmentCount)" icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i v-if="data.hasNotes" class="pi pi-comment notes-indicator" title="Tiene observaciones"></i></span></template>
                </Column>
                <Column field="name" sortField="entitieDsName" header="Nombre / Razón Social" sortable style="width: 35%"></Column>
                <Column field="cif" sortField="entitieDsCif" header="NIF/CIF" sortable style="width: 15%"></Column>

                <Column field="dateUp" sortField="dateUp" sortable style="width: 15%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>Fecha de Alta</b></span>
                            <Button :severity="fechaFilterdateUp ? 'danger' : 'secondary'" icon="pi pi-filter" rounded
                                size="small" @click.stop="openDateFilterDateUp($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        {{ HelperDates.formatDateNoTimeFromLocale((slotProps.data?.dateUp)) }}
                    </template>
                </Column>


                <Column field="active" header="Estado" sortable sortField="entitieBolActive" style="width: 10%">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
                    </template>
                </Column>


                <Column field="isclient" sortable sortField="entitieBolClient" style="width: 8%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>¿Cliente?</b></span>
                            <Button :severity="isClientFilterValue !== null ? 'danger' : 'secondary'"
                                icon="pi pi-filter" rounded size="small" @click.stop="openClientFilter($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex justify-content-center">
                            <Checkbox :modelValue="slotProps.data.isclient" binary disabled />
                        </div>
                    </template>
                </Column>


                <Column field="isprove" sortable sortField="entitieBolProve" style="width: 8%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>¿Proveedor?</b></span>
                            <Button :severity="isProveFilterValue !== null ? 'danger' : 'secondary'" icon="pi pi-filter"
                                rounded size="small" @click.stop="openProveFilter($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex justify-content-center">
                            <Checkbox :modelValue="slotProps.data.isprove" binary disabled />
                        </div>
                    </template>
                </Column>



                <Column header="Acciones" style="width: 5%">
                    <template #body="slotProps">
                        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
                    </template>
                </Column>

            </GenericDataTable>

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0"/>
        </section>

        <section class="entity-stats-card">
            <div class="stats-header"><div><h6><i class="pi pi-chart-bar"></i> Resumen de entidades</h6><span>Calidad del directorio y actividad comercial de la entidad seleccionada</span></div><Button :icon="statisticsExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" text rounded @click="statisticsExpanded = !statisticsExpanded" /></div>
            <div v-if="statisticsExpanded" class="stats-body">
                <div v-if="loadingStatistics" class="stats-loading"><i class="pi pi-spin pi-spinner"></i> Cargando indicadores...</div>
                <template v-else>
                    <div class="stats-section-title">Vista global</div>
                    <div class="kpi-grid">
                        <div class="kpi-card"><span class="kpi-icon active"><i class="pi pi-building"></i></span><div><small>Entidades activas</small><strong>{{ entityStatistics.global.activeCount }}</strong><em>No eliminadas</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon clients"><i class="pi pi-users"></i></span><div><small>Clientes activos</small><strong>{{ entityStatistics.global.clientCount }}</strong><em>Actividad comercial</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon suppliers"><i class="pi pi-truck"></i></span><div><small>Proveedores activos</small><strong>{{ entityStatistics.global.supplierCount }}</strong><em>Compras y suministro</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon both"><i class="pi pi-arrows-h"></i></span><div><small>Cliente y proveedor</small><strong>{{ entityStatistics.global.bothCount }}</strong><em>Doble relación</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon new"><i class="pi pi-calendar-plus"></i></span><div><small>Altas este año</small><strong>{{ entityStatistics.global.newThisYearCount }}</strong><em>{{ new Date().getFullYear() }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon quality"><i class="pi pi-envelope"></i></span><div><small>Sin correo</small><strong>{{ entityStatistics.global.withoutEmailCount }}</strong><em>Revisar datos</em></div></div>
                    </div>
                    <div class="selected-stats">
                        <div class="selected-heading"><div><b>Actividad de la entidad seleccionada</b><span v-if="entityStatistics.selected">{{ entityStatistics.selected.entityName }}</span></div><Tag v-if="entityStatistics.selected" :value="clientSelected?.code || 'Entidad'" severity="info" rounded /></div>
                        <Message v-if="!entityStatistics.selected" severity="info" :closable="false">Selecciona una entidad de la tabla para consultar su actividad comercial.</Message>
                        <div v-else class="kpi-grid selected-grid">
                            <div class="kpi-card"><span class="kpi-icon quotes"><i class="pi pi-file-edit"></i></span><div><small>Presupuestos</small><strong>{{ entityStatistics.selected.quoteCount }}</strong><em>{{ currency(entityStatistics.selected.quoteAmount) }}</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon orders"><i class="pi pi-shopping-cart"></i></span><div><small>Pedidos</small><strong>{{ entityStatistics.selected.orderCount }}</strong><em>{{ currency(entityStatistics.selected.orderAmount) }}</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon deliveries"><i class="pi pi-truck"></i></span><div><small>Albaranes</small><strong>{{ entityStatistics.selected.deliveryCount }}</strong><em>{{ currency(entityStatistics.selected.deliveryAmount) }}</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon pending"><i class="pi pi-clock"></i></span><div><small>Pendientes de facturar</small><strong>{{ entityStatistics.selected.pendingInvoiceCount }}</strong><em>Albaranes confirmados</em></div></div>
                            <div class="kpi-card invoice-kpi"><span class="kpi-icon invoices"><i class="pi pi-receipt"></i></span><div><small>Facturación</small><strong>{{ entityStatistics.selected.invoiceCount }} emitida{{ entityStatistics.selected.invoiceCount===1?'':'s' }}</strong><em>{{ currency(entityStatistics.selected.invoiceAmount) }} emitido</em><em class="draft-amount">{{ entityStatistics.selected.draftInvoiceCount }} borrador{{ entityStatistics.selected.draftInvoiceCount===1?'':'es' }} · {{ currency(entityStatistics.selected.draftInvoiceAmount) }}</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon relation"><i class="pi pi-address-book"></i></span><div><small>Relación documental</small><strong>{{ entityStatistics.selected.contactCount }} contactos</strong><em>{{ entityStatistics.selected.attachmentCount }} documentos</em></div></div>
                        </div>
                    </div>
                </template>
            </div>
        </section>

        <Frm_ClientForm ref="clientFormRef" @saved="refreshTable" />
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />
        <ConfirmDialog />

        <OverlayPanel ref="FrmFilterDateUp" appendTo="body">
            <DateRangePicker v-model="fechaFilterdateUp" />
        </OverlayPanel>


        <OverlayPanel ref="FrmFilterIsClient" appendTo="body" style="width: 200px;">
            <div class="flex flex-column gap-1">
                <div class="px-3 pt-2 pb-2 font-bold text-700 border-bottom-1 surface-border">
                    <Message severity="success" icon="pi pi-filter" variant="simple">Filtrar Por Cliente.</Message>
                </div>

                <Button label="Todos" icon="pi pi-list" text size="small" :outlined="isClientFilterValue === null"
                    class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = null; FrmFilterIsClient.hide()" />

                <Button label="Clientes" icon="pi pi-check-circle" text size="small"
                    :outlined="isClientFilterValue === true" class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = true; FrmFilterIsClient.hide()" />

                <Button label="No Clientes" icon="pi pi-times-circle" text size="small"
                    :outlined="isClientFilterValue === false" class="justify-content-start w-full px-3"
                    @click="isClientFilterValue = false; FrmFilterIsClient.hide()" />
            </div>
        </OverlayPanel>




        <OverlayPanel ref="FrmFilterIsProve" appendTo="body" style="width: 200px;">
            <div class="flex flex-column gap-1">
                <div class="px-3 pt-2 pb-2 font-bold text-700 border-bottom-1 surface-border">
                    <Message severity="success" icon="pi pi-filter" variant="simple">Filtrar Por Proveedor.</Message>
                </div>
                <Button label="Todos" icon="pi pi-list" text size="small" :outlined="isProveFilterValue === null"
                    class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = null; FrmFilterIsProve.hide()" />

                <Button label="Proveedores" icon="pi pi-check-circle" text size="small"
                    :outlined="isProveFilterValue === true" class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = true; FrmFilterIsProve.hide()" />

                <Button label="No Proveedores" icon="pi pi-times-circle" text size="small"
                    :outlined="isProveFilterValue === false" class="justify-content-start w-full px-3"
                    @click="isProveFilterValue = false; FrmFilterIsProve.hide()" />
            </div>
        </OverlayPanel>

    </main>


    <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_ENTITIES_DOCUMENTS"
        :title="`Documentos indexados a ${clientSelected?.name ?? ''}`" :entityId="clientSelected?.pkid" @update:visible="onAttachmentsVisible" />


    <Frm_Contacts v-model:visible="showContacts" :entitieId="clientSelected?.pkid"
        :entitieName="clientSelected?.name" />

</template>

<style scoped>
.entities-page { --kiwi: #9cc10a; --kiwi-dark: #648506; display: flex; width: 100%; min-height: calc(100dvh - 66px); flex-direction: column; padding: 18px 16px 72px; color: #243044; background: #f7f8fa; }
.entities-header { position:relative; isolation:isolate; overflow:hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; padding: 15px 20px; border: 1px solid #e3e8d2; border-radius: 15px; background:#fff; box-shadow: 0 6px 18px rgba(31,41,55,.055); }
.entities-header::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.entities-header > * { position:relative; z-index:1; }
.entities-title { display: flex; align-items: center; gap: 14px; }
.entities-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg,#38a4d8,#2875b6); box-shadow: 0 7px 15px rgba(40,117,182,.22); }
.entities-icon i { font-size: 1.3rem; }
.breadcrumb { color: #8791a0; font-size: .8rem; font-weight: 700; }
.entities-title h1 { margin: 3px 0 2px; color: #202939; font-size: 1.38rem; }
.entities-title p { margin: 0; color: #7a8494; font-size: .92rem; }
.header-actions { display: flex; align-items: center; gap: 3px; }
.entities-workspace { display: flex; height: clamp(500px,calc(100dvh - 300px),700px); min-height: 480px; flex-direction: column; overflow: hidden; border: 1px solid #dfe4ea; border-radius: 14px; background: #fff; box-shadow: 0 5px 18px rgba(30,41,59,.055); }
.entities-toolbar { padding: 13px 17px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; background: #fff; }
.workspace-heading { display: flex; flex-direction: column; gap: 3px; }
.workspace-heading span { color: #344054; font-size: 1rem; font-weight: 800; }
.workspace-heading small { color: #8a93a2; font-size: .82rem; }
.code-with-attachments { display:flex; align-items:center; flex-wrap:wrap; gap:.35rem .45rem; min-width:0; }.entity-code { font-size:.96rem; line-height:1.25; overflow-wrap:anywhere; }.code-with-attachments :deep(.p-tag) { flex:0 0 auto; font-size:.72rem; padding:.15rem .4rem; }
.notes-indicator { flex:0 0 auto; color:#7b8f22; font-size:.95rem; }
.entities-toolbar :deep(.p-button) { border-color: var(--kiwi-dark); background: var(--kiwi-dark); }
.entities-toolbar :deep(.p-button:hover) { border-color: #526f04; background: #526f04; }
.entities-table { min-height: 0; flex: 1; }
.entities-workspace :deep(.p-datatable-header) { border-color: #e8ecf0; background: #fafbfc; }
.entities-workspace :deep(.p-datatable-thead > tr > th) { padding-block: .78rem; color: #596579; background: #f5f7f9; font-size: .875rem; }
.entities-workspace :deep(.p-datatable-tbody > tr > td) { padding-block: .72rem; border-color: #eef1f4; font-size: .875rem; }
.entities-workspace :deep(.p-datatable-tbody > tr:hover) { background: #fbfdef; }
.entities-workspace :deep(.p-tag) { font-size: .72rem; }
.entity-stats-card{margin-top:14px;overflow:hidden;border:1px solid #dfe4ea;border-radius:14px;background:#fff;box-shadow:0 5px 18px rgba(30,41,59,.045)}.stats-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #e8ecf0}.stats-header h6{margin:0 0 .2rem;color:#344054;font-size:.98rem}.stats-header h6 i{margin-right:.45rem;color:#7d9e0b}.stats-header span{color:#7d8797;font-size:.82rem}.stats-body{padding:14px 16px 18px}.stats-loading{min-height:130px;display:flex;align-items:center;justify-content:center;gap:.55rem;color:#687386}.stats-section-title{margin-bottom:.55rem;color:#6b7565;font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.kpi-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.7rem}.kpi-card{display:flex;align-items:center;gap:.7rem;min-width:0;padding:.8rem;border:1px solid #e7eadf;border-radius:9px;background:#fbfcfa}.kpi-icon{display:grid;place-items:center;width:35px;height:35px;flex:0 0 35px;border-radius:9px}.kpi-icon.active{background:#e8f3ff;color:#2875b6}.kpi-icon.clients{background:#e7f5f1;color:#16846e}.kpi-icon.suppliers{background:#f5ebfb;color:#9253b5}.kpi-icon.both{background:#edf5d9;color:#66880c}.kpi-icon.new{background:#fff3d6;color:#a66c00}.kpi-icon.quality{background:#fdeaea;color:#c33f3f}.kpi-icon.quotes{background:#edf5d9;color:#66880c}.kpi-icon.orders{background:#e8f3ff;color:#2875b6}.kpi-icon.deliveries{background:#e7f5f1;color:#16846e}.kpi-icon.pending{background:#fff3d6;color:#a66c00}.kpi-icon.invoices{background:#f5ebfb;color:#9253b5}.kpi-icon.relation{background:#eef1f5;color:#667085}.kpi-card small,.kpi-card strong,.kpi-card em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kpi-card small{color:#788071;font-size:.72rem}.kpi-card strong{margin:.12rem 0;color:#303b32;font-size:1.08rem}.kpi-card em{color:#899184;font-size:.68rem;font-style:normal}.invoice-kpi .draft-amount{margin-top:.12rem;color:#9253b5;font-weight:700}.selected-stats{margin-top:1rem;padding-top:1rem;border-top:1px solid #e7eadf}.selected-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:.65rem}.selected-heading b,.selected-heading span{display:block}.selected-heading b{color:#465143;font-size:.9rem}.selected-heading span{margin-top:.15rem;color:#7d8797;font-size:.78rem}@media(max-width:1200px){.kpi-grid{grid-template-columns:repeat(3,1fr)}}
@media (max-width:700px) { .entities-page { min-height: calc(100dvh - 58px); padding: 12px 10px 66px; } .entities-header { align-items: flex-start; margin-bottom: 12px; } .entities-title p { display: none; } .header-actions :deep(.p-button-label) { display: none; } .workspace-heading small { display: none; } .kpi-grid { grid-template-columns: repeat(2,1fr); } }
</style>

<script setup lang="ts">

import { ref, watch, reactive, nextTick, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../../stores/companyStore';
import { HelperDates } from '../../../libs/HelperDates.ts';
import Frm_ClientForm from './Frm_ClientForm.vue';
import { useSecurityStore } from '../../../stores/securityStore.ts';
import DialogNotes from '@/components/dialogs/DialogNotes.vue'
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import Frm_Contacts from '../../Frm_Contacts/Frm_Contacts.vue';

const securityStore = useSecurityStore();
const clientFormRef = ref();
const router = useRouter();
const tableRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const clientSelected = ref<any>(null);
const apiUrl = ref('WebGetClients');
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();

const fechaFilterdateUp = ref<[Date | null, Date | null] | null>(null);
const isClientFilterValue = ref<boolean | null>(null);
const isProveFilterValue = ref<boolean | null>(null);

const FrmFilterDateUp = ref();
const FrmFilterIsClient = ref();
const FrmFilterIsProve = ref();
const showNotes = ref(false);
const showAttachments = ref(false);
const showContacts = ref(false);
const statisticsExpanded = ref(true);
const loadingStatistics = ref(false);
const entityStatistics = ref<any>({ global: { activeCount: 0, clientCount: 0, supplierCount: 0, bothCount: 0, newThisYearCount: 0, withoutEmailCount: 0, withNotesCount: 0 }, selected: null });
const currency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
const loadStatistics = async (entityId?: number | null) => {
    loadingStatistics.value = true;
    try {
        const suffix = entityId ? `?entityId=${entityId}` : '';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/WebGetEntityStatistics${suffix}`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        entityStatistics.value = { global: data.global ?? entityStatistics.value.global, selected: data.selected ?? null };
    } catch (error) {
        console.error(error);
        entityStatistics.value.selected = null;
    } finally {
        loadingStatistics.value = false;
    }
};

onMounted(() => loadStatistics());
watch(clientSelected, value => loadStatistics(value?.pkid ?? null));

const menuItems = computed(() => {

    const items: any[] = [];


    items.push({
        label: 'Ficha de la Entidad',
        icon: 'pi pi-pencil',
        command: () => clientFormRef.value.open(clientSelected.value?.pkid)
    });



    if (securityStore.hasPermission('ENTI_GEN_0001')) {

        items.push({
            label: 'Borrar',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => deleteClient()
        });
    };


    if (securityStore.hasPermission('ENTI_GEN_0003')) {
        if (items.length > 0) {
            items.push({
                separator: true
            });
        }

        items.push({
            label: 'Notas',
            icon: 'pi pi-comments',
            style: 'color: var(--red-500)',
            command: () => openNotes()
        });
    }


    if (securityStore.hasPermission('ENTI_GEN_0002')) {

        if (items.length > 0) {
            items.push({
                separator: true
            });
        }


        items.push({
            label: 'Documentos',
            icon: 'pi pi-paperclip',
            command: () => openAttachments()
        });
    }


        if (items.length > 0) {
            items.push({
                separator: true
            });
        }


        items.push({
            label: 'Contactos',
            icon: 'pi pi-address-book',
            command: () => openContacts()
        });

    


    return items;
});



const noteRequest = {
    table: 'ENTITIE',
    pkField: 'ENTITIE_KY_ID',
    field: 'ENTITIE_DS_MEMO',
    id: -1
}



const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);



const openMenu = (event: Event, client: any) => {
    clientSelected.value = client;
    menuOptionRegistro.value.toggle(event);
};

const openMenuTable = (event: Event) => menuTable.value.toggle(event);
const refreshTable = async () => { await tableRef.value?.refresh(); await loadStatistics(clientSelected.value?.pkid ?? null); };
const onAttachmentsVisible = (value: boolean) => { showAttachments.value = value; if (!value) refreshTable(); };
const handleRowSelect = (event: any) => { clientSelected.value = event.data; };

const handledAfterSearch = (event: any) => {
    fechaFilterdateUp.value = null;
    isClientFilterValue.value = null;
    isProveFilterValue.value = null;
};

const deleteClient = () => {
    if (!clientSelected.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar la entidad ${clientSelected.value.name}? Esta acción no se puede deshacer.`,
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary'
        },
        acceptProps: {
            label: 'Borrar',
            severity: 'danger'
        },
        accept: async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/WebDeleteEntitie`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: clientSelected.value!.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Entidad eliminada correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar la  entidad',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};



const openNotes = () => {
    if (!clientSelected.value) return;
    noteRequest.id = clientSelected.value!.pkid;
    showNotes.value = true;
};




watch([fechaFilterdateUp, isClientFilterValue, isProveFilterValue], () => {
    applyAllFilters();
});

const openDateFilterDateUp = (event: any) => {
    FrmFilterDateUp.value?.toggle(event);
};


const openClientFilter = (event: any) => {
    FrmFilterIsClient.value?.toggle(event);
};

const openProveFilter = (event: any) => {
    FrmFilterIsProve.value?.toggle(event);
};


function openAttachments() {

    showAttachments.value = true;

}


const applyAllFilters = () => {
    const queryParts: string[] = [];

    // Construir filtro de Fecha
    if (fechaFilterdateUp.value?.[0] && fechaFilterdateUp.value?.[1]) {

        const [inicio, fin] = fechaFilterdateUp.value;
        queryParts.push(`[dateUp],[${inicio.toISOString()}],[${fin.toISOString()}]`);
    }

    // Construir filtro de Booleano
    if (isClientFilterValue.value !== null) {
        queryParts.push(`[entitieBolClient],${isClientFilterValue.value}`);
    }

    if (isProveFilterValue.value !== null) {
        queryParts.push(`[entitieBolProve],${isProveFilterValue.value}`);
    }


    // Unir todo con un separador (ej: ";")
    const finalQuery = queryParts.join(';');

    // Llamar al refresh de la tabla enviando la query compuesta
    tableRef.value.refreshWithQuery(finalQuery);
};


function openContacts() {

    if (!clientSelected.value) return;

    showContacts.value = true;

}


</script>
