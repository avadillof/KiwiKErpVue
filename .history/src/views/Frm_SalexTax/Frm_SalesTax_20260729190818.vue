<template>
    <div class="p-4" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Impuestos / Taxas</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Gestión y Mantenimiento de los distintos Impuestos.
        </Message>

        <div class="mb-5">
            <Button label="Volver a Ajsutes" icon="pi pi-arrow-left" text @click="volver" />
        </div>



        <GenericDataTable ref="tableRef" dataKey="pkid" :endpoint="apiUrl" :showPaginator="true" :filterable="true"
            :showActions="true" selectionMode="single" v-model:selection="selectedTax">

            <Column field="pkid" header="ID" sortable />

            <Column field="descriptionSp" header="Descripción" sortable />


            <Column field="active" header="Activo">
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


const apiUrl = `${import.meta.env.VITE_API_URL}/WebGetSalesTax`


const tableRef = ref(null)

const selectedTax = ref(null)


function volverAlDashboard() {
    router.push({ name: 'Dashboard' });
}


</script>
