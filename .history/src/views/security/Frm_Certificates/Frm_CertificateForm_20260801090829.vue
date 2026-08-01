<template>

    <Dialog v-model:visible="visible" header="Nuevo Certificado Digital" :modal="true" :closable="true"
        :draggable="false" :style="{ width: '500px' }" class="kiwik-dialog" :dismissableMask="true">



        <Panel style="margin-top: 5px;margin-bottom: 20px; ">

            <template #header>
                <div class="flex align-items-center gap-2">
                    <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                        style="width: 32px; height: 32px;">
                        <i class="pi pi-info text-primary"></i>
                    </div>
                    <span class="font-bold">Datos Generales.</span>
                </div>



            </template>
            <div class="flex flex-column gap-4">





                <div>

                    <label class="font-semibold block mb-2">
                        Tipo de certificado
                    </label>

                    <Select v-model="certificate.typeId" :options="certificateTypes" optionLabel="description"
                        optionValue="id" placeholder="Seleccione un tipo" fluid />

                </div>


                <div>

                    <label class="font-semibold block mb-2">
                        Descripción
                    </label>

                    <InputText v-model="certificate.description" class="w-full"
                        placeholder="Descripción del certificado" maxlength="350"/>

                </div>


                <div>

                    <label class="font-semibold block mb-2">
                        Archivo certificado (.p12 / .pfx)
                    </label>


                    <FileUpload mode="basic" accept=".p12,.pfx" :maxFileSize="5000000"
                        chooseLabel="Seleccionar certificado" @select="onFileSelect" />
                    <small class="text-color-secondary">
                        Seleccione un certificado en formato PKCS#12 (.p12 o .pfx).
                    </small>

                    <p>
                        <Message v-if="certificate.file" severity="success" :closable="false" class="mt-3">

                            <i class="pi pi-file mr-2"></i>
                            {{ certificate.file.name }}

                        </Message>
                    </p>

                </div>


            </div>

        </Panel>






        <template #footer>


            <Button label="Cancelar" icon="pi pi-times" text @click="close" />


            <Button label="Guardar" icon="pi pi-save" @click="save" />


        </template>

        <div class="kiwik-separator" style="margin-top: 10px;"></div>
    </Dialog>
    <CertificatePasswordDialog ref="passwordDialog"
        message="Introduzca la contraseña del certificado para validar e importar el archivo." />

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
import CertificatePasswordDialog from '../../../components/CertificatePasswordDialog.vue';

const emit = defineEmits([
    'saved'
]);


const toast = useToast();
const passwordDialog = ref();

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

    await loadTypes();

    if (id == null) {

        certificate.value = {
            pkid: null,
            typeId: null,
            description: '',
            file: null
        };

    } else {

        await loadCertificate(id);

    }

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

        if( certificate.value.pkid> 0){
          const password = await passwordDialog.value.open();

        if (!password)
            return;
        }
        
        const formData = new FormData();


        formData.append(
            'id',
            certificate.value.pkid
        );

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

        formData.append(
            'password',
            password
        );


        const response = await fetch(

            `${import.meta.env.VITE_API_URL}/api/certificates/UploadCertificateWithValidaTePassword`,

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

const loadCertificate = async (id) => {

    const response = await fetch(
        `${import.meta.env.VITE_API_URL}/WebGetCertificateById?id=${id}`
    );

    if (!response.ok)
        return;

    certificate.value = await response.json();

};




const close = () => {

    visible.value = false;

};



</script>