import { ref, nextTick } from 'vue';
import { HelperDates } from '../../libs/HelperDates.ts';
import GenericDataTable from '../../components/shared/GenericDataTable.vue';
import Chart from 'primevue/chart';
import { HelperString } from '../../libs/HelperString.ts';
import { Chart as ChartJS } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import Menu from 'primevue/menu';

export function useDgHistoricUserConnectionsController() {
    ChartJS.register(zoomPlugin);
const visible = ref(false);
const selectedUserName = ref('');
const apiUrl = ref('');
const stats = ref({ totalRecords: '0', dailyAverage: '0.0' });
const totalRecordsFromAPI = ref(0);
const data = ref<any[]>([]);
const lastDate =ref('');
const miSeleccion = ref(null);
const tableRef = ref<any>(null);

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



const menu = ref<any>(null); 

const opcionesMenu = ref([
    {
        label: 'Acciones',
        items: [
            {
                label: 'Refrescar datos',
                icon: 'pi pi-refresh',
                command: () => {
                    try {
                        refreshTable();
                    } catch (err) {
                        console.error("Error al refrescar:", err);
                    }
                }
            },
            {
                label: 'Exportar a Excel',
                icon: 'pi pi-file-excel',
                command: () => {
                    try {
                        exportToExcel();
                    } catch (err) {
                        console.error("Error al exportar:", err);
                    }
                }
            }
        ]
    }
]);

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


const refreshTable = () => {
    if (tableRef.value) {
        tableRef.value.refresh();
    }
};


const exportToExcel = () => {
    if (tableRef.value) {
        tableRef.value.exportToExcel();
    }
};

}