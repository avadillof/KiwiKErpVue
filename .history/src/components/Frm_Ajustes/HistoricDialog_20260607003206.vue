<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad" :style="{ width: '1000px', height: '600px' }"
        :contentStyle="{ padding: '0', overflow: 'hidden' }" class="kiwik-dialog">
        <div class="main-grid">
            <div class="panel chart-panel">
                <h5 class="text-center mb-3">Tendencia de Conexiones</h5>
                <div class="chart-wrapper">
                    <Chart type="line" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="panel table-panel">
                <h5 class="text-center mb-3">Historial</h5>
                <div class="table-wrapper">
                    <GenericDataTable :key="apiUrl" :endpoint="apiUrl" ref="dataTableRef" scrollHeight="flex"
                        @data-loaded="handleDataLoaded" @scroll="onTableScroll">
                        <Column field="date" header="Fecha">
                            <template #body="slotProps">
                                <span class="text-sm">{{ formatSafe(slotProps.data?.date) }}</span>
                            </template>
                        </Column>
                    </GenericDataTable>
                </div>
            </div>
        </div>

        <div class="flex justify-content-end p-3">
            <Button label="Cerrar" size="small" @click="visible = false" />
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';
import { onMounted } from 'vue';

// Estado principal
const visible = ref(false);
const apiUrl = ref('');
const allLoadedData = ref<ConnectionLog[]>([]);
const dataTableRef = ref();

interface ConnectionLog {
    id: number;
    date: string;
    userName: string;
}

// Helpers y Lógica de Gráficos (Mantenida igual para consistencia)
const parseToDateKey = (dateStr: string): string => {
    try {
        const parts = dateStr.split(' ');
        const mesStr = parts[0].replace('.', '').toLowerCase();
        const diaStr = parts[1].replace(',', '').padStart(2, '0');
        const anioStr = parts[2];
        const meses: Record<string, string> = {
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06',
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
        };
        return `${anioStr}-${meses[mesStr] || '01'}-${diaStr}`;
    } catch (e) { return ''; }
};

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, decimation: { enabled: true, algorithm: 'lttb', samples: 100 } },
    scales: { x: { ticks: { autoSkip: true, maxRotation: 45 } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } }
});

const chartData = ref({
    labels: [] as string[],
    datasets: [{
        label: 'Conexiones',
        data: [] as number[],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        tension: 0.3,
        fill: true
    }]
});

const updateChart = (data: ConnectionLog[], fechaReferencia: Date) => {
    if (!data || data.length === 0) return;

    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0);

    const countsMap: Record<string, number> = {};
    data.forEach((item) => {
        const dateKey = parseToDateKey(item.date);
        if (dateKey) {
            const [y, m, d] = dateKey.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            if (dateObj >= startWindow && dateObj <= endWindow) {
                countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
            }
        }
    });

    const finalLabels: string[] = [];
    const finalData: number[] = [];
    let current = new Date(startWindow);

    while (current <= endWindow) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        finalLabels.push(`${d}/${m}`);
        finalData.push(countsMap[key] || 0);
        current.setDate(current.getDate() + 1);
    }

    nextTick(() => {
        chartData.value = {
            labels: finalLabels,
            datasets: [{ ...chartData.value.datasets[0], data: finalData }]
        };
    });
};

const handleDataLoaded = (data: ConnectionLog[]) => {
    allLoadedData.value = [...allLoadedData.value, ...data];
    // Solo inicializa la primera vez si el gráfico está vacío
    if (chartData.value.labels.length === 0 && allLoadedData.value.length > 0) {
        updateChart(allLoadedData.value, new Date(parseToDateKey(allLoadedData.value[0].date)));
    }
};

// Esta función captura cuando el usuario hace scroll en la tabla
const onTableScroll = (event: any) => {
    cons
    const tableWrapper = event.target;
    // Ajusta '40' si tus filas miden más o menos píxeles
    const rowIndex = Math.floor(tableWrapper.scrollTop / 40); 
    
    if (allLoadedData.value[rowIndex]) {
        const nuevaFecha = new Date(parseToDateKey(allLoadedData.value[rowIndex].date));
        // Solo actualizamos si la fecha es realmente diferente a la que ya estamos mostrando
        updateChart(allLoadedData.value, nuevaFecha);
    }
};

const open = (userId: number) => {
    allLoadedData.value = [];
    chartData.value.labels = [];
    chartData.value.datasets[0].data = [];
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    visible.value = true;
};

const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch (e) { return dateValue || 'Fecha no disponible'; }
};

onMounted(() => {
    const tableEl = document.querySelector('.p-datatable-wrapper');
    if (tableEl) {
        tableEl.addEventListener('scroll', onTableScroll);
    }
});

defineExpose({ open });
</script>

<style scoped>
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.4fr;
    gap: 1rem;
    padding: 1rem;
    height: 480px;
    box-sizing: border-box;
}

.panel {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chart-wrapper,
.table-wrapper {
    flex-grow: 1;
    min-height: 0;
    overflow: hidden;
}

:deep(.p-datatable) {
    height: 100% !important;
    width: 100% !important;
}

:deep(.p-datatable-wrapper) {
    height: 100% !important;
}
</style>