/**
 * Salvaguarda de datos: copias de seguridad de la base de datos y del
 * repositorio documental.
 *
 * El volcado se ejecuta en la infraestructura (Docker/backups del servidor),
 * no en esta vista. El panel permite lanzar una copia manual, registrar su
 * resultado en el histórico y configurar el destino en la nube
 * (Google Drive) para conservarla fuera del servidor.
 *
 * Contrato de endpoints que debe exponer el backend:
 *   GET    /WebGetBackupHistory        -> page+size -> { content, totalElements }
 *   DELETE /WebDeleteBackup?id=        -> elimina copia y su archivo del destino
 *   GET    /WebDownloadBackup?id=      -> blob del archivo de la copia
 *   GET    /WebGetBackupSettings       -> BackupCloudSettings
 *   POST   /WebSaveBackupSettings      -> BackupCloudSettings
 *   POST   /WebTestBackupCloud         -> comprueba el destino configurado
 *
 * Todos los endpoints requieren sesión de portal (cabecera X-Portal-Session).
 */
import axios from 'axios';
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyStore } from '@/stores/companyStore';

export type BackupScope = 'DB' | 'DOCS' | 'ALL';
export type BackupStatus = 'OK' | 'RUNNING' | 'ERROR';
export type CloudProvider = 'AZURE' | 'DRIVE';

export interface BackupRecord {
    /** Identificador de la copia (numérico en futuras fuentes; texto en Google Drive). */
    id: number | string;
    fileName?: string;
    createdAt?: string;
    scope: BackupScope;
    provider: CloudProvider;
    sizeBytes?: number;
    size?: number;
    status: BackupStatus;
    initiatedBy?: string;
    note?: string;
}

export interface BackupCloudSettings {
    provider: CloudProvider;
    azureAccount?: string;
    azureContainer?: string;
    azurePathPrefix?: string;
    azureConfigured?: boolean;
    driveFolderId?: string;
    driveConfigured?: boolean;
    notifyUserIds?: number[];
    scheduleEnabled?: boolean;
    scheduleTime?: string;
    scheduleZone?: string;
    lastScheduledRun?: string;
}

function defaultSettings(): BackupCloudSettings {
    return {
        provider: 'DRIVE',
        azureAccount: '',
        azureContainer: '',
        azurePathPrefix: '',
        driveFolderId: '',
        notifyUserIds: [],
        scheduleEnabled: true,
        scheduleTime: '21:00',
        scheduleZone: 'Europe/Madrid',
    };
}

export interface DriveAuthState {
    status: 'idle' | 'loading' | 'ready' | 'waiting' | 'manual' | 'done';
    authUrl?: string;
    code?: string;
    error?: string;
}

let driveAuthMessageBound = false;

