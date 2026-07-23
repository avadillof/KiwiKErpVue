<template>



    <template>

    <Dialog 
        v-model:visible="visible"
        modal
        :header="contactId ? 'Editar Contacto' : 'Nuevo Contacto'"
        :style="{width:'55rem'}"
        :closable="true"
        :draggable="false"
        :resizable="false"
        :pt="{
            root:{
                class:'kiwik-dialog'
            },
            header:{
                class:'kiwik-dialog-header'
            },
            content:{
                class:'kiwik-dialog-content'
            }
        }"
    >


        <div class="p-fluid">


            <div class="formgrid grid">


                <!-- Nombre -->

                <div class="field col-8">

                    <label>
                        Nombre
                    </label>

                    <InputText 
                        v-model="contact.name"
                    />

                </div>


                <!-- Cargo -->

                <div class="field col-4">

                    <label>
                        Cargo
                    </label>

                    <Dropdown
                        v-model="contact.cargoId"
                        :options="cargos"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Seleccione cargo"
                    />

                </div>



                <!-- Email -->

                <div class="field col-6">

                    <label>
                        Email
                    </label>

                    <InputText
                        v-model="contact.email"
                    />

                </div>



                <!-- Teléfono -->

                <div class="field col-6">

                    <label>
                        Teléfono
                    </label>

                    <InputText
                        v-model="contact.phone"
                    />

                </div>



                <!-- NIF -->

                <div class="field col-4">

                    <label>
                        NIF
                    </label>

                    <InputText
                        v-model="contact.nif"
                    />

                </div>



                <!-- Fecha nacimiento -->

                <div class="field col-4">

                    <label>
                        Fecha nacimiento
                    </label>

                    <Calendar
                        v-model="contact.birth"
                        dateFormat="dd/mm/yy"
                    />

                </div>



                <div class="field col-4 flex align-items-center gap-4 mt-4">


                    <div>

                        <Checkbox 
                            v-model="contact.defaultContact"
                            binary
                        />

                        <label class="ml-2">
                            Principal
                        </label>

                    </div>



                    <div>

                        <Checkbox 
                            v-model="contact.active"
                            binary
                        />

                        <label class="ml-2">
                            Activo
                        </label>

                    </div>


                </div>



                <!-- Memo -->

                <div class="field col-12">


                    <label>
                        Observaciones
                    </label>


                    <Textarea
                        v-model="contact.memo"
                        rows="5"
                        autoResize
                    />


                </div>


            </div>


        </div>



        <template #footer>


            <Button
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="visible=false"
            />


            <Button
                label="Guardar"
                icon="pi pi-save"
                @click="save"
            />


        </template>


    </Dialog>


</template>


<script setup lang="ts">

import { ref, watch, nextTick, computed } from 'vue';
import AttachmentsDialog from '@/components/attachments/AttachmentsDialog.vue';
import DialogNotes from '@/components/dialogs/DialogNotes.vue'
import { useSecurityStore } from '../../stores/securityStore';
import Frm_ContactForm from './Frm_ContactForm.vue';


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
        label: 'Ficha de la Entidad',
        icon: 'pi pi-pencil',
        command: () => contactFormRef.value.open(contactSelected.value?.pkid)

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




</script>