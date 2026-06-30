<script setup lang="ts">

import { computed, ref } from 'vue';
import type { KiwiLookupColumn } from './KiwiLookupColumn';

interface Props {

    modelValue: any | null;

    items: any[];

    columns: KiwiLookupColumn[];

    title: string;

    displayFields?: string[];

    placeholder?: string;

    disabled?: boolean;

}

const props = defineProps<Props>();

const emit = defineEmits<{

    (e: 'update:modelValue', value: any | null): void;

    (e: 'change', value: any | null): void;

}>();

const visible = ref(false);

const displayText = computed(() => {

    if (!props.modelValue)
        return "";

    if (!props.displayFields?.length)
        return "";

    return props.displayFields
        .map(f => props.modelValue[f])
        .filter(Boolean)
        .join(" - ");

});

function open() {

    if (props.disabled)
        return;

    visible.value = true;

}

function close() {

    visible.value = false;

}

</script>

<template>

    <div class="flex gap-2">

        <InputText
            class="w-full"
            :modelValue="displayText"
            readonly
            :placeholder="placeholder"
        />

        <Button
            icon="pi pi-search"
            severity="secondary"
            @click="open"
        />

    </div>

    <Dialog
        v-model:visible="visible"
        :header="title"
        modal
        style="width:70rem"
    >

        Aquí irá el DataTable.

    </Dialog>

</template>