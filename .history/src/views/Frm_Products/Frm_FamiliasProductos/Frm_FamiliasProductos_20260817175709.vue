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
                <Button v-if="securityStore.hasPermission('PROSER_GEN_0006')" label="Nueva Familia" icon="pi pi-plus"
                    size="small" variant="text" outlined @click="openNew" />
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






    <Dialog v-model:visible="deleteDialogVisible" modal header="Confirmar eliminación" :style="{ width: '450px' }"
        :closable="false">

        <div class="flex flex-column gap-3">

            <div class="flex align-items-start gap-3">

                <i class="pi pi-exclamation-triangle" style="font-size: 2rem; color: var(--red-500);"></i>

                <div>

                    <div class="font-bold mb-2">
                        Esta acción afectará a todos los productos de la familia.
                    </div>

                    <div>
                        La familia
                        <strong>{{ selectedFamily?.description }}</strong>
                        será marcada como eliminada y todos sus productos asociados
                        dejarán de estar disponibles para los operarios.
                    </div>

                    <div class="mt-2">
                        Los datos no se eliminarán físicamente de la base de datos.
                    </div>

                </div>

            </div>

            <div class="mt-3">

                <label class="block mb-2">
                    Para confirmar, escriba exactamente:
                </label>

                <div class="font-bold mb-2">
                    {{ selectedFamily?.description }}
                </div>

                <InputText v-model="deleteConfirmationText" class="w-full" placeholder="Escriba el nombre de la familia"
                    autocomplete="off" />

            </div>

        </div>

        <template #footer>

            <Button label="Cancelar" icon="pi pi-times" severity="secondary" @click="cancelDelete" />

            <Button label="Borrar definitivamente" icon="pi pi-trash" severity="danger" :disabled="!canConfirmDelete"
                @click="confirmDelete" />

        </template>

        <div class="kiwik-separator" style="margin-top: 10px;"></div>

    </Dialog>


    <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />

</template>


<script setup lang="ts">
import DialogNotes from '@/components/dialogs/DialogNotes.vue'
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



const noteRequest = {
    table: 'CATEGORIES',
    pkField: 'CATEGORIES_PK_ID',
    field: 'CATEGORIES_DS_MEMO',
    id: -1
}


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
const showNotes = ref(false);


const menuItems = computed(() => {

    const items: any[] = [

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
        }

    ];

    if (securityStore.hasPermission('PROSER_GEN_0006')) {

        items.push({
            label: 'Borrar',
            icon: 'pi pi-trash',
            style: 'color: var(--red-500)',
            command: () => deleteFamilia()
        });

    };



    if (securityStore.hasPermission('PROSER_GEN_0007')) {
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

    return items;
});


const openMenuTable = (event: Event) => {
    menuTable.value.toggle(event);
};
/* =========================================
   NUEVA FAMILIA
========================================= */

const openNew = () => {    
    familiaProductosRef.value?.open(null);
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

    if (!selectedFamily.value) {
        return;
    }

    confirm.require({

        message:
            `¿Estás seguro de que quieres eliminar la Familia ` +
            `"${selectedFamily.value.description}"? ` +
            `Esta acción hará que todos los productos asociados ` +
            `dejen de estar disponibles para los operarios.`,

        header: 'Confirmar eliminación',

        icon: 'pi pi-exclamation-triangle',

        rejectProps: {
            label: 'Cancelar',
            severity: 'secondary'
        },

        acceptProps: {
            label: 'Continuar',
            severity: 'danger'
        },

        accept: () => {

            deleteConfirmationText.value = '';

            deleteDialogVisible.value = true;

        }

    });

};


const refreshTable = async () => {
    await tableRef.value.refresh();
};



const canConfirmDelete = computed(() => {

    if (!selectedFamily.value?.description) {
        return false;
    }

    return deleteConfirmationText.value === selectedFamily.value.description;

});


const cancelDelete = () => {

    deleteConfirmationText.value = '';

    deleteDialogVisible.value = false;

};


const confirmDelete = async () => {

    if (!selectedFamily.value) {
        return;
    }

    if (!canConfirmDelete.value) {
        return;
    }

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebDeleteFamilia`,
            {
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

            throw new Error(
                'Error al eliminar la Familia'
            );

        }

        deleteDialogVisible.value = false;

        deleteConfirmationText.value = '';

        toast.add({

            severity: 'success',

            summary: 'Borrado',

            detail:
                'Familia y productos asociados eliminados correctamente',

            life:
                companyStore.companyInfo.toastDuration ?? 3000

        });

        await refreshTable();

    } catch (error) {

        console.error(error);

        toast.add({

            severity: 'error',

            summary: 'Error',

            detail:
                'No se pudo eliminar la Familia',

            life:
                companyStore.companyInfo.toastDuration ?? 3000

        });

    }

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




const menuItemsTable = computed(() => {

    const items: any[] = [];

    if (securityStore.hasPermission('PROSER_GEN_0005')) {

        items.push({
            label: 'Familias de Productos',
            icon: 'pi pi-tags',
            command: () => router.push({
                name: 'FamiliasProductos',
                query: { from: 'products' }
            })
        });

        items.push({
            separator: true
        });
    }

    items.push(
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
    );

    return items;
});


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
    },
     if (securityStore.hasPermission('PROSER_GEN_0002')) {

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
]);



const openNotes = () => {
    if (!selectedFamily.value) return;
    noteRequest.id = selectedFamily.value!.pkid;
    showNotes.value = true;
};




</script>