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

.security-card{
    height:100%;
    display:flex;
    flex-direction:column;
    background:white;
    border-radius:10px;
    overflow:hidden;
    border:1px solid var(--surface-border);
}

/* CABECERA */

.section-header{

    padding:1rem;

    border-bottom:1px solid var(--surface-border);

    background:linear-gradient(
        90deg,
        white,
        var(--surface-50)
    );

}

.section-icon{

    width:48px;
    height:48px;

    border-radius:50%;

    background:#c8ea4a;

    color:#6b8500;

    display:flex;
    justify-content:center;
    align-items:center;

    font-size:1.2rem;

}

/* FILAS */

.section-row{

    display:flex;

    align-items:center;

    gap:1rem;

    padding:.45rem 0;

}

.section-circle{

    width:38px;

    height:38px;

    border-radius:50%;

    background:var(--primary-50);

    color:var(--primary-color);

    display:flex;

    justify-content:center;

    align-items:center;

    flex-shrink:0;

}

/* CABECERA TABLA */

:deep(.custom-header-table .p-datatable-thead > tr > th){

    background:#c8ea4a !important;

    color:#6b8500 !important;

    font-weight:700;

}

/* HOVER */

:deep(.p-datatable-tbody > tr){

    cursor:pointer;

    transition:.2s;

}

:deep(.p-datatable-tbody > tr:hover){

    background:var(--surface-100);

}

/* SELECCIÓN */

:deep(.p-datatable-tbody > tr.p-highlight){

    background:var(--primary-50)!important;

}

/* QUITAR BORDE SUPERIOR TABLA */

:deep(.p-datatable){

    border:none;

}

/* SCROLL */

:deep(.p-datatable-wrapper){

    flex:1;

}
</style>


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