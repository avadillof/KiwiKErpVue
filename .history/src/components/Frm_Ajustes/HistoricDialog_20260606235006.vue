<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" :style="{ width: '800px' }"
        class="kiwik-dialog">

        <div class="reset-container">
            <div class="activity-chart mb-4">
                <h5 class="text-center">Actividad (Ventana de 2 meses)</h5>
                <div style="height: 250px;">
                    <Chart type="line" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="kiwik-separator mb-3"></div>

            <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="300px" 
                @data-loaded="handleDataLoaded" 
                @page="onTablePageChange">
                <Column field="date" header="Fecha y Hora">
                    <template #body="slotProps">
                        <span class="text-sm font-medium">{{ formatSafe(slotProps.data?.date) }}</span>
                    </template>
                </Column>
                <Column field="userName" header="Usuario">
                    <template #body="slotProps">
                        <span class="text-sm">{{ slotProps.data?.userName }}</span>
                    </template>
                </Column>
            </GenericDataTable>

            <div class="flex justify-content-end mt-3">
                <Button label="Cerrar" size="small" @click="visible = false" />
            </div>
        </div>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

// Helper para parsear tu fecha "jun. 06, 2026..." a "YYYY-MM-DD"
const parseToDateKey = (dateStr: string): string => {
    const parts = dateStr.split(' ');
    const mesStr = parts[0].replace('.', '').toLowerCase();
    const diaStr = parts[1].replace(',', '').padStart(2, '0');
    const anioStr = parts[2];
    const meses: Record<string, string> = { 
        'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
        'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
    };
    return `${anioStr}-${meses[mesStr]}-${diaStr}`;
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
    if (data.length === 0) return;

    // Ventana de 2 meses desde la referencia
    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0);

    const countsMap: Record<string, number> = {};
    
    data.forEach((item) => {
        const dateKey = parseToDateKey(item.date);
        const dateObj = new Date(dateKey);
        
        if (dateObj >= startWindow && dateObj <= endWindow) {
            countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
        }
    });

    const sortedDates = Object.keys(countsMap).sort();
    if (sortedDates.length === 0) return;

    const finalLabels: string[] = [];
    const finalData: number[] = [];
    let current = new Date(startWindow);

    while (current <= endWindow) {
        const key = current.toISOString().split('T')[0];
        const [y, m, d] = key.split('-');
        finalLabels.push(`${d}/${m}`);
        finalData.push(countsMap[key] || 0);
        current.setDate(current.getDate() + 1);
    }

    chartData.value = {
        labels: finalLabels,
        datasets: [{ ...chartData.value.datasets[0], data: finalData }]
    };
};

const handleDataLoaded = (data: ConnectionLog[]) => {
    allLoadedData.value = [...allLoadedData.value, ...data];
    updateChart(allLoadedData.value, new Date());
};

const onTablePageChange = (event: any) => {
    // Si la tabla emite el índice del primer registro visible
    const firstItem = allLoadedData.value[event.first];
    if (firstItem) {
        updateChart(allLoadedData.value, new Date(parseToDateKey(firstItem.date)));
    }
};

const open = (userId: number) => {
    allLoadedData.value = [];
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

<style scoped>
.reset-container { padding: 1rem; }
.kiwik-separator { border-top: 1px solid #e5e7eb; }
</style>