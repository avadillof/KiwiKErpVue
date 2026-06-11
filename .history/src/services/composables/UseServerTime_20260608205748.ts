import { ref } from 'vue';
import axios from 'axios';

// Estado global compartido
const serverTime = ref<Date | null>(null);
const loading = ref(false);
let intervalId: number | null = null; // Para controlar el timer

export function useServerTime() {
    const fetchTime = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/time`);
            // Suponiendo que la API devuelve un timestamp o fecha ISO
            serverTime.value = new Date(response.data.serverTime);
        } catch (error) {
            console.error("Error obteniendo hora del servidor:", error);
        }
    };

    const startClock = async () => {
        // Si ya hay un intervalo corriendo, no crear otro
        if (intervalId) return;

        // Carga inicial
        await fetchTime();

        // Incremento local para simular el segundero sin saturar la API
        intervalId = window.setInterval(() => {
            if (serverTime.value) {
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