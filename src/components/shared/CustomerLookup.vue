<template>
  <InputGroup><InputText :id="props.id" :modelValue="label" readonly :disabled="props.disabled" class="w-full" @click="open" /><Button icon="pi pi-search" severity="secondary" :disabled="props.disabled" aria-label="Buscar cliente" @click="open" /><Button icon="pi pi-times" severity="danger" text :disabled="props.disabled" aria-label="Quitar cliente" @click="clear" /></InputGroup>
  <Dialog v-model:visible="visible" modal header="Seleccionar cliente" :style="{ width: '52vw', height: '58vh' }" class="kiwik-dialog">
    <InputText v-model="search" autofocus placeholder="Buscar por código, nombre o NIF..." class="w-full mb-3" @update:modelValue="searchCustomers" />
    <DataTable :value="items" lazy paginator :rows="20" :totalRecords="total" :loading="loading" selectionMode="single" dataKey="pkid" @page="load($event.page)" @row-dblclick="select($event.data)" scrollable scrollHeight="34vh">
      <Column field="code" header="Código" style="min-width: 160px" /><Column field="name" header="Descripción" />
    </DataTable>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue'; import axios from 'axios'; import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import Dialog from 'primevue/dialog'; import InputGroup from 'primevue/inputgroup'; import InputText from 'primevue/inputtext';
const props = withDefaults(defineProps<{ id?: string; modelValue: number | null; label?: string; disabled?: boolean }>(), { disabled: false }); const emit = defineEmits<{ 'update:modelValue': [value: number | null]; selected: [customer: any] }>();
const visible = ref(false), loading = ref(false), items = ref<any[]>([]), total = ref(0), search = ref(''); let timer: ReturnType<typeof setTimeout> | undefined;
const load = async (page = 0) => { loading.value = true; try { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteCustomers`, { params: { page, size: 20, query: search.value } }); items.value = data?.content ?? []; total.value = data?.totalElements ?? 0; } finally { loading.value = false; } };
const open = () => { if (props.disabled) return; visible.value = true; load(); }; const clear = () => { if (!props.disabled) emit('update:modelValue', null); }; const select = (customer: any) => { emit('update:modelValue', customer.pkid); emit('selected', customer); visible.value = false; }; const searchCustomers = (value: string | undefined) => { search.value = value ?? ''; clearTimeout(timer); timer = setTimeout(() => load(0), 300); };
</script>
