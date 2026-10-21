<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="formData.pkid > 0 ? 'Editar Usuario' : 'Nuevo Usuario'"
    :style="{ width: 'min(700px, 96vw)' }"
    class="kiwik-dialog"
    :dismissableMask="true"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
  >
    <div class="kiwik-form-container grid-layout">
      <div class="col-left flex flex-column align-items-center pt-2">
        <div class="relative">
          <div
            class="border-circle overflow-hidden border-3 shadow-2 flex align-items-center justify-content-center"
            style="
              width: 120px;
              height: 120px;
              background: #f8f9fa;
              border-color: var(--primary-color);
            "
          >
            <img
              v-if="
                formData.profilePhoto &&
                formData.profilePhoto.startsWith('data:')
              "
              :src="formData.profilePhoto"
              class="w-full h-full object-cover"
            />

            <img
              v-else-if="formData.pkid > 0 && formData.profilePhoto !== 'ERROR'"
              :src="getProfilePhotoUrl()"
              class="w-full h-full object-cover"
              @error="handleImageError"
            />

            <i v-else class="pi pi-user text-5xl text-gray-300"></i>
          </div>

          <Button
            icon="pi pi-camera"
            rounded
            class="absolute bottom-0 right-0 p-2"
            @click="openCamera"
            severity="primary"
            v-tooltip.left="'Cambiar foto'"
          />
        </div>
      </div>

      <div class="col-right flex flex-column gap-4">
        <div class="col-12 md:col-4">
          <FloatLabel variant="on" class="w-full">
            <DatePicker
              id="user_date"
              v-model="formData.userDtDateUp"
              class="w-full"
              showIcon
              iconDisplay="input"
              dateFormat="dd/mm/yy"
              :disabled="formData.pkid > 0"
            />
            <label for="user_date">Fecha de Alta</label>
          </FloatLabel>
        </div>

        <div class="col-12 md:col-5">
          <InputGroup>
            <FloatLabel variant="on" class="w-full">
              <InputText
                maxlength="35"
                id="user_code"
                v-model="formData.userDsCode"
                class="w-full"
                :disabled="formData.pkid > 0"
              />
              <label for="user_code">Código de Usuario</label>
            </FloatLabel>
            <Button
              icon="pi pi-id-card"
              @click="generateCode"
              :disabled="formData.pkid > 0"
              severity="secondary"
            />
          </InputGroup>
        </div>

        <FloatLabel variant="on" class="w-full">
          <InputText
            id="user_name"
            maxlength="125"
            v-model="formData.name"
            class="w-full"
          />
          <label for="user_name">Nombre Completo</label>
        </FloatLabel>

        <FloatLabel variant="on" class="w-full">
          <InputText
            id="user_email"
            maxlength="100"
            v-model="formData.email"
            class="w-full"
          />
          <label for="user_email">Correo Electrónico *</label>
        </FloatLabel>
        <InlineMessage v-if="emailError" severity="error">{{
          emailError
        }}</InlineMessage>

        <FloatLabel variant="on" class="w-full">
          <InputText
            id="user_phone"
            maxlength="45"
            v-model="formData.phone"
            class="w-full"
            autocomplete="tel"
          />
          <label for="user_phone">Teléfono móvil</label>
        </FloatLabel>

        <FloatLabel variant="on" class="w-full" v-if="visibleInputs">
          <Select
            id="user_group"
            v-model="formData.groupKyId"
            :options="groupOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <label for="user_group">Rol / Grupo</label>
        </FloatLabel>

        <FloatLabel variant="on" class="w-full">
          <Password
            id="user_pass"
            maxlength="255"
            v-model="formData.password"
            class="w-full"
            toggleMask
            :feedback="false"
          />
          <label for="user_pass">{{
            formData.pkid > 0 ? "Nueva Contraseña" : "Contraseña"
          }}</label>
        </FloatLabel>

        <FloatLabel
          variant="on"
          class="w-full"
          v-if="Number(formData.groupKyId) === TPV_GROUP_ID"
        >
          <InputText
            id="user_pin"
            maxlength="5"
            v-model="formData.pin"
            class="w-full"
          />
          <label for="user_pin">PIN del TPV</label>
        </FloatLabel>

        <FloatLabel
          variant="on"
          class="w-full"
          v-if="Number(formData.groupKyId) === TPV_GROUP_ID"
        >
          <Select
            id="user_tpv_mode"
            v-model="formData.tpvMode"
            :options="tpvModeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <label for="user_tpv_mode">Modo TPV</label>
        </FloatLabel>

        <div class="w-full" v-if="Number(formData.groupKyId) === TPV_GROUP_ID">
          <label for="user_zones" class="font-bold text-sm">Zonas TPV</label>
          <MultiSelect
            inputId="user_zones"
            v-model="formData.zoneIds"
            :options="zoneOptions"
            optionLabel="label"
            optionValue="value"
            filter
            filterPlaceholder="Buscar por código o nombre"
            placeholder="Seleccionar zonas de trabajo"
            emptyMessage="No hay zonas disponibles"
            emptyFilterMessage="No se encontraron zonas"
            :showToggleAll="false"
            :maxSelectedLabels="2"
            selectedItemsLabel="{0} zonas asignadas"
            :virtualScrollerOptions="{ itemSize: 44 }"
            scrollHeight="264px"
            :resetFilterOnHide="true"
            class="w-full mt-2 zone-select"
            aria-describedby="user_zones_help"
            :pt="{ option: { style: { height: '44px' } } }"
          >
            <template #option="{ option }">
              <span class="zone-option" :title="option.label">{{
                option.label
              }}</span>
            </template>
          </MultiSelect>
          <small id="user_zones_help" class="zone-help">
            {{ formData.zoneIds.length }} asignadas ·
            {{ zoneOptions.length }} disponibles. Busca y marca las zonas en las
            que puede trabajar.
          </small>
        </div>

        <div class="flex align-items-center" v-if="visibleInputs">
          <Checkbox
            v-model="formData.active"
            :binary="true"
            inputId="active_check"
          />
          <label for="active_check" class="ml-2">Usuario Activo</label>
        </div>
      </div>
    </div>

    <div class="kiwik-separator"></div>

    <div class="flex justify-content-end">
      <Button label="Guardar usuario" icon="pi pi-check" @click="save" />
    </div>
  </Dialog>

  <Dialog
    v-model:visible="cameraVisible"
    modal
    header="Capturar Foto"
    :style="{ width: '400px' }"
    :dismissableMask="true"
    class="kiwik-dialog"
    @hide="stopCamera"
  >
    <div class="flex flex-column" v-if="cameraVisible">
      <video
        ref="videoRef"
        autoplay
        playsinline
        class="w-full border-round shadow-2"
        style="background: #000; min-height: 250px"
      ></video>

      <div class="kiwik-separator"></div>

      <div class="flex justify-content-end">
        <Button icon="pi pi-camera" label="Capturar Foto" @click="takePhoto" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.grid-layout {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 2rem;
  align-items: start;
}

