<template>
    <Dialog v-model:visible="visible" modal header="Análisis de Actividad y Conexiones" 
            :style="{ width: '800px' }" class="kiwik-dialog">

        <div class="reset-container">
            <div class="activity-chart mb-4">
                <h5 class="text-center">Actividad mensual del usuario</h5>
                <div style="height: 150px;">
                    <Chart type="bar" :data="chartData" :options="chartOptions" />
                </div>
            </div>

            <div class="kiwik-separator mb-3"></div>

            <GenericDataTable :key="apiUrl" :endpoint="apiUrl" scrollHeight="300px" @data-loaded="onTableDataLoaded">
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
import axios from 'axios';
import Chart from 'primevue/chart';

const visible = ref(false);
const apiUrl = ref('');

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
// 1. Define la variable de opciones
const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
});

const chartData = ref<ChartData>({
    labels: [],
    datasets: [{
        label: 'Conexiones',
        data: [],
        backgroundColor: 'var(--primary-color)'
    }]
});

const open = async (userId: number) => {
    apiUrl.value = `https://localhost:8083/api/historicuser/${userId}`;
    visible.value = true;

    try {
        const response = await axios.get(apiUrl.value, { params: { size: 500 } });
        const rawData: ConnectionLog[] = response.data.content || [];
        
        // Agrupar por día (1 al 31)
        const counts = new Array(31).fill(0);
        
        // CORRECCIÓN AQUÍ: Tipamos el parámetro 'item'
        rawData.forEach((item: ConnectionLog) => {
            const dateObj = new Date(item.date);
            // Validamos que la fecha sea válida antes de obtener el día
            if (!isNaN(dateObj.getTime())) {
                const day = dateObj.getDate();
                counts[day - 1]++;
            }
        });

        chartData.value = {
            labels: Array.from({length: 31}, (_, i) => i + 1),
            datasets: [{
                label: 'Conexiones',
                data: counts,
                backgroundColor: '#3B82F6'
            }]
        };
    } catch (error) {
        console.error("Error al cargar datos:", error);
    }
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