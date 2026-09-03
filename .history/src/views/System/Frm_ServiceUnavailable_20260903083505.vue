<template>
  <main class="service-unavailable-page">
    <section class="service-unavailable-card">
      <img :src="corporateLogo" alt="KiwiKERP · FreeLandSite" class="service-unavailable-logo" />

      <div class="service-unavailable-illustration" aria-hidden="true">
        <span class="service-unavailable-pulse"></span>
        <i class="pi pi-server"></i>
        <i class="pi pi-times service-unavailable-cross"></i>
      </div>

      <span class="service-unavailable-eyebrow">KiwiKERP no puede conectar</span>
      <h1>Servidor no disponible</h1>
      <p>La aplicación está preparada, pero el servicio de KiwiKERP no responde en este momento.</p>

      <div class="service-unavailable-detail">
        <i class="pi pi-link"></i>
        <div><span>Servidor comprobado</span><strong>{{ apiBaseUrl }}</strong></div>
      </div>

      <Message v-if="errorMessage" severity="error" :closable="false" class="service-unavailable-message">
        {{ errorMessage }}
      </Message>

      <Button label="Reintentar conexión" icon="pi pi-refresh" class="service-unavailable-retry"
        :loading="isRetrying" @click="retry" />

      <small><i class="pi pi-info-circle"></i> Comprueba que el servidor de KiwiKERP esté iniciado y vuelve a intentarlo. V2</small>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Message from 'primevue/message';
import corporateLogo from '../../assets/logos/corporate.png';
import { getInstallationState } from '../../services/Installation/installationService';

const router = useRouter();
const isRetrying = ref(false);
const errorMessage = ref('');
const apiBaseUrl = import.meta.env.VITE_API_URL || 'Servidor local';

async function retry() {
  if (isRetrying.value) return;
  isRetrying.value = true;
  errorMessage.value = '';
  const installation = await getInstallationState();
  isRetrying.value = false;

  if (installation.status === 'NEW' || installation.status === 'IN_PROGRESS') {
    await router.replace({ name: 'Installation' });
    return;
  }
  if (installation.status === 'COMPLETED' || installation.status === 'LEGACY') {
    await router.replace({ name: 'Login' });
    return;
  }
  errorMessage.value = installation.message || 'El servidor continúa sin responder.';
}
</script>

<style scoped src="../../assets/styles/System/service-unavailable.css"></style>
