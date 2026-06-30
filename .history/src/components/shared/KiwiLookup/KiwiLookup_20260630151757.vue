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

            <Button
                v-if="hasValue"
                icon="pi pi-times"
                severity="danger"
                text
                @click="clearSelection"
            />
        </InputGroup>

        <!-- DIALOG -->
        <Dialog
            v-model:visible="visible"
            modal
            :header="title"
            :style="{ width }"
        >

            <!-- SEARCH -->
            <div class="mb-3">
                <InputText
                    v-model="globalFilter"
                    placeholder="Buscar..."
                    class="w-full"
                />
            </div>

            <!-- TABLE -->
            <DataTable
                :value="filteredItems"
                paginator
                :rows="rows"
                stripedRows
                responsiveLayout="scroll"
                selectionMode="single"
                :dataKey="dataKey"
                @row-dblclick="selectRow"
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

        </Dialog>

    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { KiwiLookupColumn } from './KiwiLookupColumn'
const selectedItem = ref<any>(null)
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

    const value = props.modelValue

    if (value === null || value === undefined) return ''

    // Si viene objeto directo
    if (typeof value === 'object') {
        return props.displayField
            ? resolveField(value, props.displayField)
            : String(value?.[props.dataKey] ?? '')
    }

    // Si viene ID
    const found = props.items.find(item =>
        item?.[props.dataKey] === value
    )

    if (!found) return ''

    return props.displayField
        ? resolveField(found, props.displayField)
        : String(found?.[props.dataKey] ?? '')
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

</script>

<style scoped>
.kiwi-lookup-pro input {
    cursor: pointer;
}
</style>