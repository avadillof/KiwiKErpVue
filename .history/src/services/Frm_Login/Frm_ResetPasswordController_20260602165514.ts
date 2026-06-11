import { ref } from 'vue';
// import { useToast } from 'primevue/usetoast';


export function useForgotPasswordController() {
    const loading = ref(false);
    const username = ref('');    
   // const toast = useToast();

    async function handleRequestReset() {
        if (!username.value) {            
            loading.value = false;
     

            return;
        }

        loading.value = true;        
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            const response = await fetch(`${baseUrl}/WebResetPasswordRequest`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.value })
            });

            if (response.ok) {
     ;
            } else {
     ;
            }
        } catch (error) {
     ;
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