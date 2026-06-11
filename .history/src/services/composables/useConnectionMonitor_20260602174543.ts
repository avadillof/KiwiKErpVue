import { ref } from 'vue';

// Estado global compartido
export const isOnline = ref(true);
export const onReconnected = ref(0); // Contador que cambia al reconectar

export function useConnectionMonitor() {
    const baseUrl = import.meta.env.VITE_API_URL;
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
            
            // Lógica de detección de reconexión
            if (!isOnline.value && response.ok) {
                onReconnected.value++; // Avisamos que acabamos de reconectar
            }
            
            isOnline.value = response.ok;
        } catch (error) {
            isOnline.value = false;
        }
    };

    // ... el resto de tu onMounted y onUnmounted se queda igual
    return { isOnline };
}