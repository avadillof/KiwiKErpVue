<template>
    <DataTable
        :value="tableData"
        :totalRecords="totalRecords"
        :virtualScrollerOptions="virtualScrollerOptions"
        :loading="loading"
        lazy
        scrollable
        scrollHeight="100px"
        dataKey="id"
    >
        <slot />
    </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{
    endpoint: string;
    selection?: any;
}>();

const tableData = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const isFetching = ref(false);
const loadedPages = ref<number[]>([]);

async function fetchData(first: number, rows: number) {

    if (
        typeof first !== 'number' ||
        isNaN(first) ||
        first < 0 ||
        typeof rows !== 'number' ||
        isNaN(rows) ||
        rows <= 0
    ) {
        console.warn('Parámetros inválidos', { first, rows });
        return;
    }

    const page = Math.floor(first / rows);

    if (isFetching.value || loadedPages.value.includes(page)) {
        return;
    }

    isFetching.value = true;
    loading.value = true;

    try {

        const response = await axios.get(props.endpoint, {
            params: {
                page,
                size: rows
            }
        });

        const { totalElements, content } = response.data;

        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            tableData.value = new Array(totalElements).fill(null);
            loadedPages.value = [];
        }

        content.forEach((item: any, index: number) => {
            const position = first + index;

            if (position < tableData.value.length) {
                tableData.value[position] = item;
            }
        });

        loadedPages.value.push(page);

    } catch (error) {

        console.error('Error cargando datos', error);

    } finally {

        isFetching.value = false;
        loading.value = false;

    }
}

const virtualScrollerOptions = computed(() => ({
    lazy: true,
    itemSize: 50,
    delay: 300,

    // Si showLoader te da problemas,
    // déjalo desactivado y usa sólo :loading del DataTable
    showLoader: false,

    onLazyLoad: (event: any) => {

        console.log('Lazy event', event);

        const first = event?.first ?? 0;

        const rows =
            event?.rows ??
            (event?.last
                ? event.last - first
                : 50);

        fetchData(first, rows);
    }
}));
</script>