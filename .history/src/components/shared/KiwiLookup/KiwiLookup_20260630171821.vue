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

        <!-- SECONDARY -->
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

            <!-- HEADER -->
            <template #header>
                <div class="w-full flex align-items-center gap-2">

                    <div class="flex align-items-center justify-content-center bg-primary-100 border-circle"
                        style="width: 36px; height: 36px;">
                        <i class="pi pi-search text-primary"></i>
                    </div>

                    <div class="flex flex-column flex-1">
                        <span class="font-bold text-lg">{{ title }}</span>
                        <small class="text-500">Selecciona un registro de la lista</small>
                    </div>

                </div>
            </template>

            <!-- BODY -->
            <div class="kiwi-lookup-body">

                <!-- SEARCH -->
                <div class="mb-3">
                    <InputText v-model="globalFilter" placeholder="Buscar..." class="w-full" />
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

            </div>

            <!-- FOOTER -->
            <template #footer>
                <div class="w-full flex justify-content-between align-items-center">

                    <small class="text-500">
                        {{ filteredItems.length }} registros
                    </small>

                    <Button label="Cerrar" icon="pi pi-times" @click="visible = false" />
                </div>
            </template>

        </Dialog>

    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
    rows: { type: Number, default: 12 }
})

const emit = defineEmits(['update:modelValue'])

/* =========================
   STATE
========================= */
const visible = ref(false)
const globalFilter = ref('')

/* =========================
   VALUE STATE
========================= */
const hasValue = computed(() =>
    props.modelValue !== null && props.modelValue !== undefined
)

/* =========================
   SELECTED ITEM (SOLO LECTURA)
========================= */
const selectedItem = computed(() => {
    if (!props.modelValue) return null

    return props.items.find(item =>
        item?.[props.dataKey] === props.modelValue
    ) || null
})

/* =========================
   DISPLAY TEXT
========================= */
const displayText = computed(() => {
    const item = selectedItem.value
    if (!item) return ''

    return props.displayField
        ? resolveField(item, props.displayField)
        : item?.[props.dataKey]
})

/* =========================
   SECONDARY TEXT
========================= */
const secondaryText = computed(() => {
    if (!props.secondaryField) return ''
    const item = selectedItem.value
    if (!item) return ''
    return resolveField(item, props.secondaryField)
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
    emit('update:modelValue', event.data?.[props.dataKey])
    visible.value = false
}
</script>