<template>

    <Dialog
        v-model:visible="internalVisible"
        modal
        header="Documentos anexos"
        :style="{ width: '70rem' }"
        :closable="true"
        :draggable="false"
        :resizable="false"
        :dismissableMask="true"
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


        <div class="flex flex-column gap-3">


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


            <DataTable
                :value="documents"
                size="small"
                stripedRows
                class="w-full"
            >


                <Column
                    header=""
                    style="width:50px"
                >

                    <template #body="slot">


                        <i
                            :class="getFileIcon(slot.data.extension)"
                            style="font-size:1.4rem"
                        />


                    </template>


                </Column>



                <Column
                    field="name"
                    header="Documento"
                />



                <Column
                    field="extension"
                    header="Tipo"
                    style="width:100px"
                >


                    <template #body="slot">

                        <Tag>
                            {{ slot.data.extension.toUpperCase() }}
                        </Tag>


                    </template>


                </Column>



                <Column
                    field="size"
                    header="Tamaño"
                    style="width:120px"
                />



                <Column
                    header="Acciones"
                    style="width:160px"
                >


                    <template #body="slot">


                        <Button
                            v-if="canPreview(slot.data)"
                            icon="pi pi-eye"
                            text
                            rounded
                            severity="info"
                            v-tooltip="'Visualizar'"
                            @click="preview(slot.data)"
                        />



                        <Button
                            icon="pi pi-download"
                            text
                            rounded
                            v-tooltip="'Descargar'"
                            @click="download(slot.data)"
                        />



                        <Button
                            icon="pi pi-trash"
                            text
                            rounded
                            severity="danger"
                            v-tooltip="'Eliminar'"
                            @click="remove(slot.data)"
                        />


                    </template>


                </Column>


            </DataTable>



            <!-- Subir documentos -->


            <div class="flex justify-content-end mt-2">


                <FileUpload
                    mode="basic"
                    chooseLabel="Añadir documento"
                    :multiple="true"
                    customUpload
                    @select="upload"
                />


            </div>


        </div>


    </Dialog>




    <!-- Preview -->


    <Dialog
        v-model:visible="previewVisible"
        modal
        :header="previewDocument?.name"
        :style="{width:'60rem'}"
    >


        <div
            v-if="previewDocument"
            class="preview-container"
        >


            <iframe
                v-if="previewDocument.extension==='pdf'"
                class="preview-frame"
            />


            <img
                v-else
                :src="previewDocument.url"
                class="preview-image"
            />


        </div>


    </Dialog>


</template>





<script setup lang="ts">

import axios from 'axios';

import {
    ref,
    computed
} from 'vue';



interface Props {


    visible:boolean;


    moduleFolder:string;


    entityId:number;


}



const props = defineProps<Props>();


const emit = defineEmits([
    'update:visible'
]);





const internalVisible = computed({


    get(){

        return props.visible;

    },


    set(value:boolean){

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

}




const documents = ref<Attachment[]>([]);




const previewVisible = ref(false);


const previewDocument = ref<Attachment|null>(null);





function getFileIcon(extension:string){


    switch(extension.toLowerCase()){


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





function canPreview(file:Attachment){


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






function preview(file:Attachment){


    previewDocument.value=file;

    previewVisible.value=true;


}





function download(file:Attachment){


    console.log(
        'Descargar',
        file
    );


}





function remove(file:Attachment){


    console.log(
        'Eliminar',
        file
    );


}





function upload(event:any){


    console.log(
        'Ficheros seleccionados',
        event.files
    );


}




async function loadDocuments() {

    try {

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



</script>




<style scoped>


.attachment-info{


    display:flex;

    gap:2rem;

    padding:0.75rem;

    border-radius:6px;

    background:var(--surface-ground);


}



.label{


    font-weight:bold;

    margin-right:0.5rem;

}




.preview-container{


    display:flex;

    justify-content:center;

    align-items:center;

}




.preview-frame{


    width:100%;

    height:600px;

    border:0;

}



.preview-image{


    max-width:100%;

    max-height:600px;

}




</style>