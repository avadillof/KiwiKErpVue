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
    fetchData(0, 150);
  }, { deep: true });

  
  async function fetchData(first: number, rows: number) {
    if (!props.endpoint) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
        // CORRECCIÓN 1: Eliminamos la restricción de isInitialLoad 
        // para permitir que el scroll siempre cargue datos si el índice es válido
        loading.value = true;
        try {
            const safeRows = rows || 50;
            const page = Math.floor(first / safeRows);
            
            const params = { page, size: safeRows, ...props.filters };
            const response = await axios.get(props.endpoint, { params });
            
            const total = response.data.totalElements || 0;
            const content = response.data.content || [];
            
            // CORRECCIÓN 2: Si el total cambia, reseteamos. 
            // Si no cambia, pero el scroll llega a una parte que es null, dejamos que cargue.
            if (totalRecords.value !== total) {
                totalRecords.value = total;
                data.value = new Array(total).fill(null);
            }
            
            // CORRECCIÓN 3: Actualización eficiente
            const newData = [...data.value];
            content.forEach((item: any, i: number) => {
                const index = first + i;
                if (index < newData.length) {
                    newData[index] = item;
                }
            });
            
            data.value = newData;
            isInitialLoad.value = false;
            emit('data-loaded', response.data.content);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            loading.value = false;
        }
    }, 200);
}
  </script>

