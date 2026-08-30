<template>
    <main class="products-page">
        <header class="products-header">
            <div class="products-title">
                <div class="products-icon"><i class="pi pi-box"></i></div>
                <div>
                    <span class="breadcrumb">Ventas / Datos maestros</span>
                    <h1>Artículos y servicios</h1>
                    <p>Catálogo comercial, clasificación, unidades de medida y disponibilidad de compra y venta.</p>
                </div>
            </div>
            <nav class="header-actions" aria-label="Navegación">
                <Button label="Ventas" icon="pi pi-arrow-left" severity="secondary" text
                    @click="router.push({ name: 'Ventas' })" />
                <Button label="Inicio" icon="pi pi-home" severity="secondary" text
                    @click="router.push({ name: 'Dashboard' })" />
            </nav>
        </header>

        <section class="products-workspace">
            <Toolbar class="products-toolbar">
                <template #start>
                    <div class="workspace-heading">
                        <span>Catálogo de artículos</span>
                        <small>Productos y servicios disponibles para los procesos comerciales.</small>
                    </div>
                </template>
                <template #end>
                    <Button v-if="securityStore.hasPermission('PROSER_GEN_0001')" label="Nuevo artículo" icon="pi pi-plus"
                        size="small" @click="newProduct"/>
                </template>
            </Toolbar>

            <GenericDataTable :key="tableKey" endpoint="WebGetProducts" :showPaginator="true" :filterable="true"
                :showActions="true" @edit="editProduct" @delete="deleteProduct" ref="tableRef" dataKey="pkid"
                selectionMode="single" v-model:selection="productSelected">


                <template #headerActions>
                    <Button icon="pi pi-refresh" text rounded title="Refrescar" @click="refreshTable" />
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>

                <Column field="code" sortField="productProductDsCode" sortable header="Código" style="width: 16%">
                    <template #body="{ data }"><span class="code-with-attachments"><span class="product-code">{{ data.code }}</span><Tag v-if="Number(data.attachmentCount || 0) > 0" :value="String(data.attachmentCount)" icon="pi pi-paperclip" severity="info" rounded title="Documentos adjuntos" /><i v-if="data.hasNotes" class="pi pi-comment notes-indicator" title="Tiene observaciones"></i></span></template>
                </Column>

                <Column field="description" sortField="productProductDsDescriptionSp" header="Descripción" sortable />

                <Column field="category" sortField="category.descriptionEs" header="Categoría" sortable />

                <Column field="family" sortField="categoryType.descriptionEs" header="Tipo" sortable />

                <Column field="familiproduct" sortField="familia.categoriesDsDescriptionsp" header="Familia" sortable />

                <Column field="uom" sortField="unitOfMeasure.description" header="U.M." sortable />

                <Column field="sale" sortField="sale" header="Para Vender" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.sale ? 'Si' : 'No'"
                            :severity="slotProps.data.sale ? 'success' : 'danger'" />
                    </template>
                </Column>


                <Column field="purchase" sortField="purchase" header="Para Comprar" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.purchase ? 'Si' : 'No'"
                            :severity="slotProps.data.purchase ? 'success' : 'danger'" />
                    </template>
                </Column>


                <Column field="active" sortField="active" header="Estado" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" />
                    </template>
                </Column>


                <Column header="Acciones" style="width: 5%">
                    <template #body="slotProps">
                        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
                    </template>
                </Column>

            </GenericDataTable>

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" />
        </section>

        <section class="product-stats-card">
            <div class="stats-header"><div><h6><i class="pi pi-chart-bar"></i> Resumen de artículos</h6><span>Calidad del catálogo y actividad comercial del artículo seleccionado</span></div><Button :icon="statisticsExpanded?'pi pi-chevron-up':'pi pi-chevron-down'" text rounded @click="statisticsExpanded=!statisticsExpanded" /></div>
            <div v-if="statisticsExpanded" class="stats-body">
                <div v-if="loadingStatistics" class="stats-loading"><i class="pi pi-spin pi-spinner"></i> Cargando indicadores...</div>
                <template v-else>
                    <div class="stats-section-title">Vista global</div>
                    <div class="kpi-grid">
                        <div class="kpi-card"><span class="kpi-icon active"><i class="pi pi-box"></i></span><div><small>Artículos activos</small><strong>{{ productStatistics.global.activeCount }}</strong><em>No eliminados</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon physical"><i class="pi pi-truck"></i></span><div><small>Productos físicos</small><strong>{{ productStatistics.global.physicalCount }}</strong><em>Requieren entrega</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon services"><i class="pi pi-cog"></i></span><div><small>Servicios</small><strong>{{ productStatistics.global.serviceCount }}</strong><em>Sin entrega física</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon new"><i class="pi pi-calendar-plus"></i></span><div><small>Altas este año</small><strong>{{ productStatistics.global.newThisYearCount }}</strong><em>{{ new Date().getFullYear() }}</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon price"><i class="pi pi-euro"></i></span><div><small>Sin precio de venta</small><strong>{{ productStatistics.global.withoutPriceCount }}</strong><em>Revisar catálogo</em></div></div>
                        <div class="kpi-card"><span class="kpi-icon quality"><i class="pi pi-exclamation-triangle"></i></span><div><small>Datos incompletos</small><strong>{{ productStatistics.global.incompleteCount }}</strong><em>UOM, categoría o impuesto</em></div></div>
                    </div>
                    <div class="selected-stats">
                        <div class="selected-heading"><div><b>Actividad del artículo seleccionado</b><span v-if="productStatistics.selected">{{ productStatistics.selected.productName }}</span></div><Tag v-if="productStatistics.selected" :value="productStatistics.selected.productCode" severity="info" rounded /></div>
                        <Message v-if="!productStatistics.selected" severity="info" :closable="false">Selecciona un artículo de la tabla para consultar su actividad comercial.</Message>
                        <div v-else class="kpi-grid">
                            <div class="kpi-card"><span class="kpi-icon quoted"><i class="pi pi-file-edit"></i></span><div><small>Presupuestado</small><strong>{{ quantity(productStatistics.selected.quotedQuantity) }}</strong><em>{{ currency(productStatistics.selected.quotedAmount) }} netos</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon ordered"><i class="pi pi-shopping-cart"></i></span><div><small>Pedido</small><strong>{{ quantity(productStatistics.selected.orderedQuantity) }}</strong><em>{{ currency(productStatistics.selected.orderedAmount) }} netos</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon delivered"><i class="pi pi-check-circle"></i></span><div><small>Entregado</small><strong>{{ quantity(productStatistics.selected.deliveredQuantity) }}</strong><em>{{ currency(productStatistics.selected.deliveredAmount) }} netos</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon pending"><i class="pi pi-clock"></i></span><div><small>Pendiente de entregar</small><strong>{{ quantity(productStatistics.selected.pendingDeliveryQuantity) }}</strong><em>Pedidos en curso</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon draft"><i class="pi pi-receipt"></i></span><div><small>En factura borrador</small><strong>{{ quantity(productStatistics.selected.draftInvoiceQuantity) }}</strong><em>{{ currency(productStatistics.selected.draftInvoiceAmount) }} netos</em></div></div>
                            <div class="kpi-card"><span class="kpi-icon invoiced"><i class="pi pi-verified"></i></span><div><small>Facturado</small><strong>{{ quantity(productStatistics.selected.invoicedQuantity) }}</strong><em>{{ currency(productStatistics.selected.invoicedAmount) }} netos</em></div></div>
                        </div>
                    </div>
                </template>
            </div>
        </section>
    </main>
    <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />
    <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_PRODUCTS_DOCUMENTS"
        :title="`Documentos indexados a ${productSelected?.description ?? ''}`" :entityId="productSelected?.pkid" @update:visible="onAttachmentsVisible" />
    <ConfirmDialog />
    <Frm_Product ref="productFormRef" @saved="refreshTable" />

