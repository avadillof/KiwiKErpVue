<template>
    <div class="w-full kiwi-lookup-pro">

        <!-- INPUT PRINCIPAL -->
        <InputGroup>

            <template v-if="mode === 'dialog'">

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

            </template>

            <template v-else>

                <AutoComplete
                    v-model="internalText"
                    :suggestions="filteredItems"
                    @complete="onSearch"
                    :field="displayField"
                    forceSelection
                    class="w-full"
                    @item-select="onSelectAutocomplete"
                />

            </template>

        </InputGroup>

        <!-- SECONDARY TEXT -->
        <small v-if="secondaryText" class="text-500 block mt-1 pl-1">
            {{ secondaryText }}
        </small>

        <!-- DIALOG -->
        <Dialog
            v-model:visible="visible"
            modal
            :style="{ width: width, height: '85vh' }"
            class="kiwik-dialog"
            :dismissableMask="true"
        >

            <template #header>
                <div class="flex align-items-center gap-2 w-full">
                    <i class="pi pi-search text-primary"></i>
                    <div>
                        <div class="font-bold text-lg">{{ title }}</div>
                        <small class="text-500">Selecciona un registro</small>
                    </div>
                </div>
            </template>

            <div class="mb-3">
                <InputText v-model="globalFilter" placeholder="Buscar..." class="w-full" />
            </div>

            <DataTable
                :value="filteredItems"
                paginator
                :rows="rows"
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

            <template #footer>
                <div class="flex justify-content-between w-full">
                    <small class="text-500">{{ filteredItems.length }} registros</small>
                    <Button label="Cerrar" icon="pi pi-times" @click="visible = false" />
                </div>
            </template>

        </Dialog>

    </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { KiwiLookupColumn } from './KiwiLookupColumn'

/* =========================
   PROPS
========================= */
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

    displayField: { type: String, default: '' },
    secondaryField: { type: String, default: '' },
    dataKey: { type: String, default: 'id' },

    title: { type: String, default: 'Seleccionar' },
    placeholder: { type: String, default: 'Seleccione...' },
    width: { type: String, default: '70vw' },

    rows: { type: Number, default: 12 },

    mode: {
        type: String as PropType<'dialog' | 'autocomplete'>,
        default: 'dialog'
    }
})

const emit = defineEmits(['update:modelValue'])

/* =========================
   STATE
========================= */
const visible = ref(false)
const globalFilter = ref('')
const internalText = ref('')
const filteredItems = ref<any[]>([])

/* =========================
   SELECTED ITEM (SOLO LECTURA)
========================= */
const selectedItem = computed(() => {
    if (!props.modelValue) return null

    return props.items.find(i =>
        i?.[props.dataKey] === props.modelValue
    ) || null
})

/* =========================
   DISPLAY
========================= */
const displayText = computed(() => {
    const item = selectedItem.value
    if (!item) return ''

    return props.displayField
        ? resolveField(item, props.displayField)
        : item?.[props.dataKey]
})

const secondaryText = computed(() => {
    if (!props.secondaryField) return ''
    if (!selectedItem.value) return ''

    return resolveField(selectedItem.value, props.secondaryField)
})

const hasValue = computed(() =>
    props.modelValue !== null && props.modelValue !== undefined
)

/* =========================
   AUTOCOMPLETE SEARCH
========================= */
function onSearch(event: any) {
    const q = event.query?.toLowerCase() || ''

    filteredItems.value = props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
    )
}

/* =========================
   AUTOCOMPLETE SELECT
========================= */
function onSelectAutocomplete(event: any) {
    emit('update:modelValue', event.value?.[props.dataKey])
}

/* =========================
   DIALOG SELECT
========================= */
function selectRow(event: any) {
    emit('update:modelValue', event.data?.[props.dataKey])
    visible.value = false
}

/* =========================
   CLEAR
========================= */
function clearSelection() {
    emit('update:modelValue', null)
}

/* =========================
   OPEN
========================= */
function openDialog() {
    visible.value = true
}

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
   SYNC AUTOCOMPLETE TEXT
========================= */
watch(selectedItem, (val) => {
    if (!val) {
        internalText.value = ''
        return
    }

    internalText.value = props.displayField
        ? resolveField(val, props.displayField)
        : val?.[props.dataKey]
}, { immediate: true })
</script>