.kiwik-separator {
  border-top: 2px solid var(--primary-color);
  margin: 1.5rem 0;
}
.col-right {
  min-width: 0;
}
.zone-option {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.zone-select :deep(.p-multiselect-label) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.zone-help {
  display: block;
  margin-top: 8px;
  color: var(--p-text-muted-color, #66736b);
  line-height: 1.5;
}
</style>

<script setup lang="ts">
import { backendUrl } from "@/services/backendUrl";
import { computed, ref, watch } from "vue";
import { TPV_GROUP_ID } from "@/services/Frm_Main/permissions";
import axios from "axios";
import MultiSelect from "primevue/multiselect";
import { useToast } from "primevue/usetoast"; // Importa el hook de Toast
import Tooltip from "primevue/tooltip";
import { storeToRefs } from "pinia"; // Importamos esto
import { useCompanyStore } from "../../../stores/companyStore";
import { useAuthStore } from "@/stores/authStore";
import { HelperString } from "../../../libs/HelperString.ts";

const emit = defineEmits(["saved"]);

const toast = useToast(); // Inicializa el hook
const emailError = ref("");
const visible = ref(false);
const vTooltip = Tooltip;
const companyStore = useCompanyStore();
const { companyInfo: formDataCompany } = storeToRefs(companyStore);
const videoRef = ref<HTMLVideoElement | null>(null);
const cameraVisible = ref(false);
const visibleInputs = ref(true);
const authStore = useAuthStore();
const userPkid = computed(() => authStore.user?.pkid || 0);
// La fecha de alta no se edita: conservar también su representación del servidor.
const savedRegistrationDate = ref<string | null>(null);

const formData = ref<UserFormData>({
  pkid: 0,
  userDsCode: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  groupKyId: 0,
  active: true,
  pin: "",
  tpvMode: "SHOP",
  zoneIds: [],
  userDtDateUp: null,
  profilePhoto: undefined,
});

const activeStream = ref<MediaStream | null>(null);

// El PIN y el modo TPV solo existen para el grupo TPV: al salir del grupo se limpian.
const tpvModeOptions = [
  { label: "Tienda", value: "SHOP" },
  { label: "Bar / Restaurante", value: "BAR" },
];
watch(
  () => formData.value.groupKyId,
  (group) => {
    if (Number(group) !== TPV_GROUP_ID) {
      formData.value.pin = "";
      formData.value.tpvMode = "SHOP";
      formData.value.zoneIds = [];
    }
  },
);

// Zonas disponibles (solo admin las gestiona).
const zoneOptions = ref<DropdownOption[]>([]);
async function loadZoneOptions() {
  try {
    const zonesRes = await axios.get(backendUrl(`/WebTpv/zones`), {
      ...authStore.portalRequestConfig(),
      timeout: 15000,
    });
    zoneOptions.value = Array.isArray(zonesRes.data)
      ? zonesRes.data.map((z: any) => ({
          label: `${z.code} — ${z.name}`,
          value: Number(z.id),
        }))
      : [];
  } catch {
    zoneOptions.value = [];
  }
}
async function loadUserZones(pkid: number) {
  try {
    const zonesRes = await axios.get(
      backendUrl(`/WebTpv/users/${pkid}/zones`),
      { ...authStore.portalRequestConfig(), timeout: 15000 },
    );
    formData.value.zoneIds = Array.isArray(zonesRes.data)
      ? zonesRes.data.map((z: any) => Number(z))
      : [];
  } catch {
    formData.value.zoneIds = [];
  }
}

export interface UserFormData {
  pkid: number;
  userDsCode: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  groupKyId: number;
  active: boolean;
  pin: string;
  tpvMode: string;
  zoneIds: number[];
  userDtDateUp: Date | null;
  profilePhoto: string | undefined; // Guardará el base64
}

interface DropdownOption {
  label: string;
  value: number; // o string, dependiendo de lo que sea tu ID
}

// 2. Aplica el tipo a la ref
const groupOptions = ref<DropdownOption[]>([]);

// Ahora open recibe un ID opcional (number | null)
const open = async (id: number | null = null) => {
  try {
    // 1. Cargamos los grupos (esto siempre es necesario)
    const groupsRes = await axios.get(backendUrl(`/WebGetGroups`));
    groupOptions.value = Array.isArray(groupsRes.data)
      ? groupsRes.data.map((g: any) => ({
          label: g.descriptionEs,
          value: g.id,
        }))
      : [];
    await loadZoneOptions();

    // 2. Si hay ID, buscamos el detalle, si no, reseteamos
    if (id) {
      const userRes = await axios.get(backendUrl(`/WebGetUserById?pkid=${id}`));

      const user = userRes.data;
      savedRegistrationDate.value = user.userDtDateUp ?? null;
      const registrationDate = savedRegistrationDate.value
        ? new Date(savedRegistrationDate.value)
        : null;

      formData.value = {
        pkid: user.pkid,
        userDsCode: user.userDsCode,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        password: "", // Por seguridad no traemos la pass
        active: user.active,
        pin: user.pin || "",
        tpvMode: user.tpvMode || "SHOP",
        zoneIds: [],
        userDtDateUp:
          registrationDate && !Number.isNaN(registrationDate.getTime())
            ? registrationDate
            : null,
        groupKyId: Number(user.groupKyId),
        profilePhoto: user.profilePhoto || undefined,
      };
      emailError.value = "";
      if (id) await loadUserZones(id);
    } else {
      savedRegistrationDate.value = null;
      // Reset para usuario nuevo
      formData.value = {
        pkid: 0,
        userDsCode: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        groupKyId: 0,
        active: true,
        pin: "",
        tpvMode: "SHOP",
        zoneIds: [],
        profilePhoto: undefined,
        userDtDateUp: null,
      };
    }

    visible.value = true;
  } catch (error: any) {
    console.error("Error al cargar usuario:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo cargar la información.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const save = async () => {
  emailError.value = "";
  // 1. Validación de campos obligatorios
  // Añadimos !formData.value.userDtDateUp para validar que se haya seleccionado fecha
  if (
    !formData.value.userDsCode.trim() ||
    !formData.value.name.trim() ||
    !formData.value.email.trim() ||
    !HelperString.isValidEmail(formData.value.email) ||
    formData.value.groupKyId === 0 ||
    (formData.value.pkid === 0 && !formData.value.userDtDateUp)
  ) {
    if (
      !formData.value.email.trim() ||
      !HelperString.isValidEmail(formData.value.email)
    ) {
      emailError.value = !formData.value.email.trim()
        ? "Obligatorio"
        : "Email inválido";
    }
    toast.add({
      severity: "warn",
      summary: "Campos incompletos",
      detail:
        "El código, nombre, email (válido), rol y fecha de alta son obligatorios.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
    return;
  }

  if (!HelperString.isValidEmail(formData.value.email)) {
    toast.add({
      severity: "warn",
      summary: "Correo inválido",
      detail: "Por favor, introduce un formato de correo electrónico válido.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });

    return;
  }

  // LocalDateTime no lleva zona horaria; al editar se conserva el valor recibido.
  const dataToSend = {
    ...formData.value,
    userDtDateUp:
      formData.value.pkid > 0
        ? savedRegistrationDate.value
        : formData.value.userDtDateUp
          ? `${formData.value.userDtDateUp.getFullYear()}-${String(formData.value.userDtDateUp.getMonth() + 1).padStart(2, "0")}-${String(formData.value.userDtDateUp.getDate()).padStart(2, "0")}T00:00:00`
          : null,
  };

  // 4. Envío al servidor
  try {
    await axios.post(backendUrl(`/WebSaveUser`), dataToSend);
    // Zonas TPV (solo ficha existente de grupo TPV; no bloquea el guardado).
    if (
      formData.value.pkid > 0 &&
      Number(formData.value.groupKyId) === TPV_GROUP_ID
    ) {
      try {
        await axios.put(
          backendUrl(`/WebTpv/users/${formData.value.pkid}/zones`),
          { zoneIds: formData.value.zoneIds },
          { ...authStore.portalRequestConfig(), timeout: 15000 },
        );
      } catch {
        toast.add({
          severity: "warn",
          summary: "Zonas no guardadas",
          detail:
            "El usuario sí se guardó. Revisa tus permisos de administrador.",
          life: companyStore.companyInfo.toastDuration ?? 3000,
        });
      }
    }
    toast.add({
      severity: "success",
      summary: "Éxito",
      detail: "Usuario guardado correctamente",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
    visible.value = false;
    emit("saved");

    console.info(authStore.user?.pkid + " " + formData.value.pkid);

    if (authStore.user?.pkid == formData.value.pkid) {
      authStore.user.name = formData.value.name;
      authStore.user.userDsCode = formData.value.userDsCode;
      getProfilePhotoUrl();
      authStore.refreshUserPhoto();
    }
  } catch (error: any) {
    const status = error.response?.status;
    const errorMessage = error.response?.data || "Error desconocido";

    // Si es un conflicto (409), mostramos el mensaje específico que viene del back
    if (status === 409) {
      toast.add({
        severity: "warn",
        summary: "Atención",
        detail: errorMessage,
        life: companyStore.companyInfo.toastDuration ?? 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage,
        life: companyStore.companyInfo.toastDuration ?? 3000,
      });
    }
  }
};

const generateCode = async () => {
  try {
    const res = await axios.get(backendUrl(`/WebGenerateUserCode`));
    // Asignamos el código generado al modelo
    formData.value.userDsCode = res.data;
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "No se pudo generar el código automático.",
      life: companyStore.companyInfo.toastDuration ?? 3000,
    });
  }
};

const takePhoto = () => {
  const video = videoRef.value;
  if (!video) {
    console.error("El elemento de video no está disponible.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/png");

    // Asignación al formData
    formData.value.profilePhoto = imageData;
  }

  // Cerrar cámara
  cameraVisible.value = false;

  // Detener stream correctamente
  const stream = video.srcObject;
  if (stream instanceof MediaStream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

const openCamera = async () => {
  cameraVisible.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    activeStream.value = stream; // Guardamos el stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (err) {
    console.error("Error al acceder a la cámara:", err);
  }
};

const getProfilePhotoUrl = () => {
  if (formData.value.pkid > 0) {
    const timestamp = new Date().getTime();
    return backendUrl(
      `/gestdoc/users/${formData.value.pkid}/photoPerfil.jpg?t=${timestamp}`,
    );
  }
  return undefined; // Si es usuario nuevo, no hay pkid aún
};

const stopCamera = () => {
  // Detener y liberar TODOS los tracks del stream activo
  if (activeStream.value) {
    activeStream.value.getTracks().forEach((track) => {
      track.stop();
      track.enabled = false;
    });
    activeStream.value = null;
  }

  // Limpiar el componente de video
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
};

const handleImageError = (event: Event) => {
  // Marcamos como 'ERROR' para que el v-else-if de la imagen la oculte
  formData.value.profilePhoto = "ERROR";
};

defineExpose({ open, visibleInputs });
</script>
