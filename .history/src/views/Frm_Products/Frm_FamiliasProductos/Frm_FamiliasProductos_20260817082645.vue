<template>

    <div class="p-4" style="padding-bottom: 80px; margin-bottom: 100px;">

        <h1 class="text-3xl font-extrabold text-gray-800 mb-1">
            Getión de Familias de Productos
        </h1>

        <Message variant="simple" icon="pi pi-shield" severity="success" size="big">
            Gestión y mantenimiento de las distintas Familias de Productos a las que perenecerán los distintos productos
            y Servicios.
        </Message>

        <div class="mb-5">
            <Button :label="router.currentRoute.value.query.from === 'products'
                ? 'Volver a Productos'
                : 'Volver a Ajustes'" icon="pi pi-arrow-left" text @click="volver" />
        </div>

        <Toolbar class="mb-3">
            <template #start>
                <Button label="Nueva Familia" icon="pi pi-plus" size="small" variant="text" outlined @click="openNew" />
            </template>
        </Toolbar>






        <GenericDataTable style="height: 450px;" ref="tableRef" dataKey="pkid" selectionMode="single" :endpoint="apiUrl"
            :showPaginator="true" :filterable="true" :showActions="true" @row-select="handleRowSelect">


            <template #headerActions>
                <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />

                <Menu ref="menuTable" :model="menuItemsTable" popup />
            </template>


            <Column field="code" header="Código" sortable sortField="categoriesDsAlias" />

            <Column field="description" header="Descripción" sortable sortField="categoriesDsDescriptionsp" />

            <Column field="active" header="Activo" sortable sortField="categoriesBolActive">
                <template #body="{ data }">

                    <Tag v-if="data.active" value="ACTIVO" severity="success" />

                    <Tag v-else value="INACTIVO" severity="danger" />

                </template>
            </Column>

            <Column header="Acciones" style="width: 5%">

                <template #body="slotProps">

                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />

                </template>

            </Column>

        </GenericDataTable>

    </div>


    <!-- ========================================= -->
    <!-- FORMULARIO FAMILIA                       -->
    <!-- ========================================= -->

    <Frm_FamiliaProductos ref="familiaProductosRef" @saved="refreshTable" />


    <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" />
    <ConfirmDialog />








    
</template>


<script setup lang="ts">

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import Tag from 'primevue/tag';
import Menu from 'primevue/menu';
import GenericDataTable from '@/components/shared/GenericDataTable.vue';

import Frm_FamiliaProductos from './Frm_FamiliaProductos.vue';

import { useSecurityStore } from '@/stores/securityStore';
import { useConfirm } from 'primevue/useconfirm';
import { useCompanyStore } from '@/stores/companyStore';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
/* =========================================
   SECURITY
========================================= */

const securityStore = useSecurityStore();
const router = useRouter();
const confirm = useConfirm();
const companyStore = useCompanyStore();
const toast = useToast();
const deleteDialogVisible = ref(false);
const deleteConfirmationText = ref('');

/* =========================================
   API
========================================= */

const apiUrl = `WebGetProductFamilies`;


/* =========================================
   REFERENCES
========================================= */

const tableRef = ref();

const familiaProductosRef = ref();
const selectedFamily = ref();

const menuOptionRegistro = ref();
const menuTable = ref();



const menuItems = computed(() => [

    {
        label: 'Ficha de la Familia',
        icon: 'pi pi-pencil',
        command: () => {

            familiaProductosRef.value?.open(
                selectedFamily.value?.pkid
            );

        }
    },
     {
        separator: true
    },

    {
        label: 'Borrar',
        icon: 'pi pi-trash',
        style: 'color: var(--red-500)',
        command: () => {
            deleteFamilia();
        }
    },

]);



const openMenuTable = (event: Event) => {
    menuTable.value.toggle(event);
};
/* =========================================
   NUEVA FAMILIA
========================================= */

const openNew = () => {

    familiaProductosRef.value?.open();

};


/* =========================================
   EDITAR FAMILIA
========================================= */

const handleRowSelect = (event: any) => {



};


/* =========================================
   DESPUÉS DE GUARDAR
========================================= */

const deleteFamilia = () => {
 if (!selectedFamily.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar la Familia ${selectedFamily.value.description}? Esta acción no se puede deshacer.`,
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteFamilia`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: selectedFamily.value.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar la Familia');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Familia eliminada correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar la Familia ',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};


const refreshTable = async () => {
    await tableRef.value.refresh();
};


const volver = () => {
    if (router.currentRoute.value.query.from === 'products') {
        router.push({ name: 'Productos' });
    } else {
        router.push({ name: 'Frm_Ajustes' });
    }
};


const openMenu = (event: Event, family: any) => {

    selectedFamily.value = family;

    menuOptionRegistro.value.toggle(event);

};



const menuItemsTable = ref([
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
]);








</script>