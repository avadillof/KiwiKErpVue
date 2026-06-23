<template>
    <div style="background-color: #f9fafb; min-height: 100vh; padding: 20px; margin-bottom: 100px;">

        <div
            style="background: white; padding: 15px 25px; border-radius: 12px; border: 1px solid #e5e7eb; margin-bottom: 25px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="flex align-items-center gap-3">

                    <div class="flex flex-column">
                        <h5 class="text-primary mt-0 mb-0 flex align-items-center gap-2"
                            style="font-weight: 700; font-size: 1.25rem;">
                            <i class="pi pi-users"></i> Clientes
                        </h5>
                        <span class="text-600 font-medium" style="font-size: 0.85rem;">
                            <Message variant="simple" icon="pi pi-info-circle" severity="success" size="big">
                                Gestión de directorio de la cartera de Clientes.
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
                    <Button label="Nuevo Cliente" icon="pi pi-plus" size="small" variant="text" outlined
                        @click="clientFormRef.visibleInputs = true; clientFormRef.open(null)" />
                </template>
            </Toolbar>

            <GenericDataTable style="min-height: 400px;" ref="tableRef" dataKey="pkid" :endpoint="apiUrl"
                :showPaginator="true" :filterable="true" selectionMode="single" v-model:selection="clientSelected"
                @row-select="handleRowSelect" :showActions="true" @search="handledAfterSearch">
                <template #headerActions>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>

                <Column field="code" header="Código" sortable style="width: 15%"></Column>
                <Column field="name" header="Nombre / Razón Social" sortable style="width: 35%"></Column>
                <Column field="cif" header="NIF/CIF" sortable style="width: 15%"></Column>



                <Column field="dateUp" sortable style="width: 15%">

                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>Fecha de Alta</b></span>
                            <Button :severity="fechaFilterdateUp ? 'danger' : 'secondary'" icon="pi pi-filter" rounded
                                size="small" @click.stop="opDateFilterDateUp($event)" />
                        </div>
                    </template>


                    <template #body="slotProps">
                        {{ HelperDates.formatDateNoTimeFromLocale((slotProps.data?.dateUp)) }}
                    </template>


                </Column>


                <Column field="active" header="Estado" style="width: 10%">
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />
                    </template>
                </Column>


                <Column field="isclient" style="width: 8%">
                    <template #header>
                        <div class="flex align-items-center justify-content-between w-full">
                            <span><b>¿Cliente?</b></span>
                            <Button :severity="isClientFilterValue !== null ? 'danger' : 'secondary'"
                                icon="pi pi-filter" rounded size="small" @click.stop="opIsclientFilterDateUp($event)" />
                        </div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex justify-content-center">
                            <Checkbox :modelValue="slotProps.data.isclient" binary disabled />
                        </div>
                    </template>
                </Column>


                <Column header="Acciones" style="width: 5%">
                    <template #body="slotProps">
                        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />
                    </template>
                </Column>

            </GenericDataTable>

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" />
        </div>

        <Frm_ClientForm ref="clientFormRef" @saved="refreshTable" />
        <ConfirmDialog />

        <OverlayPanel ref="FrmFilterDateUp" appendTo="body">
            <DateRangePicker v-model="fechaFilterdateUp" />
        </OverlayPanel>


        <OverlayPanel ref="FrmFilterIsClient" appendTo="body" style="width: 200px;">
            <div class="flex flex-column gap-1">
                <div class="px-3 pt-2 pb-2 font-bold text-700 border-bottom-1 surface-border">
                    Filtrar por tipo
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


    </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive, nextTick } from 'vue';
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


//import Frm_ClientForm from './Frm_ClientForm.vue';

const router = useRouter();
const tableRef = ref();
const clientFormRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const clientSelected = ref<any>(null);
const apiUrl = ref('WebGetClients');
const confirm = useConfirm();
const toast = useToast();
const companyStore = useCompanyStore();
const fechaFilterdateUp = ref<[Date | null, Date | null] | null>(null);
const isClientFilterValue = ref<boolean | null>(null);


const FrmFilterDateUp = ref();
const FrmFilterIsClient = ref();

const menuItems = ref([
    { label: 'Editar', icon: 'pi pi-pencil', command: () => clientFormRef.value.open(clientSelected.value?.pkid) },
    { label: 'Ver Ficha', icon: 'pi pi-id-card', command: () => { /* Logica de ficha */ } },
    { separator: true },
    { label: 'Borrar', icon: 'pi pi-trash', style: 'color: var(--red-500)', command: () => deleteClient() }
]);

const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);

const openMenu = (event: Event, client: any) => {
    clientSelected.value = client;
    menuOptionRegistro.value.toggle(event);
};

const openMenuTable = (event: Event) => menuTable.value.toggle(event);
const refreshTable = () => tableRef.value?.refresh();
const handleRowSelect = (event: any) => { clientSelected.value = event.data; };
const handledAfterSearch = (event: any) => {
    fechaFilterdateUp.value = null;
};

const deleteClient = () => {
    // Implementar lógica de borrado con confirmación
};

const opDateFilterDateUp = (event: any) => {

    FrmFilterDateUp.value?.toggle(event);
};


watch(fechaFilterdateUp, (nuevoValor) => {
    // 1. Usamos 'nuevoValor' que es el valor que ya trae el watch
    // Esto evita el problema de 'possibly null' de .value


    if (nuevoValor && Array.isArray(nuevoValor) && nuevoValor[0] && nuevoValor[1]) {

        const [inicio, fin] = nuevoValor;

        nextTick(() => {
            // Es preferible pasar un objeto limpio en lugar de concatenar strings
            // Asegúrate de que tu tableRef.value.refreshFilter acepte este objeto

            tableRef.value.refreshDataField('dateUp', nuevoValor);
        });
    } else {
        tableRef.value.refresh();
    }
});



watch(isClientFilterValue, (nuevoValor) => {
    // 1. Usamos 'nuevoValor' que es el valor que ya trae el watch
    // Esto evita el problema de 'possibly null' de .value

    console.info(nuevoValor);

        nextTick(() => {
            
            tableRef.value.refreshBooleanField('isclient', nuevoValor);
        });
    
});





const opIsclientFilterDateUp = (event: any) => {
    FrmFilterIsClient.value?.toggle(event);
};


</script>