<template>
    <DataTable 
    :value="modules" 
    class="security-table" 
    stripedRows 
    size="small"
    selectionMode="single" 
    v-model:selection="selected" 
    @rowSelect="onSelect">
    
    <Column field="code" header="Módulo" class="font-bold w-4" />
    <Column field="desc" header="Descripción" />
    <Column field="access" header="Acceso">
        <template #body="slotProps">
            <Badge :value="slotProps.data.access ? 'Sí' : 'No'" 
                   :severity="slotProps.data.access ? 'success' : 'danger'" />
        </template>
    </Column>
</DataTable>
</template>

<script setup lang="ts">

import { ref } from 'vue'

const emit = defineEmits(['select'])

const selected = ref()

const modules = ref([
    { code: 'SALES', desc: 'Ventas', access: true },
    { code: 'PRODUCTS', desc: 'Productos', access: true },
    { code: 'PURCHASES', desc: 'Compras', access: false },
    { code: 'REPORTING', desc: 'Reportes', access: true },
])

const onSelect = (e: any) => {
    emit('select', e.data)
}

</script>