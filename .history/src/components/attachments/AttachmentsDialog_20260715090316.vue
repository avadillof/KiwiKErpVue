<template>

    <Dialog v-model:visible="internalVisible" modal header="Documentos anexos" :style="{
        width: '70rem',
        minHeight: '40rem'
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


        <div class="attachment-container">


            <!-- Información del registro -->

            <div class="attachment-info">


                <div>
                    <span class="label">
                        Carpeta:
                    </span>

                    <span>
                        {{ moduleFolder }}
                    </span>
                </div>


                <div>
                    <span class="label">
                        Registro:
                    </span>

                    <span>
                        {{ entityId }}
                    </span>
                </div>


            </div>



            <!-- Tabla documentos -->


            <DataTable :value="documents" size="small" stripedRows class="w-full attachment-table">


                <Column header="" style="width:50px">

                    <template #body="slot">

                        <i :class="getFileIcon(slot.data.extension)" style="font-size:1.4rem" />

                    </template>


                </Column>



                <Column field="name" header="Documento" />



                <Column field="extension" header="Tipo" style="width:100px">


                    <template #body="slot">

                        <Tag>
                            {{ slot.data.extension.toUpperCase() }}
                        </Tag>

                    </template>


                </Column>



                <Column field="size" header="Tamaño" style="width:120px" />



                <Column header="Acciones" style="width:160px">


                    <template #body="slot">


                        <Button v-if="canPreview(slot.data)" icon="pi pi-eye" text rounded severity="info"
                            v-tooltip="'Visualizar'" @click="preview(slot.data)" />



                        <Button icon="pi pi-download" text rounded v-tooltip="'Descargar'"
                            @click="download(slot.data)" />



                        <Button icon="pi pi-trash" text rounded severity="danger" v-tooltip="'Eliminar'"
                            @click="remove(slot.data)" />


                    </template>


                </Column>


            </DataTable>



            <!-- Subir documentos -->
            <div class="kiwik-separator"></div>

            <div class="upload-container">


                <FileUpload mode="basic" chooseLabel="Añadir documento" :multiple="true" customUpload
                    @select="upload" />


            </div>


        </div>


    </Dialog>




    <!-- Preview -->


    <Dialog v-model:visible="previewVisible" modal :header="previewDocument?.name" :style="{
        width: '60rem'
    }">


        <div v-if="previewDocument" class="preview-container">
            <iframe v-if="previewDocument.extension === 'pdf'" :src="previewDocument.previewUrl"
                class="preview-frame" />
        </div>


    </Dialog>


</template>


<style scoped>
.attachment-container {

    display: flex;

    flex-direction: column;

    min-height: 35rem;

    height: 100%;

}



.attachment-info {


    display: flex;

    gap: 2rem;

    padding: 0.75rem;

    border-radius: 6px;

    background: var(--surface-ground);

}



.label {


    font-weight: bold;

    margin-right: 0.5rem;

}




.attachment-table {

    flex: 1;

    margin-top: 1rem;

}



.upload-container {


    margin-top: auto;

    display: flex;

    justify-content: flex-end;

    padding-top: 1rem;

}




.preview-container {


    display: flex;

    justify-content: center;

    align-items: center;

}




.preview-frame {


    width: 100%;

    height: 600px;

    border: 0;

}



.preview-image {


    max-width: 100%;

    max-height: 600px;

}
</style>

<script setup lang="ts">

