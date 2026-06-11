import { ref, onMounted, onUnmounted } from 'vue';

export function useConnectionMonitor() {
    const isOnline = ref(true);
    const baseUrl = import.meta.env.VITE_API_URL;
    let intervalId: any = null;

    const checkConnection = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 800); // Timeout de 800ms

            const response = await fetch(`${baseUrl}/WebPing`, { 
                method: 'GET',
                signal: controller.signal 
            });

            clearTimeout(timeoutId);
            isOnline.value = response.ok;
        } catch (error) {
            isOnline.value = false;
        }
    };

    onMounted(() => {
        intervalId = setInterval(checkConnection, 1000); // Llama cada 1000ms
    });

    onUnmounted(() => {
        clearInterval(intervalId);
    });

    return { isOnline };


    
}

