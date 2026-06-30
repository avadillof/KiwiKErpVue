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
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import type { KiwiLookupColumn } from './KiwiLookupColumn';

/* =========================
   PROPS
========================= */

const props = defineProps({

    modelValue: [String, Number, Object],

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

    valueMode: {
        type: String as PropType<'id' | 'object'>,
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
});

const emit = defineEmits(['update:modelValue']);

/* =========================
   STATE
========================= */

const visible = ref(false);
const globalFilter = ref('');

/* =========================
   COMPUTED
========================= */

const hasValue = computed(() =>
    props.modelValue !== null && props.modelValue !== undefined
);

/* FILTERED ITEMS */
const filteredItems = computed(() => {

    if (!globalFilter.value) return props.items;

    const q = globalFilter.value.toLowerCase();

    return props.items.filter(item =>
        JSON.stringify(item).toLowerCase().includes(q)
    );
});

/* DISPLAY TEXT */
const displayText = computed(() => {

    const value = props.modelValue;

    if (!value) return '';

    // CASO OBJETO
    if (typeof value === 'object') {
        return props.displayField
            ? resolveField(value, props.displayField)
            : value?.[props.dataKey];
    }

    // CASO ID
    const found = props.items.find(item =>
        item?.[props.dataKey] === value
    );

    return found
        ? (props.displayField
            ? resolveField(found, props.displayField)
            : found?.[props.dataKey])
        : '';
});

/* =========================
   HELPERS
========================= */

function resolveField(obj: any, path: string): any {
    if (!obj || !path) return '';

    return path.split('.').reduce((acc, key) => {
        return acc ? acc[key] : '';
    }, obj);
}

/* =========================
   ACTIONS
========================= */

function openDialog() {
    visible.value = true;
}

function clearSelection() {
    emit('update:modelValue', null);
}

function selectRow(event: any) {

    const row = event.data;

    if (props.valueMode === 'object') {
        emit('update:modelValue', row);
    } else {
        emit('update:modelValue', row?.[props.dataKey]);
    }

    visible.value = false;
}
</script>

<style scoped>
.kiwi-lookup-pro input {
    cursor: pointer;
}
</style>