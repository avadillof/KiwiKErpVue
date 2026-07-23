<template>
    <Dialog 
        v-model:visible="dialogVisible"
        modal
        header="Editar Nota"
        :style="{ width: '55rem' }"
        :closable="true"
        :draggable="false"
        :resizable="false"
        :dismissableMask="true"
        :pt="{
            root: {
                class: 'kiwik-dialog'
            },
            header: {
                class: 'kiwik-dialog-header'
            },
            content: {
                class: 'kiwik-dialog-content'
            },
            footer: {
                class: 'kiwik-dialog-footer'
            }
        }"
    >

        <div class="note-container">
            <Textarea 
                v-model="note"
                rows="18"
                autoResize
                fluid
                class="note-textarea"
            />
        </div>
        
        <template #footer>



        <div class="flex justify-content-end">
        
        </div>


        <Button 
                label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="close"
            />


            <Button 
                label="Guardar"
                icon="pi pi-save"
                :loading="isSaving"
                :disabled="isSaving || !note.trim()"
                @click="save"
            />

        </template>


    </Dialog>
</template>

<style scoped>
.note-container {
    width: 100%;
}

.note-textarea {
    width: 100%;
    min-height: 65vh;
}


.kiwik-separator {
    border-top: 2px solid var(--primary-color);
    margin: 1.5rem 0;
}
</style>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useCompanyStore } from '@/stores/companyStore'



interface NoteRequest {

    table: string

    pkField: string

    field: string

    id: number

}

const props = defineProps<{
    visible: boolean
    request: NoteRequest | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'saved'): void
}>()

const toast = useToast()
const companyStore = useCompanyStore()
const note = ref('')
const isSaving = ref(false)
const baseUrl = import.meta.env.VITE_API_URL;

const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
})

watch(
    () => props.visible,
    async (value) => {

        if (value && props.request) {

            await load()

        }


        if (!value) {

            note.value = ''

        }

    }
)


 async function load() {

        if (!props.request) {
            return
        }


        try {

            const endpoint = '/api/notes/load'


            const response = await fetch(
                `${import.meta.env.VITE_API_URL}${endpoint}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(props.request)
                }
            )


            if (!response.ok) {

                throw new Error(
                    `Error cargando nota (${response.status})`
                )

            }


            const data = await response.json()


            note.value = data.note ?? ''


        } catch (error) {


            console.error(error)


            toast.add({

                severity: 'error',

                summary: 'Error',

                detail: 'No se pudo cargar la nota.',

                life: companyStore.companyInfo?.toastDuration ?? 3000

            })


            note.value = ''

        }

    }



function close() {
    note.value = ''
    dialogVisible.value = false
}

async function save() {

    if (!props.request) {




        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'No hay registro seleccionado para guardar la nota.',
            life: companyStore.companyInfo?.toastDuration ?? 3000
        })

        return
    }


    if (!note.value.trim()) {

        toast.add({
            severity: 'warn',
            summary: 'Aviso',
            detail: 'Escribe un texto para guardar la nota.',
            life: companyStore.companyInfo?.toastDuration ?? 3000
        })

        return
    }


    isSaving.value = true


    const payload = {

        table: props.request.table,
        pkField: props.request.pkField,
        field: props.request.field,
        id: props.request.id,
        note: note.value

    }


    try {


        const endpoint = '/api/notes/save'


        const response = await fetch(
            `${import.meta.env.VITE_API_URL}${endpoint}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        )


        if (!response.ok) {

            throw new Error(
                `Error al guardar la nota (${response.status})`
            )

        }


        emit('saved')


        toast.add({
            severity: 'success',
            summary: 'Guardado',
            detail: 'La nota se guardó correctamente.',
            life: companyStore.companyInfo?.toastDuration ?? 3000
        })


        close()


    } catch (error) {

        console.error(error)

        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar la nota.',
            life: companyStore.companyInfo?.toastDuration ?? 3000
        })


    } finally {

        isSaving.value = false

    }




   
}


</script>

<style scoped>
.note-container {
    width: 100%;
}

.note-textarea {
    width: 100%;
    min-height: 65vh;
}
</style>