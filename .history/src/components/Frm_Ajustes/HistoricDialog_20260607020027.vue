<template>
    <Dialog v-model:visible="visible" modal :header="'Análisis de Actividad para ' + selectedUserName"
        :style="{ width: '1000px', height: '650px' }" class="kiwik-dialog" :dismissableMask="true">
        <div class="reset-container">

            <div class="stats-row">
                <div class="stat-card">
                    <i class="pi pi-calendar-times text-blue-500"></i>
                    <div>
                        <p>Total Registros</p>
                        <strong>{{ allLoadedData.length }}</strong>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-chart-bar text-purple-500"></i>
                    <div>
                        <p>Media diaria</p>
                        <strong>{{ calculateDailyAverage() }}</strong>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-clock text-green-500"></i>
                    <div>
                        <p>Última Actividad</p>
                        <strong>{{ allLoadedData.length > 0 ? formatSafe(allLoadedData[0].date).split(' ')[0] : '-'
                            }}</strong>
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
                    <div class="table-wrapper">
                        <GenericDataTable :key="apiUrl" :endpoint="apiUrl" ref="dataTableRef" scrollHeight="flex"
                            v-model:selection="selectedRow" @data-loaded="handleDataLoaded" @lazy-load="onTableLazyLoad"
                            @row-select="onRowSelect">
                            <Column field="date" style="width: 100%">
                                <template #header>
                                    <div class="flex align-items-center gap-2">
                                        <i class="pi pi-calendar text-primary"></i>
                                        <span class="font-bold text-800">Fecha de Conexión</span>
                                    </div>
                                </template>
                                <template #body="slotProps">
                                    <span class="date-badge">
                                        <i class="pi pi-clock text-xs mr-1"></i>
                                        {{ formatSafe(slotProps.data?.date) }}
                                    </span>
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

<style scoped>
/* Stats Row */
.stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.stat-card {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.stat-card i {
    font-size: 1.5rem;
    background: var(--surface-100);
    padding: 0.75rem;
    border-radius: 10px;
}

.stat-card p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    text-transform: uppercase;
}

.stat-card strong {
    font-size: 1.1rem;
    color: var(--text-color);
}

/* Main Grid */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.45fr;
    gap: 1.5rem;
    height: 350px;
    margin-bottom: 1rem;
}

.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--surface-card);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.date-badge {
    background: var(--surface-hover);
    padding: 0.25rem 0.6rem;
    border-radius: 6px;
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--text-color-secondary);
}

.chart-wrapper,
.table-wrapper {
    flex-grow: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
}

.chart-wrapper>div {
    width: 100% !important;
    height: 100% !important;
}

:deep(.p-datatable) {
    height: 100% !important;
}

:deep(.p-datatable-thead > tr > th) {
    background: var(--surface-50);
    font-weight: 700;
    font-size: 0.85rem;
}

:deep(.p-datatable-wrapper) {
    flex-grow: 1;
    border-radius: 8px;
    border: 1px solid var(--surface-border);
}
</style>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';

const selectedUserName = ref('');
const selectedRow = ref();
const visible = ref(false);
const apiUrl = ref('');
const allLoadedData = ref<any[]>([]);
const totalRecordsFromAPI = ref(0);

const chartOptions = ref({ 
    responsive: true, 
    maintainAspectRatio: false, 
    plugins: { legend: { display: false } }, 
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } 
});

const chartData = ref({ 
    labels: [] as string[], 
    datasets: [{ label: 'Conexiones', data: [] as number[], borderColor: '#3B82F6', tension: 0.3, fill: true }] 
});

const onRowSelect = (event: any) => console.log("Fila:", event.data);

const parseToDateObj = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    try {
        const parts = dateStr.split(' ');
        const mesMap: Record<string, number> = { 'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11 };
        const y = parseInt(parts[2]);
        const m = mesMap[parts[0].replace('.', '').toLowerCase()] || 0;
        const d = parseInt(parts[1].replace(',', ''));
        return new Date(y, m, d);
    } catch { return new Date(); }
};

const parseToDateKey = (dateStr: string): string => {
    const d = parseToDateObj(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const updateChart = (data: any[]) => {
    if (!data || data.length === 0) return;

    const dates = data.map(i => parseToDateObj(i.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const counts: Record<string, number> = {};
    data.forEach(item => { 
        const key = parseToDateKey(item.date); 
        if (key) counts[key] = (counts[key] || 0) + 1; 
    });

    const labels: string[] = []; 
    const values: number[] = [];
    let curr = new Date(minDate);
    
    while (curr <= maxDate) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
        labels.push(`${String(curr.getDate()).padStart(2, '0')}/${String(curr.getMonth() + 1).padStart(2, '0')}`);
        values.push(counts[key] || 0);
        curr.setDate(curr.getDate() + 1);
    }
    
    nextTick(() => {
        chartData.value = {
            labels,
            datasets: [{ ...chartData.value.datasets[0], data: values }]
        };
    });
};

// Se corrige el manejo de parámetros para evitar undefined
const handleDataLoaded = (data: any[], total: number) => {
    // Si total es undefined, intenta sacarlo del length o pon 0
    totalRecordsFromAPI.value = total || data.length;
    allLoadedData.value = [...allLoadedData.value, ...data];
    updateChart(allLoadedData.value);
};


const handleDataLoaded = (data: any[], total: number) => {
    // 1. REEMPLAZAMOS, no concatenamos. 
    // Esto evita el parpadeo del DOM porque no creamos un array gigante.
    allLoadedData.value = data; 
    
    // 2. Usamos el total que viene del backend
    totalRecordsFromAPI.value = total || 0;
    
    // 3. Actualizamos la gráfica
    updateChart(allLoadedData.value);
};

const onTableLazyLoad = (_event: any) => {
    if (allLoadedData.value.length > 0) updateChart(allLoadedData.value);
};

const open = (userId: number, userName: string) => {
    selectedUserName.value = userName;
    allLoadedData.value = [];
    totalRecordsFromAPI.value = 0; // Reset
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    visible.value = true;
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch { return dateValue || 'N/A'; }
};

const calculateDailyAverage = () => {
    // Protección absoluta contra NaN
    const total = totalRecordsFromAPI.value || 0;
    if (total === 0 || allLoadedData.value.length === 0) return '0.0';

    const uniqueDays = new Set(allLoadedData.value.map(item => parseToDateKey(item.date)));
    const days = uniqueDays.size || 1;

    const result = total / days;
    return isFinite(result) ? result.toFixed(1) : '0.0';
};

defineExpose({ open });
</script>