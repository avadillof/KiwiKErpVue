<template>
    <DataTable 
    :value="permissions" 
    scrollable 
    scrollHeight="flex" 
    class="p-datatable-sm custom-header-table"
>
    <Column field="desc" header="Permiso / Acción" />

    <Column header="Estado" class="w-4">
        <template #body="slotProps">
            <div class="flex align-items-center gap-3">
                <ToggleSwitch v-model="slotProps.data.active" />
                <span 
                    class="text-sm font-medium transition-colors duration-200"
                    :class="slotProps.data.active ? 'text-primary' : 'text-500'"
                >
                    {{ slotProps.data.active ? 'HABILITADO' : 'BLOQUEADO' }}
                </span>
            </div>
        </template>
    </Column>
</DataTable>
</template>



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