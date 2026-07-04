<template>
  <div class="h-full overflow-hidden flex flex-column">
    <DataTable
      :value="modules"
      stripedRows
      size="small"
      selectionMode="single"
      dataKey="securityPk"
      v-model:selection="selected"
      @rowSelect="onSelect"
      scrollable
      scrollHeight="flex"
      class="p-datatable-sm"
    >
      <Column field="module" header="Módulo">
        <template #body="slotProps">
          <div class="flex align-items-center gap-3">
            <div class="w-2rem h-2rem flex align-items-center justify-content-center border-circle surface-200">
                <i :class="getModuleIcon(slotProps.data.module)" class="text-primary text-sm"></i>
            </div>
            <span class="font-bold text-700">{{ slotProps.data.module }}</span>
          </div>
        </template>
      </Column>

      <Column header="Acceso" class="text-center">
        <template #body="slotProps">
          <Badge 
            :value="slotProps.data.active ? 'HABILITADO' : 'BLOQUEADO'" 
            :severity="slotProps.data.active ? 'success' : 'secondary'"
            class="px-2 py-1 font-semibold text-xs border-round-md" 
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">

/**
 * =========================
 * PROPS (DATOS EXTERNOS)
 * =========================
 */
const props = defineProps<{
  modules: any[]
}>()

/**
 * =========================
 * SELECCIÓN CONTROLADA
 * =========================
 */
const selected = defineModel<any>('selected')

const emit = defineEmits(['select'])

/**
 * =========================
 * EVENTO SELECCIÓN
 * =========================
 */
const onSelect = (e: any) => {
  emit('select', e.data)
}

/**
 * =========================
 * ICONOS POR MÓDULO
 * =========================
 */
const getModuleIcon = (code: string): string => {
  const icons: Record<string, string> = {
    SALES: 'pi pi-shopping-cart',
    PRODUCTS: 'pi pi-box',
    PURCHASES: 'pi pi-wallet',
    REPORTING: 'pi pi-chart-bar'
  }

  return icons[code] || 'pi pi-cog'
}

</script>

<style scoped>


</style>