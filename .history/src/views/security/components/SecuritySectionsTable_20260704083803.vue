<template>
  <div class="security-card">

    <!-- CABECERA -->
    <div class="section-header">

      <div class="flex align-items-center gap-3">

        <div class="section-icon">
          <i class="pi pi-sitemap"></i>
        </div>

        <div>

          <div class="text-xs text-500 uppercase font-semibold">
            Secciones del módulo
          </div>

          <div class="text-lg font-bold text-900">
            {{ props.module?.description || 'Seleccione un módulo' }}
          </div>

        </div>

      </div>

    </div>

    <!-- TABLA -->
    <DataTable
      :value="sections"
      v-model:selection="selected"
      selectionMode="single"
      @rowSelect="onSelect"
      scrollable
      scrollHeight="flex"
      class="p-datatable-sm custom-header-table flex-1"
    >

      <Column header="Secciones disponibles">

        <template #body="slotProps">

          <div class="section-row">

            <div class="section-circle">
              <i :class="slotProps.data.icon"></i>
            </div>

            <div class="flex flex-column">

              <span class="font-semibold text-900">
                {{ slotProps.data.name }}
              </span>

              <small class="text-500">
                Configuración de seguridad
              </small>

            </div>

          </div>

        </template>

      </Column>

    </DataTable>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
    module?: any
}>()

const emit = defineEmits(['select'])

const selected = ref()
const sections = ref<any[]>([])

watch(
    () => props.module,
    (m) => {

        selected.value = null

        if (!m) {
            sections.value = []
            return
        }

        switch (m.module) {

            case 'SALES':

                sections.value = [
                    {
                        id: 1,
                        name: 'General de Ventas',
                        icon: 'pi pi-home'
                    },
                    {
                        id: 2,
                        name: 'Presupuestos',
                        icon: 'pi pi-file-edit'
                    },
                    {
                        id: 3,
                        name: 'Pedidos',
                        icon: 'pi pi-shopping-cart'
                    },
                    {
                        id: 4,
                        name: 'Facturación',
                        icon: 'pi pi-receipt'
                    }
                ]

                break

            case 'PRODUCTS':

                sections.value = [
                    {
                        id: 5,
                        name: 'General Productos',
                        icon: 'pi pi-box'
                    },
                    {
                        id: 6,
                        name: 'Familias',
                        icon: 'pi pi-tags'
                    },
                    {
                        id: 7,
                        name: 'Tarifas',
                        icon: 'pi pi-money-bill'
                    }
                ]

                break

            default:

                sections.value = []

        }

    },
    {
        immediate: true
    }
)

const onSelect = (e: any) => {
    emit('select', e.data)
}
</script>

<style scoped>


</style>