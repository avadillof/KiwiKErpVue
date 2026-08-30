<template>
    <div class="maintenance-page">
        <header class="page-header"><div class="page-heading"><div class="page-icon"><i class="pi pi-percentage"></i></div><div><span class="breadcrumb">Configuración / Datos maestros</span><h1>Impuestos</h1><p>Tipos impositivos aplicables a productos, servicios, compras y ventas.</p></div></div><nav class="header-actions"><Button label="Ajustes" icon="pi pi-arrow-left" severity="secondary" text @click="volver" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav></header>
        <div class="card list-card"><Toolbar class="list-toolbar">
            <template #start><div class="workspace-heading"><span>Catálogo de impuestos</span><small>Consulta y mantiene los tipos impositivos disponibles.</small></div></template>
            <template #end><Button label="Nuevo impuesto" icon="pi pi-plus" size="small" @click="openNewSalesTax" /></template>
        </Toolbar>

        <GenericDataTable class="maintenance-table" ref="tableRef" dataKey="pkid" :endpoint="apiUrl"
            :showPaginator="true" :filterable="true" :showActions="true" selectionMode="single"
            v-model:selection="selectedTax">

            <template #headerActions>
                <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                <Menu ref="menuTable" :model="menuItemsTable" popup />
            </template>

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
        <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" /></div>

    </div>


    <Frm_SalexTaxForm ref="salesTaxFormRef" @saved="refreshTable" />
    <ConfirmDialog />


</template>


<style scoped>
.maintenance-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; min-height:calc(100dvh - 66px); padding:18px 16px 72px; box-sizing:border-box; background:#f7f8fa; }
.page-header { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:18px; padding:15px 20px; border:1px solid #e3e8d2; border-radius:15px; background:#fff; box-shadow:0 6px 18px rgba(31,41,55,.055); }.page-header::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.page-header>*{position:relative;z-index:1}.page-heading { display:flex; align-items:center; gap:14px; }.page-icon { display:grid; width:50px; height:50px; flex:0 0 auto; place-items:center; border-radius:13px; color:#fff; background:linear-gradient(135deg,#f3ae48,#dc7c22); box-shadow:0 7px 15px rgba(220,124,34,.22); }.page-icon i{font-size:1.3rem}.breadcrumb{color:#8791a0;font-size:.8rem;font-weight:700}.page-heading h1{margin:3px 0 2px;color:#202939;font-size:1.38rem}.page-heading p{margin:0;color:#7a8494;font-size:.92rem}.header-actions{display:flex;align-items:center;gap:3px}
.list-card { height:clamp(520px,calc(100dvh - 270px),760px); min-height:0; display:flex; flex-direction:column; overflow:hidden; padding:0; border:1px solid #dfe4ea; border-radius:14px; background:#fff; box-shadow:0 5px 18px rgba(30,41,59,.055); }.list-toolbar{padding:13px 17px;border:0;border-bottom:1px solid #e8ecf0;border-radius:0;background:#fff}.workspace-heading{display:flex;flex-direction:column;gap:3px}.workspace-heading span{color:#344054;font-size:1rem;font-weight:800}.workspace-heading small{color:#8a93a2;font-size:.82rem}.list-toolbar :deep(.p-button){border-color:var(--kiwi-dark);background:var(--kiwi-dark)}.maintenance-table{flex:1 1 auto;min-height:0}.list-card :deep(.table-container){border:0;border-radius:0}@media(max-width:700px){.maintenance-page{padding:12px 10px 66px}.page-header{padding:12px;align-items:flex-start}.page-heading p,.workspace-heading small,.header-actions :deep(.p-button-label){display:none}.list-card{height:560px}}
</style>


<script setup>

import Frm_SalexTaxForm from './Frm_SalesTaxForm.vue';
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';
const toast = useToast();
const companyStore = useCompanyStore();


const apiUrl = `WebGetSalesTax`
const router = useRouter();
const tableRef = ref(null);
const selectedTax = ref(null);
const salesTaxFormRef = ref();
const menuOptionRegistro = ref(null);
const confirm = useConfirm();
const menuTable = ref();


const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);



const openMenuTable = (event) => {
    menuTable.value.toggle(event);
};

const refreshTable = async () => {
    await tableRef.value.refresh();
};

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
    router.push({ name: 'Frm_Ajustes', query: { tab: '3' } });
}


const openMenu = (event, tax) => {
    selectedTax.value = tax;
    menuOptionRegistro.value.toggle(event);
};

const openNewSalesTax = () => {
    salesTaxFormRef.value?.open(null);
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteSalesTax?id=${selectedTax.value.pkid}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: selectedTax.value.pkid
                        })
                    }
                );

                if (!response.ok) {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo eliminar el Impuesto',
                        life: companyStore.companyInfo.toastDuration ?? 3000
                    });
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Impuesto eliminado correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                await refreshTable();
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
