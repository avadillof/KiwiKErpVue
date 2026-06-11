<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    header="¿Has olvidado tu contraseña?" 
    :style="{ width: '400px' }" 
    class="kiwik-dialog"
    :dismissableMask="true"
  >
    <div class="reset-container">
      
      <div class="reset-header">
        <div class="icon-circle">
          <i class="pi pi-lock"></i>
        </div>
        <p class="reset-subtitle">
          Introduce tu correo electrónico y te enviaremos las instrucciones para restablecer tu acceso.
        </p>
      </div>
      
      <FloatLabel variant="on" class="w-full">
        <InputText 
          id="rec_user" 
          v-model="username" 
          class="w-full"
          @keyup.enter="handleRequestReset"
        />
        <label for="rec_user">Correo electrónico</label>
      </FloatLabel>

      <Button 
        label="Enviar instrucciones" 
        @click="handleRequestReset" 
        :loading="loading" 
        class="w-full p-button-primary"
      />
      
      <div class="feedback-area">
        <Message v-if="errorMessage" severity="error" variant="simple" size="small">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" variant="simple" size="small">{{ successMessage }}</Message>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>

</style>

<script setup>
import { useForgotPasswordController } from '../../services/Frm_Login/Frm_ResetPasswordController.ts';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import Message from 'primevue/message';

const visible = defineModel('visible');

// Instanciamos el controlador separado
const { 
    username, 
    loading, 
    errorMessage, 
    successMessage, 
    handleRequestReset 
} = useForgotPasswordController();
</script>