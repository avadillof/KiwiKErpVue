<template>
    <Dialog v-model:visible="visible" modal :header="formData.pkid > 0 ? 'Editar Usuario' : 'Nuevo Usuario'"
        :style="{ width: '450px' }" class="kiwik-dialog" :dismissableMask="true">
        <div class="kiwik-form-container">

            <div class="flex flex-column gap-4 mt-3">

                <InputGroup>
                    <FloatLabel variant="on" class="w-full">
                        <InputText id="user_code" v-model="formData.userDsCode" class="w-full"
                            :disabled="formData.pkid > 0" />
                        <label for="user_code">Código de Usuario</label>
                    </FloatLabel>
                    <Button icon="pi pi-id-card" @click="generateCode" :disabled="formData.pkid > 0"
                        severity="secondary" v-tooltip.top="'Generar código automático'" />
                </InputGroup>


                <div class="w-4">
                    <label class="text-sm text-gray-500 mb-1 ml-1">Fecha de Alta</label>
                    <DatePicker v-model="formData.userDtDateUp" class="w-full" showIcon iconDisplay="input"
                        dateFormat="dd/mm/yy" :disabled="formData.pkid > 0" />
                </div>

                <FloatLabel variant="on" class="w-full">
                    <InputText id="user_name" v-model="formData.name" class="w-full" />
                    <label for="user_name">Nombre Completo</label>
                </FloatLabel>

                <FloatLabel variant="on" class="w-full">
                    <InputText id="user_email" v-model="formData.email" class="w-full" />
                    <label for="user_email">Correo Electrónico</label>
                </FloatLabel>

                <div class="w-full">
                    <label class="text-sm text-gray-500 mb-1 ml-1">Rol / Grupo</label>
                    <Select v-model="formData.groupKyId" :options="groupOptions" optionLabel="label" optionValue="value"
                        class="w-full" />
                </div>

                <FloatLabel variant="on" class="w-full">
                    <Password id="user_pass" v-model="formData.password" class="w-full" toggleMask :feedback="false" />
                    <label for="user_pass">{{ formData.pkid > 0 ? 'Nueva Contraseña (opcional)' : 'Contraseña'
                        }}</label>
                </FloatLabel>

                <div class="flex align-items-center justify-content-between">
                    <div class="flex align-items-center">
                        <Checkbox v-model="formData.active" :binary="true" inputId="active_check" />
                        <label for="active_check" class="ml-2">Usuario Activo</label>
                    </div>
                </div>
            </div>

            <div class="kiwik-separator"></div>

            <Button label="Guardar usuario" icon="pi pi-check" @click="save" class="kiwik-btn-auto-right" />
        </div>
    </Dialog>

    <Toast position="top-right" />

</template>

<style scoped>
/* Asegúrate de que estos estilos estén en tu CSS global o aquí */
.kiwik-form-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.reset-header {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
}

.icon-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--primary-50);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    font-size: 1.5rem;
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useToast } from 'primevue/usetoast'; // Importa el hook de Toast
import Tooltip from 'primevue/tooltip';

const toast = useToast(); // Inicializa el hook
const visible = ref(false);
const vTooltip = Tooltip;
import { useCompanyStore } from '../../stores/companyStore'

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
            life: 3000
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
            life: 3000
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
        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario guardado correctamente', life: companyStore.companyInfo.toastDuration });
        visible.value = false;
        emit('saved');
    } catch (error: any) {
        const status = error.response?.status;
        const errorMessage = error.response?.data || 'Error desconocido';

        // Si es un conflicto (409), mostramos el mensaje específico que viene del back
        if (status === 409) {
            toast.add({ severity: 'warn', summary: 'Atención', detail: errorMessage, life: 5000 });
        } else {
            toast.add({ severity: 'error', summary: 'Error', detail: errorMessage, life: 5000 });
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

defineExpose({ open });
</script>