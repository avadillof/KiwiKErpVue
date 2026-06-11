<template>
 
</template>


<script setup lang="ts">
import { loginController } from '../../services/Frm_Login/Frm_LoginController.ts';
import ForgotPasswordDialog from './Frm_ResetPassword.vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import Message from 'primevue/message';

const {
  loginData,
  isLoading,
  handleLogin,
  dataEmpresa,
  handleForgotPassword,
  logoUrl,
  isForgotPasswordVisible,  
} = loginController();



</script>