import { useCompanyStore } from '../../stores/companyStore';
import { useToast } from 'primevue/usetoast';
import { ref, computed, watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';

interface Props {

    visible: boolean;
    moduleFolder: string;
    entityId: number;
}



const props = defineProps<Props>();
const companyStore = useCompanyStore();
const toast = useToast();
const confirm = useConfirm();

const emit = defineEmits([
    'update:visible'
]);





const internalVisible = computed({


    get() {

        return props.visible;

    },


    set(value: boolean) {

        emit(
            'update:visible',
            value
        );

    }


});





interface Attachment {

    name: string

    extension: string

    size: number

    previewUrl?: string

}




const documents = ref<Attachment[]>([]);




const previewVisible = ref(false);


const previewDocument = ref<Attachment | null>(null);





function getFileIcon(extension: string) {


    switch (extension.toLowerCase()) {


        case 'pdf':
            return 'pi pi-file-pdf';



        case 'jpg':

        case 'jpeg':

        case 'png':
            return 'pi pi-image';



        case 'xls':

        case 'xlsx':
            return 'pi pi-file-excel';



        case 'doc':

        case 'docx':
            return 'pi pi-file-word';



        default:
            return 'pi pi-file';


    }

}





function canPreview(file: Attachment) {


    return [
        'pdf',
        'jpg',
        'jpeg',
        'png'
    ]
        .includes(
            file.extension.toLowerCase()
        );


}






function preview(file: Attachment) {


    const url =
        `${import.meta.env.VITE_API_URL}/api/gestdoc/preview`
        + `?entity=${props.moduleFolder}`
        + `&entityId=${props.entityId}`
        + `&fileName=${encodeURIComponent(file.name)}`;


    previewDocument.value = {

        ...file,

        previewUrl: url

    };


    previewVisible.value = true;


}





function download(file: Attachment) {


    console.log(
        'Descargar',
        file
    );


}





function remove(file: Attachment) {


    const toastLife = companyStore.companyInfo.toastDuration ?? 3000;


    confirm.require({

        message: `¿Desea eliminar el documento ${file.name}?`,

        header: 'Eliminar documento',

        icon: 'pi pi-exclamation-triangle',


        accept: async () => {


            try {


                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/gestdoc/delete?entity=${props.moduleFolder}&entityId=${props.entityId}&fileName=${encodeURIComponent(file.name)}`,
                    {
                        method: 'DELETE'
                    }
                );


                if (!response.ok) {

                    throw new Error(
                        'Error al eliminar documento'
                    );

                }



                toast.add({

                    severity: 'success',

                    summary: 'Eliminado',

                    detail: 'Documento eliminado correctamente',

                    life: toastLife

                });



                await loadDocuments();



            } catch (error) {


                console.error(error);



                toast.add({

                    severity: 'error',

                    summary: 'Error',

                    detail: 'No se pudo eliminar el documento',

                    life: toastLife

                });


            }


        }

    });


}





async function upload(event: any) {


    const files = event.files;


    if (!files || files.length === 0) {
        return;
    }


    try {


        const formData = new FormData();


        formData.append(
            'entity',
            props.moduleFolder
        );


        formData.append(
            'entityId',
            String(props.entityId)
        );



        files.forEach((file: File) => {

            formData.append(
                'files',
                file
            );

        });



        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/gestdoc/upload`,
            {
                method: 'POST',
                body: formData
            }
        );



        if (!response.ok) {

            throw new Error(
                'Error al subir documentos'
            );

        }



        toast.add({

            severity: 'success',

            summary: 'Documentos',

            detail: 'Documentos subidos correctamente',

            life: companyStore.companyInfo.toastDuration ?? 3000

        });



        await loadDocuments();



    } catch (error) {


        console.error(error);



        toast.add({

            severity: 'error',

            summary: 'Error',

            detail: 'No se pudieron subir los documentos',

            life: companyStore.companyInfo.toastDuration ?? 3000

        });


    }


}




async function loadDocuments() {

    try {
        console.log('loadDocuments');
        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/api/gestdoc/list?entity=${props.moduleFolder}&entityId=${props.entityId}`
        );

        if (!response.ok) {
            throw new Error('Error al cargar los documentos');
        }

        documents.value = await response.json();

    } catch (error) {

        console.error(error);

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los documentos',
            life: companyStore.companyInfo.toastDuration ?? 3000
        });

    }

}

watch(
    () => props.visible,
    async (visible) => {

        if (visible) {

            await loadDocuments();

        }

    }
);

</script>
