<template>
    <Dialog v-model:visible="visible" modal :header="formData.pkid > 0 ? 'Editar Usuario' : 'Nuevo Usuario'"
        :style="{ width: '700px' }" class="kiwik-dialog" :dismissableMask="true">

        <div class="kiwik-form-container grid-layout">

            <div class="col-left flex flex-column align-items-center pt-2">
                <div class="relative">
                    <div class="border-circle overflow-hidden border-3 shadow-2 flex align-items-center justify-content-center"
                        style="width: 120px; height: 120px; background: #f8f9fa; border-color: var(--primary-color);">
                        <img v-if="formData.profilePhoto" :src="formData.profilePhoto"
                            class="w-full h-full object-cover" />
                        <i v-else class="pi pi-user text-5xl text-gray-300"></i>
                    </div>
                    <Button icon="pi pi-camera" rounded class="absolute bottom-0 right-0 p-2" @click="openCamera"
                        severity="primary" v-tooltip.left="'Cambiar foto'" />
                </div>
            </div>

            <div class="col-right flex flex-column gap-4">

                <FloatLabel variant="on" class="w-full">
                    <DatePicker id="user_date" v-model="formData.userDtDateUp" class="w-full" showIcon
                        iconDisplay="input" dateFormat="dd/mm/yy" :disabled="formData.pkid > 0" />
                    <label for="user_date">Fecha de Alta</label>
                </FloatLabel>

                <InputGroup>
                    <FloatLabel variant="on" class="w-full">
                        <InputText id="user_code" v-model="formData.userDsCode" class="w-full"
                            :disabled="formData.pkid > 0" />
                        <label for="user_code">Código de Usuario</label>
                    </FloatLabel>
                    <Button icon="pi pi-id-card" @click="generateCode" :disabled="formData.pkid > 0"
                        severity="secondary" />
                </InputGroup>

                <FloatLabel variant="on" class="w-full">
                    <InputText id="user_name" v-model="formData.name" class="w-full" />
                    <label for="user_name">Nombre Completo</label>
                </FloatLabel>

                <FloatLabel variant="on" class="w-full">
                    <InputText id="user_email" v-model="formData.email" class="w-full" />
                    <label for="user_email">Correo Electrónico</label>
                </FloatLabel>

                <FloatLabel variant="on" class="w-full">
                    <Select id="user_group" v-model="formData.groupKyId" :options="groupOptions" optionLabel="label"
                        optionValue="value" class="w-full" />
                    <label for="user_group">Rol / Grupo</label>
                </FloatLabel>

                <FloatLabel variant="on" class="w-full">
                    <Password id="user_pass" v-model="formData.password" class="w-full" toggleMask :feedback="false" />
                    <label for="user_pass">{{ formData.pkid > 0 ? 'Nueva Contraseña' : 'Contraseña' }}</label>
                </FloatLabel>

                <div class="flex align-items-center">
                    <Checkbox v-model="formData.active" :binary="true" inputId="active_check" />
                    <label for="active_check" class="ml-2">Usuario Activo</label>
                </div>
            </div>
        </div>

        <div class="kiwik-separator"></div>

        <div class="flex justify-content-end">
            <Button label="Guardar usuario" icon="pi pi-check" @click="save" />
        </div>
    </Dialog>

    <Dialog v-model:visible="cameraVisible" modal header="Capturar Foto" :style="{ width: '400px' }"
        :dismissableMask="true" class="kiwik-dialog" @hide="stopCamera">

        <div class="flex flex-column" v-if="cameraVisible"> <video ref="videoRef" autoplay playsinline
                class="w-full border-round shadow-2" style="background: #000; min-height: 250px;"></video>

            <div class="kiwik-separator"></div>

            <div class="flex justify-content-end">
                <Button icon="pi pi-camera" label="Capturar Foto" @click="takePhoto" />
            </div>
        </div>
    </Dialog>
</template>

<style scoped>
.grid-layout {
    display: grid;
    grid-template-columns: 140px 1fr;
    gap: 2rem;
    align-items: start;
}

.kiwik-separator {
    border-top: 2px solid var(--primary-color);
    margin: 1.5rem 0;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast
import Tooltip from 'primevue/tooltip';
import { storeToRefs } from 'pinia'; // Importamos esto
import { useCompanyStore } from '../../../stores/companyStore';

const emit = defineEmits(['saved']);
const toast = useToast(); // Inicializa el hook
const visible = ref(false); const vTooltip = Tooltip;
const companyStore = useCompanyStore();
const { companyInfo: formDataCompany } = storeToRefs(companyStore);
const videoRef = ref<HTMLVideoElement | null>(null);
const cameraVisible = ref(false);

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

const activeStream = ref<MediaStream | null>(null);


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
                groupKyId: Number(user.groupKyId),
                profilePhoto: user.profilePhoto || null
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
                profilePhoto: null,
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
    if (!video) {
        console.error("El elemento de video no está disponible.");
        return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/png');

        // Asignación al formData
        formData.value.profilePhoto = imageData;
    }

    // Cerrar cámara
    cameraVisible.value = false;

    // Detener stream correctamente
    const stream = video.srcObject;
    if (stream instanceof MediaStream) {
        stream.getTracks().forEach(track => track.stop());
    }
};



const stopCamera = () => {
    const video = videoRef.value;
    if (video) {
        // Detener el stream
        if (video.srcObject instanceof MediaStream) {
            video.srcObject.getTracks().forEach(track => track.stop());
        }
        // IMPORTANTE: Limpiar el elemento
        video.srcObject = null;
        video.load(); // Esto fuerza al elemento a resetear su estado
    }
};

defineExpose({ open });
</script>