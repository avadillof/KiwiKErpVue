<template>

    <Dialog
        v-model:visible="visible"
        header="Usuarios autorizados"
        :modal="true"
        :closable="true"
        :draggable="false"
        :style="{ width: '900px'; }"
        class="kiwik-dialog"
        :dismissableMask="true"
    >

        <div class="mb-3">

            <Message severity="info" :closable="false">
                Seleccione los usuarios que estarán autorizados para utilizar este certificado.
            </Message>

        </div>

        <GenericDataTable
            ref="tableRef"
            dataKey="pkid"
            :endpoint="apiUrl"
            :showPaginator="true"
            :filterable="true"
            :showActions="false"
        >

            <Column
                field="username"
                header="Usuario"
                sortable
                sortField="username"
            />

            <Column
                field="name"
                header="Nombre"
                sortable
                sortField="name"
            />

            <Column
                header="Autorizado"
                style="width: 120px"
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


const visible = ref(false);

const tableRef = ref();

const certificateId = ref(null);

const apiUrl = ref('');


const open = async (id) => {

    certificateId.value = id;

    apiUrl.value =
        `WebGetCertificateUsers?certificateId=${id}`;

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