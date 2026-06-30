<template>
    <div class="class="kiwik-dialog"">

        <!-- INPUT -->
        <InputGroup>
            <InputText :modelValue="displayText" :placeholder="placeholder" readonly class="w-full"
                @click="openDialog" />

            <Button icon="pi pi-search" severity="secondary" @click="openDialog" />

            <Button v-if="hasValue" icon="pi pi-times" severity="danger" text @click="clearSelection" />
        </InputGroup>

        <!-- DIALOG -->
        <Dialog v-model:visible="visible" modal :style="{ width: width, height: '85vh' }" class="kiwik-dialog"
            :dismissableMask="true">

            <!-- HEADER CUSTOM -->
            <template #header>
                <div class="flex align-items-center gap-2">
                    <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                        style="width: 36px; height: 36px;">
                        <i class="pi pi-search text-primary"></i>
                    </div>

                    <div class="flex flex-column">
                        <span class="font-bold text-lg">{{ title }}</span>
                        <small class="text-500">Selecciona un registro de la lista</small>
                    </div>
                </div>
            </template>

            <div class="kiwi-lookup-body">

                <!-- SEARCH BAR -->
                <div class="lookup-search">
                    <InputGroup>
                        <InputText v-model="globalFilter" placeholder="Buscar..." class="w-full" />
                        <Button icon="pi pi-filter" severity="secondary" />
                    </InputGroup>
                </div>

                <!-- TABLE CONTAINER -->
                <div class="lookup-table">

                    <DataTable :value="filteredItems" paginator :rows="rows" stripedRows responsiveLayout="scroll"
                        selectionMode="single" :dataKey="dataKey" @row-dblclick="selectRow" class="compact-table" >

                        <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header"
                            sortable>
                            <template #body="{ data }">
                                {{ resolveField(data, col.field) }}
                            </template>
                        </Column>

                    </DataTable>

                </div>

            </div>

            <!-- FOOTER -->
            <template #footer>
                <div class="flex justify-content-between w-full">
                    <small class="text-500">
                        {{ filteredItems.length }} registros
                    </small>

                    <div class="flex gap-2">                            
                        <Button label="Cerrar" icon="pi pi-check" @click="visible = false" />
                    </div>
                </div>
            </template>

        </Dialog>

    </div>



    
</template>


<style scoped>
/* Contenedor principal con un poco más de aire */
.reset-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    gap: 0.75rem;
}

/* Las "stat-cards" ahora lucen como tarjetas flotantes */
.stats-row {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.stat-card {
    background: #ffffff;
    padding: 0.75rem;
    border-radius: 12px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.stat-card i {
    font-size: 1.5rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.03);
}


.stat-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.stat-label {
    margin: 0;
    font-size: 0.9rem;
    /* Un poco más grande que el default */
    color: #6b7280;
    /* Gris medio para no competir con el valor */
    font-weight: 500;
}

.stat-value {
    font-size: 1.2rem;
    /* Aquí está el tamaño grande que buscas */
    color: #111827;
    /* Gris muy oscuro/casi negro para máxima legibilidad */
    line-height: 1.2;
    margin-top: 0.25rem;
}

/* Grid principal con separación limpia */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.65fr;
    gap: 0.5rem;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

/* Paneles con estética Glass-morphism sutil */
.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    flex: 1;
}

/* Tipografía de encabezados */
h4 {
    color: #374151;
    font-size: 1rem;
    letter-spacing: -0.01em;
    margin: 0 0 1rem 0 !important;
}

.chart-container {
    flex: 1;
    /* Esto le da un 50% más de peso vertical que a otros elementos hermanos si los hubiera */
    min-height: 400px;
    /* <--- Esto es lo que realmente "alarga" la gráfica */
    position: relative;
    width: 100%;

}

.table-container-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Badge de fecha más estilizado */
.date-badge {
    background: #f3f4f6;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4b5563;

}



.custom-select-sm {
  height: 1.5rem !important;
  min-width: 4rem !important;
  display: flex;
  align-items: center;
  border-radius: 4px !important;
}

</style>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { KiwiLookupColumn } from './KiwiLookupColumn'
const selectedItem = ref<any>(null);

const props = defineProps({
    modelValue: {
        type: [String, Number, Object, null] as PropType<
            string | number | Record<string, any> | null
        >,
        default: null
    },

    items: {
        type: Array as PropType<any[]>,
        default: () => []
    },

    columns: {
        type: Array as PropType<KiwiLookupColumn[]>,
        default: () => []
    },

    displayField: {
        type: String,
        default: ''
    },

    dataKey: {
        type: String,
        default: 'id'
    },

    title: {
        type: String,
        default: 'Seleccionar'
    },

    placeholder: {
        type: String,
        default: 'Seleccione...'
    },

    width: {
        type: String,
        default: '70vw'
    },

    rows: {
        type: Number,
        default: 12
    }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)
const globalFilter = ref('')

/* =========================
   VALUE STATE SAFE
========================= */
const hasValue = computed(() =>
    props.modelValue !== null && props.modelValue !== undefined
)

/* =========================
   DISPLAY VALUE (FIX IMPORTANTE)
========================= */
const displayText = computed(() => {

    if (selectedItem.value) {
        return props.displayField
            ? resolveField(selectedItem.value, props.displayField)
            : selectedItem.value?.[props.dataKey]
    }

    const value = props.modelValue
    if (!value) return ''

    const found = props.items.find(item =>
        item?.[props.dataKey] === value
    )

    if (found) {
        selectedItem.value = found
    }

    return found
        ? (props.displayField
            ? resolveField(found, props.displayField)
            : found?.[props.dataKey])
        : ''
})

/* =========================
   FILTER
========================= */
const filteredItems = computed(() => {
    if (!globalFilter.value) return props.items

    const q = globalFilter.value.toLowerCase()

    return props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
    )
})

/* =========================
   HELPERS
========================= */
function resolveField(obj: any, path: string) {
    if (!obj || !path) return ''

    return path.split('.').reduce((acc, key) => {
        return acc ? acc[key] : ''
    }, obj)
}

/* =========================
   ACTIONS
========================= */
function openDialog() {
    visible.value = true
}

function clearSelection() {
    emit('update:modelValue', null)
}

function selectRow(event: any) {
    const row = event.data

    selectedItem.value = row

    emit('update:modelValue', row?.[props.dataKey])

    visible.value = false
}

/* =========================
   FIX CRÍTICO UX
   (recalcular cuando cambian items)
========================= */
watch(() => props.items, () => {
    // fuerza reactividad del displayText cuando llegan datos async
}, { deep: true })

watch(() => props.modelValue, (val) => {

    if (!val) {
        selectedItem.value = null
        return
    }

    const found = props.items.find(item =>
        item?.[props.dataKey] === val
    )

    if (found) {
        selectedItem.value = found
    }
})


</script>

<style scoped>
.kiwi-lookup-pro input {
    cursor: pointer;
}
</style>