export function Frm_Backup() {
    const toast = useToast();
    const auth = useAuthStore();
    const company = useCompanyStore();
    const toastLife = () => company.companyInfo.toastDuration ?? 3000;

    const loading = ref(false);
    const saving = ref(false);
    const testingCloud = ref(false);
    const runningBackup = ref(false);

    const backups = ref<BackupRecord[]>([]);
    const totalRecords = ref(0);
    const rowsPerPage = ref(10);
    const first = ref(0);

    const settings = ref<BackupCloudSettings>(defaultSettings());
    const azureConnectionString = ref('');
    const notifyCandidates = ref<{ id: number; name: string; email: string }[]>([]);
    const loadingCandidates = ref(false);

    const error = ref('');
    const success = ref('');

    function portal() {
        return auth.portalRequestConfig();
    }

    function safeError(e: any, fallback: string): string {
        return typeof e?.response?.data === 'string'
            ? e.response.data
            : e?.response?.data?.message || e?.message || fallback;
    }

    function acceptSettings(data: any) {
        success.value = '';
        error.value = '';
        const d = data || {};
        settings.value = {
            provider: d.provider === 'AZURE' ? 'DRIVE' : (d.provider || 'DRIVE'),
            azureAccount: d.azureAccount || '',
            azureContainer: d.azureContainer || '',
            azurePathPrefix: d.azurePathPrefix || '',
            azureConfigured: !!d.azureConfigured,
            driveFolderId: d.driveFolderId || '',
            driveConfigured: !!d.driveConfigured,
            notifyUserIds: Array.isArray(d.notifyUserIds) ? d.notifyUserIds.map(Number) : [],
            scheduleEnabled: d.scheduleEnabled !== false,
            scheduleTime: d.scheduleTime || '21:00',
            scheduleZone: d.scheduleZone || 'Europe/Madrid',
            lastScheduledRun: d.lastScheduledRun || undefined,
        };
        azureConnectionString.value = '';
    }

    async function loadHistory(page = 0) {
        loading.value = true;
        success.value = '';
        error.value = '';
        try {
            const { data } = await axios.get(backendUrl(`/WebGetBackupHistory`), {
                ...portal(),
                params: { page, size: rowsPerPage.value, sort: 'createdAt,desc' },
            });
            if (data?.authRequired && data?.authUrl) {
                driveAuth.value = { status: 'ready', authUrl: data.authUrl };
                backups.value = [];
                totalRecords.value = 0;
                error.value = data.message || 'Google Drive no está autorizado.';
                return;
            }
            backups.value = data.content || [];
            totalRecords.value = data.totalElements ?? 0;
            first.value = page * rowsPerPage.value;
        } catch (e: any) {
            if (e?.response?.status === 404) {
                backups.value = [];
                totalRecords.value = 0;
            } else {
                error.value = safeError(e, 'No se pudo cargar el histórico de copias.');
            }
        } finally {
            loading.value = false;
        }
    }

    async function deleteBackup(record: BackupRecord) {
        try {
            const { data } = await axios.delete(backendUrl(`/WebDeleteBackup`), {
                ...portal(),
                params: { id: record.id },
            });
            toast.add({
                severity: 'success',
                summary: 'Eliminada',
                detail: data?.message || 'La copia se ha eliminado del histórico.',
                life: toastLife(),
            });
            await loadHistory();
        } catch (e: any) {
            toast.add({
                severity: 'error',
                summary: 'No se pudo eliminar',
                detail: safeError(e, 'La copia no se pudo eliminar.'),
                life: 6000,
            });
        }
    }

    async function downloadBackup(record: BackupRecord) {
        try {
            const response = await axios.get(backendUrl(`/WebDownloadBackup`), {
                ...portal(),
                params: { id: record.id },
                responseType: 'blob',
            });
            const url = URL.createObjectURL(response.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = downloadFileName(
                response.headers['content-disposition'],
                record.fileName || `kiwikerp-backup-${record.id}`,
            );
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            toast.add({
                severity: 'error',
                summary: 'No se pudo descargar',
                detail: safeError(e, 'La copia no está disponible para descargar.'),
                life: 6000,
            });
        }
    }

    /** Respeta el nombre y la extensión que devuelve el servidor (SQL, ZIP, etc.). */
    function downloadFileName(contentDisposition: unknown, fallback: string): string {
        const header = typeof contentDisposition === 'string' ? contentDisposition : '';
        const encoded = header.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
        const plain = header.match(/filename="?([^";]+)"?/i)?.[1];
        const candidate = encoded ? decodeURIComponent(encoded) : plain;
        return candidate?.trim() || fallback;
    }

    async function loadSettings() {
        try {
            const { data } = await axios.get(backendUrl(`/WebGetBackupSettings`), portal());
            acceptSettings(data);
        } catch (e: any) {
            if (e?.response?.status !== 404) {
                error.value = safeError(e, 'No se pudo cargar la configuración de destino.');
            }
        }
    }

    async function loadNotifyCandidates() {
        loadingCandidates.value = true;
        try {
            const { data } = await axios.get(backendUrl(`/WebGetBackupNotifyCandidates`), portal());
            notifyCandidates.value = Array.isArray(data) ? data : [];
        } catch (e: any) {
            notifyCandidates.value = [];
        } finally {
            loadingCandidates.value = false;
        }
    }

    async function saveSettings() {
        saving.value = true;
        success.value = '';
        error.value = '';
        try {
            const { data } = await axios.post(
                backendUrl(`/WebSaveBackupSettings`),
                { ...settings.value, azureConnectionString: azureConnectionString.value || null },
                portal(),
            );
            acceptSettings(data);
            success.value = 'Configuración de destino guardada.';
            toast.add({
                severity: 'success',
                summary: 'Guardado',
                detail: 'Destino de copias actualizado.',
                life: toastLife(),
            });
        } catch (e: any) {
            error.value = safeError(e, 'No se pudo guardar la configuración de destino.');
            toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: error.value, life: 6000 });
        } finally {
            saving.value = false;
        }
    }

    async function testCloud() {
        testingCloud.value = true;
        success.value = '';
        error.value = '';
        try {
            const { data } = await axios.post(backendUrl(`/WebTestBackupCloud`), {}, portal());
            if (data?.authRequired && data?.authUrl) {
                driveAuth.value = { status: 'ready', authUrl: data.authUrl };
                error.value = data.message || 'Google Drive no está autorizado.';
            } else {
                success.value = data?.message || 'El destino configurado es accesible.';
            }
        } catch (e: any) {
            error.value = safeError(e, 'El destino configurado no es accesible.');
        } finally {
            testingCloud.value = false;
        }
    }

    async function runBackup() {
        runningBackup.value = true;
        success.value = '';
        error.value = '';
        try {
            const { data } = await axios.post(backendUrl(`/WebRunBackup`), {}, portal());
            if (data?.authRequired && data?.authUrl) {
                driveAuth.value = { status: 'ready', authUrl: data.authUrl };
                error.value = data.message || 'Google Drive no está autorizado. Autorízalo antes de lanzar la copia.';
                toast.add({ severity: 'warn', summary: 'Autorización necesaria', detail: error.value, life: 6000 });
            } else {
                success.value = data?.message || 'La copia de seguridad ha comenzado.';
                toast.add({
                    severity: 'success',
                    summary: 'Copia en curso',
                    detail: data?.message || 'La copia de seguridad ha comenzado.',
                    life: toastLife(),
                });
                setTimeout(() => void loadHistory(0), 5000);
            }
        } catch (e: any) {
            error.value = safeError(e, 'No se pudo lanzar la copia de seguridad.');
            toast.add({ severity: 'error', summary: 'No se pudo lanzar', detail: error.value, life: 6000 });
        } finally {
            runningBackup.value = false;
        }
    }

    const driveAuth = ref<DriveAuthState>({ status: 'idle' });
    const authPending = ref(false);

    async function loadDriveAuthStatus() {
        try {
            const { data } = await axios.get(backendUrl(`/WebGetDriveAuthStatus`), portal());
            if (data?.authorized) {
                driveAuth.value = { status: 'done' };
            } else if (data?.authUrl) {
                driveAuth.value = { status: 'ready', authUrl: data.authUrl };
            }
        } catch (e: any) {
            // Sin conexión o no administrador: se deja el estado idle.
        }
    }

    async function requestDriveAuthUrl() {
        authPending.value = true;
        try {
            const { data } = await axios.post(backendUrl(`/WebGetDriveAuthUrl`), {}, portal());
            if (data?.authUrl) {
                driveAuth.value = { status: 'ready', authUrl: data.authUrl };
            } else {
                error.value = 'No se pudo generar el enlace de autorización de Google Drive.';
            }
        } catch (e: any) {
            error.value = safeError(e, 'No se pudo generar el enlace de autorización de Google Drive.');
        } finally {
            authPending.value = false;
        }
    }

    function openDriveAuthUrl() {
        if (driveAuth.value.authUrl) window.open(driveAuth.value.authUrl, '_blank');
    }

    if (!driveAuthMessageBound) {
        driveAuthMessageBound = true;
        window.addEventListener('message', (event) => {
            const d = event?.data;
            if (!d || d.type !== 'KIWIKERP_DRIVE_AUTH') return;
            if (driveAuth.value.status !== 'waiting') return;
            if (d.ok) {
                driveAuth.value = { status: 'done' };
                success.value = 'Google Drive autorizado correctamente.';
                toast.add({ severity: 'success', summary: 'Autorizado', detail: 'Google Drive conectado.', life: toastLife() });
                void loadSettings().then(() => testCloud());
            }
        });
    }

    /**
     * Flujo automático: abre la autorización, espera a que Google redirija al callback
     * del backend (WebDriveOAuthCallback) y sondea hasta que el token se guarde.
     */
    async function waitDriveAuth(showManual?: () => void) {
        driveAuth.value = { status: 'waiting', authUrl: driveAuth.value.authUrl };
        const deadline = Date.now() + 5 * 60 * 1000;
        while (Date.now() < deadline) {
            await new Promise((resolve) => setTimeout(resolve, 2500));
            if (driveAuth.value.status !== 'waiting') return;
            try {
                const { data } = await axios.get(backendUrl(`/WebGetDriveAuthStatus`), portal());
                if (data?.authorized) {
                    driveAuth.value = { status: 'done' };
                    success.value = 'Google Drive autorizado correctamente.';
                    toast.add({ severity: 'success', summary: 'Autorizado', detail: 'Google Drive conectado.', life: toastLife() });
                    await loadSettings();
                    await testCloud();
                    return;
                }
            } catch (e: any) {
                // Transitorio: se reintenta en el siguiente ciclo.
            }
        }
        // Sin notificación del callback pese a autorizar: permitir pegar el code manualmente.
        driveAuth.value = { status: 'manual', authUrl: driveAuth.value.authUrl };
        if (showManual) showManual();
    }

    async function openDriveAuth(autoWait: boolean, showManual?: () => void) {
        if (!driveAuth.value.authUrl) {
            await requestDriveAuthUrl();
        }
        if (!driveAuth.value.authUrl) return;
        openDriveAuthUrl();
        if (autoWait) void waitDriveAuth(showManual);
    }

    async function submitDriveAuthCode() {
        const raw = driveAuth.value.code?.trim();
        if (!raw) {
            error.value = 'Pega aquí la dirección a la que te redirigió Google después de autorizar.';
            return;
        }
        const parsed = parseOAuthRedirect(raw);
        if (!parsed?.code) {
            error.value = 'No se encontró ningún code en lo pegado. Copia la dirección completa de la barra del navegador tras autorizar.';
            return;
        }
        authPending.value = true;
        try {
            const { data } = await axios.post(
                backendUrl(`/WebSaveDriveAuthCode`),
                { code: parsed.code, state: parsed.state || extractState(driveAuth.value.authUrl) },
                portal(),
            );
            driveAuth.value = { status: 'done' };
            success.value = data?.message || 'Google Drive autorizado correctamente.';
            await loadSettings();
            await testCloud();
        } catch (e: any) {
            error.value = safeError(e, 'No se pudo completar la autorización de Google Drive.');
        } finally {
            authPending.value = false;
        }
    }

    function parseOAuthRedirect(value: string): { code?: string; state?: string } {
        const match = value.match(/code=([^&\s]+)/);
        const state = value.match(/[?&]state=([^&\s]+)/);
        if (!match) return {};
        return { code: decodeURIComponent(match[1]), state: state ? decodeURIComponent(state[1]) : undefined };
    }

    function extractState(authUrl?: string): string | undefined {
        if (!authUrl) return undefined;
        const match = authUrl.match(/[?&]state=([^&\s]+)/);
        return match ? decodeURIComponent(match[1]) : undefined;
    }

    return {
        backups,
        totalRecords,
        rowsPerPage,
        first,
        loading,
        saving,
        testingCloud,
        settings,
        azureConnectionString,
        notifyCandidates,
        loadingCandidates,
        error,
        success,
        loadHistory,
        deleteBackup,
        downloadBackup,
        loadSettings,
        loadNotifyCandidates,
        saveSettings,
        testCloud,
        runBackup,
        runningBackup,
        driveAuth,
        authPending,
        loadDriveAuthStatus,
        requestDriveAuthUrl,
        openDriveAuthUrl,
        openDriveAuth,
        waitDriveAuth,
        submitDriveAuthCode,
    };
}
