<template>
  <main class="pairing-page">
    <section class="pairing-card">
      <img src="/logos/logo512.png" alt="KiwiKERP" class="brand" />
      <p class="eyebrow">KIWIKERP · NOTIFICACIONES</p>
      <h1>Vincular este móvil</h1>
      <div v-if="loading" class="state"><i class="pi pi-spin pi-spinner" /> Comprobando enlace…</div>
      <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>
      <template v-else-if="!completed">
        <p class="description">
          Activarás los avisos de tareas e incidencias para
          <strong>{{ displayName }}</strong>. No necesitas abrir el ERP en el móvil.
        </p>
        <Button
          label="Activar notificaciones"
          icon="pi pi-bell"
          :loading="activating"
          fluid
          @click="activate"
        />
        <small>El navegador te pedirá permiso una sola vez.</small>
      </template>
      <div v-else class="success">
        <i class="pi pi-check-circle" />
        <h2>Móvil vinculado</h2>
        <p>Ya puedes cerrar esta página. Recibirás los próximos avisos.</p>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import Button from "primevue/button";
import Message from "primevue/message";
import {
  activatePairedPush,
  loadPushPairing,
} from "@/services/pushNotifications";

const route = useRoute();
const code = String(route.query.code || "");
const loading = ref(true);
const activating = ref(false);
const completed = ref(false);
const displayName = ref("");
const error = ref("");

onMounted(async () => {
  try {
    if (!code) throw new Error("El enlace de vinculación no es válido.");
    const data = await loadPushPairing(code);
    if (!data.available)
      throw new Error("Las notificaciones no están disponibles en esta instalación.");
    displayName.value = data.displayName;
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || e?.message || "El enlace ha caducado o ya se ha utilizado.";
  } finally {
    loading.value = false;
  }
});

async function activate() {
  activating.value = true;
  try {
    await activatePairedPush(code);
    completed.value = true;
  } catch (e: any) {
    error.value =
      e?.response?.data?.message || e?.message || "No se pudo vincular este móvil.";
  } finally {
    activating.value = false;
  }
}
</script>

<style scoped>
.pairing-page {
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
  background: radial-gradient(circle at top, #f4f9e6, #f5f7f9 55%);
}
.pairing-card {
  width: min(100%, 430px);
  padding: 2rem;
  border: 1px solid #dfe7cc;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 18px 50px rgb(28 40 13 / 10%);
  text-align: center;
}
.brand { width: 68px; height: 68px; object-fit: contain; }
.eyebrow { margin: 0.8rem 0 0.25rem; color: #789800; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; }
h1 { margin: 0 0 1.25rem; color: #172033; font-size: 1.65rem; }
.description { color: #475467; line-height: 1.55; }
.state { padding: 1rem; color: #667085; }
small { display: block; margin-top: 0.9rem; color: #667085; }
.success i { color: #8eb500; font-size: 3rem; }
.success h2 { margin-bottom: 0.25rem; }
.success p { margin-top: 0; color: #667085; }
@media (max-width: 480px) { .pairing-card { padding: 1.5rem 1.1rem; border-radius: 18px; } }
</style>
