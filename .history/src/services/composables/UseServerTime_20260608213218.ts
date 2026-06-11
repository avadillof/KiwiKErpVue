import { ref } from 'vue';
import axios from 'axios';

const serverTime = ref<Date | null>(null);
const loading = ref(false);
let intervalId: number | null = null;

export function useServerTime() {
    const fetchTime = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/time`);

            // 1. Obtenemos el valor crudo
            let rawDate = response.data.serverTime;

            // 2. LIMPIEZA: Si contiene corchetes (formato Spring Boot con zona horaria), 
            // eliminamos la parte entre corchetes para que JS lo entienda.
            if (typeof rawDate === 'string' && rawDate.includes('[')) {
                rawDate = rawDate.split('[')[0];
            }

            // 3. Conversión y Validación
            const parsedDate = new Date(rawDate);

            if (rawDate && !isNaN(parsedDate.getTime())) {
                serverTime.value = parsedDate;
            } else {
                console.warn("Formato de fecha no procesable, usando hora local:", rawDate);
                serverTime.value = new Date();
            }
        } catch (error) {
            console.error("Error obteniendo hora del servidor:", error);
            // Fallback en caso de error de red
            serverTime.value = new Date();
        }
    };

    const startClock = async () => {
        if (intervalId !== null) return;

        await fetchTime();

        intervalId = window.setInterval(() => {
            if (serverTime.value) {
                // Sumamos 1000ms al valor reactivo actual
                serverTime.value = new Date(serverTime.value.getTime() + 1000);
            }
        }, 1000);
    };


    /**
 * Convierte un objeto Date o un string ISO a formato humano.
 * Ejemplo: "8 de junio de 2026, 21:21:52"
 */
    export function formatHumanDate(date: Date | string | null): string {
        if (!date) return '--';

        const d = new Date(date);

        // Validar si es una fecha real
        if (isNaN(d.getTime())) return 'Fecha inválida';

        return new Intl.DateTimeFormat('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(d);
    }

    return {
        serverTime,
        loading,
        startClock
        
    };
}