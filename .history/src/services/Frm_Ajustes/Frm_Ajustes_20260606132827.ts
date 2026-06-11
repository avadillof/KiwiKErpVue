import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia'; // Importamos esto
import { HelperString } from '../../libs/HelperString';
import { useCompanyStore } from '../../stores/companyStore'
import UsuariosTabla from './UsuariosTabla.vue';

export function Frm_Ajustes() {

    const userDialog = ref(false);
    const toast = useToast();
    const baseUrl = import.meta.env.VITE_API_URL;
    const logoUrl = ref('');
    const loading = ref(false);

    // 1. Conectamos al Store y usamos storeToRefs para mantener la reactividad
    const companyStore = useCompanyStore();
    const { companyInfo: formData } = storeToRefs(companyStore);

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
            companyStore.setCompanyParameters(data);
            logoUrl.value = data.urlLogoCompany;
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

            // Añadimos el timestamp para romper el caché del navegador
            const timestamp = new Date().getTime();
            const newLogoUrl = `${baseUrl.replace(':8080', ':8083')}/base/logo.png?t=${timestamp}`;

            // 1. Actualizamos el valor local reactivo
            logoUrl.value = newLogoUrl;

            // 2. Actualizamos el store
            formData.value.urlLogoCompany = newLogoUrl;
            companyStore.updateLogoUrl(newLogoUrl);

            toast.add({ severity: 'success', summary: 'Correcto', detail: 'Logo actualizado', life: companyStore.companyInfo.toastDuration ?? 3000 });
        } catch (error) {
            toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo subir', life: companyStore.companyInfo.toastDuration ?? 3000 });
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


 return { handleImageLoad,handleImageError, formData, loading, saveData, loadData, provincias, onUploadLogo, logoUrl, baseUrl };
}