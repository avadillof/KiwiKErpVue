<template>
  <div class="h-full flex flex-column surface-card border-round-md border-1 surface-border shadow-sm">
    
    <div class="p-3 border-bottom-1 surface-border flex align-items-center justify-content-between">
      <h5 class="m-0 font-bold text-700">
        <i class="pi pi-folder-open text-primary mr-2"></i>Secciones
      </h5>
      <Badge :value="modules.length" severity="secondary" />
    </div>

    <DataTable
      :value="modules"
      stripedRows
      size="small"
      selectionMode="single"
      v-model:selection="selected"
      @rowSelect="onSelect"
      scrollable
      scrollHeight="flex"
      class="custom-header-table"
    >
      <Column field="name" header="Sección" class="font-medium">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i class="pi pi-file text-400 text-sm"></i>
            {{ slotProps.data.name }}
          </div>
        </template>
      </Column>

      <template #empty>
        <div class="text-center p-4 text-500">
          <i class="pi pi-inbox text-2xl mb-2"></i>
          <p>Selecciona un módulo para ver secciones</p>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  modules: any[] // Aquí vendrían tus secciones
}>()

const selected = defineModel<any>('selected')
const emit = defineEmits(['select'])

const onSelect = (e: any) => {
  emit('select', e.data)
}
</script>