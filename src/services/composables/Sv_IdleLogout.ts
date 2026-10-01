import { watch } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import { useCompanyStore } from '../../stores/companyStore';

/**
 * Cierre de sesión por inactividad: si no hay actividad del usuario
 * durante IDLE_MINUTES, avisa 1 minuto antes y si sigue sin haberla
 * cierra la sesión y vuelve al login.
 */
const IDLE_MINUTES = 15;
const WARNING_SECONDS = 60;
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const;

let started = false;

export function startIdleWatcher() {
    if (started) return;
    started = true;

    const confirm = useConfirm();
    const toast = useToast();
    const router = useRouter();
    const authStore = useAuthStore();
    const companyStore = useCompanyStore();

    let idleTimer: number | null = null;
    let warnTimer: number | null = null;

    const clear = () => {
        if (idleTimer !== null) window.clearTimeout(idleTimer);
        if (warnTimer !== null) window.clearTimeout(warnTimer);
        idleTimer = null;
        warnTimer = null;
    };

    const doLogout = (detail: string) => {
        confirm.close();
        clear();
        authStore.logout();
        toast.add({
            severity: 'info',
            summary: 'Sesión finalizada',
            detail,
            life: companyStore.companyInfo.toastDuration ?? 3000
        });
        router.push({ name: 'Login' });
    };

    const arm = () => {
        clear();
        warnTimer = window.setTimeout(showWarning, IDLE_MINUTES * 60 * 1000 - WARNING_SECONDS * 1000);
        idleTimer = window.setTimeout(() => doLogout('Se ha cerrado la sesión por inactividad.'), IDLE_MINUTES * 60 * 1000);
    };

    const showWarning = () => {
        confirm.require({
            message: `Tu sesión se cerrará por inactividad en ${WARNING_SECONDS / 60} minuto.`,
            header: '¿Sigues ahí?',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Seguir trabajando',
            rejectLabel: 'Cerrar sesión',
            accept: () => arm(),
            reject: () => doLogout('Sesión cerrada.')
        });
    };

    const onActivity = () => {
        if (!authStore.isAuthenticated) return;
        confirm.close();
        arm();
    };

    const attach = () => {
        ACTIVITY_EVENTS.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }));
    };

    const detach = () => {
        ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
    };

    watch(
        () => authStore.isAuthenticated,
        (logged) => {
            confirm.close();
            if (logged) {
                attach();
                arm();
            } else {
                detach();
                clear();
            }
        },
        { immediate: true }
    );
}
