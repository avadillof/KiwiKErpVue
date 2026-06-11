<template>
    <Dialog v-model:visible="visible" modal :header="'Análisis de Actividad para ' + selectedUserName"
        :style="{ width: '85%', height: '95vh' }" class="kiwik-dialog" :dismissableMask="true">
        <div class="reset-container">

            <div class="stats-row">
                <div class="stat-card">
                    <i class="pi pi-calendar-times text-blue-500"></i>
                    <div class="stat-content">
                        <p class="stat-label">Total Registros</p>
                        <strong class="stat-value">
                            {{ HelperString.formatThousands(stats.totalRecords) }}
                        </strong>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-chart-bar text-purple-500"></i>
                    <div class="stat-content">
                        <p class="stat-label">Media diaria</p>
                        <strong class="stat-value">{{ stats.dailyAverage }}</strong>
                    </div>
                </div>
                <div class="stat-card">
                    <i class="pi pi-clock text-green-500"></i>
                    <div class="stat-content">
                        <p class="stat-label">Última Actividad</p>
                        <strong class="stat-value">{{ lastDate }}</strong>
                    </div>
                </div>
            </div>

            <div class="main-grid">

                <div class="panel glass-effect">
                    <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                        <i class="pi pi-chart-line"></i> Tendencia de Conexiones
                    </h4>
                    <div class="chart-container">
                        <Chart type="line" :data="chartData" :options="chartOptions"
                            :style="{ height: '65%', width: '100%' }" />
                    </div>
                </div>

                <div class="panel glass-effect flex-1">
                    <h4 class="text-primary mt-0 mb-4 flex align-items-center gap-2">
                        <i class="pi pi-history"></i> Historial Reciente
                    </h4>
                    <div class="table-container-wrapper">
                        
                        
                        <GenericDataTable 
                            :endpoint="apiUrl" 
                            :showPaginator="false"                            
                            :selectionMode="single"
                            v-model:selection="miSeleccion"      
                            @row-select="handleRowSelect"                      
                            @data-loaded="handleDataLoaded">

                            <Column field="date" header="Fecha de Conexión" sortable>
                                <template #body="slotProps">
                                    {{ HelperDates.formatDateFromLocale((slotProps.data?.date)) }}
                                </template>
                            </Column>
                        </GenericDataTable>


                    </div>
                </div>
            </div>

            <div class="kiwik-separator"></div>
            <div class="flex justify-content-end">
                <Button label="Cerrar" @click="visible = false" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
/* Contenedor principal con un poco más de aire */
.reset-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    gap: 1.5rem;
}

/* Las "stat-cards" ahora lucen como tarjetas flotantes */
.stats-row {
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.stat-card {
    background: #ffffff;
    padding: 1.25rem;
    border-radius: 16px;
    border: 1px solid rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
}

.stat-card i {
    font-size: 1.5rem;
    padding: 0.75rem;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.03);
}


.stat-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.stat-label {
    margin: 0;
    font-size: 0.9rem;
    /* Un poco más grande que el default */
    color: #6b7280;
    /* Gris medio para no competir con el valor */
    font-weight: 500;
}

.stat-value {
    font-size: 1.6rem;
    /* Aquí está el tamaño grande que buscas */
    color: #111827;
    /* Gris muy oscuro/casi negro para máxima legibilidad */
    line-height: 1.2;
    margin-top: 0.25rem;
}

/* Grid principal con separación limpia */
.main-grid {
    display: grid;
    grid-template-columns: 1fr 0.35fr;
    gap: 1.5rem;
    flex: 1;
    min-height: 0;
    overflow: hidden;
}

/* Paneles con estética Glass-morphism sutil */
.panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 20px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    flex: 1;
}

/* Tipografía de encabezados */
h4 {
    color: #374151;
    font-size: 1rem;
    letter-spacing: -0.01em;
    margin: 0 0 1rem 0 !important;
}

