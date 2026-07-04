<template>
  <div class="card p-0 border-round-lg shadow-sm border-1 surface-border h-full flex flex-column overflow-auto ">
    <div class="p-3 border-bottom-1 surface-border bg-surface-50">
      <span class="text-sm font-bold text-700 uppercase tracking-wider">
          {{ props.module?.desc || 'Seleccione una Sección' }}
      </span>
    </div>

    <DataTable 
      :value="sections" 
      selectionMode="single" 
      v-model:selection="selected" 
      @rowSelect="onSelect"
      scrollable 
      scrollHeight="flex" 
      class="p-datatable-sm custom-header-table"
    >
      <Column field="name" header="Secciones disponibles">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2 py-1">
            <i class="pi pi-chevron-right text-primary text-xs"></i>
            <span class="font-medium text-900">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>



</te<template>


    <div class="p-3 border-bottom-1 surface-border bg-surface-50">
      <span class="text-sm font-bold text-700 uppercase tracking-wider">
        {{ props.module?.desc || 'Seleccione una Sección' }}
      </span>
    </div>

    mplate>

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