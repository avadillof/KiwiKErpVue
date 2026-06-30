<template>
    <div class="w-full kiwi-lookup">

        <!-- INPUT -->
        <InputGroup class="kiwi-lookup-input">
            <InputText
                :modelValue="displayText"
                :placeholder="placeholder"
                readonly
                class="w-full"
                @click="openDialog"
            />

            <Button
                icon="pi pi-search"
                severity="secondary"
                @click="openDialog"
            />

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
            class="kiwi-lookup-dialog"
        >

            <DataTable
                :value="items"
                paginator
                :rows="rows"
                stripedRows
                responsiveLayout="scroll"
                selectionMode="single"
                :dataKey="dataKey"
                @row-dblclick="selectRow"
                class="kiwi-lookup-table"
            >

                <Column
                    v-for="col in columns"
                    :key="col.field"
                    :field="col.field"
                    :header="col.header"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="kiwi-cell">
                            {{ resolveField(data, col.field) }}
                        </span>
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
        default: 'description'
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
});

const emit = defineEmits(['update:modelValue']);

const visible = ref(false);

/* =========================
   VALUE STATE
========================= */

const hasValue = computed(() =>
    props.modelValue !== null && props.modelValue !== undefined
);

/* =========================
   DISPLAY TEXT
========================= */

const displayText = computed(() => {

    if (!props.modelValue) return '';

    const found = props.items.find((item: any) =>
        item?.[props.dataKey] === props.modelValue
    );

    return found ? resolveField(found, props.displayField) : '';
});

/* =========================
   FIELD RESOLVER (AQUÍ ESTÁ LA MAGIA)
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

    emit('update:modelValue', row?.[props.dataKey]);
    visible.value = false;
}
</script>

<style scoped>
.kiwi-lookup-input input {
    cursor: pointer;
}

.kiwi-lookup-dialog :deep(.p-dialog-content) {
    padding: 0;
}

.kiwi-cell {
    display: inline-block;
    padding: 2px 0;
}
</style>