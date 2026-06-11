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
        if (!dateStr) return '';
        const parts = dateStr.split(' ');
        if (parts.length < 3) return '';
        
        const mesStr = parts[0].replace('.', '').toLowerCase();
        const diaStr = parts[1].replace(',', '').padStart(2, '0');
        const anioStr = parts[2];
        const meses: Record<string, string> = { 
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04', 'may': '05', 'jun': '06', 
            'jul': '07', 'ago': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12' 
        };
        return `${anioStr}-${meses[mesStr] || '01'}-${diaStr}`;
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
    updateChart(allLoadedData.value, new Date());
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