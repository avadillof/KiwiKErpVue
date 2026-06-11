import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';


export function useForgotPasswordController() {
    const loading = ref(false);
    const username = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');
    const toast = useToast();

    async function handleRequestReset() {
        if (!username.value) {
            errorMessage.value = "El usuario es obligatorio.";
            loading.value = false;

            toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'No se pudo enviar el correo', 
                life: 3000 
            });


            return;
        }

        loading.value = true;
        errorMessage.value = '';
        successMessage.value = '';

        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/WebResetPasswordRequest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value })
            });

            if (response.ok) {
                successMessage.value = "Se han enviado las instrucciones a su correo.";
            } else {
                errorMessage.value = "Usuario no encontrado o error en el servidor.";
            }
        } catch (error) {
            errorMessage.value = "Error de conexión. Inténtalo más tarde.";
        } finally {
            loading.value = false;
        }
    }

    return {
        username,
        loading,
        errorMessage,
        successMessage,
        handleRequestReset
    };
}