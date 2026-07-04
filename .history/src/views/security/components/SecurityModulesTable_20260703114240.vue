<template>
    <DataTable
        :value="modules"
        selectionMode="single"
        v-model:selection="selected"
        @rowSelect="onSelect"
    >
        <Column field="code" header="Código" />
        <Column field="desc" header="Descripción" />
        <Column field="access" header="Acceso" />
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