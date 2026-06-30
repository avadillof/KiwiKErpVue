<template>
    <div class="w-full">

        <!-- Input -->
        <InputGroup>
            <InputText :modelValue="displayText" :placeholder="placeholder" readonly class="w-full"
                @click="openDialog" />

            <Button icon="pi pi-search" severity="secondary" @click="openDialog" />

            <Button v-if="modelValue" icon="pi pi-times" severity="danger" outlined @click="clearSelection" />
        </InputGroup>

        <!-- Dialog -->
        <Dialog v-model:visible="visible" modal :header="title" :style="{ width: width }">

            <DataTable :value="items" paginator :rows="rows" filterDisplay="row" stripedRows responsiveLayout="scroll"
                selectionMode="single" dataKey="id" @row-dblclick="selectRow">

                <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header" sortable>

                    <template #body="{ data }">
                        {{ data[col.field] }}
                    </template>

                </Column>

            </DataTable>

        </Dialog>

    </div>
</template>

<script setup lang="ts">

import { computed } from 'vue';
import { ref } from 'vue';
import type { PropType } from 'vue';

import type { KiwiLookupColumn } from './KiwiLookupColumn';

const props = defineProps({

    modelValue: Object,

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

const emit = defineEmits([
    'update:modelValue'
]);

const visible = ref(false);

const displayText = computed(() => {

    const id = props.modelValue;

    if (!id) return '';

    const found = props.items.find((i: any) =>
        i.salesTarifasPkId === id
    );

    return found?.[props.displayField] ?? '';
});


function getFieldValue(obj: any, path: string): any {

    if (!obj || !path) {
        return '';
    }

    return path.split('.').reduce((current, key) => {

        return current ? current[key] : '';

    }, obj);

}

function openDialog() {
    visible.value = true;
}

function clearSelection() {
    emit('update:modelValue', null);
}

function selectRow(event: any) {
    emit('update:modelValue', event.data.salesTarifasPkId);
    visible.value = false;
}

</script>