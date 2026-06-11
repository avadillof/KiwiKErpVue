
  <Dialog v-model:visible="visible" modal header="Recuperar Acceso" :style="{ width: '400px' }" class="kiwik-dialog">
    <div class="kiwik-vLayout-clean" style="gap: 1.5rem; padding: 1rem 0;">
      
      <div class="reset-header">
        <i class="pi pi-lock" style="font-size: 2rem; color: #608422; margin-bottom: 1rem;"></i>
    <template>    <p class="reset-subtitle">¿Olvidaste tu clave? No te preocupes. Escribe tu correo electrónico y te enviaremos los pasos para recuperarla.</p>
      </div>
      
  <FloatLabel variant="on" style="width: 100%">
  <InputText 
    id="rec_user" 
    v-model="username" 
    class="kiwik-input" 
    style="width: 100%" 
  />
  <label for="rec_user">Correo electrónico</label>
</FloatLabel>

      <Button label="Enviar instrucciones" @click="handleRequestReset" :loading="loading" class="kiwik-btn-primary" style="width: 100%;" />
      
      <div class="feedback-area">
        <Message v-if="errorMessage" severity="error" variant="simple" size="small">{{ errorMessage }}</Message>
        <Message v-if="successMessage" severity="success" variant="simple" size="small">{{ successMessage }}</Message>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.reset-header {
  text-align: center;
}
.reset-subtitle {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.4;
  margin: 0;
}
.feedback-area {
  min-height: 40px; /* Evita que el layout salte al aparecer el mensaje */
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