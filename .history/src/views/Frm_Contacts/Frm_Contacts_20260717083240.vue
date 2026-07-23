<template>
    <div class="card">

        <Toolbar class="mb-3">

            <template #start>
                <Button
                    label="Nuevo"
                    icon="pi pi-plus"
                    @click="newContact"
                />

                <Button
                    label="Editar"
                    icon="pi pi-pencil"
                    class="ml-2"
                    :disabled="!selectedContact"
                    @click="editContact"
                />

                <Button
                    label="Adjuntos"
                    icon="pi pi-paperclip"
                    class="ml-2"
                    :disabled="!selectedContact"
                    @click="showAttachments = true"
                />
            </template>


            <template #end>

                <InputText
                    v-model="search"
                    placeholder="Buscar..."
                />

            </template>


        </Toolbar>


        <DataTable
            :value="contacts"
            v-model:selection="selectedContact"
            selectionMode="single"
            dataKey="pkid"

            lazy
            paginator
            :rows="rows"
            :totalRecords="totalRecords"

            @page="loadContacts"
        >


            <Column
                field="name"
                header="Nombre"
            />


            <Column
                field="surname"
                header="Apellidos"
            />


            <Column
                field="email"
                header="Email"
            />


        </DataTable>



        <Frm_ContactForm
            v-model:visible="showForm"
            :contact="selectedContact"
            @saved="loadContacts"
        />



        <AttachmentsDialog
            v-model:visible="showAttachments"
            moduleFolder="CONTACTS"
            :entityId="selectedContact?.pkid"
        />


    </div>
</template>



<script setup lang="ts">

import { ref, onMounted } from "vue";

import Frm_ContactForm from "./Frm_ContactForm.vue";
import AttachmentsDialog from "@/components/AttachmentsDialog.vue";


const contacts = ref([]);

const selectedContact = ref(null);

const showForm = ref(false);

const showAttachments = ref(false);


const search = ref("");

const rows = ref(20);

const totalRecords = ref(0);



const loadContacts = async () => {

    // Aquí irá el endpoint real

};



const newContact = () => {

    selectedContact.value = null;

    showForm.value = true;

};



const editContact = () => {

    showForm.value = true;

};



onMounted(() => {

    loadContacts();

});


</script>