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


                <Message severity="success" class="w-full">

                    <div class="flex flex-column gap-2">

                        <div class="flex align-items-center gap-2">
                            <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                                style="width: 32px; height: 32px;">
                                <i class="pi pi-link text-primary"></i>
                            </div>
                            <div>
                                <strong>{{ title }}</strong>
                            </div>
                        </div>
                        <div>
                            <span class="label">Carpeta:</span>
                            {{ moduleFolder }}
                        </div>



                    </div>

                </Message>

            </div>


            <!-- Tabla documentos -->


            <DataTable :value="documents" scrollable size="small" scrollHeight="flex" stripedRows
                class="w-full attachment-table">


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



                <Column header="Tamaño" style="width:120px">


                    <template #body="slot">


                        {{ formatSize(slot.data.size) }}


                    </template>


                </Column>



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


                <FileUpload mode="basic" chooseLabel="Añadir documento" :multiple="true" customUpload :accept="accept" :maxFileSize="maxFileSize"
                    @select="upload" />


                <Button icon="pi pi-camera" label="Escanear" severity="secondary" outlined v-tooltip="'Capturar con la cámara o escáner documental USB'" @click="openScanner" />


            </div>


        </div>



    </Dialog>




    <Dialog v-model:visible="scanVisible" modal header="Escanear documento" :style="{ width: 'min(760px,94vw)' }"
        :closable="!scanning" :draggable="false" :resizable="false" :dismissableMask="false" :pt="{
            root: {
                class: 'kiwik-dialog'
            },
            header: {
                class: 'kiwik-dialog-header'
            },
            content: {
                class: 'kiwik-dialog-content'
            }
        }" @hide="stopScanner">


        <Message v-if="scanError" severity="error" :closable="false" class="w-full mb-3">{{ scanError }}</Message>


        <div v-else class="scan-container">


            <video ref="scanVideo" autoplay playsinline muted class="scan-video"></video>


            <small>Apunta al documento y pulsa Capturar. Sirven la cámara del equipo, la del móvil y las cámaras documentales USB (se exponen como webcam). Los escáneres TWAIN de sobremesa deben usar su propio programa con salida a carpeta.</small>


        </div>


        <template #footer>


            <div class="flex justify-content-end gap-2">


                <Button label="Cerrar" severity="secondary" text :disabled="scanning" @click="stopScanner(); scanVisible = false" />


                <Button label="Capturar" icon="pi pi-camera" :disabled="scanning || !!scanError" :loading="scanning" @click="captureScan" />


            </div>


        </template>


    </Dialog>





    <Dialog v-model:visible="previewVisible" modal :header="previewDocument?.name" :style="{
        width: '75rem',
        height: '85vh'
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


        <div v-if="previewDocument" class="preview-container">


            <!-- PDF -->


            <iframe v-if="previewDocument.extension.toLowerCase() === 'pdf'" :src="previewDocument.previewUrl"
                class="preview-frame" />



            <!-- Imagen -->


            <img v-else :src="previewDocument.previewUrl" class="preview-image" />


        </div>


    </Dialog>


</template>


<style scoped>
.attachment-container {

    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 35rem;

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
    min-height: 0;
    margin-top: 1rem;

}



.upload-container {


    margin-top: auto;

    display: flex;

    justify-content: flex-end;

    gap: 0.5rem;

    padding-top: 1rem;

}










.preview-container {

    width: 100%;

    height: 75vh;

    display: flex;

    justify-content: center;

    align-items: center;

    background: var(--surface-ground);

    border-radius: 8px;

    overflow: hidden;

}



.preview-frame {

    width: 100%;

    height: 100%;

    border: 0;

    border-radius: 8px;

}



.preview-image {

    max-width: 95%;

    max-height: 95%;

    object-fit: contain;

    border-radius: 8px;

}


.scan-container {

    display: flex;

    flex-direction: column;

    gap: 0.75rem;

}


.scan-video {

    width: 100%;

    max-height: 52vh;

    border-radius: 8px;

    background: #000;

}
</style>

