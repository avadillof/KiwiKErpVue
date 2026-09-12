import { backendUrl } from '@/services/backendUrl';
import { computed, ref, onMounted, onUnmounted } from 'vue';

// Exportamos estos valores fuera de la función para que sean GLOBALES
// y cualquier componente/controlador pueda acceder al mismo estado.
export const isOnline = ref(true);
export const onReconnected = ref(0); 

// Disabled deliberately: do not perform an isolated startup check without recovery polling.
export function useConnectionMonitor(enabled = false) {
    const connectionLost = computed(() => enabled && !isOnline.value);
    let intervalId: any = null;

    const checkConnection = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 800);
        try {
            
            const response = await fetch(backendUrl(`/WebPing`), {
                method: 'GET',
                signal: controller.signal 
            });


            // Si estábamos desconectados y ahora la respuesta es OK, disparamos la reconexión
            if (!isOnline.value && response.ok) {
                onReconnected.value++; 
            }

            isOnline.value = response.ok;
        } catch (error) {
            isOnline.value = false;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    onMounted(() => {
        if (!enabled) return;
        // Ejecución inmediata al montar
        checkConnection();
        // Luego cada segundo
        intervalId = setInterval(checkConnection, 1000);
    });

    onUnmounted(() => {
        clearInterval(intervalId);
    });

    // Retornamos lo mismo para que tus componentes actuales no se rompan
    return { isOnline, connectionLost };
}
