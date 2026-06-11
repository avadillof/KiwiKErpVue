<template>
  <div class="login-container">
    <img src="../../assets/logos/corporate.png" alt="FreeLandSite" class="corporate-logo" />
    
    

    <div class="login-grid">
      <div class="login-card login-card-main">
        <div class="login-form">
          <Message variant="simple" icon="pi pi-bell" severity="warn" size="small">
            Ingrese sus credenciales de acceso.
          </Message>

          <FloatLabel variant="on">
            <InputText id="user" v-model="loginData.username" />
            <label for="user">Usuario</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <InputText id="pass" type="password" v-model="loginData.password" @keyup.enter="handleLogin" />
            <label for="pass">Contraseña</label>
          </FloatLabel>

          <Button label="¿Olvidaste tu contraseña?" text class="login-link" @click="handleForgotPassword" />
          <Button label="Acceder" :loading="isLoading" @click="handleLogin" class="login-submit" />
        </div>
      </div>

      <div class="login-card login-card-info">
        <div class="login-header">
          <h1 class="branded-title">{{ dataEmpresa.txtnombreEmpresa }}</h1>
          <div class="title-accent"></div>
          <p class="cif-text">CIF: {{ dataEmpresa.txtCifEmpresa }}</p>
          <div>
            <img v-if="dataEmpresa.txtLogoEmpresa" :src="dataEmpresa.txtLogoEmpresa" class="client-logo" />
          </div>
        </div>
      </div>
    </div>

    <div class="footer-container">
      <div class="footer-main">
        Develop by <b>FreeLandSite.es</b> | Versión 1.0.4
      </div>
      <div class="footer-sub">
        Con Tecnología
        <a href="https://www.freelandsite.es" target="_blank">FreeLandsite.es</a>
      </div>
    </div>
  </div>

  <ForgotPasswordDialog v-model:visible="isForgotPasswordVisible" />
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

