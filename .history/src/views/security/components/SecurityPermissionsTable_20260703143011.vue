<template>
    <DataTable :value="permissions" 
    scrollable 
    scrollHeight="flex" 
    class="security-table h-full"
    >

        <Column field="desc" header="Permiso" />

        <Column header="Estado" class="w-2">
            <template #body="slotProps">
                <div class="flex align-items-center gap-2">
                    <ToggleSwitch v-model="slotProps.data.active" />
                    <span :class="slotProps.data.active ? 'text-primary font-bold' : 'text-500'">
                        {{ slotProps.data.active ? 'Activo' : 'Inactivo' }}
                    </span>
                </div>
            </template>
        </Column>

    </DataTable>
</template>

<style scoped>
/* Definimos el color corporativo */
:deep(.custom-header-table .p-datatable-thead > tr > th) {
    background-color: #c8ea4a !important; /* Sustituye por el verde de KiwiK */
    color: #7fa608 !important;
    font-weight: 700;
    border-color: rgba(255, 255, 255, 0.1);
}

/* Opcional: Para mejorar el contraste al hacer hover en las filas */
:deep(.custom-header-table .p-datatable-tbody > tr:hover) {
    background-color: var(--surface-100);
}
</style>

<script setup lang="ts">

import { ref, watch } from 'vue'

const props = defineProps({
    section: Object
})

const permissions = ref<any[]>([])

watch(() => props.section, (s) => {

    if (!s) {
        permissions.value = []
        return
    }

    permissions.value = [
        { desc: 'Actualizar datos', active: true },
        { desc: 'Ver nota', active: true },
        { desc: 'Imprimir', active: false },
        { desc: 'Enviar correo', active: true },
    ]

})

</script>