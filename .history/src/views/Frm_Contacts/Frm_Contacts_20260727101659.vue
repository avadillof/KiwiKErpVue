<template>



    <Dialog v-model:visible="internalVisible" modal :header="`Contactos de ${entitieName ?? ''}`" :style="{
        width: '95rem',
        minHeight: '50rem'
    }" :closable="true" :draggable="false" :resizable="false" :dismissableMask="true" :pt="{
        root: {
            class: 'kiwik-dialog'
        },
        header: {
            class: 'kiwik-dialog-header'
        },
        content: {
            class: 'kiwik-dialog-content'
        }
    }">




        <div style="
            height:520px;
            display:flex;
            flex-direction:column;
            background:white;
            padding:20px;
            border-radius:12px;
            border:1px solid #e5e7eb;">


            <Toolbar class="mb-3">

                <template #start>

                    <Button label="Nuevo Contacto" icon="pi pi-plus" size="small" variant="text" outlined
                        @click="contactFormRef.open(null)" />

                </template>


                <template #end>


                    <Menu ref="menuTable" :model="menuItemsTable" popup />

                </template>


            </Toolbar>



            <GenericDataTable ref="tableRef" dataKey="pkid" selectionMode="single" v-model:selection="contactSelected"
                endpoint="WebGetContacts" :params="{ entitieId: props.entitieId }" :showPaginator="true"
                :filterable="true" :showActions="true" @row-select="handleRowSelect">

                <template #headerActions>
                    <Button icon="pi pi-ellipsis-v" text rounded @click="openMenuTable($event)" />
                    <Menu ref="menuTable" :model="menuItemsTable" popup />
                </template>


                <Column field="name" header="Nombre" sortable style="width:30%" />


                <Column field="email" header="Email" sortable style="width:25%" />


                <Column field="phone" header="Teléfono" style="width:15%" />


                <Column field="cargo" header="Cargo" sortable style="width:15%" />


                <Column field="defaultContact" header="Principal" style="width:8%">

                    <template #body="slotProps">

                        <div class="flex justify-content-center">

                            <Checkbox :modelValue="slotProps.data.defaultContact" binary disabled />

                        </div>

                    </template>

                </Column>



                <Column field="active" header="Estado" style="width:10%">

                    <template #body="slotProps">

                        <Tag :value="slotProps.data.active ? 'ACTIVO' : 'INACTIVO'"
                            :severity="slotProps.data.active ? 'success' : 'danger'" rounded />

                    </template>

                </Column>


                <Column header="Acciones" style="width:5%">

                    <template #body="slotProps">

                        <Button icon="pi pi-ellipsis-v" text rounded @click="openMenu($event, slotProps.data)" />

                    </template>

                </Column>


            </GenericDataTable>

            <Menu ref="menuOptionRegistro" :model="menuItems" :popup="true" v-if="menuItems.length > 0" />

        </div>
        <DialogNotes v-model:visible="showNotes" :request="noteRequest" @saved="refreshTable" />

    </Dialog>

    <AttachmentsDialog v-model:visible="showAttachments" moduleFolder="ATTACHEMENTS_CONTACTS_DOCUMENTS"
        :title="`Documentos indexados a ${contactSelected?.name ?? ''}`" :entityId="contactSelected?.pkid" />

    <Frm_ContactForm ref="contactFormRef" :entitieId="props.entitieId" :entitieName='props.entitieName' @saved="refreshContacts"/>

</template>


<script setup lang="ts">

import { ref, watch, nextTick, computed } from 'vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import DialogNotes from '@/components/dialogs/DialogNotes.vue'
import { useSecurityStore } from '../../stores/securityStore';
import Frm_ContactForm from './Frm_ContactForm.vue';
import { useToast } from "primevue/usetoast";


const toast = useToast();
const companyStore = useCompanyStore();

const contactFormRef = ref();

const props = defineProps({

    visible: {
        type: Boolean,
        default: false
    },


    entitieId: {
        type: Number,
        default: null
    },


    entitieName: {
        type: String,
        default: ''
    }

});


const securityStore = useSecurityStore();
const internalVisible = ref(props.visible);
const tableRef = ref();
const menuTable = ref();
const menuOptionRegistro = ref();
const contactSelected = ref<any>(null);
const showAttachments = ref(false);
const showNotes = ref(false);


const emit = defineEmits([
    'update:visible'
]);



const noteRequest = {
    table: 'CONTACTS',
    pkField: 'CONTACTS_KY_ID',
    field: 'CONTACTS_DS_MEMO',
    id: -1
}



watch(
    () => props.visible,
    (value) => {

        internalVisible.value = value;

        if (value) {

            nextTick(() => {

                loadContacts();

            });

        }

    }
);



watch(
    internalVisible,
    value => {

        emit(
            'update:visible',
            value
        );

    }
);



const menuItemsTable = ref([
    { label: 'Refrescar', icon: 'pi pi-refresh', command: () => refreshTable() },
    { label: 'Exportar Excel', icon: 'pi pi-file-excel', command: () => tableRef.value.exportToExcel() }
]);


const menuItems = computed(() => {

    const items: any[] = [];


    items.push({
        label: 'Ficha del Contacto',
        icon: 'pi pi-pencil',
        command: () => contactFormRef.value.open(contactSelected.value?.pkid,contactSelected.value?.name)

    });


    if (securityStore.hasPermission('ENTI_CON_003')) {

        items.push({
            label: 'Notas',
            icon: 'pi pi-comments',
            style: 'color: var(--red-500)',
            command: () => openNotes()
        });
    }


    if (securityStore.hasPermission('ENTI_CON_0004')) {

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


    return items;
});

const refreshTable = () => {

    tableRef.value?.refresh();

};



const loadContacts = () => {

    if (!props.entitieId)
        return;

    tableRef.value?.refresh();

};

const deleteContact = () => {
    if (!contactSelected.value) return;

    confirm.require({
        message: `¿Estás seguro de que quieres borrar el contacto ${contactSelected.value.name}? Esta acción no se puede deshacer.`,
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
                    `${import.meta.env.VITE_API_URL}/WebDeleteContact`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pkid: contactSelected.value!.pkid
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }

                toast.add({
                    severity: 'success',
                    summary: 'Borrado',
                    detail: 'Entidad eliminada correctamente',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });

                refreshTable();
            } catch (error) {
                console.error(error);

                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo eliminar la  entidad',
                    life: companyStore.companyInfo.toastDuration ?? 3000
                });
            }
        }
    });
};



const handleRowSelect = (event: any) => {

    contactSelected.value = event.data;

};



const openMenuTable = (event: any) => {

    menuTable.value.toggle(event);

};



const openMenu = (event: any, row: any) => {

    contactSelected.value = row;

    menuOptionRegistro.value?.toggle(event);

};



function openAttachments() {
    showAttachments.value = true;
}


const openNotes = () => {
    if (!contactSelected.value) return;
    noteRequest.id = contactSelected.value!.pkid;
    showNotes.value = true;
};

const refreshContacts = () => {
    tableRef.value?.refresh();
};


</script>