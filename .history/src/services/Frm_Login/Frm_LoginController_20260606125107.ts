
import { isOnline, onReconnected } from '../composables/ConnectionMonitor.ts';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/authStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useRouter } from 'vue-router';

export function loginController() {
    const isDataLoaded = ref(false);
    const toast = useToast();
    const companyStore = useCompanyStore();

    const isForgotPasswordVisible = ref(false);
    const loginData = ref({ username: '', password: '' });
    const isLoading = ref(false);
    const errorMessage = ref('');
    const logoEmpresaClienteUrl = ref('/logos/logo512.png');
    const logoUrl = ref('/logos/logo512.png');
    const router = useRouter();

    const dataEmpresa = ref({
        txtnombreEmpresa: companyStore.companyInfo.nameCompany || '',
        txtCifEmpresa: companyStore.companyInfo.cifCompany || '',
        txtLogoEmpresa: companyStore.companyInfo.urlLogoCompany || ''
    });

    const handleForgotPassword = function () {
        console.log("Navegando a recuperación de contraseña...");
        isForgotPasswordVisible.value = true;
    };

    async function getCompanyParameters() {
        const baseUrl = import.meta.env.VITE_API_URL;

        try {
            const response = await fetch(baseUrl + '/WebGetParameters', {
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
        const data = await getCompanyParameters();
        if (data) {
            dataEmpresa.value.txtnombreEmpresa = data.nameCompany;
            dataEmpresa.value.txtCifEmpresa = data.cifCompany;

            const newLogoUrl = `${data.urlLogoCompany}?t=${new Date().getTime()}`;
            dataEmpresa.value.txtLogoEmpresa = newLogoUrl;
            
            companyStore.setCompanyParameters({
                nameCompany: data.nameCompany,
                cifCompany: data.cifCompany,
                urlLogoCompany: data.urlLogoCompany,
                toastDuration: data.toastDuration // Aseguramos que se guarde el valor real
            });
            isDataLoaded.value = true;
        }
    }
    init();

    watch(onReconnected, () => {
        console.log("Conexión restablecida, reintentando carga de parámetros...");
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
            const baseUrl = import.meta.env.VITE_API_URL;

            const loginPayload = {
                name: loginData.value.username,
                password: loginData.value.password
            };

            const response = await fetch(`${baseUrl}/WebLoginUser`, {
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
                authStore.setUser(userDTO);

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
        handleLogin,
        dataEmpresa,
        logoEmpresaClienteUrl,
        handleForgotPassword,
        logoUrl,
        isForgotPasswordVisible,
        handleImageError
    };
}