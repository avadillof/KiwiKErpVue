<template>
    <Dialog v-model:visible="dialogVisible" modal header="Editar Nota" :style="{ width: '55rem' }" :closable="true"
        :draggable="false" :resizable="false">

        <div class="note-container">
            <Textarea v-model="note" rows="18" autoResize fluid class="note-textarea" />
        </div>

        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined @click="close" />

            <Button label="Guardar" icon="pi pi-save" :loading="isSaving" :disabled="isSaving || !note.trim()"
                @click="save" />
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
</style>