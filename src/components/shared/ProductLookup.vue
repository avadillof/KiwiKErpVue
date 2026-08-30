<template>
  <InputGroup>
    <InputText :modelValue="label" readonly :placeholder="placeholder" :disabled="props.disabled" class="w-full" @click="open" />
    <Button icon="pi pi-search" severity="secondary" :disabled="props.disabled" @click="open" />
    <Button icon="pi pi-times" severity="danger" text :disabled="props.disabled" @click="clear" />
  </InputGroup>
  <Dialog v-model:visible="visible" modal header="Seleccionar producto" :style="{ width: '52vw', height: '58vh' }" class="kiwik-dialog product-lookup-dialog">
    <InputText v-model="search" autofocus placeholder="Buscar por código, descripción o código de barras..." class="w-full mb-3" @update:modelValue="searchProducts" />
    <Message v-if="error" severity="error" class="mb-3">{{ error }}</Message>
    <DataTable :value="items" lazy paginator :rows="rows" :totalRecords="total" :loading="loading" selectionMode="single" dataKey="pkid" @page="load($event.page)" @row-dblclick="select($event.data)" scrollable scrollHeight="34vh" class="product-lookup-table">
      <Column field="code" header="Código" style="min-width: 160px" />
      <Column field="description" header="Descripción" />
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import Dialog from 'primevue/dialog'; import InputGroup from 'primevue/inputgroup'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message';
const props = withDefaults(defineProps<{ modelValue: number | null; label?: string; placeholder?: string; rows?: number; disabled?: boolean }>(), { label: '', placeholder: 'Seleccionar producto...', rows: 20, disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: number | null]; selected: [product: any]; cleared: [] }>();
const visible = ref(false); const loading = ref(false); const items = ref<any[]>([]); const total = ref(0); const search = ref(''); const error = ref(''); let timer: ReturnType<typeof setTimeout> | undefined;
const load = async (page = 0) => { loading.value = true; error.value = ''; try { const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteProducts`, { params: { page, size: props.rows, query: search.value } }); items.value = data?.content ?? []; total.value = data?.totalElements ?? 0; } catch (requestError: any) { items.value = []; total.value = 0; error.value = requestError.response?.status === 404 ? 'El servicio de búsqueda de productos no está disponible. Reinicia el backend.' : (requestError.response?.data ?? 'No se pudieron cargar los productos.'); } finally { loading.value = false; } };
const open = () => { if (props.disabled) return; visible.value = true; load(); };
const clear = () => { if (props.disabled) return; emit('update:modelValue', null); emit('cleared'); };
const select = (product: any) => { emit('update:modelValue', product.pkid); emit('selected', product); visible.value = false; };
const searchProducts = (value: string | undefined) => { search.value = value ?? ''; clearTimeout(timer); timer = setTimeout(() => load(0), 300); };
</script>
