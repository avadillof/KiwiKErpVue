<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="formData.pkid > 0 ? 'Editar Usuario' : 'Nuevo Usuario'" 
    :style="{ width: '450px' }"
    class="kiwik-dialog" 
    :dismissableMask="true"
  >
    <div class="kiwik-form-container">      

      <div class="flex flex-column gap-4 mt-3">
        
        <FloatLabel variant="on" class="w-full">
          <InputText id="user_code" v-model="formData.userDsCode" class="w-full" :disabled="formData.pkid > 0" />
          <label for="user_code">Código de Usuario</label>
        </FloatLabel>

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
          <Select 
            v-model="formData.groupKyId" 
            :options="groupOptions" 
            optionLabel="label" 
            optionValue="value" 
            class="w-full" 
          />
        </div>

        <FloatLabel variant="on" class="w-full">
          <Password id="user_pass" v-model="formData.password" class="w-full" toggleMask :feedback="false" />
          <label for="user_pass">{{ formData.pkid > 0 ? 'Nueva Contraseña (opcional)' : 'Contraseña' }}</label>
        </FloatLabel>

        <div class="flex align-items-center justify-content-between">
          <div class="flex align-items-center">
            <Checkbox v-model="formData.active" :binary="true" inputId="active_check" />
            <label for="active_check" class="ml-2">Usuario Activo</label>
          </div>
        </div>
      </div>

      <div class="kiwik-separator"></div>

      <Button 
        label="Guardar usuario" 
        icon="pi pi-check" 
        @click="save" 
        class="kiwik-btn-auto-right" 
      />
    </div>
  </Dialog>
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
const open = async (user: UserFormData | null = null) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const res = await axios.get(baseUrl+ `/WebGetGroups`);
    groupOptions.value = res.data.map((g: any) => ({ label: g.descriptionEs, value: g.id }));

    if (user) {
        // Ahora TypeScript sabe que 'user' es de tipo UserFormData
        formData.value = {
            pkid: user.pkid,
            userDsCode: user.userDsCode,
            name: user.name,
            email: user.email,
            password: '',
            groupKyId: user.groupKyId || 0,
            active: user.active,
            pin: user.pin || ''
        };
    } else {
        // Reset para nuevo usuario
        formData.value = {
            pkid: 0,
            userDsCode: '',
            name: '',
            email: '',
            password: '',
            groupKyId: 0,
            active: true,
            pin: ''
        };
    }
    visible.value = true;
};

const emit = defineEmits(['saved']);
const save = async () => {
    try {
        const baseUrl = import.meta.env.VITE_API_URL;
        
        await axios.post('/WebSaveUser', formData.value);
        visible.value = false;
        emit('saved');
        // Opcional: Emitir evento para que ListGridUsers recargue la tabla
    } catch (error) {
        console.error("Error al guardar:", error);
    }
};

defineExpose({ open });
</script>