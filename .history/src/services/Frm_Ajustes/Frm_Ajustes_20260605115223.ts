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
        nameCompany: '',
        cifCompany: '',
        urlLogoCompany: '',
        email: '',
        phone: '',
        portalWeb: '',
        smtpServer: '',
        smtpPort: 587,
        smtpUser: '',
        address: '',
        addressNumber: '',
        zipCode: '',
        city: '',
        province: '',
        sloganCompany: '',
        smtpAuth: true,
        starttlsEnable: true,
        starttlsRequired: true,
        sslProtocols: 'TLSv1.2',
        mailSender: '',
        toastDuration: 4000,
        reportRgpd: ''
    });

    const loading = ref(false);

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

            const data: ConfigData = await response.json();
            formData.value = { ...formData.value, ...data };
            
            toast.add({ severity: 'info', summary: 'Cargado', detail: 'Datos recuperados', life: 2000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar', life: 3000 });
        } finally {
            loading.value = false;
        }
    }

    async function saveData() {
        loading.value = true;
        // Corrección del puerto 8083 para el logo
        const logoUrl = baseUrl.replace(':8080', ':8083') + '/base/logo.png';
        formData.value.urlLogoCompany = logoUrl;

        try {
            const response = await fetch(`${baseUrl}/WebSaveParameters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData.value)
            });

            if (!response.ok) throw new Error('Error al guardar');

            toast.add({ severity: 'success', summary: 'Guardado', detail: 'Datos actualizados', life: 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
        } finally {
            loading.value = false;
        }
    }



    function onUploadLogo(event: any) {
    // Cuando el servidor termine de guardar, actualizamos la vista
    // El servidor debe devolver la nueva ruta o nombre del archivo
    formData.value.urlLogoCompany = `${assetsUrl}/base/logo.png?t=${new Date().getTime()}`;
    toast.add({ severity: 'success', summary: 'Logo actualizado', detail: 'El logo se ha subido correctamente.', life: 3000 });
}

    // --- RETURN ÚNICO AL FINAL ---
    return {
        formData,
        loading,
        saveData,
        loadData,
        provincias
    };
}