<template>
  <div class="profile-page">
    <header class="profile-hero">
      <div>
        <span class="profile-kicker"
          ><i class="pi pi-user" /> Cuenta personal</span
        >
        <h1>Mi perfil</h1>
        <p>
          Actualiza tus datos de contacto y la imagen con la que aparecerás en
          el portal.
        </p>
      </div>
    </header>

    <div class="profile-grid">
      <section class="profile-card photo-card">
        <div class="profile-card__heading">
          <span class="profile-card__icon"><i class="pi pi-camera" /></span>
          <div>
            <h2>Fotografía</h2>
            <p>Tu imagen personal en KiwiKERP.</p>
          </div>
        </div>
        <div class="photo-content">
          <div class="photo-preview">
            <img v-if="photoUrl" :src="photoUrl" alt="Fotografía del perfil" />
            <span v-else>{{ initials }}</span>
          </div>
          <div class="photo-copy">
            <strong>Elige una imagen clara y reconocible</strong>
            <span>Formatos JPG o PNG. Tamaño máximo: 5 MB.</span>
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              accept="image/jpeg,image/png"
              @change="onPhotoSelected"
            />
            <div class="photo-actions">
              <Button
                label="Hacer una foto"
                icon="pi pi-camera"
                :loading="uploading"
                @click="openCamera"
              />
              <Button
                label="Subir imagen"
                icon="pi pi-upload"
                outlined
                :loading="uploading"
                @click="fileInput?.click()"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="profile-card data-card">
        <div class="profile-card__heading">
          <span class="profile-card__icon"><i class="pi pi-id-card" /></span>
          <div>
            <h2>Datos personales</h2>
            <p>Información utilizada para comunicarnos contigo.</p>
          </div>
        </div>

        <form class="profile-form" @submit.prevent="save">
          <div class="field field--wide">
            <label for="profile-name">Nombre y apellidos</label>
            <InputText
              id="profile-name"
              v-model.trim="form.name"
              autocomplete="name"
              fluid
            />
          </div>
          <div class="field field--wide">
            <label for="profile-email">Correo electrónico</label>
            <InputText
              id="profile-email"
              v-model.trim="form.email"
              type="email"
              autocomplete="email"
              fluid
            />
            <small
              >Los próximos enlaces de acceso se enviarán a esta
              dirección.</small
            >
          </div>
          <div class="field">
            <label for="profile-phone">Teléfono</label>
            <InputText
              id="profile-phone"
              v-model.trim="form.phone"
              autocomplete="tel"
              fluid
            />
          </div>
          <div class="field">
            <label for="profile-nif">NIF</label>
            <InputText
              id="profile-nif"
              v-model.trim="form.nif"
              maxlength="50"
              fluid
            />
          </div>
          <div class="field">
            <label for="profile-born">Fecha de nacimiento</label>
            <input
              id="profile-born"
              v-model="form.born"
              class="native-date"
              type="date"
            />
          </div>

          <Message
            v-if="error"
            severity="error"
            :closable="false"
            class="field--wide"
            >{{ error }}</Message
          >
          <div class="form-actions field--wide">
            <Button
              type="submit"
              label="Guardar cambios"
              icon="pi pi-check"
              :loading="saving"
            />
          </div>
        </form>
      </section>
    </div>
  </div>

  <Dialog
    v-model:visible="cameraVisible"
    modal
    header="Hacer una foto"
    class="kiwik-dialog camera-dialog"
    :style="{ width: 'min(560px, 94vw)' }"
    :draggable="false"
    @hide="stopCamera"
  >
    <div class="camera-body">
      <video ref="videoRef" autoplay playsinline muted></video>
      <Message v-if="cameraError" severity="error" :closable="false">{{
        cameraError
      }}</Message>
      <small v-else>Mira a la cámara y pulsa Capturar fotografía.</small>
    </div>
    <template #footer>
      <div class="camera-footer">
        <div class="kiwik-separator"></div>
        <div>
          <Button
            label="Cancelar"
            severity="secondary"
            text
            @click="cameraVisible = false"
          />
          <Button
            label="Capturar fotografía"
            icon="pi pi-camera"
            :disabled="!!cameraError"
            :loading="uploading"
            @click="takePhoto"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from "vue";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import {
  portalProfile,
  savePortalProfile,
  savePortalProfilePhoto,
} from "@/services/Tasks/portalService";

const props = defineProps<{
  token: string;
  contactName: string;
  photoUrl: string | null;
}>();
const emit = defineEmits<{ saved: [name: string]; photoUpdated: [] }>();
const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const saving = ref(false);
const uploading = ref(false);
const error = ref("");
const cameraVisible = ref(false);
const cameraError = ref("");
const videoRef = ref<HTMLVideoElement | null>(null);
let cameraStream: MediaStream | null = null;
const form = reactive({ name: "", email: "", phone: "", nif: "", born: "" });

const initials = computed(() => {
  const parts = (form.name || props.contactName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return parts.length
    ? `${parts[0][0]}${parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""}`.toUpperCase()
    : "?";
});

function errorText(value: any, fallback: string) {
  return typeof value?.response?.data === "string"
    ? value.response.data
    : fallback;
}

async function load() {
  try {
    const profile = await portalProfile(props.token);
    form.name = profile.name;
    form.email = profile.email;
    form.phone = profile.phone;
    form.nif = profile.nif;
    form.born = profile.born?.slice(0, 10) ?? "";
  } catch (value: any) {
    error.value = errorText(
      value,
      "No se pudieron cargar los datos del perfil.",
    );
  }
}

async function save() {
  error.value = "";
  saving.value = true;
  try {
    const profile = await savePortalProfile(props.token, {
      ...form,
      born: form.born || null,
    });
    form.name = profile.name;
    emit("saved", profile.name);
    toast.add({
      severity: "success",
      summary: "Perfil actualizado",
      detail: "Tus datos se han guardado correctamente.",
      life: 3500,
    });
  } catch (value: any) {
    error.value = errorText(value, "No se pudieron guardar los cambios.");
  } finally {
    saving.value = false;
  }
}

async function onPhotoSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  await uploadPhoto(file);
  input.value = "";
}

