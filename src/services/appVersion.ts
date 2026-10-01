import { backendUrl } from '@/services/backendUrl';

/**
 * Versiones de las imágenes Docker con las que se instaló (flujo Provisioning).
 * - Front: inyectada en build (Docker ARG FRONTEND_VERSION -> VITE_FRONT_VERSION).
 *   En local vale 'dev' (.env.development).
 * - Back: la sirve el propio backend en /WebAppVersion (ENV KIWIKERP_BUILD
 *   desde el ARG BACKEND_VERSION de su imagen). Sin back, '—'.
 */
export const FRONT_VERSION: string = import.meta.env.VITE_FRONT_VERSION || 'dev';

let backVersionCache: string | null = null;

export async function getBackVersion(): Promise<string> {
    if (backVersionCache !== null) return backVersionCache;
    let version = '—';
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(backendUrl('/WebAppVersion'), { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error();
        const data = await response.json();
        version = (data?.version ?? '').toString().trim() || '—';
    } catch {
        version = '—';
    }
    backVersionCache = version;
    return version;
}
