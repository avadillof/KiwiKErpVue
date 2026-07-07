<template>
  <div class="security-card">

    <!-- CABECERA -->
    <div class="section-header">

      <div class="flex align-items-center gap-3">

        <div>

          <div class="text-xs text-500 uppercase font-semibold">
            Secciones del módulo
          </div>

          <div class="text- font-bold text-900">
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
      class="custom-header-table flex-1"
    >

    <SecurityPermissions
      :section="selectedSection"
      :module="module"
    />

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
const selectedSection = ref(null)

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
    selectedSection.value = e.data
    emit('select', e.data)
}


const props = defineProps({
    module: Object,
    disabled: Boolean
})

</script>

<style scoped>

.security-card{
    height:100%;
    display:flex;
    flex-direction:column;
    border:1px solid var(--surface-border);
    border-radius:10px;
    overflow:hidden;
}

.section-header{
    padding:1rem;
    border-bottom:1px solid var(--surface-border);
}

.section-icon{
    width:48px;
    height:48px;
    border-radius:50%;
    background:#c8ea4a;
    color:#6b8500;

    display:flex;
    align-items:center;
    justify-content:center;
}

.section-row{
    display:flex;
    align-items:center;
    gap:1rem;
}

.section-circle{
    width:36px;
    height:36px;
    border-radius:50%;
    background:var(--primary-50);

    display:flex;
    align-items:center;
    justify-content:center;
}

</style>