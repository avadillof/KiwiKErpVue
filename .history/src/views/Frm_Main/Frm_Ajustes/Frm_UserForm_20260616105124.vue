<template>
    <Dialog v-model:visible="visible" :header="formData.pkid > 0 ? 'Editar Usuario' : 'Nuevo Usuario'" modal
        :style="{ width: '450px' }">
        <div class="field mt-3">
            <label class="block mb-1">Código</label>
            <InputText v-model="formData.userDsCode" class="w-full" :disabled="formData.pkid > 0" />
        </div>

        <div class="field mt-3">
            <label class="block mb-1">Nombre</label>
            <InputText v-model="formData.name" class="w-full" />
        </div>

        <div class="field mt-3">
            <label class="block mb-1">Email</label>
            <InputText v-model="formData.email" class="w-full" />
        </div>

        <div class="field mt-3">
            <label class="block mb-1">Grupo</label>
            <Select v-model="formData.groupKyId" :options="groupOptions" optionLabel="label" optionValue="value"
                placeholder="Seleccione un grupo" class="w-full" />
        </div>

        <div class="field mt-3">
            <label class="block mb-1">Contraseña</label>
            <Password v-model="formData.password" class="w-full" toggleMask
                :placeholder="formData.pkid > 0 ? 'Vacío para mantener actual' : ''" />
        </div>

        <div class="field mt-3">
            <label class="block mb-1">PIN</label>
            <InputText v-model="formData.pin" class="w-full" maxlength="5" />
        </div>

        <div class="field-checkbox mt-4">
            <Checkbox v-model="formData.active" :binary="true" inputId="activeCheck" />
            <label for="activeCheck" class="ml-2">Usuario Activo</label>
        </div>

        <template #footer>
            <Button label="Cancelar" text @click="visible = false" />
            <Button label="Guardar" icon="pi pi-check" @click="save" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const visible = ref(false);
const groupOptions = ref([]);
const formData = ref<UserFormData>({
    pkid: 0,
    userDsCode: '',
    name: '',
    email: '',
    password: '',
    groupKyId: 0,
    active: true,
    pin: ''
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
}

// Método para abrir el formulario
const open = async (user = null) => {
    // Cargar grupos para el Dropdown


    const res = await axios.get('/api/user-groups');
    groupOptions.value = res.data.map((g: any) => ({ label: g.descriptionEs, value: g.id }));

    if (user) {
        // Si editamos, mapeamos los campos
        formData.value = {
            pkid: user.pkid,
            userDsCode: user.userDsCode,
            name: user.name,
            email: user.email,
            password: '', // Siempre vacío por seguridad
            groupKyId: user.groupKyId || 0,
            active: user.active,
            pin: user.pin || ''
        };
    } else {
        // Reset para nuevo usuario
        formData.value = { pkid: 0, userDsCode: '', name: '', email: '', password: '', groupKyId: 0, active: true, pin: '' };
    }
    visible.value = true;
};

const emit = defineEmits(['saved']);
const save = async () => {
    try {
        await axios.post('/api/WebSaveUser', formData.value);
        visible.value = false;
        emit('saved');
        // Opcional: Emitir evento para que ListGridUsers recargue la tabla
    } catch (error) {
        console.error("Error al guardar:", error);
    }
};

defineExpose({ open });
</script>