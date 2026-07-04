<template>
  <div class="card p-0 border-round-lg shadow-sm border-1 surface-border overflow-auto mt-2 md-2 ml-2 mr-2">

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
      class="p-datatable-sm custom-header-table"
    >

      <!-- MÓDULO -->
      <Column field="module" header="Módulo" class="w-4">
        <template #body="slotProps">
          <div class="flex align-items-center gap-2">
            <i :class="getModuleIcon(slotProps.data.module)" class="text-primary"></i>
            <span class="font-semibold text-900">
              {{ slotProps.data.module }}
            </span>
          </div>
        </template>
      </Column>

      <!-- DESCRIPCIÓN -->
      <Column field="description" header="Descripción" class="text-600" />

      <!-- ACCESO -->
      <Column header="Estado" class="text-center">
        <template #body="slotProps">
          <div class="flex justify-content-center align-items-center gap-2">

            <!-- SOLO VISUAL (NO MUTAR DATA) -->
            <ToggleSwitch :modelValue="slotProps.data.active" disabled />

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
/* ==========================================================
   CABECERA PREMIUM KIWIK ERP
========================================================== */

:deep(.custom-header-table .p-datatable-thead) {
    position: relative;
    z-index: 2;
    box-shadow: 0 4px 10px rgba(0, 0, 0, .08);
}

:deep(.custom-header-table .p-datatable-thead > tr > th) {

    background: linear-gradient(
        to bottom,
        #d9f46d 0%,
        #c8ea4a 55%,
        #bddf39 100%
    ) !important;

    color: #5e7f05 !important;

    font-weight: 700;
    font-size: .82rem;
    letter-spacing: .03em;
    text-transform: uppercase;

    border-top: 1px solid rgba(255,255,255,.85);
    border-bottom: 2px solid #9dbc28;
    border-right: 1px solid rgba(255,255,255,.35);

    box-shadow:
        inset 0 1px 0 rgba(255,255,255,.85),
        inset 0 -1px 0 rgba(0,0,0,.08);

    transition: all .15s ease;
}

/* Primera columna */
:deep(.custom-header-table .p-datatable-thead > tr > th:first-child) {
    border-top-left-radius: 2px;
}

/* Última columna */
:deep(.custom-header-table .p-datatable-thead > tr > th:last-child) {
    border-top-right-radius: 2px;
    border-right: none;
}

/* Hover sobre la cabecera */
:deep(.custom-header-table .p-datatable-thead > tr > th:hover) {
    background: linear-gradient(
        to bottom,
        #e5fa89 0%,
        #d6ef63 60%,
        #c7e248 100%
    ) !important;
}

/* ==========================================================
   FILAS
========================================================== */

/* Hover */
:deep(.custom-header-table .p-datatable-tbody > tr:hover) {
    background: #f8fce8 !important;
    transition: background .15s ease;
}

/* Filas alternas */
:deep(.custom-header-table .p-datatable-tbody > tr:nth-child(even)) {
    background: #fcfcfc;
}

/* Fila seleccionada */
:deep(.custom-header-table .p-datatable-tbody > tr.p-highlight) {
    background: #eef9c6 !important;
    color: inherit !important;
}

/* Bordes */
:deep(.custom-header-table .p-datatable-tbody > tr > td) {
    border-color: #ececec;
}

/* ==========================================================
   ESQUINAS
========================================================== */

:deep(.custom-header-table) {
    border-radius: 4px;
    overflow: hidden;
}

</style>