<template>

    <Dialog v-model:visible="visible" header="Nuevo Certificado Digital" :modal="true" :closable="true"
        :draggable="false" :style="{ width: '500px' }" class="kiwik-dialog" :dismissableMask="true">


        <div class="flex flex-column gap-4">


            <div>

                <label class="font-semibold block mb-2">
                    Tipo de certificado
                </label>

                <Dropdown v-model="certificate.typeId" :options="certificateTypes" optionLabel="description"
                    optionValue="id" placeholder="Seleccione un tipo" class="w-full" />

            </div>


            <div>

                <label class="font-semibold block mb-2">
                    Descripción
                </label>

                <InputText v-model="certificate.description" class="w-full" placeholder="Descripción del certificado" />

            </div>


            <div>

                <label class="font-semibold block mb-2">
                    Archivo certificado (.p12 / .pfx)
                </label>


                <FileUpload mode="basic" accept=".p12,.pfx" :maxFileSize="5000000" chooseLabel="Seleccionar certificado"
                    @select="onFileSelect" />


                <div v-if="certificate.file" class="mt-3 text-sm text-color-secondary">

                    <i class="pi pi-file"></i>
                    {{ certificate.file.name }}

                </div>


            </div>


        </div>



        <template #footer>


            <Button label="Cancelar" icon="pi pi-times" text @click="close" />


            <Button label="Guardar" icon="pi pi-save" @click="save" />


        </template>

        <div class="kiwik-separator" s></div>
    </Dialog>


</template>


<script setup>


import { ref } from 'vue';

import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '@/stores/companyStore';


const emit = defineEmits([
    'saved'
]);


const toast = useToast();

const companyStore = useCompanyStore();

const toastLife = companyStore.companyInfo.toastDuration ?? 3000;



const visible = ref(false);


const certificateTypes = ref([]);



const certificate = ref({

    pkid: null,

    typeId: null,

    description: '',

    file: null

});



const open = async (id = null) => {


    certificate.value = {

        pkid: null,

        typeId: null,

        description: '',

        file: null

    };


    await loadTypes();


    visible.value = true;


};



defineExpose({

    open

});





const loadTypes = async () => {


    try {


        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebGetCertificateTypes`
        );


        if (!response.ok)
            throw new Error();


        certificateTypes.value = await response.json();


    } catch (error) {


        toast.add({

            severity: 'error',

            summary: 'Error',

            detail: 'No se pudieron cargar los tipos de certificado',

            life: toastLife

        });


    }


};





const onFileSelect = (event) => {


    if (event.files && event.files.length > 0) {

        certificate.value.file = event.files[0];

    }


};






const save = async () => {


    if (!certificate.value.typeId) {

        toast.add({

            severity: 'warn',

            summary: 'Aviso',

            detail: 'Seleccione un tipo de certificado',

            life: toastLife

        });

        return;

    }



    if (!certificate.value.description) {


        toast.add({

            severity: 'warn',

            summary: 'Aviso',

            detail: 'Introduzca una descripción',

            life: toastLife

        });


        return;

    }



    if (!certificate.value.file) {


        toast.add({

            severity: 'warn',

            summary: 'Aviso',

            detail: 'Seleccione el archivo del certificado',

            life: toastLife

        });


        return;

    }



    try {


        const formData = new FormData();


        formData.append(
            'typeId',
            certificate.value.typeId
        );


        formData.append(
            'description',
            certificate.value.description
        );


        formData.append(
            'file',
            certificate.value.file
        );



        const response = await fetch(

            `${import.meta.env.VITE_API_URL}/api/certificates`,

            {

                method: 'POST',

                body: formData

            }

        );



        if (!response.ok) {


            const error = await response.text();

            throw new Error(error);


        }



        toast.add({

            severity: 'success',

            summary: 'Guardado',

            detail: 'Certificado guardado correctamente',

            life: toastLife

        });



        emit('saved');


        close();



    } catch (error) {


        console.error(error);


        toast.add({

            severity: 'error',

            summary: 'Error',

            detail: error.message || 'No se pudo guardar el certificado',

            life: toastLife

        });


    }


};






const close = () => {

    visible.value = false;

};



</script>