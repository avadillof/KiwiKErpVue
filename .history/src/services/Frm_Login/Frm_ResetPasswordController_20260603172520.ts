import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import {frmLogin} from './Frm_LoginController.ts';

export function useForgotPasswordController() {
    const loading = ref(false);
    const username = ref('');
    const toast = useToast();

    async function handleRequestReset() {
        loading.value = true;
        try {
            const baseUrl = import.meta.env.VITE_API_URL;

            // Creamos los parámetros de la URL: /WebResetPasswordRequest?email=valor
            const params = new URLSearchParams({ email: username.value });

            const response = await fetch(`${baseUrl}/WebResetPasswordRequest?${params.toString()}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
                // IMPORTANTE: En un GET, no se envía la propiedad 'body'
            });

            if (response.ok) {
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Instrucciones enviadas correctamente', life: 5000 });
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la solicitud', life: 5000 });
            }
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'Error de conexión', life: 5000 });
        } finally {
            loading.value = false;
        }
    }

    return {
        username,
        loading,
        handleRequestReset
    };
}