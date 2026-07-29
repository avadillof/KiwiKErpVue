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
                        size="small" variant="text" outlined @click="clientFormRef.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable :key="tableKey" endpoint="WebGetProducts" :showPaginator="true" :filterable="true"
                :showActions="true" @edit="editProduct" @delete="deleteProduct">

                <Column field="code" sortField="productProductDsCode" sortable header="Código" />

                <Column field="description" sortField="productProductDsDescriptionSp" header="Descripción" sortable />

                <Column field="category" sortField="category.descriptionEs" header="Categoría" sortable />

                <Column field="family" sortField="categoryType.descriptionEs" header="Familia" sortable />

                <Column field="uom" sortField="unitOfMeasure.description" header="U.M." sortable />

                <Column field="sale" sortField="sale" header="Para Vender" sortable>
                    <template #body="{ data }">
                        <i :class="data.sale ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-400'">
                        </i>
                    </template>
                </Column>


<Column field="sale" sortField="sale" header="Para Vender" sortable>
                    <template #body="{ data }">
                        <i :class="data.sale ? 'pi pi-check-circle text-green-500' : 'pi pi-times-circle text-red-400'">
                        </i>
                    </template>
                </Column>

                <Column field="purchasePrice" header="Precio Compra" sortable>
                    <template #body="slotProps">
                        {{
                            slotProps.data.purchasePrice?.toLocaleString('es-ES', {
                                minimumFractionDigits: 2
                            })
                        }}
                    </template>
                </Column>

                <Column field="active" header="Estado">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" />
                    </template>
                </Column>

            </GenericDataTable>


        </div>



    </div>



</template>




















<script setup lang="ts">


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


const tableKey = ref(0);


const products = ref([]);







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



function deleteProduct(product: ProductsDTO) {

    toast.add({
        severity: 'warn',
        summary: 'Eliminar producto',
        detail: `Producto ${product.code}`,
        life: 3000
    });

}



</script>
