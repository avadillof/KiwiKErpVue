<template>
    <div class="w-full kiwi-lookup-pro">

        <!-- INPUT -->
        <InputGroup>
            <InputText
                :modelValue="displayText"
                :placeholder="placeholder"
                readonly
                class="w-full"
                @click="openDialog"
            />

            <Button icon="pi pi-search" severity="secondary" @click="openDialog" />
            <Button icon="pi pi-times" severity="danger" text @click="clearSelection" />
        </InputGroup>

        <slot name="secondary" :item="selectedItem">
            <small v-if="secondaryText" class="text-500 block mt-1 pl-1 ml-3">
                {{ secondaryText }}
            </small>
        </slot>

        <!-- DIALOG -->
        <Dialog
            v-model:visible="visible"
            modal
            :style="{ width: width, height: '85vh' }"
            class="kiwik-dialog"
        >
            <template #header>
                <div class="w-full flex align-items-center justify-content-between gap-3">
                    <div class="flex align-items-center gap-2 w-full">
                        <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                             style="width: 36px; height: 36px;">
                            <i class="pi pi-search text-primary"></i>
                        </div>

                        <div class="flex flex-column flex-1">
                            <span class="font-bold text-lg">{{ title }}</span>
                            <small class="text-500">Selecciona un registro de la lista</small>
                        </div>
                    </div>
                </div>
            </template>

            <div class="kiwi-lookup-body">

                <!-- SEARCH -->
                <div class="lookup-search">
                    <InputGroup>
                        <InputText
                            v-model="search"
                            :placeholder="placeholder"
                            class="w-full"
                        />
                    </InputGroup>
                </div>

                <!-- TABLE -->
                <div class="lookup-table">
                    <DataTable
                        :value="filteredItems"
                        paginator
                        :rows="rows"
                        selectionMode="single"
                        v-model:selection="selectedRow"
                        :dataKey="dataKey"
                        @row-dblclick="selectRow"
                        scrollable
                        scrollHeight="flex"
                    >
                        <Column
                            v-for="col in columns"
                            :key="col.field"
                            :field="col.field"
                            :header="col.header"
                            sortable
                        >
                            <template #body="{ data }">
                                {{ resolveField(data, col.field) }}
                            </template>
                        </Column>
                    </DataTable>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-content-between align-items-center w-full">
                    <small class="text-500">{{ filteredItems.length }} registros</small>

                    <Button label="Cerrar" icon="pi pi-check" @click="visible = false" />
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


.kiwi-lookup-pro small {
    font-size: 0.75rem;
    line-height: 1.1rem;
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



.kiwi-lookup-body {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.lookup-search {
    flex: 0 0 auto;
    padding: 1rem;
}

.lookup-table {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.lookup-table :deep(.p-datatable) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
}

.lookup-table :deep(.p-datatable-wrapper) {
    flex: 1;
    overflow: auto;
}

:deep(.p-dialog-content) {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

:deep(.p-dialog-footer) {
    flex-shrink: 0;
}
</style>


<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { KiwiLookupColumn } from './KiwiLookupColumn'

const props = defineProps({
    modelValue: {
        type: [String, Number, Object, null] as PropType<string | number | null>,
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

    displayField: { type: String, default: '' },
    secondaryField: { type: String, default: '' },
    dataKey: { type: String, default: 'id' },

    title: { type: String, default: 'Seleccionar' },
    placeholder: { type: String, default: 'Seleccione...' },
    width: { type: String, default: '70vw' },
    rows: { type: Number, default: 12 }
})

const emit = defineEmits(['update:modelValue'])

/* =========================
   STATE
========================= */
const visible = ref(false)
const selectedItem = ref<any>(null)
const selectedRow = ref<any>(null)
const search = ref('')

/* =========================
   DISPLAY
========================= */
const displayText = computed(() => {
    if (!selectedItem.value) return ''

    return props.displayField
        ? resolveField(selectedItem.value, props.displayField)
        : selectedItem.value?.[props.dataKey]
})

const secondaryText = computed(() => {
    if (!props.secondaryField || !selectedItem.value) return ''
    return resolveField(selectedItem.value, props.secondaryField)
})

/* =========================
   FILTER
========================= */
const filteredItems = computed(() => {
    if (!search.value) return props.items

    const q = search.value.toLowerCase()

    return props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
    )
})

/* =========================
   SYNC SINGLE SOURCE OF TRUTH
========================= */
watch(
    () => props.modelValue,
    (val) => {
        if (!val) {
            selectedItem.value = null
            return
        }

        selectedItem.value =
            props.items.find(i => i?.[props.dataKey] === val) || null
    },
    { immediate: true }
)

watch(
    () => props.items,
    () => {
        if (!props.modelValue) return

        selectedItem.value =
            props.items.find(i => i?.[props.dataKey] === props.modelValue) || null
    },
    { deep: true }
)

/* =========================
   ACTIONS
========================= */
function openDialog() {
    visible.value = true
}

function clearSelection() {
    selectedItem.value = null
    selectedRow.value = null
    emit('update:modelValue', null)
}

function selectRow(event: any) {
    const row = event.data

    selectedItem.value = row
    emit('update:modelValue', row?.[props.dataKey])

    visible.value = false
}

/* =========================
   HELPERS
========================= */
function resolveField(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? ''
}
</script>





<style scoped>
.kiwi-lookup-pro input {
    cursor: pointer;
}
</style>