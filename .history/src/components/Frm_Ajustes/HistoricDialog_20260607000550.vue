<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" 
        :style="{ width: '1000px', height: '650px' }" 
        class="kiwik-dialog">

        <div class="main-container flex flex-row gap-3 h-full overflow-hidden">
            
            <div class="chart-panel w-8 flex-none p-3 border-round-lg border-1 surface-border">
                <h5 class="text-center mb-3">Tendencia de Conexiones</h5>
                <div style="height: 480px;">
                    <Chart type="line" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="table-panel w-4 flex-grow-1 p-3 border-round-lg border-1 surface-border overflow-hidden">
                <h5 class="text-center mb-3">Historial</h5>
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

        <div class="flex justify-content-end mt-2 px-2">
            <Button label="Cerrar" size="small" @click="visible = false" />
        </div>
    </Dialog>
</template>

<style scoped>
/* Aseguramos que el contenedor padre no tenga scroll horizontal */
.main-container { 
    height: 520px; /* Altura fija para evitar desbordes */
    width: 100%;
    overflow: hidden;
}

.chart-panel, .table-panel {
    background: var(--surface-card);
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

/* Forzamos que la tabla no se salga de su contenedor (w-4) */
:deep(.p-datatable) {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
}

:deep(.p-datatable-wrapper) {
    flex-grow: 1;
    overflow-y: auto; /* Scroll solo vertical */
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

    // Rango de 2 meses: desde el día 1 del mes de referencia hasta el último día del mes siguiente
    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0);

    console.log("LOG [updateChart]: Buscando entre", startWindow, "y", endWindow);

    const countsMap: Record<string, number> = {};
    
    data.forEach((item) => {
        const dateKey = parseToDateKey(item.date); // Ej: "2026-06-06"
        if (dateKey) {
            // Creamos fecha local para comparar sin desfases de hora
            const [y, m, d] = dateKey.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d); 
            
            if (dateObj >= startWindow && dateObj <= endWindow) {
                countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
            } else {
                // Esto nos dirá si los datos están fuera del rango
                // console.log("Dato fuera de ventana:", dateKey);
            }
        }
    });

    console.log("LOG [countsMap]:", countsMap);

    const finalLabels: string[] = [];
    const finalData: number[] = [];
    let current = new Date(startWindow);

    while (current <= endWindow) {
        // Formato YYYY-MM-DD para la clave del mapa
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        
        finalLabels.push(`${d}/${m}`);
        finalData.push(countsMap[key] || 0);
        
        current.setDate(current.getDate() + 1);
    }

    console.log("LOG [finalData]:", finalData); // Si esto tiene números, el gráfico debería pintarlos

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
    if (event && allLoadedData.value[event.first]) {
        const firstItem = allLoadedData.value[event.first];
        const refDate = new Date(parseToDateKey(firstItem.date));
        updateChart(allLoadedData.value, isNaN(refDate.getTime()) ? new Date() : refDate);
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