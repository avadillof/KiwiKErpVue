<template>
    <div class="p-4" style="padding-bottom: 80px;margin-bottom: 100px; ">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Impuestos / Taxas</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Gestión y Mantenimiento de los distintos Impuestos.
        </Message>

        <div class="mb-5">
            <Button label="Volver a Ajsutes" icon="pi pi-arrow-left" text @click="volver" />
        </div>



        <GenericDataTable  style="min-height: 50px; height: 500px;" ref="tableRef" dataKey="pkid" :endpoint="apiUrl" :showPaginator="true" :filterable="true"
            :showActions="true" selectionMode="single" v-model:selection="selectedTax">



            <Column field="description" header="Descripción" sortable sortField="descriptionSp" style="width: 80%" />

            <Column field="value" header="% Valor" sortable headerStyle="text-align:right" style="width: 10%" sortField="value">
                <template #body="{ data }">
                    <div class="text-right font-semibold">
                        {{ data.value }} %
                    </div>
                </template>
            </Column>

            <Column field="active" header="Activo" style="width: 10%"  sortField="active" sortable>
                <template #body="{ data }">
                    <Tag :value="data.active ? 'ACTIVO' : 'INACTIVO'" :severity="data.active ? 'success' : 'danger'" />
                </template>
            </Column>


        </GenericDataTable>

    </div>
</template>


<style scoped>
.sales-tax-container {
    width: 100%;
}
</style>


<script setup>

import { ref } from 'vue'
import { useRouter } from 'vue-router';

const apiUrl = `WebGetSalesTax`
const router = useRouter();
const tableRef = ref(null)
const selectedTax = ref(null)

function volver() {
    router.push({ name: 'Frm_Ajustes' });
}


</script>
