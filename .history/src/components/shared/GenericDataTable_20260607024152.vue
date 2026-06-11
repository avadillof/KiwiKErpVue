  <template>
    <DataTable 
      :value="cleanData" 
      :totalRecords="totalRecords" 
      lazy 
      :loading="loading"
      :virtualScrollerOptions="virtualScrollerOptions"
      scrollable 
      v-bind="$attrs"
      selectionMode="single"
      dataKey="id" 
      :selection="selection"
      @update:selection="(val) => emit('update:selection', val)"
    >
      <template #header>
        <slot name="header"></slot>
      </template>
      
      <slot></slot>
    </DataTable>
  </template>

  <script setup lang="ts" generic="T extends object">
  import { ref, watch, onUnmounted, computed } from 'vue';
  import axios from 'axios';
  import DataTable from 'primevue/datatable';

  const props = defineProps<{
    endpoint: string;
    filters?: Record<string, any>;
    selection?: any; // Añade esta prop
  }>();

  const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);
  const data = ref<any[]>([]);
  const totalRecords = ref(0);
  const loading = ref(false);
  const isInitialLoad = ref(true);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // Protección para el renderizado: filtramos los nulos para que el DataTable
  // no intente pintar filas vacías mientras se hace scroll
  const cleanData = computed(() => data.value.filter((item) => item !== null));

  const virtualScrollerOptions = {
    lazy: true,
    itemSize: 50,
    delay: 200,
    onLazyLoad: (event: any) => {
      emit('lazy-load', event); // Emitimos el evento hacia afuera
      fetchData(event.first ?? 0, event.rows ?? 50);
    },
  };

  onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
  });

  watch(() => props.filters, () => {
    isInitialLoad.value = true;
    fetchData(0, 50);
  }, { deep: true });

  
  }
  </script>

