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

      <small><i class="pi pi-info-circle"></i> Comprueba que el servidor de KiwiKERP esté iniciado y vuelve a intentarlo.</small>
      <small v-if="autoRetry" class="auto-retry"><i class="pi pi-spin pi-spinner"></i> Reintentando automáticamente… (intento {{ attempts }})</small>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Message from 'primevue/message';
import corporateLogo from '../../assets/logos/corporate.png';
import { getInstallationState } from '../../services/Installation/installationService';
import { isOnline, onReconnected } from '../../services/composables/Sv_MonitorConnectionBack';

const router = useRouter();
const isRetrying = ref(false);
const errorMessage = ref('');
const apiBaseUrl = import.meta.env.VITE_API_URL || 'Servidor local';
const autoRetry = ref(true);
const attempts = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

async function checkAndRedirect(fromAuto = false): Promise<boolean> {
  if (isRetrying.value && fromAuto) return false;
  isRetrying.value = true;
  if (fromAuto) attempts.value++;
  else errorMessage.value = '';
  const installation = await getInstallationState();
  isRetrying.value = false;

  if (installation.status === 'NEW' || installation.status === 'DATABASE_EXISTS' || installation.status === 'IN_PROGRESS') {
    stopAuto();
    await router.replace({ name: 'Installation' });
    return true;
  }
  if (installation.status === 'COMPLETED') {
    stopAuto();
    // Marcar online para que el overlay no reaparezca al volver al Login.
    isOnline.value = true;
    onReconnected.value++;
    await router.replace({ name: 'Login' });
    return true;
  }
  if (!fromAuto) errorMessage.value = installation.message || 'El servidor continúa sin responder.';
  return false;
}

async function retry() {
  await checkAndRedirect(false);
}

function stopAuto() {
  autoRetry.value = false;
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

onMounted(() => {
  // Detección automática: si el back arranca, salir solo sin pulsar nada.
  timer = setInterval(() => {
    if (document.hidden || isRetrying.value) return;
    void checkAndRedirect(true);
  }, 4000);
});

onUnmounted(() => stopAuto());
</script>

<style scoped src="../../assets/styles/System/service-unavailable.css"></style>
