<template>
    <div>

        <DataTable :value="sections" selectionMode="single" v-model:selection="selected" @rowSelect="onSelect"
            scrollable 
            scrollHeight="flex" 
            class="security-table h-full">
            <Column field="name" header="Sección" />
        </DataTable>

    </div>
</template>

<script setup lang="ts">

import { ref, watch } from 'vue'

const props = defineProps({
    module: Object
})

const emit = defineEmits(['select'])

const selected = ref()
const sections = ref<any[]>([])

watch(() => props.module, (m) => {

    selected.value = null

    if (!m) {
        sections.value = []
        return
    }

    if (m.code === 'SALES') {
        sections.value = [
            { id: 1, name: 'General Ventas' },
            { id: 2, name: 'Presupuestos' },
            { id: 3, name: 'Pedidos' },
        ]
    }

    if (m.code === 'PRODUCTS') {
        sections.value = [
            { id: 4, name: 'General Productos' },
            { id: 5, name: 'Familias' },
        ]
    }

})

const onSelect = (e: any) => {
    emit('select', e.data)
}

</script>