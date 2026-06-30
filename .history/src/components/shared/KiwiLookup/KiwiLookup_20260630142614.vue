<template>
    <div class="w-full">

        <!-- Input -->
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
                v-if="modelValue !== null && modelValue !== undefined"
                icon="pi pi-times"
                severity="danger"
                outlined
                @click="clearSelection"
            />
        </InputGroup>

        <!-- Dialog -->
        <Dialog v-model:visible="visible" modal :header="title" :style="{ width: width }">

            <DataTable
                :value="items"
                paginator
                :rows="rows"
                filterDisplay="row"
                stripedRows
                responsiveLayout="scroll"
                selectionMode="single"
                dataKey="__kiwi_key__"
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
   PROPS (GENÉRICO REAL)
========================= */
const props = defineProps({
    modelValue: {
        type: [String, Number, Object, null] as PropType<any>,
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
        default: 'description'
    },

    valueField: {
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
        default: 15
    }
});

/* =========================
   EMIT
========================= */
const emit = defineEmits(['update:modelValue']);

/* =========================
   STATE
========================= */
const visible = ref(false);

/* =========================
   DISPLAY VALUE (GENÉRICO)
========================= */
const displayText = computed(() => {

    const id = props.modelValue;

    if (id === null || id === undefined) return '';

    const found = props.items.find((item: any) =>
        resolveField(item, props.valueField) === id
    );

    return found ? resolveField(found, props.displayField) : '';
});

/* =========================
   HELPERS (GENÉRICOS)
========================= */
function resolveField(obj: any, path: string): any {
    if (!obj || !path) return '';

    return path.split('.').reduce((acc, key) => {
        return acc ? acc[key] : undefined;
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
    const value = resolveField(event.data, props.valueField);
    emit('update:modelValue', value);
    visible.value = false;
}

</script>