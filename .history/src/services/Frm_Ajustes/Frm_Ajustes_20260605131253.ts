import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import FileUpload from 'primevue/fileupload';

export interface ConfigData {
    nameCompany: string;
    cifCompany: string;
    urlLogoCompany: string;
    email: string;
    phone: string;
    portalWeb: string;
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    address: string;
    addressNumber: string;
    zipCode: string;
    city: string;
    province: string;
    sloganCompany: string;
    smtpAuth: boolean;
    starttlsEnable: boolean;
    starttlsRequired: boolean;
    sslProtocols: string;
    mailSender: string;
    toastDuration: number;
    reportRgpd: string;
}

export function Frm_Ajustes() {
    const toast = useToast();
    const baseUrl = import.meta.env.VITE_API_URL;
    const logoUrl = ref('');

    const provincias = [
        { nombre: 'Álava' }, { nombre: 'Albacete' }, { nombre: 'Alicante' }, { nombre: 'Almería' },
        { nombre: 'Ávila' }, { nombre: 'Badajoz' }, { nombre: 'Baleares' }, { nombre: 'Barcelona' },
        { nombre: 'Burgos' }, { nombre: 'Cáceres' }, { nombre: 'Cádiz' }, { nombre: 'Castellón' },
        { nombre: 'Ciudad Real' }, { nombre: 'Córdoba' }, { nombre: 'A Coruña' }, { nombre: 'Cuenca' },
        { nombre: 'Girona' }, { nombre: 'Granada' }, { nombre: 'Guadalajara' }, { nombre: 'Gipuzkoa' },
        { nombre: 'Huelva' }, { nombre: 'Huesca' }, { nombre: 'Jaén' }, { nombre: 'León' },
        { nombre: 'Lleida' }, { nombre: 'La Rioja' }, { nombre: 'Lugo' }, { nombre: 'Madrid' },
        { nombre: 'Málaga' }, { nombre: 'Murcia' }, { nombre: 'Navarra' }, { nombre: 'Ourense' },
        { nombre: 'Asturias' }, { nombre: 'Palencia' }, { nombre: 'Las Palmas' }, { nombre: 'Pontevedra' },
        { nombre: 'Salamanca' }, { nombre: 'Santa Cruz de Tenerife' }, { nombre: 'Cantabria' },
        { nombre: 'Segovia' }, { nombre: 'Sevilla' }, { nombre: 'Soria' }, { nombre: 'Tarragona' },
        { nombre: 'Teruel' }, { nombre: 'Toledo' }, { nombre: 'Valencia' }, { nombre: 'Valladolid' },
        { nombre: 'Bizkaia' }, { nombre: 'Zamora' }, { nombre: 'Zaragoza' }
    ];

    const formData = ref<ConfigData>({
        nameCompany: '', cifCompany: '', urlLogoCompany: '', email: '', phone: '',
        portalWeb: '', smtpServer: '', smtpPort: 587, smtpUser: '', address: '',
        addressNumber: '', zipCode: '', city: '', province: '', sloganCompany: '',
        smtpAuth: true, starttlsEnable: true, starttlsRequired: true,
        sslProtocols: 'TLSv1.2', mailSender: '', toastDuration: 4000, reportRgpd: ''
    });

    const loading = ref(false);

    // --- FUNCIONS ---

    async function loadData() {
        loading.value = true;
        try {
            const response = await fetch(`${baseUrl}/WebGetParameters`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                if (response.status === 404) return;
                throw new Error('Error al carregar');
            }
            const data: ConfigData = await response.json();
            formData.value = { ...formData.value, ...data };
            logoUrl.value = data.urlLogoCompany;
            toast.add({ severity: 'info', summary: 'Càrrega', detail: 'Dades recuperades', life: 2000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No es va poder carregar', life: 3000 });
        } finally {
            loading.value = false;
        }
    }

    async function saveData() {
    // 1. Validación de campos obligatorios
    if (!formData.value.nameCompany?.trim() || !formData.value.cifCompany?.trim()) {
        toast.add({ 
            severity: 'warn', 
            summary: 'Validació requerida', 
            detail: 'El nom de l\'entitat i el CIF són obligatoris', 
            life: 3000 
        });
        return; // Detenemos la ejecución aquí
    }

    // 2. Si pasa la validación, procedemos con el guardado
    loading.value = true;
    
    // Asignación de la URL del logo
    logoUrl.value = baseUrl.replace(':8080', ':8083') + '/base/logo.png';
    formData.value.urlLogoCompany = logoUrl.value;

    try {
        const response = await fetch(`${baseUrl}/WebSaveParameters`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData.value)
        });
        
        if (!response.ok) throw new Error('Error al guardar');
        
        toast.add({ 
            severity: 'success', 
            summary: 'Guardat', 
            detail: 'Dades actualitzades correctament', 
            life: 3000 
        });
    } catch (error) {
        toast.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'No es va poder guardar', 
            life: 3000 
        });
    } finally {
        loading.value = false;
    }
}

    async function onUploadLogo(event: any) {
        console.info(">>>>>>>>>>>>>>>>>>>>>");
        const file = event.files[0]; // Obtenemos el archivo seleccionado

        const formDataUpload = new FormData();
        formDataUpload.append('logo', file); // 'logo' es el nombre del parámetro que espera tu Java @RequestParam

        try {
            const response = await fetch(`${baseUrl}/WebUploadLogo`, {
                method: 'POST',
                body: formDataUpload // Se envía como multipart/form-data
            });

            if (!response.ok) throw new Error('Error al subir la imagen');

            // Si la subida fue OK, actualizamos la vista            
            logoUrl.value = `${baseUrl}/base/logo.png?t=${new Date().getTime()}`;
            formData.value.urlLogoCompany = logoUrl.value;

            toast.add({
                severity: 'success',
                summary: 'Logo guardado',
                detail: 'La imagen se ha guardado en el servidor.',
                life: 3000
            });

        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo subir la imagen.',
                life: 3000
            });
            console.error(error);
        }
    }

    return {
        formData, loading, saveData, loadData, provincias, onUploadLogo, logoUrl, baseUrl
    };
}