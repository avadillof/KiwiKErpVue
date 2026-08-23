<template>

    <Dialog
        v-model:visible="visible"
        header="Usuarios autorizados"
        :modal="true"
        :closable="true"
        :draggable="false"
        :style="{ width: '900px', height: '1000px' }"
        class="kiwik-dialog"
        :dismissableMask="true"
    >

        <Message severity="info" :closable="false" class="mb-3">
            Seleccione los usuarios autorizados para utilizar este certificado.
        </Message>

        <GenericDataTable
            ref="tableRef"
            dataKey="pkid"
            :endpoint="apiUrl"
            :showPaginator="true"
            :filterable="true"
            :showActions="false"
        >

            <Column
                field="code"
                header="Usuario"
                sortable
                sortField="code"
            />

            <Column
                field="name"
                header="Nombre"
                sortable
                sortField="userDsName"
            />

            <Column
                field="email"
                header="Email"
                sortable
                sortField="email"
            />

            <Column
                header="Autorizado"
                style="width: 120px; text-align:center"
            >

                <template #body="slotProps">

                    <Checkbox
                        v-model="slotProps.data.assigned"
                        binary
                    />

                </template>

            </Column>

        </GenericDataTable>

        <template #footer>

            <Button
                label="Cancelar"
                icon="pi pi-times"
                text
                @click="close"
            />

            <Button
                label="Guardar"
                icon="pi pi-save"
                @click="save"
            />

        </template>

    </Dialog>

</template>

<script setup>

import { ref } from 'vue';

import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';

import GenericDataTable from '../../../components/shared/GenericDataTable.vue';

import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';

const toast = useToast();
const companyStore = useCompanyStore();

const toastLife = companyStore.companyInfo.toastDuration ?? 3000;

const visible = ref(false);

const tableRef = ref();

const certificateId = ref(null);

const apiUrl = ref('');


const open = (id) => {

    console.log('CertificateUsersDialog - open:', id);

    certificateId.value = id;

    apiUrl.value = `WebGetCertificateUsers?certificateId=${id}`;

    console.log('CertificateUsersDialog - apiUrl:', apiUrl.value);

    visible.value = true;
};


defineExpose({
    open
});


const close = () => {

    visible.value = false;

};


const save = async () => {

    // Lo hacemos en el siguiente paso

};

</script>