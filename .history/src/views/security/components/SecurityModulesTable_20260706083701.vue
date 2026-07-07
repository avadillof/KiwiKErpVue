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
      class="custom-header-table"
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
           <ToggleSwitch
            :modelValue="slotProps.data.active"
            @update:modelValue="toggleModule(slotProps.data, $event)"
          />

            <span
               class="text-xs font-bold px-2 py-1 border-round-md transition-colors"
              :class="slotProps.data.active ? '' : ''"
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


import { updateModuleUser } from '@/services/Frm_Security/SecurityService.ts'

/**
 * =========================
 * PROPS (DATOS EXTERNOS)
 * =========================
 */
const props = defineProps<{
   modules: Array,
    selected: Object,
    userPk: Number
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
    ENTITIES: 'pi pi-building',
    SALES: 'pi pi-shopping-cart',
    PRODUCTS: 'pi pi-box',
    PURCHASES: 'pi pi-wallet',
    REPORTING: 'pi pi-chart-bar',
    SITES: 'pi pi-bullseye',
    MANUFACTER: 'pi pi-hammer',
    MESSAGES: 'pi pi-comments',
    DOCUMENTUM: 'pi pi-book',
    INVENTARY: 'pi pi-barcode',
  }

  return icons[code] || 'pi pi-cog'
}


const toggleModule = async (module: any, value: boolean) => {

    try {

        const response = await fetch(
            `${import.meta.env.VITE_API_URL}/WebSetSecurityModuleUser`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userPk: userPk.value,
                    securityPk: module.securityPk,
                    active: value
                })
            }
        )

        if (!response.ok) {
            throw new Error()
        }

        module.active = value

    } catch (e) {

        // opcional Toast

    }

}

</script>

