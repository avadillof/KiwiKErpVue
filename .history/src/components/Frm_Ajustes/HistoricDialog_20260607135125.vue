<template>
  <Dialog v-model:visible="visible" modal :header="'Análisis de Actividad para ' + selectedUserName"
    :style="{ width: '1000px', height: '650px' }" class="kiwik-dialog" :dismissableMask="true">
    <div class="reset-container">

      <div class="stats-row">
        <div class="stat-card">
          <i class="pi pi-calendar-times text-blue-500"></i>
          <div>
            <p>Total Registros</p>
            <strong>{{ stats.totalRecords }}</strong>
          </div>
        </div>
        <div class="stat-card">
          <i class="pi pi-chart-bar text-purple-500"></i>
          <div>
            <p>Media diaria</p>
            <strong>{{ stats.dailyAverage }}</strong>
          </div>
        </div>
        <div class="stat-card">
          <i class="pi pi-clock text-green-500"></i>
          <div>
            <p>Última Actividad</p>
            <strong>{{ lastDate }}</strong>
          </div>
        </div>
      </div>

      <div class="main-grid">
        <div class="panel glass-effect">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-chart-line"></i> Tendencia de Conexiones
          </h4>
          <div class="chart-wrapper">
            <Chart type="line" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="panel glass-effect">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-history"></i> Historial Reciente
          </h4>
          <div style>
            <GenericDataTable :endpoint="apiUrl" @data-loaded="handleDataLoaded">
              <Column field="date" header="Fecha de Conexión" sortable>
                <template #body="slotProps">
                  <span class="date-badge">{{ formatSafe(slotProps.data?.date) }}</span>
                </template>
              </Column>
            </GenericDataTable>
          </div>
        </div>
      </div>

      <div class="kiwik-separator"></div>
      <div class="flex justify-content-end">
        <Button label="Cerrar" @click="visible = false" class="kiwik-btn-auto-right" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';

const visible = ref(false);
const selectedUserName = ref('');
const apiUrl = ref('');
const stats = ref({ totalRecords: '0', dailyAverage: '0.0' });
const accumulatedData = ref<any[]>([]);
const totalRecordsFromAPI = ref(0);

const lastDate = computed(() => {
    return accumulatedData.value.length > 0 
        ? parseToDateKey(accumulatedData.value[0].date) 
        : '-';
});

const chartOptions = ref({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
});

const chartData = ref({
    labels: [] as string[],
    datasets: [{ label: 'Conexiones', data: [] as number[], borderColor: '#3B82F6', tension: 0.3, fill: true }]
});

const handleDataLoaded = (data: any[], total: number) => {
    // Si el total cambia, es un nuevo usuario o recarga completa, reseteamos
    if (totalRecordsFromAPI.value !== total) {
        accumulatedData.value = [];
    }
    
    // Acumulamos los nuevos datos paginados
    const newItems = data.filter(item => item !== null);
    accumulatedData.value = [...accumulatedData.value, ...newItems];
    totalRecordsFromAPI.value = total;
    
    updateChart(accumulatedData.value);
};

const updateChart = (data: any[]) => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
        if (!item.date) return;
        const key = parseToDateKey(item.date);
        counts[key] = (counts[key] || 0) + 1;
    });

    const sortedDates = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    nextTick(() => {
        chartData.value = {
            labels: sortedDates,
            datasets: [{
                ...chartData.value.datasets[0],
                data: sortedDates.map(date => counts[date])
            }]
        };
    });
};

const parseToDateKey = (dateString: string) => {
    if (typeof dateString !== 'string') return '';
    return dateString.split('T')[0]; 
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch { return dateValue || 'N/A'; }
};

const open = async (userId: number, userName: string) => {
    selectedUserName.value = userName;
    visible.value = true;
    accumulatedData.value = []; // Reset al abrir
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;

    try {
        const resStats = await fetch(`https://localhost:8083/api/historicuser/${userId}/stats`);
        const data = await resStats.json();
        stats.value = {
            totalRecords: new Intl.NumberFormat('es-ES').format(Number(data.totalRecords)),
            dailyAverage: Number(data.dailyAverage).toFixed(1).replace('.', ',')
        };
    } catch (e) { console.error("Error stats", e); }
};

defineExpose({ open });
</script>

<style scoped>

.reset-container {
    display: flex;
    flex-direction: column;
    height: 100%; /* Ocupa el espacio del Dialog */
    overflow: hidden; /* Evita que el contenedor crezca más que el diálogo */
}

.panel {
    display: flex; flex-direction: column; overflow: hidden;
    background: var(--surface-card);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px; padding: 1.25rem;
}
.date-badge {
    background: var(--surface-hover); padding: 0.1rem 0.35rem;
    border-radius: 4px; font-weight: 500; font-size: 0.75rem;
    color: var(--text-color-secondary); display: inline-block;
}
.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
.main-grid { display: grid; grid-template-columns: 1fr 0.45fr; gap: 1.5rem; height: 350px; margin-bottom: 1rem; }
.chart-wrapper { width: 100%; height: 100%; }
</style>