async function uploadPhoto(file: File) {
  error.value = "";
  uploading.value = true;
  try {
    await savePortalProfilePhoto(props.token, file);
    emit("photoUpdated");
    toast.add({
      severity: "success",
      summary: "Fotografía actualizada",
      detail: "La nueva imagen ya aparece en tu perfil.",
      life: 3500,
    });
  } catch (value: any) {
    error.value = errorText(value, "No se pudo guardar la fotografía.");
  } finally {
    uploading.value = false;
  }
}

async function openCamera() {
  cameraError.value = "";
  cameraVisible.value = true;
  await nextTick();
  if (!navigator.mediaDevices?.getUserMedia) {
    cameraError.value = "Este navegador no permite acceder a la cámara.";
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    if (videoRef.value) videoRef.value.srcObject = cameraStream;
  } catch {
    cameraError.value =
      "No se pudo abrir la cámara. Revisa el permiso del navegador.";
  }
}

function stopCamera() {
  cameraStream?.getTracks().forEach((track) => track.stop());
  cameraStream = null;
  if (videoRef.value) videoRef.value.srcObject = null;
}

async function takePhoto() {
  const video = videoRef.value;
  if (!video || !video.videoWidth || !video.videoHeight) {
    cameraError.value = "La cámara todavía no está preparada.";
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) {
    cameraError.value = "No se pudo capturar la fotografía.";
    return;
  }
  await uploadPhoto(
    new File([blob], "foto-perfil.jpg", { type: "image/jpeg" }),
  );
  cameraVisible.value = false;
  stopCamera();
}

onMounted(load);
onUnmounted(stopCamera);
</script>

<style scoped>
.profile-page {
  --kiwi: #9cc10a;
  --kiwi-dark: #648506;
  width: 100%;
  padding: 18px 18px 88px;
  color: #1f2937;
}
.profile-hero {
  position: relative;
  overflow: hidden;
  min-height: 96px;
  padding: 15px 24px;
  border: 1px solid #e7edcf;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.07);
}
.profile-hero::after {
  content: "";
  position: absolute;
  width: 260px;
  height: 260px;
  right: 28px;
  top: 50%;
  transform: translateY(-50%);
  background: url("/logos/logo512.png") center/contain no-repeat;
  filter: grayscale(1);
  opacity: 0.065;
  pointer-events: none;
}
.profile-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--kiwi-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.profile-hero h1 {
  margin: 5px 0 3px;
  color: #172033;
  font-size: clamp(1.5rem, 2.5vw, 1.85rem);
}
.profile-hero p {
  margin: 0;
  color: #657084;
  font-size: 1rem;
}
.profile-grid {
  display: grid;
  grid-template-columns: minmax(280px, 0.72fr) minmax(480px, 1.6fr);
  gap: 16px;
  margin-top: 18px;
  align-items: start;
}
.profile-card {
  padding: 20px;
  border: 1px solid #e5e9f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.06);
}
.profile-card__heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 15px;
  border-bottom: 1px solid #edf0f4;
}
.profile-card__heading h2 {
  margin: 0;
  color: #253047;
  font-size: 1.08rem;
}
.profile-card__heading p {
  margin: 3px 0 0;
  color: #7a8494;
  font-size: 0.82rem;
}
.profile-card__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 11px;
  background: #eef5d7;
  color: #648506;
  font-size: 1rem;
}
.photo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 26px 8px 8px;
  text-align: center;
}
.photo-preview {
  display: grid;
  width: 136px;
  height: 136px;
  place-items: center;
  overflow: hidden;
  border: 4px solid #fff;
  border-radius: 50%;
  background: #eef5d7;
  color: #648506;
  font-size: 2.5rem;
  font-weight: 800;
  box-shadow:
    0 0 0 2px #9cc10a,
    0 12px 28px rgba(43, 56, 15, 0.15);
}
.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-copy {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 7px;
}
.photo-copy strong {
  color: #283245;
}
.photo-copy span {
  margin-bottom: 7px;
  color: #7d8797;
  font-size: 0.78rem;
}
.photo-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.55rem;
}
.camera-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.camera-body video {
  width: 100%;
  min-height: 300px;
  max-height: 52vh;
  border-radius: 12px;
  background: #111;
  object-fit: cover;
  transform: scaleX(-1);
}
.camera-body small {
  color: #7d8797;
  text-align: center;
}
.camera-footer {
  width: 100%;
}
.camera-footer > div:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.8rem;
}
.profile-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-top: 20px;
}
.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 7px;
}
.field--wide {
  grid-column: 1 / -1;
}
.field label {
  color: #465064;
  font-size: 0.82rem;
  font-weight: 700;
}
.field small {
  color: #8a93a2;
  font-size: 0.72rem;
}
.native-date {
  width: 100%;
  min-height: 42px;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--p-inputtext-border-color, #cbd5e1);
  border-radius: var(--p-inputtext-border-radius, 6px);
  background: #fff;
  color: #334155;
  font: inherit;
}
.native-date:focus {
  border-color: #9cc10a;
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(156, 193, 10, 0.15);
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 3px;
  border-top: 1px dashed #e3e7ee;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 900px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 620px) {
  .profile-page {
    padding: 15px 15px 78px;
  }
  .profile-form {
    grid-template-columns: 1fr;
  }
  .field--wide {
    grid-column: auto;
  }
}
</style>
