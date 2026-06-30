<template>
    <div class="w-full kiwi-lookup-pro">

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
                        selectionMode="single" :dataKey="dataKey" @row-dblclick="selectRow" class="p-datatable-sm">

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
                        <Button label="Limpiar" icon="pi pi-times" severity="danger" text @click="clearSelection" />
                        <Button label="Cerrar" icon="pi pi-check" @click="visible = false" />
                    </div>
                </div>
            </template>

        </Dialog>

    </div>



    
</template>

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