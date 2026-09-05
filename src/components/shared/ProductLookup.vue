<template>
  <InputGroup>
    <InputText :modelValue="label" readonly :placeholder="placeholder" :disabled="props.disabled" class="w-full" @click="open" />
    <Button icon="pi pi-search" severity="secondary" :disabled="props.disabled" @click="open" />
    <Button icon="pi pi-times" severity="danger" text :disabled="props.disabled" @click="clear" />
  </InputGroup>
  <Dialog v-model:visible="visible" :closable="!selecting" modal header="Seleccionar producto" :style="{ width: '52vw', height: '58vh' }" class="kiwik-dialog product-lookup-dialog">
    <InputText v-model="search" :disabled="selecting" autofocus placeholder="Buscar por código, descripción o código de barras..." class="w-full mb-3" @update:modelValue="searchProducts" />
    <Message v-if="error" severity="error" class="mb-3">{{ error }}</Message>
    <DataTable :value="items" lazy paginator :rows="rows" :totalRecords="total" :loading="loading || selecting" selectionMode="single" dataKey="pkid" @page="load($event.page)" @row-dblclick="select($event.data)" scrollable scrollHeight="34vh" class="product-lookup-table">
      <template #loading><CorporateLoader label="Cargando productos…" /></template>
      <Column field="code" header="Código" style="min-width: 160px" />
      <Column field="description" header="Descripción" />
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import CorporateLoader from './CorporateLoader.vue';
import { ref } from 'vue';
import axios from 'axios';
import Button from 'primevue/button'; import Column from 'primevue/column'; import DataTable from 'primevue/datatable'; import Dialog from 'primevue/dialog'; import InputGroup from 'primevue/inputgroup'; import InputText from 'primevue/inputtext'; import Message from 'primevue/message';
const props = withDefaults(defineProps<{ modelValue: number | null; label?: string; placeholder?: string; rows?: number; disabled?: boolean }>(), { label: '', placeholder: 'Seleccionar producto...', rows: 20, disabled: false });
const emit = defineEmits<{ 'update:modelValue': [value: number | null]; selected: [product: any]; cleared: [] }>();
const visible = ref(false); const loading = ref(false); const items = ref<any[]>([]); const total = ref(0); const search = ref(''); const error = ref(''); let timer: ReturnType<typeof setTimeout> | undefined;
let requestVersion = 0;
const selecting = ref(false);
const load = async (page = 0) => {
  const version = ++requestVersion;
  loading.value = true;
  error.value = '';
  items.value = [];
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteProducts`, {
      params: { page, size: props.rows, query: search.value }
    });
    if (version !== requestVersion) return;
    items.value = data?.content ?? [];
    total.value = data?.totalElements ?? 0;
  } catch (requestError: any) {
    if (version !== requestVersion) return;
    total.value = 0;
    error.value = 'No se pudieron cargar los productos.';
  } finally {
    if (version === requestVersion) loading.value = false;
  }
};
const open = () => {
  if (props.disabled || selecting.value) return;
  clearTimeout(timer);
  visible.value = true;
  void load();
};
const clear = () => {
  if (props.disabled || selecting.value) return;
  emit('update:modelValue', null);
  emit('cleared');
};
const select = async (product: any) => {
  if (props.disabled || loading.value || selecting.value) return;
  selecting.value = true;
  error.value = '';
  try {
    // La búsqueda identifica el producto; la línea usa su configuración actual.
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebGetSalesQuoteProduct/${product.pkid}`);
    emit('update:modelValue', data.pkid);
    emit('selected', data);
    visible.value = false;
  } catch (requestError: any) {
    error.value = requestError.response?.status === 404
      ? 'El producto ya no está disponible o falta actualizar el backend.'
      : 'No se pudo cargar la configuración actual del producto. Vuelve a intentarlo.';
  } finally {
    selecting.value = false;
  }
};
const searchProducts = (value: string | undefined) => {
  search.value = value ?? '';
  clearTimeout(timer);
  ++requestVersion;
  items.value = [];
  loading.value = true;
  timer = setTimeout(() => { void load(0); }, 300);
};
</script>

<style scoped>
:deep(.p-datatable-mask){background:rgba(255,255,255,.92);backdrop-filter:blur(2px)}
</style>
