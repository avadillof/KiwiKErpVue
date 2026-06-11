<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" :style="{ width: '800px' }"
        class="kiwik-dialog">

        <div class="reset-container">
            <div class="activity-chart mb-4">
                <h5 class="text-center">Actividad mensual del usuario</h5>
                <div style="height: 250px;">
                    <Chart type="line" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="kiwik-separator mb-3"></div>

            <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="300px" @data-loaded="handleDataLoaded">
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

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        tension: number;
        fill: boolean;
    }[];
}

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
        legend: { display: false },
        decimation: {
            enabled: true,
            algorithm: 'lttb',
            samples: 100
        }
    },
    scales: {
        x: { ticks: { autoSkip: true, maxRotation: 45 } },
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
    }
});

const chartData = ref<ChartData>({
    labels: [],
    datasets: [{
        label: 'Conexiones',
        data: [],
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        tension: 0.3,
        fill: true
    }]
});

const updateChart = (data: ConnectionLog[], fechaReferencia: Date = new Date()) => {
    if (data.length === 0) return;

    // Calculamos el rango: desde el mes de la fechaReferencia, hasta 2 meses después
    const startWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth(), 1);
    const endWindow = new Date(fechaReferencia.getFullYear(), fechaReferencia.getMonth() + 2, 0); // Último día del 2º mes

    const countsMap: Record<string, number> = {};
    
    // Solo procesamos datos que caen dentro de este rango de 2 meses
    data.forEach((item: ConnectionLog) => {
        // ... (tu lógica de parseo actual para obtener el dateKey "YYYY-MM-DD")
        const dateKey = parseToDateKey(item.date); 
        const dateObj = new Date(dateKey);
        
        if (dateObj >= startWindow && dateObj <= endWindow) {
            countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
        }
    });

    // ... (el resto de tu lógica de rellenado con ceros igual que antes)
};

const handleDataLoaded = (data: ConnectionLog[]) => {
    if (!data || data.length === 0) return;
    allLoadedData.value = [...allLoadedData.value, ...data];
    updateChart(allLoadedData.value);
};

const open = (userId: number) => {
    allLoadedData.value = [];
    chartData.value.datasets[0].data = [];
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    visible.value = true;
};

const formatSafe = (dateValue: string) => {
    if (!dateValue) return 'Fecha no disponible';
    if (typeof dateValue === 'string' && dateValue.includes(',')) return dateValue;
    try {
        return HelperDates.formatDateFromLocale(dateValue);
    } catch (e) {
        return dateValue;
    }
};

defineExpose({ open });
</script>

<style scoped>
.reset-container { padding: 1rem; }
.kiwik-separator { border-top: 1px solid #e5e7eb; }
</style>