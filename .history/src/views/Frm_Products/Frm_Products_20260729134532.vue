<template>
    <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px;">

        <div
            style="background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="flex align-items-center gap-3">

                    <div class="flex flex-column">
                        <h5 class="text-primary mt-0 mb-0 flex align-items-center gap-2"
                            style="font-weight: 700; font-size: 1.25rem;">
                            <i class="pi pi-box"></i> Productos y Servicios
                        </h5>
                        <span class="text-600 font-medium" style="font-size: 0.85rem;">
                            <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
                                Gestión de de la cartera de Artículos y Servicios de la entidad.
                            </Message>
                        </span>
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 10px;">
                <Button label="Volver" icon="pi pi-arrow-left" severity="secondary" text
                    @click="router.push({ name: 'Ventas' })" />

                <div style="width: 1px; height: 20px; background-color: #e5e7eb; margin: 0 5px;"></div>

                <Button label="Inicio" icon="pi pi-home" severity="info" outlined
                    @click="router.push({ name: 'Dashboard' })" />
            </div>
        </div>

        <div class="card"
            style="height: 650px; display: flex; flex-direction: column; background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <Toolbar class="mb-3">
                <template #start>
                    <Button v-if="securityStore.hasPermission('ENTI_GEN_0001')" label="Nuevo Artículo" icon="pi pi-plus"
                        size="small" variant="text" outlined />
                </template>
            </Toolbar>

            <GenericDataTable :key="tableKey" endpoint="WebGetProducts" :showPaginator="true" :filterable="true"
                :showActions="true" @edit="editProduct" @delete="deleteProduct" ref="tableRef" dataKey="pkid"
                selectionMode="single" v-model:selection="productSelected">


                <template #headerActions>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>

                <Column field="code" sortField="productProductDsCode" sortable header="Código" />

                <Column field="description" sortField="productProductDsDescriptionSp" header="Descripción" sortable />

                <Column field="category" sortField="category.descriptionEs" header="Categoría" sortable />

                <Column field="family" sortField="categoryType.descriptionEs" header="Familia" sortable />

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
        </div>



    </div>
    <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />
    <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_PRODUCTS_DOCUMENTS"
        :title="`Documentos indexados a ${productSelected?.description ?? ''}`" :entityId="productSelected?.pkid" />
    <ConfirmDialog />

</template>




















<script setup lang="ts">

import DialogNotes from '@/components/dialogs/DialogNotes.vue'
import type { ProductsDTO } from '../../models/ProductsDTO.ts';
import { ref, watch, reactive, nextTick, computed } from 'vue';
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
import { HelperDates } from '../../libs/HelperDates.ts';
import { useSecurityStore } from '../../stores/securityStore.ts';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';

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


const refreshTable = () => tableRef.value?.refresh();

const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);

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
        icon: 'pi pi-pencil'
    });



    if (securityStore.hasPermission('PROSER_GEN_0001')) {

        items.push({
            label: 'Borrar',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => deleteProduct()
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



    return items;
});

const openMenu = (event: Event, product: any) => {
    productSelected.value = product;
    menuOptionRegistro.value.toggle(event);
};



function newProduct() {

    toast.add({
        severity: 'info',
        summary: 'Nuevo producto',
        detail: 'Pendiente de implementar',
        life: 3000
    });

}



function editProduct(product: ProductsDTO) {

    toast.add({
        severity: 'info',
        summary: 'Editar producto',
        detail: `Producto ${product.code}`,
        life: 3000
    });

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
