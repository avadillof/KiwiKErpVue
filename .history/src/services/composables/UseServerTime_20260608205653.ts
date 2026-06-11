import { ref } from 'vue';
import axios from 'axios';

// Estado global compartido (Singleton)
const serverTime = ref<Date | null>(null);
const loading = ref(false);

export function useServerTime() {
    const fetchTime = async () => {
        loading.value = true;
        try {
            // Ajusta la URL a tu endpoint real
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/system/time`);
            // Asegúrate de que el formato que devuelve tu API sea compatible con el constructor de Date
            serverTime.value = new Date(response.data.serverTime);
        } catch (error) {
            console.error("Error obteniendo hora del servidor:", error);
        } finally {
            loading.value = false;
        }
    };

    return {
        serverTime, // Los componentes leerán esta variable reactiva
        loading,
        fetchTime
    };
}