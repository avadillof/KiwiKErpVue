import { ref, type Ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useCompanyStore } from '../../stores/companyStore';


export function useForgotPasswordController(isVisibleRef: Ref<boolean>) {
    const loading = ref(false);
    const username = ref('');
    const toast = useToast();
    const companyStore = useCompanyStore();

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
                toast.add({ severity: 'success', summary: 'Éxito', detail: 'Instrucciones enviadas correctamente', life: companyStore.companyInfo.toastDuration ?? 3000 });
                isVisibleRef.value = false;
                
            } else {
                toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo procesar la solicitud', life: companyStore.companyInfo.toastDuration ?? 3000 });
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
        handleRequestReset,
        
    };
}