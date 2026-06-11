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
.reset-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.reset-header {
  text-align: center;
}

.icon-circle {
  width: 60px;
  height: 60px;
  background: #f9fbe7; /* Color muy claro de tu tema */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.icon-circle i {
  font-size: 1.5rem;
  color: #B1D70E; /* Tu color corporativo */
}

.reset-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.feedback-area {
  min-height: 40px;
}
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