<template>

    <div class="maintenance-page">
        <header class="page-header"><div class="page-heading"><div class="page-icon"><i class="pi pi-sitemap"></i></div><div><span class="breadcrumb">Configuración / Datos maestros</span><h1>Familias de productos</h1><p>Clasificación común para mantener organizado el catálogo de productos y servicios.</p></div></div><nav class="header-actions"><Button :label="router.currentRoute.value.query.from === 'products' ? 'Artículos' : 'Ajustes'" icon="pi pi-arrow-left" severity="secondary" text @click="volver" /><Button label="Inicio" icon="pi pi-home" severity="secondary" text @click="router.push({ name: 'Dashboard' })" /></nav></header>
        <div class="card list-card"><Toolbar class="list-toolbar">
            <template #start><div class="workspace-heading"><span>Catálogo de familias</span><small>Consulta y organiza las agrupaciones utilizadas por los artículos.</small></div></template>
            <template #end><Button v-if="securityStore.hasPermission('PROSER_GEN_0006')" label="Nueva familia" icon="pi pi-plus" size="small" @click="openNew" /></template>
        </Toolbar>






        <GenericDataTable class="maintenance-table" ref="tableRef" dataKey="pkid" selectionMode="single" :endpoint="apiUrl"
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

        </GenericDataTable></div>

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


    <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_ENTITIES_DOCUMENTS"
        :title="`Documentos indexados a ${selectedFamily?.description ?? ''}`" :entityId="selectedFamily?.pkid" />

</template>

<style scoped>
.maintenance-page { --kiwi:#9cc10a; --kiwi-dark:#648506; width:100%; min-height:calc(100dvh - 66px); padding:18px 16px 72px; box-sizing:border-box; background:#f7f8fa; }
.page-header { position:relative; isolation:isolate; overflow:hidden; display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:18px; padding:15px 20px; border:1px solid #e3e8d2; border-radius:15px; background:#fff; box-shadow:0 6px 18px rgba(31,41,55,.055); }.page-header::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.page-header>*{position:relative;z-index:1}.page-heading{display:flex;align-items:center;gap:14px}.page-icon{display:grid;width:50px;height:50px;flex:0 0 auto;place-items:center;border-radius:13px;color:#fff;background:linear-gradient(135deg,#b1d70e,#719808);box-shadow:0 7px 15px rgba(113,152,8,.22)}.page-icon i{font-size:1.3rem}.breadcrumb{color:#8791a0;font-size:.8rem;font-weight:700}.page-heading h1{margin:3px 0 2px;color:#202939;font-size:1.38rem}.page-heading p{margin:0;color:#7a8494;font-size:.92rem}.header-actions{display:flex;align-items:center;gap:3px}
.list-card{height:clamp(520px,calc(100dvh - 270px),760px);min-height:0;display:flex;flex-direction:column;overflow:hidden;padding:0;border:1px solid #dfe4ea;border-radius:14px;background:#fff;box-shadow:0 5px 18px rgba(30,41,59,.055)}.list-toolbar{padding:13px 17px;border:0;border-bottom:1px solid #e8ecf0;border-radius:0;background:#fff}.workspace-heading{display:flex;flex-direction:column;gap:3px}.workspace-heading span{color:#344054;font-size:1rem;font-weight:800}.workspace-heading small{color:#8a93a2;font-size:.82rem}.list-toolbar :deep(.p-button){border-color:var(--kiwi-dark);background:var(--kiwi-dark)}.maintenance-table{flex:1 1 auto;min-height:0}.list-card :deep(.table-container){border:0;border-radius:0}@media(max-width:700px){.maintenance-page{padding:12px 10px 66px}.page-header{padding:12px;align-items:flex-start}.page-heading p,.workspace-heading small,.header-actions :deep(.p-button-label){display:none}.list-card{height:560px}}
</style>


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
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
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
const showAttachments = ref(false);


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


     if (securityStore.hasPermission('PROSER_GEN_0008')) {

        items.push({
            separator: true
        });


        items.push({
            label: 'Documentos',
            icon: 'pi pi-paperclip',
            command: () => openAttachments()
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
        router.push({ name: 'Frm_Ajustes', query: { tab: '3' } });
    }
};


const openMenu = (event: Event, family: any) => {

    selectedFamily.value = family;

    menuOptionRegistro.value.toggle(event);

};




const menuItemsTable = computed(() => {

    const items: any[] = [];

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
    )

   

    return items;
});





const openNotes = () => {
    if (!selectedFamily.value) return;
    noteRequest.id = selectedFamily.value!.pkid;
    showNotes.value = true;
};

function openAttachments() {

    showAttachments.value = true;

}



</script>
