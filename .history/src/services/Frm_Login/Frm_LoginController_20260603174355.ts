
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

    const handleForgotPassword = function() {
        console.log("Navegando a recuperación de contraseña...");
        isForgotPasswordVisible.value = true;
    };




    async function getCompanyParameters() {

        const baseUrl = import.meta.env.VITE_API_URL;

        try {
            const response = await fetch(baseUrl+'/WebGetParameters', {
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
        if (!loginData.value.username || !loginData.value.password) {
            toast.add({ 
                severity: 'error', 
                summary: 'Campos incompletos', 
                detail: 'Por favor, introduce tanto el usuario como la contraseña.', 
                life: 3000 
            });
            return; // Corta la ejecución aquí
        }

        isLoading.value = true;
        errorMessage.value = '';

        try {
            console.log("Conectando con el servidor...");
            // Aquí iría tu lógica de fetch para el login
        } catch (err) {
            errorMessage.value = "Credenciales incorrectas o error de conexión.";
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