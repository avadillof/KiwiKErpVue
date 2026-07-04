<template>
  <div class="card p-0 border-round-lg shadow-sm border-1 surface-border overflow-hidden">
    <DataTable 
      :value="modules" 
      stripedRows 
      size="small" 
      selectionMode="single"
      v-model:selection="selected" 
      @rowSelect="onSelect"
      scrollable 
      scrollHeight="flex" 
      class="p-datatable-sm custom-header-table"
    >
      <Column field="code" header="Módulo" class="w-4">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i :class="getModuleIcon(slotProps.data.code)" class="text-primary"></i>
            <span class="font-semibold text-900">{{ slotProps.data.code }}</span>
          </div>
        </template>
      </Column>

      <Column field="desc" header="Descripción" class="text-600" />

      <Column field="access" header="Estado" class="text-center">
        <template #body="slotProps">
          <div class="flex justify-content-center">
            <Tag 
              :value="slotProps.data.access ? 'HABILITADO' : 'BLOQUEADO'" 
              :severity="slotProps.data.access ? 'success' : 'secondary'"
              :icon="slotProps.data.access ? 'pi pi-check-circle' : 'pi pi-lock'"
              rounded
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['select'])
const selected = ref()

const modules = ref([
    { code: 'SALES', desc: 'Gestión completa de ventas y facturación', access: true },
    { code: 'PRODUCTS', desc: 'Catálogo y control de inventario', access: true },
    { code: 'PURCHASES', desc: 'Órdenes de compra y proveedores', access: false },
    { code: 'REPORTING', desc: 'Analíticas y cuadros de mando', access: true },
])

// Helper para iconos dinámicos
const getModuleIcon = function(code: string): string {
    const icons: Record<string, string> = {
        'SALES': 'pi pi-shopping-cart',
        'PRODUCTS': 'pi pi-box',
        'PURCHASES': 'pi pi-wallet',
        'REPORTING': 'pi pi-chart-bar'
    };
    return icons[code] || 'pi pi-cog';
};

const onSelect = function(e: any): void {
    emit('select', e.data)
}
</script>

<style scoped>
/* Transición suave al seleccionar */
:deep(.p-datatable-tbody > tr.p-highlight) {
    background: var(--primary-50) !important;
    color: var(--primary-900) !important;
}
</style>