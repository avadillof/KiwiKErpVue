<template>
  <div class="login-container">
    <img :src="logoUrl" alt="Logo" class="corner-logo" />

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

    </div>
</template>


<script setup lang="ts">
import { loginController } from '../../services/Frm_Login/Frm_LoginController.ts';
import ForgotPasswordDialog from '../../services/Frm_Login/Frm_ResetPasswordController.ts';
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
    isForgotPasswordVisible 
  } = loginController();
</script>

<style scoped>
.login-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
  align-items: stretch; /* ESTO ES LO QUE FUERZA LA MISMA ALTURA */
  min-width: 0;
}

.login-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  width: 100%;
  
  /* Esto asegura que el contenido interno también ocupe todo el espacio */
  display: flex;
  flex-direction: column;
}

/* Opcional: si quieres que el botón de 'Acceder' se mantenga al final 
   de la tarjeta aunque el contenido sea corto */
.login-form {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .login-grid {
    grid-template-columns: 1fr;
  }
}
</style>