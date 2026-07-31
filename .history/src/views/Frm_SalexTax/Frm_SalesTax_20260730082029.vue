<template>
    <div class="p-4" style="padding-bottom: 80px;margin-bottom: 100px; ">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Impuestos / Taxas</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Gestión y Mantenimiento de los distintos Impuestos.
        </Message>

        <div class="mb-5">
            <Button label="Volver a Ajustes" icon="pi pi-arrow-left" text @click="volver" />
        </div>

        <Toolbar class="mb-3">
                <template #start>
                    <Button v-if="securityStore.hasPermission('ENTI_GEN_0001')" label="Nuevo Cliente" icon="pi pi-plus"
                        size="small" variant="text" outlined @click="clientFormRef.open(null)" />
                </template>
        </Toolbar>

        <GenericDataTable style="height: calc(100vh - 260px);" ref="tableRef" dataKey="pkid" :endpoint="apiUrl"
            :showPaginator="true" :filterable="true" :showActions="true" selectionMode="single"
            v-model:selection="selectedTax">



            <Column field="description" header="Descripción" sortable sortField="descriptionSp" style="width: 80%" />

            <Column field="value" header="%" sortable sortField="value" headerStyle="text-align:right"
                style="width: 120px">

                <template #body="{ data }">
                    <div class="text-right font-semibold">
                        {{ Number(data.value).toLocaleString('es-ES', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2
                        }) }} %
                    </div>
                </template>

            </Column>

            <Column field="active" header="Activo" style="width: 10%" sortField="active" sortable>
                <template #body="{ data }">
                    <Tag :value="data.active ? 'ACTIVO' : 'INACTIVO'" :severity="data.active ? 'success' : 'danger'" />
                </template>
            </Column>


        </GenericDataTable>

    </div>


    <Frm_SalexTaxForm ref="clientFormRef" @saved="refreshTable" />



</template>


<style scoped>
.sales-tax-container {
    width: 100%;
}
</style>


<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';

const apiUrl = `WebGetSalesTax`
const router = useRouter();
const tableRef = ref(null);
const selectedTax = ref(null);
const clientFormRef = ref();

function volver() {
    router.push({ name: 'Frm_Ajustes' });
}


</script>
