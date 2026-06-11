import { ref } from 'vue';
import axios from 'axios';

const serverTime = ref<Date | null>(null);
const loading = ref(false);
let intervalId: number | null = null;

export function useServerTime() {
    const fetchTime = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/time`);
            
            // --- VALIDACIÓN DE SEGURIDAD ---
            const rawDate = response.data.serverTime;
            const parsedDate = new Date(rawDate);

            if (rawDate && !isNaN(parsedDate.getTime())) {
                serverTime.value = parsedDate;
            } else {
                console.error("Formato de fecha inválido recibido:", rawDate);
                // Si falla, al menos intentamos mantener la hora local para no romper la UI
                serverTime.value = new Date(); 
            }
        } catch (error) {
            console.error("Error obteniendo hora del servidor:", error);
        }
    };

    const startClock = async () => {
        if (intervalId !== null) return;

        await fetchTime();

        intervalId = window.setInterval(() => {
            if (serverTime.value) {
                // Sumamos 1000ms al valor actual
                serverTime.value = new Date(serverTime.value.getTime() + 1000);
            }
        }, 1000);
    };

    return {
        serverTime,
        loading,
        startClock
    };
}