<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="'Análisis de Actividad para ' + selectedUserName"
    :style="{ width: '1000px', height: '90vh' }" 
    class="kiwik-dialog" 
    :dismissableMask="true"
  > 
    <div class="reset-container">

      <div class="stats-row">
        <div class="stat-card">
          <i class="pi pi-calendar-times text-blue-500"></i>
          <div><p>Total Registros</p><strong>{{ stats.totalRecords }}</strong></div>
        </div>
        <div class="stat-card">
          <i class="pi pi-chart-bar text-purple-500"></i>
          <div><p>Media diaria</p><strong>{{ stats.dailyAverage }}</strong></div>
        </div>
        <div class="stat-card">
          <i class="pi pi-clock text-green-500"></i>
          <div><p>Última Actividad</p><strong>{{ lastDate }}</strong></div>
        </div>
      </div>

      <div class="main-grid">
        
        <div class="panel glass-effect">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-5">
            <i class="pi pi-chart-line"></i> Tendencia de Conexiones
          </h4>
          <div class="chart-container">
            <Chart type="line" :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="panel glass-effect flex-1">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-history"></i> Historial Reciente
          </h4>
          <div class="table-container-wrapper">
            <GenericDataTable :endpoint="apiUrl" @data-loaded="handleDataLoaded" />
          </div>
        </div>
      </div>

      <div class="kiwik-separator"></div>
      <div class="flex justify-content-end">
        <Button label="Cerrar" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* 1. Contenedor Raíz: Ocupa el 100% del Dialog y recorta excesos */
.reset-container { 
    display: flex; flex-direction: column; 
    height: 100%; min-height: 0; overflow: hidden; 
}

/* 2. Grid Principal: Crece para llenar el hueco central */
.main-grid { 
    display: grid; grid-template-columns: 1fr 0.45fr; gap: 1.5rem; 
    flex: 1; min-height: 0; overflow: hidden; margin-bottom: 1rem;
    
}

/* 3. Panel genérico: Permite scroll interno y flex interno */
.panel { 
    display: flex; flex-direction: column; 
    overflow: hidden; min-height: 0;
    background: var(--surface-card); border-radius: 16px; padding: 1.25rem; 
}

/* 4. Contenedores de contenido (Gráfica y Tabla) */
.chart-container { flex: 1; min-height: 0; position: relative; }
.table-container-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }

/* 5. Estadísticas fijas */
.stats-row { flex: 0 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
</style>




<script setup lang="ts">
// (Tu lógica actual se mantiene igual, no necesita cambios)
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

const lastDate = computed(() => accumulatedData.value.length > 0 ? parseToDateKey(accumulatedData.value[0].date) : '-');
const chartOptions = ref({ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } });
const chartData = ref({ labels: [] as string[], datasets: [{ label: 'Conexiones', data: [] as number[], borderColor: '#3B82F6', tension: 0.3, fill: true }] });

const handleDataLoaded = (data: any[], total: number) => {
    if (totalRecordsFromAPI.value !== total) accumulatedData.value = [];
    accumulatedData.value = [...accumulatedData.value, ...data.filter(item => item !== null)];
    totalRecordsFromAPI.value = total;
    updateChart(accumulatedData.value);
};

const updateChart = (data: any[]) => {
    const counts: Record<string, number> = {};
    data.forEach(item => { if(item.date) counts[parseToDateKey(item.date)] = (counts[parseToDateKey(item.date)] || 0) + 1; });
    const sortedDates = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    nextTick(() => {
        chartData.value = { labels: sortedDates, datasets: [{ ...chartData.value.datasets[0], data: sortedDates.map(date => counts[date]) }] };
    });
};

const parseToDateKey = (dateString: string) => dateString.split('T')[0];
const formatSafe = (dateValue: string) => { try { return HelperDates.formatDateFromLocale(dateValue); } catch { return dateValue || 'N/A'; } };

const open = async (userId: number, userName: string) => {
    selectedUserName.value = userName;
    visible.value = true;
    accumulatedData.value = [];
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    try {
        const resStats = await fetch(`https://localhost:8083/api/historicuser/${userId}/stats`);
        const data = await resStats.json();
        stats.value = { totalRecords: new Intl.NumberFormat('es-ES').format(Number(data.totalRecords)), dailyAverage: Number(data.dailyAverage).toFixed(1).replace('.', ',') };
    } catch (e) { console.error("Error stats", e); }
};
defineExpose({ open });
</script>

