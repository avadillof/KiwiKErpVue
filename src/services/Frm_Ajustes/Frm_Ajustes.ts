import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia'; // Importamos esto
import { HelperString } from '../../libs/HelperString';
import { useCompanyStore } from '../../stores/companyStore'
import { provincias } from '../../data/provinces.ts'
import { useAuthStore } from '../../stores/authStore';

export function Frm_Ajustes() {

    const userDialog = ref(false);
    const toast = useToast();
    
    const logoUrl = ref('');
    const loading = ref(false);
    const testingSmtp = ref(false);

    // 1. Conectamos al Store y usamos storeToRefs para mantener la reactividad
    const companyStore = useCompanyStore();
    const authStore = useAuthStore();
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
            companyStore.setCompanyParameters({
                ...data,
                urlLogo: resolvedLogoUrl,
                smtpPasswordCountSmtp: ''
            });
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

        if (companyStore.companyInfo.documentRoot && !/^(?:[a-zA-Z]:[\\/]|\/)/.test(companyStore.companyInfo.documentRoot.trim())) {
            toast.add({ severity: 'warn', summary: 'Validación', detail: 'La ruta del repositorio documental debe ser absoluta.', life: companyStore.companyInfo.toastDuration ?? 3000 });
            return;
        }

        loading.value = true;
        try {
            const portalHeaders = authStore.portalRequestConfig().headers;
            const response = await fetch(`${baseUrl}/WebSaveParameters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...portalHeaders },
                body: JSON.stringify(formData.value)
            });

            if (!response.ok) {
                const payload = await response.text();
                let detail = payload;
                try {
                    const parsed = JSON.parse(payload);
                    detail = parsed.message || parsed.error || payload;
                } catch { /* El backend también puede devolver texto plano. */ }
                throw new Error(detail || 'No se pudo guardar la configuración.');
            }

            const saved = await response.json();
            companyStore.setCompanyParameters(saved);
            formData.value.smtpPasswordCountSmtp = '';
            toast.add({ severity: 'success', summary: 'Guardado', detail: 'Datos actualizados correctamente', life: companyStore.companyInfo.toastDuration ?? 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'No se pudo guardar', detail: error instanceof Error ? error.message : 'No se pudo guardar la configuración.', life: 6000 });
            await loadData();
        } finally {
            loading.value = false;
        }
    }

    async function testSmtpConnection() {
        if (!formData.value.smtpServer?.trim() || !formData.value.smtpPort) {
            toast.add({
                severity: 'warn',
                summary: 'Configuración incompleta',
                detail: 'Indica el servidor y el puerto SMTP.',
                life: companyStore.companyInfo.toastDuration ?? 4000
            });
            return;
        }

        testingSmtp.value = true;
        try {
            const portalHeaders = authStore.portalRequestConfig().headers;
            const response = await fetch(`${baseUrl}/WebTestSmtpConnection`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...portalHeaders },
                body: JSON.stringify(formData.value)
            });
            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.message || 'No se pudo verificar la conexión SMTP.');
            }

            toast.add({
                severity: 'success',
                summary: 'Conexión SMTP correcta',
                detail: result.message || 'El servidor SMTP ha aceptado la conexión y la autenticación.',
                life: companyStore.companyInfo.toastDuration ?? 5000
            });
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error de conexión SMTP',
                detail: error instanceof Error ? error.message : 'No se pudo verificar la conexión SMTP.',
                life: 7000
            });
        } finally {
            testingSmtp.value = false;
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



    return { userDialog, openUserDialog, handleImageLoad, handleImageError, formData, loading, testingSmtp, testSmtpConnection, saveData, loadData, provincias, onUploadLogo, logoUrl, baseUrl };
}
