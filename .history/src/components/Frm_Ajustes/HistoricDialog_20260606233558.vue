<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" :style="{ width: '800px' }"
        class="kiwik-dialog">

        <div class="reset-container">
            <div class="activity-chart mb-4">
                <h5 class="text-center">Actividad mensual del usuario</h5>
                <div style="height: 150px;">
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
// Almacenamos todos los registros cargados para que la gráfica tenga contexto global
const allLoadedData = ref<ConnectionLog[]>([]);

interface ConnectionLog {
    id: number;
    date: string;
    userName: string;
}

interface ChartData {
    labels: (string | number)[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string;
    }[];
}

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        x: {
            ticks: {
                autoSkip: false, // Importante: muestra TODAS las fechas (01, 02, etc.)
                maxRotation: 45
            }
        },
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
        }
    }
});

const chartData = ref<ChartData>({
    labels: Array.from({ length: 31 }, (_, i) => i + 1),
    datasets: [{
        label: 'Conexiones',
        data: new Array(31).fill(0),
        backgroundColor: '#3B82F6'
    }]
});

// Esta función procesa los datos y actualiza la gráfica
const updateChart = (data: ConnectionLog[]) => {
    const countsMap: Record<string, number> = {};

    data.forEach((item: ConnectionLog) => {
        // Tu string es: "jun. 06, 2026 08:02:16 p. m."
        // Vamos a extraer el día "06" de forma segura:
        // 1. Buscamos el punto después del mes: "jun. "
        // 2. Tomamos los dos dígitos siguientes
        try {
            const parts = item.date.split(' '); // ["jun.", "06,", "2026", ...]
            let day = parts[1].replace(',', ''); // "06"
            
            // Aseguramos que sea formato "06"
            day = day.padStart(2, '0');
            
            countsMap[day] = (countsMap[day] || 0) + 1;
        } catch (e) {
            console.error("Error procesando fecha:", item.date);
        }
    });

    // Ordenamos los días (01, 02, 03...)
    const sortedDays = Object.keys(countsMap).sort();
    const counts = sortedDays.map(day => countsMap[day]);

    // Actualizamos el gráfico
    chartData.value = {
        labels: sortedDays,
        datasets: [{
            ...chartData.value.datasets[0],
            data: counts
        }]
    };
};

// Se ejecuta cuando la tabla carga nuevos datos (Asegúrate de conectar este evento en el template)
const handleDataLoaded = (data: ConnectionLog[]) => {
    console.log("LOG [handleDataLoaded]: Datos recibidos del componente:", data);

    if (!data || data.length === 0) {
        console.warn("LOG [handleDataLoaded]: Los datos recibidos están vacíos o son nulos.");
        return;
    }

    allLoadedData.value = [...allLoadedData.value, ...data];
    console.log("LOG [handleDataLoaded]: Acumulador total:", allLoadedData.value);

    updateChart(allLoadedData.value);
};

const open = (userId: number) => {
    // Reseteamos datos al abrir
    allLoadedData.value = [];
    chartData.value.datasets[0].data = new Array(31).fill(0);

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
/* Estas clases aseguran que el estilo sea idéntico al de tus otros diálogos */
.reset-container {
    padding: 1rem;
}

.reset-header {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--primary-50);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.5rem;
}
</style>