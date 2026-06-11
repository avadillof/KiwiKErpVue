<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad" 
        :style="{ width: '1000px', height: '600px' }" 
        :contentStyle="{ padding: '0' }"
        class="kiwik-dialog">

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
                    <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="flex" 
                        @data-loaded="handleDataLoaded" 
                        @page="onTablePageChange">
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

<style scoped>
/* Grid Layout estricto */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.4fr; /* 70% - 30% aprox */
    gap: 1rem;
    padding: 1rem;
    height: 480px;
    box-sizing: border-box;
}

/* Bordes bonitos y estilo */
.panel {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    padding: 1rem;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.chart-wrapper {
    flex-grow: 1;
    min-height: 0;
}

.table-wrapper {
    flex-grow: 1;
    min-height: 0;
    overflow: hidden; /* Esto evita que la tabla empuje el contenedor */
}

/* Forzar que la tabla se mantenga dentro */
:deep(.p-datatable) {
    height: 100% !important;
    width: 100% !important;
}

:deep(.p-datatable-wrapper) {
    height: 100% !important;
}
</style>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';

const visible = ref(false);
const apiUrl = ref('');
const allLoadedData = ref<ConnectionLog[]>([]);

interface ConnectionLog {
    id: number;
    date: string;
    userName: string;
}

// Helper robusto para parsear fechas
const parseToDateKey = (dateStr: string): string => {
    try {
        // Tu string es: "may. 06, 2026 12:40:21 p. m."
        const parts = dateStr.split(' '); 
        const mesStr = parts[0].replace('.', '').toLowerCase(); // "may"
        const diaStr = parts[1].replace(',', '').padStart(2, '0'); // "06"
        const anioStr = parts[2]; // "2026"
        
        const meses: Record<string, string> = { 
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
        };
        
        const m = meses[mesStr] || '01';
        return `${anioStr}-${m}-${diaStr}`;
    } catch (e) {
        return '';
    }
};

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        decimation: { enabled: true, algorithm: 'lttb', samples: 100 }
    },
    scales: {
        x: { ticks: { autoSkip: true, maxRotation: 45 } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
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

const updateChart = (data: ConnectionLog[], fechaReferencia: Date = new Date()) => {
    if (!data || data.length === 0) return;

    // 1. Definir rango: 2 meses desde la fecha referencia
    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0);

    const countsMap: Record<string, number> = {};
    
    // 2. Filtrar y mapear datos
    data.forEach((item) => {
        const dateKey = parseToDateKey(item.date); // Ej: "2026-02-06"
        if (dateKey) {
            const [y, m, d] = dateKey.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            
            if (dateObj >= startWindow && dateObj <= endWindow) {
                countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
            }
        }
    });

    // 3. Generar etiquetas solo para los días dentro de la ventana
    const finalLabels: string[] = [];
    const finalData: number[] = [];
    let current = new Date(startWindow);

    while (current <= endWindow) {
        // Formato para comparar con el mapa: YYYY-MM-DD
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        
        finalLabels.push(`${d}/${m}`); // Muestra 06/02, 07/02...
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
    if (allLoadedData.value.length > 0) {
        const primeraFecha = new Date(parseToDateKey(allLoadedData.value[0].date));
        updateChart(allLoadedData.value, primeraFecha);
    }
};

const onTablePageChange = (event: any) => {
    // Asegúrate de usar el índice correcto para obtener el primer elemento visible de la página
    const index = event.first;
    if (allLoadedData.value[index]) {
        const fechaRaw = allLoadedData.value[index].date;
        const refDate = new Date(parseToDateKey(fechaRaw));
        
        console.log("Nueva referencia para el gráfico:", refDate);
        updateChart(allLoadedData.value, refDate);
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
    if (!dateValue) return 'Fecha no disponible';
    try { return HelperDates.formatDateFromLocale(dateValue); } 
    catch (e) { return dateValue; }
};

defineExpose({ open });
</script>