<template>


    <div class="p-3 border-bottom-1 surface-border bg-surface-50">
      <span class="text-sm font-bold text-700 uppercase tracking-wider">
        {{ props.module?.desc || 'Seleccione una Sección' }}
      </span>
    </div>

   
</template>

<style>
/* Sin "scoped" para asegurar que los selectores de PrimeVue se sobreescriban */
.custom-header-table .p-datatable-thead > tr > th {
    background-color: #c8ea4a !important; 
    color: #7fa608 !important;
    font-weight: 700 !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
}

.custom-header-table .p-datatable-tbody > tr:hover {
    background-color: var(--surface-100) !important;
}
</style>

<script setup lang="ts">

import { ref, watch } from 'vue'



const props = defineProps<{
    section: Object,
    module?: any
}>()


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