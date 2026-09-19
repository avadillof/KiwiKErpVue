import { backendUrl } from '@/services/backendUrl';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

// Exportamos estos valores fuera de la función para que sean GLOBALES
// y cualquier componente/controlador pueda acceder al mismo estado.
export const isOnline = ref(true);
export const onReconnected = ref(0);

/**
 * Vigila la conexión con el back cada 5s y bloquea la interacción si se pierde.
 * No actúa en Instalación ni en Servicio-no-disponible (la instalación debe
 * funcionar precisamente sin backend).
 */
export function useConnectionMonitor(enabled = true) {
    const route = useRoute();
    const connectionLost = computed(() => enabled && !isOnline.value);
    let intervalId: any = null;

    const isExcludedRoute = () => {
        const meta: any = route.meta || {};
        return Boolean(meta.installationRoute || meta.serviceUnavailableRoute)
            || route.path.startsWith('/installation')
            || route.path.startsWith('/service-unavailable');
    };

    const checkConnection = async () => {
        if (!enabled || isExcludedRoute() || document.hidden) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
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
            if (!isExcludedRoute()) isOnline.value = false;
        } finally {
            clearTimeout(timeoutId);
        }
    };

    onMounted(() => {
        if (!enabled) return;
        // Ejecución inmediata al montar
        checkConnection();
        // Luego cada 5 segundos (1s era demasiado agresivo)
        intervalId = setInterval(checkConnection, 5000);
    });

    onUnmounted(() => {
        clearInterval(intervalId);
    });

    // Retornamos lo mismo para que tus componentes actuales no se rompan
    return { isOnline, connectionLost };
}
