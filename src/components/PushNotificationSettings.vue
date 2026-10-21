<template>
  <section class="push-settings">
    <div class="push-intro">
      <span class="push-icon"><i class="pi pi-mobile" /></span>
      <div>
        <h3>Avisos en tus dispositivos</h3>
        <p>Recibe tareas e incidencias aunque KiwiKERP esté cerrado.</p>
      </div>
      <Button
        label="Activar en este dispositivo"
        icon="pi pi-bell"
        :loading="activating"
        :disabled="!settings.available"
        @click="activate"
      />
      <Button
        label="Vincular móvil"
        icon="pi pi-qrcode"
        outlined
        :loading="pairingLoading"
        :disabled="!settings.available"
        @click="openPairing"
      />
    </div>
    <Message v-if="!settings.available" severity="warn" :closable="false"
      >Web Push todavía no está configurado en esta instalación.</Message
    >
    <div class="quiet-row">
      <div>
        <strong>No molestar</strong
        ><small>La campana seguirá guardando todos los avisos.</small>
      </div>
      <ToggleSwitch v-model="settings.doNotDisturb" class="quiet-toggle" />
    </div>
    <div v-if="settings.doNotDisturb" class="quiet-hours">
      <label>Desde <input v-model="settings.dndFrom" type="time" /></label>
      <label>Hasta <input v-model="settings.dndTo" type="time" /></label>
    </div>
    <div class="settings-actions">
      <Button
        label="Guardar preferencias"
        icon="pi pi-check"
        outlined
        :loading="saving"
        @click="save"
      /><Button
        label="Enviar prueba"
        icon="pi pi-send"
        text
        :disabled="!settings.devices.length"
        @click="sendTest"
      />
    </div>
    <div class="devices">
      <h4>Dispositivos vinculados</h4>
      <p v-if="!settings.devices.length" class="empty">
        Todavía no hay dispositivos vinculados.
      </p>
      <article v-for="device in settings.devices" :key="device.id">
        <i class="pi pi-desktop" />
        <div>
          <strong>{{ device.name }}</strong
          ><small>Último uso: {{ formatDate(device.lastSeen) }}</small>
        </div>
        <Button
          icon="pi pi-trash"
          text
          severity="danger"
          aria-label="Desvincular dispositivo"
          @click="remove(device.id)"
        />
      </article>
    </div>
    <Dialog
      v-model:visible="pairingVisible"
      modal
      header="Vincular un móvil"
      class="pairing-dialog"
      :style="{ width: '31rem' }"
    >
      <div class="pairing-content">
        <p>
          Escanea este código con la cámara del móvil. Solo abrirá una pantalla
          segura para activar los avisos; no carga el ERP completo.
        </p>
        <div v-if="!pairing" class="origin-step">
          <label for="push-origin">Dirección de KiwiKERP accesible desde el móvil</label>
          <InputText id="push-origin" v-model="pairingOrigin" />
          <Message v-if="localOrigin" severity="warn" :closable="false">
            Sustituye localhost por la IP o el nombre de red del equipo donde está KiwiKERP.
          </Message>
          <Button label="Generar código QR" icon="pi pi-qrcode" :loading="pairingLoading" @click="generatePairing" />
        </div>
        <template v-else>
          <img :src="pairing.qrDataUrl" alt="Código QR para vincular el móvil" />
          <small>El código caduca {{ expiryText }} y solo puede usarse una vez.</small>
          <a :href="pairing.pairingUrl" target="_blank" rel="noopener noreferrer">
            Abrir enlace de vinculación
          </a>
        </template>
      </div>
    </Dialog>
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import ToggleSwitch from "primevue/toggleswitch";
import { useToast } from "primevue/usetoast";
import {
  activatePush,
  createPushPairing,
  loadPushSettings,
  removePushDevice,
  savePushSettings,
  testPush,
  type PushSettings,
  type PushPairing,
} from "@/services/pushNotifications";
const props = defineProps<{ portalToken?: string }>();
const toast = useToast();
const activating = ref(false);
const saving = ref(false);
const pairingLoading = ref(false);
const pairingVisible = ref(false);
const pairing = ref<PushPairing | null>(null);
const pairingOrigin = ref(window.location.origin);
const localOrigin = computed(() => /\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(pairingOrigin.value));
const expiryText = computed(() =>
  pairing.value
    ? `a las ${new Date(pairing.value.expiresAt).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`
    : "",
);
const settings = reactive<PushSettings>({
  available: false,
  doNotDisturb: false,
  dndFrom: "22:00",
  dndTo: "08:00",
  devices: [],
});
async function load() {
  try {
    Object.assign(settings, await loadPushSettings(props.portalToken));
    if (!settings.dndFrom) settings.dndFrom = "22:00";
    if (!settings.dndTo) settings.dndTo = "08:00";
  } catch {
    toast.add({
      severity: "error",
      summary: "Notificaciones",
      detail: "No se pudo cargar la configuración.",
      life: 3500,
    });
  }
}
async function activate() {
  activating.value = true;
  try {
    await activatePush(props.portalToken);
    await load();
    toast.add({
      severity: "success",
      summary: "Dispositivo vinculado",
      detail: "Ya puedes recibir avisos de tareas e incidencias.",
      life: 3500,
    });
  } catch (e: any) {
    toast.add({
      severity: "warn",
      summary: "No se pudo activar",
      detail: e?.message || "Revisa los permisos del navegador.",
      life: 4500,
    });
  } finally {
    activating.value = false;
  }
}
async function save() {
  saving.value = true;
  try {
    Object.assign(
      settings,
      await savePushSettings(settings, props.portalToken),
    );
    toast.add({
      severity: "success",
      summary: "Preferencias guardadas",
      detail: "Se aplicarán a tus próximos avisos.",
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
}
async function openPairing() {
  pairing.value = null;
  pairingVisible.value = true;
}
async function generatePairing() {
  pairingLoading.value = true;
  try {
    pairing.value = await createPushPairing(pairingOrigin.value, props.portalToken);
  } catch {
    toast.add({
      severity: "error",
      summary: "No se pudo crear el enlace",
      detail: "Inténtalo de nuevo en unos segundos.",
      life: 3500,
    });
  } finally {
    pairingLoading.value = false;
  }
}
async function sendTest() {
  await testPush(props.portalToken);
  toast.add({
    severity: "info",
    summary: "Prueba enviada",
    detail: "Comprueba las notificaciones del dispositivo.",
    life: 3000,
  });
}
async function remove(id: number) {
  await removePushDevice(id, props.portalToken);
  await load();
}
const formatDate = (v: string) =>
  v ? new Date(v).toLocaleString("es-ES") : "—";
onMounted(load);
</script>
<style scoped>
.push-settings {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.push-intro,
.quiet-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.quiet-row :deep(.quiet-toggle.p-toggleswitch) {
  flex: 0 0 3rem !important;
  width: 3rem !important;
  min-width: 3rem !important;
  max-width: 3rem !important;
}
.push-intro > div,
.quiet-row > div {
  flex: 1;
}
.push-intro h3,
.devices h4 {
  margin: 0;
  color: #1f2937;
}
.push-intro p,
.quiet-row small,
.devices small {
  display: block;
  margin-top: 0.25rem;
  color: #667085;
}
.push-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 12px;
  background: #eef5d7;
  color: #6d8d08;
  font-size: 1.2rem;
}
.quiet-row {
  padding: 1rem;
  border: 1px solid #e2e8d6;
  border-radius: 12px;
  background: #fafcf6;
}
.quiet-hours {
  display: flex;
  gap: 1rem;
}
.quiet-hours label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}
.quiet-hours input {
  padding: 0.55rem;
  border: 1px solid #ccd5bf;
  border-radius: 8px;
}
.settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
.devices {
  border-top: 1px solid #e4e7ec;
  padding-top: 1rem;
}
.devices article {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eef0f2;
}
.devices article div {
  flex: 1;
}
.empty {
  color: #667085;
}
.pairing-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  text-align: center;
}
.pairing-content p {
  margin: 0;
  color: #475467;
  line-height: 1.5;
}
.pairing-content img {
  width: min(280px, 78vw);
  border: 1px solid #e3e8d5;
  border-radius: 14px;
}
.pairing-content small {
  color: #667085;
}
.pairing-content a {
  color: #668500;
  font-weight: 700;
}
.origin-step {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}
.origin-step label {
  color: #344054;
  font-weight: 700;
}
@media (max-width: 650px) {
  .push-intro {
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .push-intro .p-button {
    width: 100%;
  }
  .quiet-hours {
    flex-direction: column;
  }
}
</style>