.chart-container {
    flex: 1;
    /* Esto le da un 50% más de peso vertical que a otros elementos hermanos si los hubiera */
    min-height: 400px;
    /* <--- Esto es lo que realmente "alarga" la gráfica */
    position: relative;
    width: 100%;

}

.table-container-wrapper {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* Badge de fecha más estilizado */
.date-badge {
    background: #f3f4f6;
    padding: 0.2rem 0.6rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #4b5563;
}
</style>



<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';
import { HelperString } from '../../libs/HelperString.ts';
import { Chart as ChartJS } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(zoomPlugin);
const visible = ref(false);
const selectedUserName = ref('');
const apiUrl = ref('');
const stats = ref({ totalRecords: '0', dailyAverage: '0.0' });
const totalRecordsFromAPI = ref(0);
const data = ref<any[]>([]);
const lastDate =ref('');
const miSeleccion = ref(null);

const chartOptions = ref({
    responsive: true,
    maintainAspectRatio: false, // Fundamental
    layout: {
        padding: {
            top: 0,
            bottom: 0
        }
    },
    plugins: {
        legend: { display: false },
        zoom: { // Aquí configuramos el plugin
            zoom: {
                wheel: { enabled: true },
                pinch: { enabled: true },
                mode: 'x',
            },
            pan: {
                enabled: true,
                mode: 'x',
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1,
                padding: 10 // Da aire a los números del eje Y
            },
            grid: {
                drawBorder: false
            }
        },
        x: {
            grid: {
                display: true // Limpia el gráfico visualmente
            }
        }
    }
});

const chartData = ref({
    labels: [] as string[],
    datasets: [{ label: 'Conexiones', data: [] as number[], borderColor: '#3B82F6', tension: 0.3, fill: true }]
});

const handleDataLoaded = (data: any[], total: number) => {
    // 1. Limpiamos la referencia al total si es necesario
    totalRecordsFromAPI.value = total;

    // 2. Filtramos los nulos si los hubiera (buena práctica)
    const currentItems = data.filter(item => item !== null);

    // 3. Pasamos SOLO los datos de la página actual a la función del gráfico
    updateChart(currentItems);
};

const updateChart = (data: any[]) => {
    const counts: Record<string, number> = {};
    
    data.forEach(item => {
        if (!item.date) return;
        if(lastDate.value==''){
            lastDate.value=HelperDates.formatDateFromLocale(item.date);
        }
        
        const key = HelperDates.formatDateNoTimeFromLocale(item.date);
        counts[key] = (counts[key] || 0) + 1;
    });

    const sortedDates = Object.keys(counts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    nextTick(() => {
        chartData.value = {
            labels: sortedDates,
            datasets: [{
                ...chartData.value.datasets[0],
                data: sortedDates.map(date => counts[date])
            }]
        };
    });
};



const formatSafe = (dateValue: string) => {
    try { return HelperDates.formatDateFromLocale(dateValue); }
    catch { return dateValue || 'N/A'; }
};

const open = async (userId: number, userName: string) => {

    const baseUrl = import.meta.env.VITE_API_URL;
    apiUrl.value = `${baseUrl}/api/historicuser/${userId}`;
    selectedUserName.value = userName;
    visible.value = true;
    
    

    try {
        const resStats = await fetch(`${baseUrl}/api/historicuser/${userId}/stats`);
        const result = await resStats.json();
        data.value = result.records || [];
        stats.value = {
            totalRecords: new Intl.NumberFormat('es-ES', { minimumGroupingDigits: 1 } as any).format(Number(result.totalRecords || 0)),
            dailyAverage: Number(result.dailyAverage || 0).toFixed(1).replace('.', ',')
        };

    } catch (e) { console.error("Error stats", e); }
};


const handleRowSelect = (event: any) => {
    console.log("Registro seleccionado:", event.data);
    // Aquí puedes realizar cualquier lógica adicional con el registro seleccionado
};

defineExpose({ open });
</script>
