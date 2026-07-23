<template>
    <Dialog v-model:visible="dialogVisible" modal header="Editar Nota" :style="{ width: '55rem' }"
        :closable="true" :draggable="false" :resizable="false">

        <div class="note-container">
            <Textarea v-model="note" rows="18" autoResize fluid class="note-textarea" />
        </div>

        <template #footer>
            <Button label="Cancelar"
                icon="pi pi-times"
                severity="secondary"
                outlined
                @click="close" />

            <Button label="Guardar"
                icon="pi pi-save"
                @click="save" />
        </template>

    </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

export interface NoteRequest {
    table: string
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

const note = ref('')

const dialogVisible = computed({
    get: () => props.visible,
    set: (value: boolean) => emit('update:visible', value)
})

function close() {
    dialogVisible.value = false
}

function save() {

    // Aquí más adelante llamaremos al backend

    emit('saved')

    dialogVisible.value = false

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