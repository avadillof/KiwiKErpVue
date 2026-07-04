<template>
    <DataTable :value="permissions">

        <Column field="desc" header="Permiso" />

        <Column header="Activo">
            <template #body="slotProps">
                <ToggleSwitch v-model="slotProps.data.active" />
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