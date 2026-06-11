
import { isOnline, onReconnected } from '../composables/ConnectionMonitor.ts';
import { ref, onMounted, watch } from 'vue';
import { useToast } from 'primevue/usetoast';

export function loginController() {
    const toast = useToast();

    const isForgotPasswordVisible = ref(false);
    const loginData = ref({ username: '', password: '' });
    const isLoading = ref(false);
    const errorMessage = ref('');
    const logoEmpresaClienteUrl = ref('/logos/logo512.png');
    const logoUrl = ref('/logos/logo512.png');

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
            dataEmpresa.value.txtLogoEmpresa = data.urlLogoCompany;
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

        try {
            const baseUrl = import.meta.env.VITE_API_URL;

            // 2. Construimos la URL con los parámetros
            // Usamos URLSearchParams para asegurar que caracteres especiales se codifiquen bien
            const params = new URLSearchParams({
                codeUser: loginData.value.username,
                password: loginData.value.password
            });

            const response = await fetch(`${baseUrl}/WebApiLoginUser?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // 3. Procesamos la respuesta
            if (response.ok) {
                const user = await response.json();
                console.log("Login exitoso:", user);
                toast.add({ severity: 'success', summary: 'Bienvenido', detail: 'Acceso correcto.', life: 3000 });
                // Aquí redirigirías al usuario o guardarías el token/sesión
            } else if (response.status === 404) {
                errorMessage.value = "Credenciales incorrectas.";
                toast.add({ severity: 'error', summary: 'Error', detail: 'Usuario o contraseña inválidos.', life: 3000 });
            } else {
                throw new Error('Error en el servidor');
            }

        } catch (err) {
            console.error(err);
            errorMessage.value = "Error de conexión con el servidor.";
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar al servidor.', life: 3000 });
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