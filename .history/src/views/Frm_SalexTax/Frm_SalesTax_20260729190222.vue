<template>
    <div class="p-4" style="padding-bottom: 80px;">
        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">Ajustes del Sistema</h1>
        <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
            Gestión y mante
        </Message>

        <div class="mb-5">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="flex justify-content-between align-items-center mb-3">

            <div>
                <h2 class="m-0">
                    <i class="pi pi-percentage mr-2"></i>
                    Impuestos
                </h2>

                <small class="text-color-secondary">
                    Gestión de impuestos utilizados en ventas, compras y productos
                </small>
            </div>

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


<script setup>

import { ref } from 'vue'


const apiUrl = `${import.meta.env.VITE_API_URL}/WebGetSalesTax`


const tableRef = ref(null)

const selectedTax = ref(null)


</script>


<style scoped>
.sales-tax-container {
    width: 100%;
}
</style>