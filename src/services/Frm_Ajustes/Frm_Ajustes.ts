import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia'; // Importamos esto
import { HelperString } from '../../libs/HelperString';
import { useCompanyStore } from '../../stores/companyStore'
import { provincias } from '../../data/provinces.ts'

export function Frm_Ajustes() {

    const userDialog = ref(false);
    const toast = useToast();
    
    const logoUrl = ref('');
    const loading = ref(false);

    // 1. Conectamos al Store y usamos storeToRefs para mantener la reactividad
    const companyStore = useCompanyStore();
    const { companyInfo: formData } = storeToRefs(companyStore);

    const baseUrl = import.meta.env.VITE_API_URL;

    

    // --- FUNCIONES ---

    async function loadData() {
        loading.value = true;
        try {
            const response = await fetch(`${baseUrl}/WebGetParameters`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                if (response.status === 404) return;
                throw new Error('Error al cargar');
            }
            const data = await response.json();

            // Actualizamos el store
            // El API usa urlLogoCompany (nombre de la columna). En la aplicación
            // mantenemos urlLogo como propiedad de presentación.
            const resolvedLogoUrl = data.urlLogoCompany || `${baseUrl}/base/logo.png`;
            companyStore.setCompanyParameters({ ...data, urlLogo: resolvedLogoUrl });
            logoUrl.value = resolvedLogoUrl;
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar', life: companyStore.companyInfo.toastDuration ?? 3000 });
        } finally {
            loading.value = false;
        }
    }

    async function saveData() {
        // Validaciones usando formData (que ahora es el estado del store)
        if (!formData.value.nameCompany?.trim() || !formData.value.cifCompany?.trim()) {
            toast.add({ severity: 'warn', summary: 'Validación', detail: 'El nombre y el CIF son obligatorios', life: companyStore.companyInfo.toastDuration ?? 3000 });
            return;
        }

        if (formData.value.email && !HelperString.isValidEmail(formData.value.email)) {
            toast.add({ severity: 'warn', summary: 'Validación', detail: 'El formato del email Corporativo de la Empresa no es válido', life: companyStore.companyInfo.toastDuration ?? 3000 });
            return;
        }

        if (formData.value.mailSender && !HelperString.isValidEmail(formData.value.mailSender)) {
            toast.add({ severity: 'warn', summary: 'Validación', detail: 'El formato del email de la cuenta del Sistema no es válido', life: companyStore.companyInfo.toastDuration ?? 3000 });
            return;
        }


        if (!HelperString.isValidCifNif(formData.value.cifCompany)) {
            toast.add({ severity: 'warn', summary: 'Validación', detail: 'El formato del CIF/NIF no es válido', life: companyStore.companyInfo.toastDuration ?? 3000 });
            return;
        }

        loading.value = true;
        try {
            const response = await fetch(`${baseUrl}/WebSaveParameters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData.value)
            });

            if (!response.ok) throw new Error('Error al guardar');

            toast.add({ severity: 'success', summary: 'Guardado', detail: 'Datos actualizados correctamente', life: companyStore.companyInfo.toastDuration ?? 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
        } finally {
            loading.value = false;
        }
    }

    async function onUploadLogo(event: any) {
        const file = event.files[0];
        const formDataUpload = new FormData();
        formDataUpload.append('logo', file);

        try {
            const response = await fetch(`${baseUrl}/WebUploadLogo`, {
                method: 'POST',
                body: formDataUpload
            });

            if (!response.ok) throw new Error('Error al subir la imagen');

            const data = await response.json();
            // Se añade el timestamp únicamente para refrescar la previsualización.
            // La URL que el backend guarda para los PDF no contiene este parámetro.
            const newLogoUrl = `${data.urlLogoCompany || `${baseUrl}/base/logo.png`}?t=${Date.now()}`;
            formData.value.urlLogo = newLogoUrl;
            logoUrl.value = newLogoUrl;

            toast.add({
                severity: 'success',
                summary: 'Correcto',
                detail: 'Logo actualizado',
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo subir',
                life: companyStore.companyInfo.toastDuration ?? 3000
            });
        }
    }


    const handleImageError = (event: Event) => {
        const target = event.target as HTMLImageElement;
        // Ocultamos la imagen rota para que no se vea el icono roto
        target.style.display = 'none';
    };

    const handleImageLoad = (event: Event) => {
        const target = event.target as HTMLImageElement;
        // Cuando la imagen cargue correctamente, nos aseguramos de que sea visible
        target.style.display = 'block';
    };


    function openUserDialog(user?: any) {
        // Aquí prepararás el usuario seleccionado o null si es nuevo
        userDialog.value = true;
    }



    return { userDialog, openUserDialog, handleImageLoad, handleImageError, formData, loading, saveData, loadData, provincias, onUploadLogo, logoUrl, baseUrl };
}
