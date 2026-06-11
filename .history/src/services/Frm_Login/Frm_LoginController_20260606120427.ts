
import { isOnline, onReconnected } from '../composables/ConnectionMonitor.ts';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '../../stores/authStore';
import { useCompanyStore } from '../../stores/companyStore';
import { useRouter } from 'vue-router';

export function loginController() {
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
        txtnombreEmpresa: '',
        txtCifEmpresa: '',
        txtLogoEmpresa: ''

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



    // Función para inicializar los datos
    async function init() {
        const data = await getCompanyParameters();
        if (data) {
            // Asumiendo que el JSON de respuesta tiene las claves correctas
            // Ajusta 'nombre' y 'cif' según lo que devuelva exactamente tu API
            dataEmpresa.value.txtnombreEmpresa = data.nameCompany;
            dataEmpresa.value.txtCifEmpresa = data.cifCompany;

            const newLogoUrl = `${data.urlLogoCompany}?t=${new Date().getTime()}`;
            dataEmpresa.value.txtLogoEmpresa = newLogoUrl;

            
            companyStore.setCompanyParameters({
                nameCompany: data.nameCompany,
                cifCompany: data.cifCompany,
                urlLogoCompany: data.urlLogoCompany
            });
        }
    }
    init();


    watch(onReconnected, () => {
        console.log("Conexión restablecida, reintentando carga de parámetros...");
        init();
    });

    async function handleLogin() {
        // 1. Validamos campos
        if (!loginData.value.username || !loginData.value.password) {
            toast.add({ severity: 'error', summary: 'Campos incompletos', detail: 'Usuario y contraseña son requeridos.', life: 3000 });
            return;
        }

        isLoading.value = true;
        errorMessage.value = '';

        // Inicializamos el controlador para el timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos de espera

        try {
            const baseUrl = import.meta.env.VITE_API_URL;

            const loginPayload = {
                name: loginData.value.username,
                password: loginData.value.password
            };

            // Realizamos la petición pasando el signal del controlador
            const response = await fetch(`${baseUrl}/WebLoginUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginPayload),
                signal: controller.signal // <--- Aquí controlamos el timeout
            });

            // Si la petición llega antes del timeout, limpiamos el temporizador
            clearTimeout(timeoutId);

            // 3. Procesamos la respuesta
            if (response.ok) {
                const userDTO = await response.json();

                console.log("Login exitoso:", userDTO);

                const authStore = useAuthStore();
                authStore.setUser(userDTO);

                toast.add({
                    severity: 'success',
                    summary: 'Bienvenido',
                    detail: `Acceso correcto. Hola ${userDTO.name}`,
                    life: companyStore.companyInfo.toastDuration
                });
                router.push('/Frm_Main');
            } else if (response.status === 404) {
                errorMessage.value = "Credenciales incorrectas.";
                toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña inválidos.', life: 3000 });
            } else {
                throw new Error('Error en el servidor');
            }

        } catch (err: any) {
            // Limpiamos en caso de error
            clearTimeout(timeoutId);

            if (err.name === 'AbortError') {
                console.error("Timeout: La petición excedió el tiempo de espera.");
                errorMessage.value = "El servidor tarda demasiado en responder.";
                toast.add({ severity: 'error', summary: 'Error de conexión', detail: 'Tiempo de espera agotado.', life: 3000 });
            } else {
                console.error(err);
                errorMessage.value = "Error de conexión con el servidor.";
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar al servidor.', life: 3000 });
            }
        } finally {
            isLoading.value = false;
        }
    }

    return {
        loginData,
        isLoading,
        errorMessage,
        handleLogin,
        dataEmpresa,
        logoEmpresaClienteUrl,
        handleForgotPassword,
        logoUrl,
        isForgotPasswordVisible
        
    };
}