<script setup lang="ts">
import { backendUrl } from '@/services/backendUrl';
import { useCompanyStore } from '../../stores/companyStore';
import { useToast } from 'primevue/usetoast';
import { ref, computed, watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import Avatar from 'primevue/avatar';
interface Props {

    visible: boolean;
    moduleFolder: string;
    entityId: number;
    title: string;
    accept?: string;
    maxFileSize?: number;
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


const scanVisible = ref(false);


const scanning = ref(false);


const scanError = ref('');


const scanVideo = ref<HTMLVideoElement | null>(null);


let scanStream: MediaStream | null = null;




async function openScanner() {


    scanError.value = '';


    scanVisible.value = true;


    try {


        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error('Este navegador no permite acceder a la cámara.');
        }


        stopScannerTracks();


        scanStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });


        if (scanVideo.value) {
            scanVideo.value.srcObject = scanStream;
            await scanVideo.value.play().catch(() => { /* autoplay con muted basta */ });
        }


    } catch (error: any) {


        scanError.value = error?.name === 'NotAllowedError'
            ? 'Permiso de cámara denegado. Actívalo en el navegador para escanear.'
            : (error?.message || 'No se pudo abrir la cámara para escanear.');


    }


}


function stopScannerTracks() {


    if (scanStream) {


        scanStream.getTracks().forEach((track) => track.stop());


        scanStream = null;


    }


    if (scanVideo.value) {

        scanVideo.value.srcObject = null;

    }


}


function stopScanner() {


    stopScannerTracks();


}


async function captureScan() {


    if (!scanVideo.value || !scanStream) {
        return;
    }


    scanning.value = true;


    try {


        const video = scanVideo.value;


        const canvas = document.createElement('canvas');


        canvas.width = video.videoWidth || 1280;


        canvas.height = video.videoHeight || 720;


        canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);


        const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/jpeg', 0.92)
        );


        if (!blob) {
            throw new Error('No se pudo capturar la imagen');
        }


        const now = new Date();


        const pad = (value: number) => String(value).padStart(2, '0');


        const name = `ESCANEADO_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.jpg`;


        await uploadFiles([new File([blob], name, { type: 'image/jpeg' })]);


        stopScanner();


        scanVisible.value = false;


    } catch (error) {


        console.error(error);


        toast.add({

            severity: 'error',

            summary: 'Error',

            detail: 'No se pudo capturar el documento',

            life: companyStore.companyInfo.toastDuration ?? 3000

        });


    } finally {


        scanning.value = false;


    }


}




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
        backendUrl(`/api/gestdoc/preview`)
        + `?entity=${props.moduleFolder}`
        + `&entityId=${props.entityId}`
        + `&fileName=${encodeURIComponent(file.name)}`;


    previewDocument.value = {

        ...file,

        previewUrl: url

    };


    previewVisible.value = true;


}





async function download(file: Attachment) {

    const toastLife = companyStore.companyInfo.toastDuration ?? 3000;

    try {

        const response = await fetch(
            backendUrl(`/api/gestdoc/download?entity=${props.moduleFolder}&entityId=${props.entityId}&fileName=${encodeURIComponent(file.name)}`)
        );

        if (!response.ok) {
            throw new Error('Error al descargar el documento');
        }

        const blob = await response.blob();

        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = url;
        link.download = file.name;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        toast.add({
            severity: 'success',
            summary: 'Descarga',
            detail: 'Documento descargado correctamente',
            life: toastLife
        });

    } catch (error) {

        console.error(error);

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo descargar el documento',
            life: toastLife
        });

    }

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
                    backendUrl(`/api/gestdoc/delete`),
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            entity: props.moduleFolder,
                            entityId: props.entityId,
                            fileName: file.name
                        })
                    }
                );


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


    await uploadFiles(files);


}


async function uploadFiles(files: File[]) {


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
            backendUrl(`/api/gestdoc/upload`),
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
            backendUrl(`/api/gestdoc/list?entity=${props.moduleFolder}&entityId=${props.entityId}`)
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


function formatSize(size: number) {


    if (!size) {
        return '0 Bytes';
    }


    const units = [
        'Bytes',
        'KB',
        'MB',
        'GB',
        'TB'
    ];


    const index = Math.floor(
        Math.log(size) / Math.log(1024)
    );


    const value = size / Math.pow(1024, index);



    return `${value.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;


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
