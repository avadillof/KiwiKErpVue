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
    :metaKeySelection="false"
    dataKey="id" 
    :selection="selection"
    @update:selection="(val) => emit('update:selection', val)"
  >
    <slot></slot>
  </DataTable>
</template>

<script setup lang="ts" generic="T extends object">
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';

const props = defineProps<{ endpoint: string; selection?: any }>();
const emit = defineEmits(['data-loaded', 'lazy-load', 'update:selection']);

const data = ref<any[]>([]);
const totalRecords = ref(0);
const loading = ref(false);
const loadedPages = ref(new Set<number>());

const cleanData = computed(() => data.value.filter((item) => item !== null));

const virtualScrollerOptions = {
  lazy: true, itemSize: 50, delay: 200,
  onLazyLoad: (event: any) => { fetchData(event.first ?? 0, event.rows ?? 50); },
};

watch(() => props.endpoint, () => {
    data.value = [];
    loadedPages.value.clear();
    totalRecords.value = 0;
});

async function fetchData(first: number, rows: number) {
    const page = Math.floor(first / rows);
    if (loadedPages.value.has(page)) return;

    loading.value = true;
    try {
        const response = await axios.get(props.endpoint, { params: { page, size: rows } });
        const { totalElements, content } = response.data;
        
        if (totalRecords.value !== totalElements) {
            totalRecords.value = totalElements;
            data.value = new Array(totalElements).fill(null);
            loadedPages.value.clear();
        }
        
        loadedPages.value.add(page);
        let newData = [...data.value];
        content.forEach((item: any, i: number) => {
            const index = first + i;
            if (index < newData.length) newData[index] = item;
        });
        data.value = newData;
        emit('data-loaded', content);
    } catch (e) { console.error(e); } finally { loading.value = false; }
}
</script>