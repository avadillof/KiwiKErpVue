import { ref, onMounted, onUnmounted } from 'vue';
import { useCompanyStore } from '../'

// Exportamos estos valores fuera de la función para que sean GLOBALES
// y cualquier componente/controlador pueda acceder al mismo estado.
export const isOnline = ref(true);
export const onReconnected = ref(0); 

export function useConnectionMonitor() {
    //const baseUrl = import.meta.env.VITE_API_URL;
    const baseUrl = companyStore.companyInfo.urlServer || import.meta.env.VITE_API_URL;
    let intervalId: any = null;

    const checkConnection = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800);

            const response = await fetch(`${baseUrl}/WebPing`, { 
                method: 'GET',
                signal: controller.signal 
            });

            clearTimeout(timeoutId);

            // Si estábamos desconectados y ahora la respuesta es OK, disparamos la reconexión
            if (!isOnline.value && response.ok) {
                onReconnected.value++; 
            }

            isOnline.value = response.ok;
        } catch (error) {
            isOnline.value = false;
        }
    };

    onMounted(() => {
        // Ejecución inmediata al montar
        checkConnection();
        // Luego cada segundo
        //intervalId = setInterval(checkConnection, 1000);
    });

    onUnmounted(() => {
        clearInterval(intervalId);
    });

    // Retornamos lo mismo para que tus componentes actuales no se rompan
    return { isOnline };
}