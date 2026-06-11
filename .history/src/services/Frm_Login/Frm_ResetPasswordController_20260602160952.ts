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
            errorMessage.value = "";
            loading.value = false;

            toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'El Usaurio es Obligatorio.', 
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
                toast.add({ 
                severity: 'success', 
                summary: 'Éxito', 
                detail: 'Instrucciones enviadas correctamente', 
                life: 3000 
            });
            } else {
                toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Usuario no encontrado', 
                life: 3000 
            });
            }
        } catch (error) {
            toast.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Error de conexión', 
                life: 3000 
            });
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