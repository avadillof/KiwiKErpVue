import { backendUrl } from '@/services/backendUrl';
import { FRONT_VERSION, getBackVersion } from '@/services/appVersion';
import { onReconnected } from '../composables/Sv_MonitorConnectionBack.ts';
import { ref, watch, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/authStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useRouter } from 'vue-router';
import { getInstallationState } from '../Installation/installationService';

export function loginController() {
    const isDataLoaded = ref(false);
    const toast = useToast();
    const companyStore = useCompanyStore();

    const isForgotPasswordVisible = ref(false);
    const frontVersion = FRONT_VERSION;
    const backVersion = ref('…');
    // Etiqueta Docker: solo versiones conocidas (en local son 'dev'/'—' y se oculta).
    const versionLabel = computed(() => {
        const front = String(frontVersion ?? '').trim();
        const back = String(backVersion.value ?? '').trim();
        const frontKnown = front !== '' && front !== 'dev';
        const backKnown = back !== '' && back !== '…' && back !== '—' && back !== 'dev';
        if (frontKnown && backKnown) return `Front ${front} · Back ${back}`;
        if (frontKnown) return `Front ${front}`;
        if (backKnown) return `Back ${back}`;
        return '';
    });
    const LAST_USERNAME_KEY = 'kiwik.lastUsername';
    const lastUsername = (() => {
        try {
            return localStorage.getItem(LAST_USERNAME_KEY) || '';
        } catch {
            return '';
        }
    })();
    const loginData = ref({ username: lastUsername, password: '' });
    const isLoading = ref(false);
    const errorMessage = ref('');
    const router = useRouter();

    const initialLogoUrl = companyStore.companyInfo.urlLogo || '';

    const dataEmpresa = ref({
        txtnombreEmpresa: companyStore.companyInfo.nameCompany || '',
        txtCifEmpresa: companyStore.companyInfo.cifCompany || '',
        txtLogoEmpresa: initialLogoUrl
    });

    const handleForgotPassword = function () {
        console.log("Navegando a recuperación de contraseña...");
        isForgotPasswordVisible.value = true;
    };

    async function getCompanyParameters() {
        

        try {
            const response = await fetch(backendUrl('/WebGetParameters'), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al conectar con el servidor de parámetros');
            }

            return await response.json();
        } catch (error) {
            console.error('Error recuperando parámetros:', error);
            return null;
        }
    }

    async function init() {
        getBackVersion().then((v) => { backVersion.value = v; });
        const installation = await getInstallationState();
        if (installation.activationPending || installation.status === 'NEW' || installation.status === 'DATABASE_EXISTS' || installation.status === 'IN_PROGRESS') {
            await router.replace({ name: 'Installation' });
            return;
        }
        if (installation.status === 'ERROR') {
            await router.replace({ name: 'ServiceUnavailable' });
            return;
        }

        const data = await getCompanyParameters();
        if (data) {
            dataEmpresa.value.txtnombreEmpresa = data.nameCompany;
            dataEmpresa.value.txtCifEmpresa = data.cifCompany;

            const logoSource = data.urlLogoCompany
                || companyStore.companyInfo.urlLogo
                || backendUrl(`/base/logo.png`);
            const newLogoUrl = `${logoSource}${logoSource.includes('?') ? '&' : '?'}t=${Date.now()}`;
            dataEmpresa.value.txtLogoEmpresa = newLogoUrl;
            
            companyStore.setCompanyParameters({
                nameCompany: data.nameCompany,
                cifCompany: data.cifCompany,
                urlServer: data.urlServer,
                urlLogo: logoSource,
                toastDuration: data.toastDuration,
                sloganCompany: data.sloganCompany,
                documentRoot: data.documentRoot || '',
                paginationTable: data.paginationTable
                
            });
            isDataLoaded.value = true;
        }
    }
    init();

    watch(onReconnected, () => {
        console.log("Conexión restablecida, comprobando instalación y parámetros...");
        init();
    });

    async function handleLogin() {
        // Obtenemos la duración del store directamente (persistencia asegurada)
        const toastLife = companyStore.companyInfo.toastDuration ?? 3000;

        // 1. Validamos campos
        if (!loginData.value.username || !loginData.value.password) {
            toast.add({ 
                severity: 'error', 
                summary: 'Campos incompletos', 
                detail: 'Usuario y contraseña son requeridos.', 
                life: toastLife 
            });
            return;
        }

        isLoading.value = true;
        errorMessage.value = '';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
            const companyStore = useCompanyStore();
            
            
            const loginPayload = {
                name: loginData.value.username,
                password: loginData.value.password
            };

            const response = await fetch(backendUrl(`/WebLoginUser`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const userDTO = await response.json();
                const authStore = useAuthStore();
                authStore.setUser(userDTO, response.headers.get('X-Portal-Session') || '');
                try {
                    localStorage.setItem(LAST_USERNAME_KEY, loginData.value.username.trim());
                } catch {
                    // almacenamiento no disponible: el login sigue funcionando
                }
                loginData.value.password = '';
                toast.add({
                    severity: 'success',
                    summary: 'Bienvenido',
                    detail: `Acceso correcto. Hola ${userDTO.name}`,
                    life: toastLife
                });
                router.push('/Frm_Main');
            } else if (response.status === 404) {
                errorMessage.value = "Credenciales incorrectas.";
                toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña inválidos.', life: toastLife });
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (err: any) {
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                errorMessage.value = "El servidor tarda demasiado en responder.";
                toast.add({ severity: 'error', summary: 'Error de conexión', detail: 'Tiempo de espera agotado.', life: toastLife });
            } else {
                errorMessage.value = "Error de conexión con el servidor.";
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar al servidor.', life: toastLife });
            }
        } finally {
            isLoading.value = false;
        }
    }


    const handleImageError = (event: Event) => {
        const target = event.target as HTMLImageElement;
        // Ocultamos la imagen si falla
        target.style.display = 'none';
        console.warn("La imagen no pudo cargarse:", target.src);
    };

    return {
        loginData,
        isLoading,
        errorMessage,
        frontVersion,
        backVersion,
        versionLabel,
        handleLogin,
        dataEmpresa,
        handleForgotPassword,
        isForgotPasswordVisible,
        handleImageError
    };
}
