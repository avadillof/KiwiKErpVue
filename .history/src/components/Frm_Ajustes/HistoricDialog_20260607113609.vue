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
                        <GenericDataTable :endpoint="apiUrl" ref="dataTableRef" dataKey="id"
                            v-model:selection="selectedRow" @data-loaded="handleDataLoaded" @row-select="onRowSelect">

                            <Column field="date" header="Fecha de Conexión">
                                <template #body="slotProps">
                                    <span class="date-badge">
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

date-badge {
    background: var(--surface-hover);
    padding: 0.1rem 0.35rem;
    border-radius: 4px;
    font-weight: 500;
    font-size: 0.75rem;
    color: var(--text-color-secondary);
    display: inline-block;
}

.chart-wrapper,

.chart-wrapper>div {
    width: 100% !important;
    height: 100% !important;
}




</style>





<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';

const stats = ref({
    totalRecords: '0',
    dailyAverage: '0.0'
});

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
// Cambia esto en tu script
const handleDataLoaded = (data: any[], total: number) => {
    // 1. Asignación simple: La tabla solo muestra la página actual.
    // Esto elimina el parpadeo del DOM.
    allLoadedData.value = data;

    // 2. Usamos el total que nos da el servidor (que es fijo)
    totalRecordsFromAPI.value = total;

    // 3. Si necesitas la gráfica de TODO el histórico, 
    // lo ideal es que el total sea la base del cálculo.
    updateChart(allLoadedData.value);
};



const open = async (userId: number, userName: string) => {
    selectedUserName.value = userName;
    visible.value = true;
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;

    // 1. Llamada a estadísticas (Media y Total)
    try {
        const resStats = await fetch(`https://localhost:8083/api/historicuser/${userId}/stats`);
        const data = await resStats.json();

        // Aseguramos que sea un número antes de formatear
        const total = Number(data.totalRecords);
        const avg = Number(data.dailyAverage);

        stats.value = {
            // 'es-ES' garantiza el punto para miles y coma para decimales
            totalRecords: new Intl.NumberFormat('es-ES').format(total),
            dailyAverage: avg.toFixed(1).replace('.', ',') // Forzamos formato español
        };
    } catch (e) { console.error("Error stats", e); }

    // 2. Llamada a datos de la gráfica
    try {
        //const resChart = await fetch(`https://localhost:8083/api/historicuser/${userId}`);
        //const data = await resChart.json();

        //chartData.value = {
        //    labels: data.map((d: any) => d.date),
        //    datasets: [{
        //        ...chartData.value.datasets[0],
        //        data: data.map((d: any) => d.count)
        //    }]
        // };
    } catch (e) { console.error("Error chart", e); }
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch { return dateValue || 'N/A'; }
};


defineExpose({ open });
</script>