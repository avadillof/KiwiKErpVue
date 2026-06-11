<template>
  
</template>


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