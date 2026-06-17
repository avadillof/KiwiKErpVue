

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast
import Tooltip from 'primevue/tooltip';

const toast = useToast(); // Inicializa el hook
const visible = ref(false);
const vTooltip = Tooltip;
import { storeToRefs } from 'pinia'; // Importamos esto
import { useCompanyStore } from '../../../stores/companyStore';


const companyStore = useCompanyStore();
const { companyInfo: formDataCompany } = storeToRefs(companyStore);

const formData = ref<UserFormData>({
    pkid: 0,
    userDsCode: '',
    name: '',
    email: '',
    password: '',
    groupKyId: 0,
    active: true,
    pin: '',
    userDtDateUp: null,
    profilePhoto: null,
    

});


interface UserFormData {
    pkid: number;
    userDsCode: string;
    name: string;
    email: string;
    password: string;
    groupKyId: number;
    active: boolean;
    pin: string;
    userDtDateUp: Date | null;
    profilePhoto: string | null; // Guardará el base64
}


interface DropdownOption {
    label: string;
    value: number; // o string, dependiendo de lo que sea tu ID
}

// 2. Aplica el tipo a la ref
const groupOptions = ref<DropdownOption[]>([]);

// Método para abrir el formulario
const open = async (user: UserFormData | null = null) => {
    try {
        // 1. Cargamos los grupos de forma segura
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}/WebGetGroups`);

        // Validamos que sea un array antes de mapear
        if (Array.isArray(res.data)) {
            groupOptions.value = res.data.map((g: any) => ({
                label: g.descriptionEs,
                value: g.id
            }));
        } else {
            console.error("Formato de grupos inesperado:", res.data);
            groupOptions.value = [];
        }

        // 2. Mapeo del usuario
        if (user) {

            console.info('------>');
            console.info(user);
            formData.value = {
                pkid: user.pkid,
                userDsCode: user.userDsCode,
                name: user.name,
                email: user.email,
                password: '',
                active: user.active,
                pin: user.pin || '',
                userDtDateUp: user.userDtDateUp ? new Date(user.userDtDateUp) : new Date(),
                groupKyId: Number(user.groupKyId)
            };
        } else {
            // Reset limpio
            formData.value = {
                pkid: 0,
                userDsCode: '',
                name: '',
                email: '',
                password: '',
                groupKyId: 0,
                active: true,
                pin: '',
                userDtDateUp: null
            };
        }

        visible.value = true;
    } catch (error: any) {
        console.error("Error al abrir el formulario:", error);
        // Si falla la carga de grupos, avisamos al usuario
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos necesarios.',
            life: companyStore.companyInfo.toastDuration ?? 100
        });
    }
};

const emit = defineEmits(['saved']);
const save = async () => {
    // 1. Validación de campos obligatorios
    // Añadimos !formData.value.userDtDateUp para validar que se haya seleccionado fecha
    if (!formData.value.userDsCode.trim() ||
        !formData.value.name.trim() ||
        !formData.value.email.trim() ||
        formData.value.groupKyId === 0 ||
        !formData.value.userDtDateUp) {

        toast.add({
            severity: 'warn',
            summary: 'Campos incompletos',
            detail: 'El código, nombre, email, rol y fecha de alta son obligatorios.',
            life: companyStore.companyInfo.toastDuration ?? 100
        });
        return;
    }

    // 2. Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value.email)) {
        toast.add({
            severity: 'warn',
            summary: 'Correo inválido',
            detail: 'Por favor, introduce un formato de correo electrónico válido.',
            life: 3000
        });
        return;
    }

    // 3. Preparación de datos para el envío
    // Creamos un objeto con los datos y convertimos la fecha a formato ISO string
    // esto es lo que mejor entiende Java/LocalDateTime
    const dataToSend = {
        ...formData.value,
        userDtDateUp: formData.value.userDtDateUp ? new Date(formData.value.userDtDateUp).toISOString() : null
    };

    // 4. Envío al servidor
    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/WebSaveUser`, dataToSend);
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario guardado correctamente', life: companyStore.companyInfo.toastDuration ?? 100 });
        visible.value = false;
        emit('saved');
    } catch (error: any) {
        const status = error.response?.status;
        const errorMessage = error.response?.data || 'Error desconocido';

        // Si es un conflicto (409), mostramos el mensaje específico que viene del back
        if (status === 409) {
            toast.add({ severity: 'warn', summary: 'Atención', detail: errorMessage, life: companyStore.companyInfo.toastDuration ?? 100 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: companyStore.companyInfo.toastDuration ?? 100 });
        }
    }
};


const generateCode = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL;
        const res = await axios.get(`${baseUrl}/WebGenerateUserCode`);
        // Asignamos el código generado al modelo
        formData.value.userDsCode = res.data;
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo generar el código automático.',
            life: 3000
        });
    }
};



const videoRef = ref<HTMLVideoElement | null>(null);
const cameraVisible = ref(false);

const openCamera = async () => {
    cameraVisible.value = true;
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.value) videoRef.value.srcObject = stream;
    } catch (err) {
        console.error("Error al acceder a la cámara:", err);
    }
};

const takePhoto = () => {
    const video = videoRef.value;
    const canvas = document.createElement('canvas');
    canvas.width = video!.videoWidth;
    canvas.height = video!.videoHeight;
    canvas.getContext('2d')!.drawImage(video!, 0, 0);
    
    // Convertir a base64 para enviarlo al backend
    const imageData = canvas.toDataURL('image/jpeg');
    //formData.value.profilePhoto = imageData; // Guardar en tu DTO
    
    // Detener la cámara
    (video!.srcObject as MediaStream).getTracks().forEach(track => track.stop());
    cameraVisible.value = false;
};


defineExpose({ open });
</script>