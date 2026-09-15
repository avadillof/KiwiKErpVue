<template>
  <main class="login-page">
    <section class="login-shell">
      <img src="../../assets/logos/corporate.png" alt="FreeLandSite" class="corporate-divider-logo" />

      <aside class="brand-panel">
        <div class="brand-glow brand-glow--top"></div>
        <div class="brand-glow brand-glow--bottom"></div>

        <div class="brand-copy">
          <span class="brand-eyebrow">Sistema integrado de gestión</span>
          <h1>Tu empresa,<br />mejor conectada.</h1>
          <p>Gestiona clientes, artículos y todo el ciclo comercial desde un único espacio de trabajo.</p>
        </div>

        <div class="brand-features">
          <span><i class="pi pi-check-circle"></i> Gestión centralizada</span>
          <span><i class="pi pi-shield"></i> Acceso seguro</span>
          <span><i class="pi pi-chart-line"></i> Información en tiempo real</span>
        </div>

        <div class="brand-footer">
          <span>Desarrollado por <a href="https://www.freelandsite.es" target="_blank"
              rel="noopener noreferrer">FreeLandSite.es</a></span>
        </div>
      </aside>

      <section class="access-panel">
        <div class="access-content">
          <header class="company-header">
            <div class="client-logo-wrap">
              <img v-if="dataEmpresa.txtLogoEmpresa" :key="dataEmpresa.txtLogoEmpresa"
                :src="dataEmpresa.txtLogoEmpresa" alt="Logotipo de la empresa"
                class="client-logo" @error="handleImageError" />
              <i class="pi pi-building client-logo-fallback"></i>
            </div>
            <div>
              <span class="access-eyebrow">Bienvenido</span>
              <h2>{{ dataEmpresa.txtnombreEmpresa || 'Acceso a KiwiKERP' }}</h2>
              <p v-if="dataEmpresa.txtCifEmpresa">NIF/CIF: {{ dataEmpresa.txtCifEmpresa }}</p>
            </div>
          </header>

          <div class="access-intro">
            <h3>Inicia sesión</h3>
            <p>Introduce tus credenciales para acceder a tu espacio de trabajo.</p>
          </div>

          <form class="login-form" @submit.prevent="handleLogin">
            <div class="field-group">
              <label for="user">Usuario</label>
              <IconField>
                <InputIcon class="pi pi-user" />
                <InputText id="user" v-model="loginData.username" autocomplete="username" placeholder="Tu usuario"
                  autofocus fluid />
              </IconField>
            </div>

            <div class="field-group">
              <div class="password-label"><label for="pass">Contraseña</label><button type="button"
                  @click="handleForgotPassword">¿La has olvidado?</button></div>
              <Password inputId="pass" v-model="loginData.password" autocomplete="current-password"
                placeholder="Tu contraseña" :feedback="false" toggleMask fluid />
            </div>

            <Button type="submit" label="Acceder a KiwiKERP" icon="pi pi-arrow-right" iconPos="right"
              :loading="isLoading" class="login-submit" />
          </form>

          <p class="access-help"><i class="pi pi-lock"></i> Tus credenciales se envían mediante una conexión segura.</p>
        </div>

        <footer class="access-footer">
          <span>KiwiKERP</span><span class="footer-dot"></span><span>Versión 1.0.4</span>
        </footer>
      </section>
    </section>
  </main>

  <ForgotPasswordDialog v-model:visible="isForgotPasswordVisible" />
</template>

<script setup lang="ts">
import { loginController } from '../../services/Frm_Login/Frm_LoginController.ts';
import ForgotPasswordDialog from './Frm_ResetPassword.vue';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

const {
  loginData,
  isLoading,
  handleLogin,
  dataEmpresa,
  handleForgotPassword,
  isForgotPasswordVisible,
  handleImageError
} = loginController();
</script>
