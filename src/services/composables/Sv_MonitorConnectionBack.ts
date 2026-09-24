import { backendUrl } from '@/services/backendUrl';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

// Exportamos estos valores fuera de la función para que sean GLOBALES
// y cualquier componente/controlador pueda acceder al mismo estado.
export const isOnline = ref(true);
export const onReconnected = ref(0);

/**
 * Vigila la conexión con el back cada 5s y bloquea la interacción si se pierde.
 * El sondeo SIEMPRE corre (incluso en Instalación / Servicio-no-disponible)
 * para poder detectar que el back ha vuelto. Lo que se oculta en esas rutas
 * es solo el overlay, no la actualización de `isOnline`.
 */
export function useConnectionMonitor(enabled = true) {
    const route = useRoute();
    let intervalId: any = null;

    const isExcludedRoute = () => {
        const meta: any = route.meta || {};
        return Boolean(meta.installationRoute || meta.serviceUnavailableRoute)
            || route.path.startsWith('/installation')
            || route.path.startsWith('/service-unavailable');
    };

    // El overlay no se muestra en rutas excluidas, pero isOnline sí se actualiza.
    const connectionLost = computed(() => enabled && !isOnline.value && !isExcludedRoute());

    const checkConnection = async () => {
        if (!enabled || document.hidden) return;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        try {
            const response = await fetch(backendUrl(`/WebPing`), {
                method: 'GET',
                cache: 'no-store',
                signal: controller.signal
            });

            // Distinguir "red caída" de "back que responde con error HTTP":
            // - Si hay respuesta HTTP, el TCP del back está vivo. Un 404 (endpoint
            //   no existente) o un 4xx/500 puntual NO debe dejar el overlay clavado.
            // - Solo 502/503/504 (puerta de enlace / arranque a medias) se tratan
            //   como "todavía no disponible".
            const gatewayDown = response.status === 502 || response.status === 503 || response.status === 504;
            const onlineNow = !gatewayDown;

            // Si estábamos desconectados y ahora hay respuesta útil, disparamos la reconexión
            if (!isOnline.value && onlineNow) {
                onReconnected.value++;
            }

            isOnline.value = onlineNow;
        } catch (error) {
            // Solo el fallo de red (TypeError / Abort) marca offline.
            isOnline.value = false;
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
