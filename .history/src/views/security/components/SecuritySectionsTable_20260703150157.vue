<template>
  <div class="card p-0 border-round-lg shadow-sm border-1 surface-border h-full flex flex-column overflow-auto" s>
    <div class="p-3 border-bottom-1 surface-border bg-surface-50">
      <span class="text-sm font-bold text-700 uppercase tracking-wider">
        {{ props.module?.desc || 'Seleccione un módulo' }}
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

const props = defineProps<{
    module?: any
}>()

const emit = defineEmits(['select'])

const selected = ref()
const sections = ref<any[]>([])

// Cambiamos el watch a función tradicional
watch(
    function() { return props.module; },
    function(m) {
        selected.value = null

        if (!m) {
            sections.value = []
            return
        }

        if (m.code === 'SALES') {
            sections.value = [
                { id: 1, name: 'General Ventas', icon: 'pi pi-home' },
                { id: 2, name: 'Presupuestos', icon: 'pi pi-file-edit' },
                { id: 3, name: 'Pedidos', icon: 'pi pi-shopping-bag' },
            ]
        } else if (m.code === 'PRODUCTS') {
            sections.value = [
                { id: 4, name: 'General Productos', icon: 'pi pi-box' },
                { id: 5, name: 'Familias', icon: 'pi pi-tags' },
            ]
        }
    }
)

const onSelect = function(e: any): void {
    emit('select', e.data)
}
</script>

<style scoped>
/* Estilo limpio para la tabla sin bordes innecesarios */
:deep(.p-datatable .p-datatable-tbody > tr) {
    transition: background 0.2s;
    cursor: pointer;
}

:deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background: var(--surface-100);
}

:deep(.p-datatable .p-datatable-tbody > tr.p-highlight) {
    background: var(--primary-50) !important;
}
</style>