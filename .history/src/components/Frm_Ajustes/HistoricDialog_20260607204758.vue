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
    <div class="stat-content">
      <p class="stat-label">Total Registros</p>
      <strong class="stat-value">{{ stats.totalRecords }}</strong>
    </div>
  </div>
  <div class="stat-card">
    <i class="pi pi-chart-bar text-purple-500"></i>
    <div class="stat-content">
      <p class="stat-label">Media diaria</p>
      <strong class="stat-value">{{ stats.dailyAverage }}</strong>
    </div>
  </div>
  <div class="stat-card">
    <i class="pi pi-clock text-green-500"></i>
    <div class="stat-content">
      <p class="stat-label">Última Actividad</p>
      <strong class="stat-value">{{ lastDate }}</strong>
    </div>
  </div>
</div>

      <div class="main-grid">
        
        <div class="panel glass-effect">          
            <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-chart-line"></i> Tendencia de Conexiones
          </h4>
          <div class="chart-container">
            <Chart type="line" :data="chartData" :options="chartOptions" :style="{ height: '65%', width: '100%' }"/>
          </div>
        </div>

        <div class="panel glass-effect flex-1">
          <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
            <i class="pi pi-history"></i> Historial Reciente
          </h4>
          <div class="table-container-wrapper">
            <GenericDataTable :endpoint="apiUrl" @data-loaded="handleDataLoaded" >
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
        <Button label="Cerrar" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
/* Contenedor principal con un poco más de aire */
.reset-container { 
    display: flex; flex-direction: column; 
    height: 100%; min-height: 0; overflow: hidden; 
    gap: 1.5rem;
}

/* Las "stat-cards" ahora lucen como tarjetas flotantes */
.stats-row { 
    flex: 0 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; 
}

.stat-card {
    background: #ffffff;
    padding: 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(0,0,0,0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
}

.stat-card:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }

.stat-card i { font-size: 1.5rem; padding: 0.75rem; border-radius: 12px; background: rgba(0,0,0,0.03); }

/* Grid principal con separación limpia */
.main-grid { 
    display: grid; 
    grid-template-columns: 1fr 0.35fr; gap: 1.5rem; 
    flex: 1; min-height: 0; overflow: hidden; 
}

/* Paneles con estética Glass-morphism sutil */
.panel { 
    display: flex; flex-direction: column; 
    overflow: hidden; min-height: 0;
    background: #ffffff; 
    border: 1px solid rgba(0,0,0,0.05);
    border-radius: 20px; 
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    flex: 1 ;
}

/* Tipografía de encabezados */
h4 { color: #374151; font-size: 1rem; letter-spacing: -0.01em; margin: 0 0 1rem 0 !important; }

.chart-container { 
    flex: 1; /* Esto le da un 50% más de peso vertical que a otros elementos hermanos si los hubiera */
    min-height: 400px; /* <--- Esto es lo que realmente "alarga" la gráfica */
    position: relative;
    width: 100%;
    
}
.table-container-wrapper { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }

/* Badge de fecha más estilizado */
.date-badge { 
    background: #f3f4f6; padding: 0.2rem 0.6rem; 
    border-radius: 8px; font-size: 0.75rem; font-weight: 600;
    color: #4b5563;
}
</style>



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
    responsive: true,
    maintainAspectRatio: false, // Fundamental
    layout: {
        padding: {
            top: 0,
            bottom: 0
        }
    },
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { 
                stepSize: 1,
                padding: 10 // Da aire a los números del eje Y
            },
            grid: {
                drawBorder: false
            }
        },
        x: {
            grid: {
                display: true // Limpia el gráfico visualmente
            }
        }
    }
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
    
    // Obtenemos YYYY-MM-DD
    const isoDate = dateString.split('T')[0]; 
    const [year, month, day] = isoDate.split('-');
    
    // Devolvemos DD-MM-YY (tomando los últimos dos dígitos del año)
    return `${day}-${month}-${year}`;
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
