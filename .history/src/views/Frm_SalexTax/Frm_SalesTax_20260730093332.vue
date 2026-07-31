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
                <Button label="Nuevo Impuesto" icon="pi pi-plus" size="small" variant="text" outlined
                    @click="salesTaxFormRef.open(null)" />
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

            <Column field="active" header="Activo" style="width: 5%" sortField="active" sortable>
                <template #body="{ data }">
                    <Tag :value="data.active ? 'ACTIVO' : 'INACTIVO'" :severity="data.active ? 'success' : 'danger'" />
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


    <Frm_SalexTaxForm ref="salesTaxFormRef" @saved="refreshTable" />
    <ConfirmDialog />


</template>


<style scoped>
.sales-tax-container {
    width: 100%;
}
</style>


<script setup>

import Frm_SalexTaxForm from './Frm_SalesTaxForm.vue';
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";


const apiUrl = `WebGetSalesTax`
const router = useRouter();
const tableRef = ref(null);
const selectedTax = ref(null);
const salesTaxFormRef = ref();
const menuOptionRegistro = ref(null);


const refreshTable = () => tableRef.value?.refresh();
const menuItems = computed(() => {

    const items = [];


    items.push({
        label: 'Ficha del Impuesto',
        icon: 'pi pi-pencil',
        command: () => salesTaxFormRef.value.open(selectedTax.value?.pkid)
    });

    items.push({
        label: 'Borrar',
        icon: 'pi pi-trash',
        style: 'color: var(--red-500)',
        command: () => deleteTax()
    });


    return items;
});

function volver() {
    router.push({ name: 'Frm_Ajustes' });
}


const openMenu = (event, tax) => {
    selectedTax.value = tax;
    menuOptionRegistro.value.toggle(event);
};



const deleteTax = () => {
    if (!selectedTax.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar el impuesto ${selectedTax.value.description}? Esta acción no se puede deshacer.`,
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteSalesTax`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: selectedTax.value.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar el impuesto');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Impuesto eliminado correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar el Impuesto',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};

</script>