</template>

<style scoped>
.products-page { --kiwi: #9cc10a; --kiwi-dark: #648506; display: flex; width: 100%; min-height: calc(100dvh - 66px); flex-direction: column; padding: 18px 16px 72px; color: #243044; background: #f7f8fa; }
.products-header { position:relative; isolation:isolate; overflow:hidden; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 18px; padding: 15px 20px; border: 1px solid #e3e8d2; border-radius: 15px; background:#fff; box-shadow: 0 6px 18px rgba(31,41,55,.055); }
.products-header::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.products-header > * { position:relative; z-index:1; }
.products-title { display: flex; align-items: center; gap: 14px; }
.products-icon { display: grid; width: 50px; height: 50px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: #fff; background: linear-gradient(135deg,#b1d70e,#719808); box-shadow: 0 7px 15px rgba(113,152,8,.22); }
.products-icon i { font-size: 1.3rem; }
.breadcrumb { color: #8791a0; font-size: .8rem; font-weight: 700; }
.products-title h1 { margin: 3px 0 2px; color: #202939; font-size: 1.38rem; }
.products-title p { margin: 0; color: #7a8494; font-size: .92rem; }
.header-actions { display: flex; align-items: center; gap: 3px; }
.products-workspace { display: flex; height: clamp(500px,calc(100dvh - 300px),700px); min-height: 480px; flex-direction: column; overflow: hidden; border: 1px solid #dfe4ea; border-radius: 14px; background: #fff; box-shadow: 0 5px 18px rgba(30,41,59,.055); }
.products-toolbar { padding: 13px 17px; border: 0; border-bottom: 1px solid #e8ecf0; border-radius: 0; background: #fff; }
.workspace-heading { display: flex; flex-direction: column; gap: 3px; }
.workspace-heading span { color: #344054; font-size: 1rem; font-weight: 800; }
.workspace-heading small { color: #8a93a2; font-size: .82rem; }
.code-with-attachments { display:flex; align-items:center; flex-wrap:wrap; gap:.35rem .45rem; min-width:0; }.product-code { font-size:.96rem; line-height:1.25; overflow-wrap:anywhere; }.code-with-attachments :deep(.p-tag) { flex:0 0 auto; font-size:.72rem; padding:.15rem .4rem; }
.notes-indicator { flex:0 0 auto; color:#7b8f22; font-size:.95rem; }
.products-toolbar :deep(.p-button) { border-color: var(--kiwi-dark); background: var(--kiwi-dark); }
.products-toolbar :deep(.p-button:hover) { border-color: #526f04; background: #526f04; }
.products-workspace :deep(.table-container) { min-height: 0; flex: 1; border: 0; border-radius: 0; }
.products-workspace :deep(.p-datatable-header) { border-color: #e8ecf0; background: #fafbfc; }
.products-workspace :deep(.p-datatable-thead > tr > th) { padding-block: .78rem; color: #596579; background: #f5f7f9; font-size: .875rem; }
.products-workspace :deep(.p-datatable-tbody > tr > td) { padding-block: .72rem; border-color: #eef1f4; font-size: .875rem; }
.products-workspace :deep(.p-datatable-tbody > tr:hover) { background: #fbfdef; }
.products-workspace :deep(.p-tag) { font-size: .72rem; }
.product-stats-card{margin-top:14px;overflow:hidden;border:1px solid #dfe4ea;border-radius:14px;background:#fff;box-shadow:0 5px 18px rgba(30,41,59,.045)}
.stats-header{display:flex;align-items:center;justify-content:space-between;padding:13px 16px;border-bottom:1px solid #e8ecf0}.stats-header h6{margin:0 0 .2rem;color:#344054;font-size:.98rem}.stats-header h6 i{margin-right:.45rem;color:#7d9e0b}.stats-header span{color:#7d8797;font-size:.82rem}.stats-body{padding:14px 16px 18px}.stats-loading{min-height:130px;display:flex;align-items:center;justify-content:center;gap:.55rem;color:#687386}.stats-section-title{margin-bottom:.55rem;color:#6b7565;font-size:.76rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em}.kpi-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:.7rem}.kpi-card{display:flex;align-items:center;gap:.7rem;min-width:0;padding:.8rem;border:1px solid #e7eadf;border-radius:9px;background:#fbfcfa}.kpi-icon{display:grid;place-items:center;width:35px;height:35px;flex:0 0 35px;border-radius:9px}.kpi-icon.active{background:#e8f3ff;color:#2875b6}.kpi-icon.physical{background:#e7f5f1;color:#16846e}.kpi-icon.services{background:#f5ebfb;color:#9253b5}.kpi-icon.new{background:#fff3d6;color:#a66c00}.kpi-icon.price{background:#fdeaea;color:#c33f3f}.kpi-icon.quality{background:#fff0e5;color:#c65d16}.kpi-icon.quoted{background:#edf5d9;color:#66880c}.kpi-icon.ordered{background:#e8f3ff;color:#2875b6}.kpi-icon.delivered{background:#e7f5f1;color:#16846e}.kpi-icon.pending{background:#fff3d6;color:#a66c00}.kpi-icon.draft{background:#f5ebfb;color:#9253b5}.kpi-icon.invoiced{background:#eef1f5;color:#667085}.kpi-card small,.kpi-card strong,.kpi-card em{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.kpi-card small{color:#788071;font-size:.72rem}.kpi-card strong{margin:.12rem 0;color:#303b32;font-size:1.08rem}.kpi-card em{color:#899184;font-size:.68rem;font-style:normal}.selected-stats{margin-top:1rem;padding-top:1rem;border-top:1px solid #e7eadf}.selected-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:.65rem}.selected-heading b,.selected-heading span{display:block}.selected-heading b{color:#465143;font-size:.9rem}.selected-heading span{margin-top:.15rem;color:#7d8797;font-size:.78rem}
@media(max-width:1200px){.kpi-grid{grid-template-columns:repeat(3,1fr)}}
@media (max-width:700px) { .products-page { min-height: calc(100dvh - 58px); padding: 12px 10px 66px; } .products-header { align-items: flex-start; margin-bottom: 12px; } .products-title p { display: none; } .header-actions :deep(.p-button-label) { display: none; } .workspace-heading small { display: none; } .products-workspace{height:560px;min-height:420px}.kpi-grid{grid-template-columns:1fr}.stats-header span{display:none} }
</style>








<script setup lang="ts">

import DialogNotes from '@/components/dialogs/DialogNotes.vue'
import type { ProductsDTO } from '../../models/ProductsDTO.ts';
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Menu from 'primevue/menu';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCompanyStore } from '../../stores/companyStore';
import { useSecurityStore } from '../../stores/securityStore.ts';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import Frm_Product from './Frm_Product.vue';

const productFormRef = ref();
const securityStore = useSecurityStore();
const router = useRouter();
const tableRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const productSelected = ref<any>(null);
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();
const showAttachments = ref(false);
const showNotes = ref(false);
const tableKey = ref(0);
const products = ref([]);
const openMenuTable = (event: Event) => menuTable.value.toggle(event);

const statisticsExpanded = ref(true);
const loadingStatistics = ref(false);
const productStatistics = ref<any>({
    global: { activeCount: 0, physicalCount: 0, serviceCount: 0, newThisYearCount: 0, withoutPriceCount: 0, incompleteCount: 0 },
    selected: null
});
const currency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Number(value) || 0);
const quantity = (value: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 2 }).format(Number(value) || 0);
const loadStatistics = async (productId?: number | null) => {
    loadingStatistics.value = true;
    try {
        const suffix = productId ? `?productId=${productId}` : '';
        const response = await fetch(`${import.meta.env.VITE_API_URL}/WebGetProductStatistics${suffix}`);
        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        productStatistics.value = { global: data.global ?? productStatistics.value.global, selected: data.selected ?? null };
    } catch (error) {
        console.error(error);
        productStatistics.value.selected = null;
    } finally {
        loadingStatistics.value = false;
    }
};

onMounted(() => loadStatistics());
watch(productSelected, value => loadStatistics(value?.pkid ?? null));

const refreshTable = async () => { await tableRef.value?.refresh(); await loadStatistics(productSelected.value?.pkid ?? null); };
const onAttachmentsVisible = (value: boolean) => { showAttachments.value = value; if (!value) refreshTable(); };

const menuItemsTable = computed(() => {

    const items: any[] = [];

    if (securityStore.hasPermission('PROSER_GEN_0005')) {

        items.push({
            label: 'Familias de Productos',
            icon: 'pi pi-tags',
            command: () => router.push({
                name: 'FamiliasProductos',
                query: { from: 'products' }
            })
        });

        items.push({
            separator: true
        });
    }

    items.push(
        {
            label: 'Refrescar',
            icon: 'pi pi-refresh',
            command: () => refreshTable()
        },
        {
            label: 'Exportar Excel',
            icon: 'pi pi-file-excel',
            command: () => tableRef.value.exportToExcel()
        }
    );

    return items;
});

const noteRequest = {
    table: 'PRODUCT_PRODUCT',
    pkField: 'PRODUCT_PRODUCT_PK_ID',
    field: 'PRODUCT_PRODUCT_DS_NOTES',
    id: -1
}

const menuItems = computed(() => {

    const items: any[] = [];


    items.push({
        label: 'Ficha del Producto',
        icon: 'pi pi-pencil',
        command: () => editProduct(productSelected.value)
    });



    if (securityStore.hasPermission('PROSER_GEN_0001')) {

        items.push({
            label: 'Borrar',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => deleteProduct()
        });
    };


    if (securityStore.hasPermission('PROSER_GEN_0003')) {
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


    if (securityStore.hasPermission('PROSER_GEN_0002')) {

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



    return items;
});

const openMenu = (event: Event, product: any) => {
    productSelected.value = product;
    menuOptionRegistro.value.toggle(event);
};



function newProduct() {

    productFormRef.value?.open(null);

}



function editProduct(product: ProductsDTO) {

    productFormRef.value?.open(product.pkid);

}



function deleteProduct() {

    if (!productSelected.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar el Producto/Servicio ${productSelected.value.description}? Esta acción no se puede deshacer.`,
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteProduct`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: productSelected.value!.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar el Producto/Servicio');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Producto eliminado correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el Producto',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
}

function openAttachments() {

    showAttachments.value = true;

}







const openNotes = () => {
    if (!productSelected.value) return;
    noteRequest.id = productSelected.value!.pkid;
    showNotes.value = true;
};

</script>
