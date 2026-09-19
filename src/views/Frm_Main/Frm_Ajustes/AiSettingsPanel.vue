<template>
  <SettingsPanelCard
    class="ai-settings"
    title="Inteligencia artificial"
    subtitle="Conexión común multi-proveedor · Funciones específicas por módulo"
    icon="pi pi-sparkles"
  >
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <Message v-if="success" severity="success" :closable="false">{{
      success
    }}</Message>
    <p v-if="loading">Comprobando sesión de administrador y configuración…</p>
    <template v-if="saved">
      <div class="status">
        <Tag
          :severity="saved.ready ? 'success' : 'warn'"
          :value="
            saved.ready
              ? 'Configuración completa (conexión sin verificar)'
              : saved.enabled
                ? 'Configuración incompleta'
                : 'IA desactivada'
          "
        /><span
          >Proveedor: {{ activeProvider.label }} · Módulos conectados: Facturas,
          Pedidos y Presupuestos (solo lectura)</span
        >
      </div>
      <Message v-if="saved.problem" severity="warn" :closable="false">{{
        saved.problem
      }}</Message>
      <Message v-if="!saved.encryptionReady" severity="warn" :closable="false"
        >El servicio de cifrado de certificados no está disponible. Revisa el
        arranque del backend.</Message
      >
      <form @submit.prevent="save()">
        <div class="enable">
          <ToggleSwitch
            v-model="form.enabled"
            inputId="ai-enabled"
            :disabled="busy"
          /><label for="ai-enabled"
            >Activar IA en los módulos habilitados</label
          >
        </div>
        <div class="fields">
          <div>
            <label for="ai-provider">Proveedor</label
            ><Select
              id="ai-provider"
              v-model="form.provider"
              :options="providerOptions"
              optionLabel="label"
              optionValue="value"
              :disabled="busy"
              @change="changeProvider"
            /><small>{{ activeProvider.help }}</small>
          </div>
          <div>
            <label for="ai-model">Modelo {{ activeProvider.shortLabel }}</label
            ><InputText
              id="ai-model"
              v-model="form.model"
              maxlength="100"
              :disabled="busy"
              :placeholder="activeProvider.defaultModel"
            /><small
              >KiwiKERP propone {{ activeProvider.defaultModel }} por defecto.
              Cambia este campo sólo si tu administrador indica otro
              compatible con {{ activeProvider.label }}. Los modelos de Groq
              contienen `/` (p. ej. openai/gpt-oss-20b): si al guardar ves
              "Identificador de modelo no válido", el backend aún valida solo
              modelos OpenAI y hay que actualizarlo.</small
            >
          </div>
          <div class="key-field">
            <label for="ai-api-key">Clave API de {{ activeProvider.label }}</label
            ><InputText
              id="ai-api-key"
              v-model="apiKey"
              type="password"
              autocomplete="new-password"
              :spellcheck="false"
              maxlength="1000"
              :disabled="busy || !saved.encryptionReady || !secureTransport"
              :placeholder="
                saved.storedKey
                  ? 'Pega otra clave para sustituirla'
                  : 'Copia y pega aquí tu clave API'
              "
            /><small>{{
              saved.storedKey
                ? "Hay una clave guardada cifrada. Deja este campo vacío para conservarla."
                : "Todavía no hay clave guardada. Copia y pega aquí tu clave API."
            }}</small
            ><small
              >La clave se guarda cifrada en la base de datos y nunca se
              devuelve al navegador. Consigue la clave gratis en
              {{ activeProvider.keyUrl }}. El consumo de la API gratuita depende
              de tu plan en {{ activeProvider.label }}.</small
            >
          </div>
        </div>
        <Message v-if="!secureTransport" severity="warn" :closable="false"
          >La entrada de claves requiere HTTPS tanto para la página como para la
          API, o direcciones locales de desarrollo.</Message
        >
        <p class="notice">
          Guardar no contacta con el proveedor. Probar conexión envía una
          pregunta técnica fija, sin facturas ni datos de clientes, y puede
          generar un pequeño consumo en tu cuota gratuita de
          {{ activeProvider.label }}. La prueba utiliza la configuración
          guardada, incluso si la IA está desactivada.
        </p>
        <div class="kiwik-separator" />
        <div class="actions">
          <Button
            v-if="saved.storedKey"
            label="Eliminar clave"
            icon="pi pi-trash"
            severity="danger"
            text
            :disabled="busy || dirty"
            @click="confirmRemoval = true"
          /><Button
            label="Recargar"
            icon="pi pi-refresh"
            severity="secondary"
            text
            :disabled="busy"
            @click="load"
          /><Button
            label="Probar conexión"
            icon="pi pi-link"
            severity="secondary"
            outlined
            :disabled="busy || dirty || !saved.keyConfigured || !saved.model"
            @click="confirmTest = true"
          /><Button
            type="submit"
            label="Guardar ajustes IA"
            icon="pi pi-save"
            :loading="saving"
            :disabled="busy || !dirty"
          />
        </div>
        <small v-if="dirty"
          >Guarda los cambios antes de probar la conexión.</small
        >
      </form>
    </template>
    <Button
      v-if="!saved && !loading"
      label="Reintentar carga"
      icon="pi pi-refresh"
      @click="load"
    />
    <Dialog
      v-model:visible="confirmTest"
      modal
      :header="`Probar conexión con ${activeProvider.label}`"
      :draggable="false"
      class="kiwik-dialog"
      :style="{ width: 'min(520px,94vw)' }"
      ><p>
        Se enviará una pregunta técnica fija al modelo guardado
        ({{ saved?.model || activeProvider.defaultModel }}). Puede generar
        consumo en tu cuota gratuita. No se enviarán facturas ni datos de
        clientes.
      </p>
      <template #footer
        ><Button
          label="Cancelar"
          text
          severity="secondary"
          @click="confirmTest = false" /><Button
          label="Probar ahora"
          icon="pi pi-link"
          @click="test" /></template
    ></Dialog>
    <Dialog
      v-model:visible="confirmRemoval"
      modal
      header="Eliminar la clave guardada"
      :draggable="false"
      class="kiwik-dialog"
      :style="{ width: 'min(520px,94vw)' }"
      ><p>
        Se eliminará la copia cifrada de KiwiKERP y se desactivará la IA, que
        dejará de interpretar preguntas. Para recuperar la conexión
        tendrás que introducir la clave otra vez. Esto no revoca la clave en
        {{ activeProvider.label }}.
      </p>
      <template #footer
        ><Button
          label="Cancelar"
          text
          severity="secondary"
          @click="confirmRemoval = false" /><Button
          label="Eliminar clave y desactivar IA"
          severity="danger"
          @click="save(true)" /></template
    ></Dialog>
  </SettingsPanelCard>
</template>
<script setup lang="ts">
import SettingsPanelCard from './SettingsPanelCard.vue';
import { backendUrl } from '@/services/backendUrl';
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import axios from "axios";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import ToggleSwitch from "primevue/toggleswitch";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import { useAuthStore } from "@/stores/authStore";
const auth = useAuthStore();
// Catálogo de proveedores con API compatible OpenAI. Groq es el recomendado
// gratuito inicial; OpenAI se conserva por compatibilidad con instalaciones
// existentes. El backend debe implementar el conmutador provider/baseUrl.
const providers: Record<
  string,
  { label: string; shortLabel: string; defaultModel: string; keyUrl: string; help: string }
> = {
  groq: {
    label: "Groq",
    shortLabel: "Groq",
    defaultModel: "openai/gpt-oss-120b",
    keyUrl: "console.groq.com",
    help: "Gratis con cuota generosa. Crea la clave en console.groq.com y pégala abajo. Modelo grande (120B): entiende mejor el español y sigue las reglas del piloto. No usa tus datos para entrenar.",
  },
  openai: {
    label: "OpenAI",
    shortLabel: "OpenAI",
    defaultModel: "gpt-4.1-mini",
    keyUrl: "platform.openai.com",
    help: "Proveedor de pago. Conservado para instalaciones que ya lo usan.",
  },
  ollama: {
    label: "Ollama (local)",
    shortLabel: "local",
    defaultModel: "llama3.1",
    keyUrl: "tu servidor Ollama",
    help: "Próximamente: modelo local sin coste ni envío de datos. Requiere configurar la URL base en el backend.",
  },
};
const providerOptions = Object.entries(providers).map(([value, p]) => ({
  label: p.label,
  value,
}));
const saved = ref<any>(null),
  form = ref({ enabled: false, provider: "groq", model: "" }),
  apiKey = ref("");
const activeProvider = computed(
  () => providers[form.value.provider] || providers.groq,
);
const loading = ref(false),
  saving = ref(false),
  testing = ref(false),
  error = ref(""),
  success = ref(""),
  confirmTest = ref(false),
  confirmRemoval = ref(false);
const busy = computed(() => loading.value || saving.value || testing.value);
const dirty = computed(
  () =>
    !!saved.value &&
    (apiKey.value.length > 0 ||
      form.value.enabled !== saved.value.enabled ||
      form.value.provider !== (saved.value.provider || "openai") ||
      form.value.model !== saved.value.model),
);
const endpoint = backendUrl(`/WebAiSettings`);
const secureTransport = (() => {
  try {
    const api = new URL(endpoint, window.location.href);
    return (
      window.isSecureContext &&
      (api.protocol === "https:" ||
        ["localhost", "127.0.0.1", "[::1]"].includes(api.hostname))
    );
  } catch {
    return false;
  }
})();
let sequence = 0;
watch(
  [() => form.value.enabled, () => form.value.provider, () => form.value.model, apiKey],
  () => {
    success.value = "";
    error.value = "";
  },
  { flush: "sync" },
);
const safeError = (e: any) =>
  typeof e.response?.data === "string"
    ? e.response.data
    : e.response?.status === 401
      ? "Vuelve a iniciar sesión."
      : e.response?.status === 403
        ? "Sólo los administradores pueden configurar la IA."
        : "No se pudo completar la operación. Comprueba el backend y la migración V26.";
function accept(data: any) {
  saved.value = data;
  // Compatibilidad: el backend antiguo no devuelve provider (era solo OpenAI).
  const provider = data.provider || "openai";
  form.value = {
    enabled: data.enabled,
    provider: providers[provider] ? provider : "groq",
    model: data.model || providers[provider]?.defaultModel || "",
  };
  apiKey.value = "";
}
function changeProvider(event: any) {
  // Al cambiar de proveedor se propone siempre su modelo por defecto: un
  // identificador de otro proveedor no sería válido para el nuevo.
  // Se usa el valor del evento (no form.provider) porque v-model puede aún
  // no estar sincronizado cuando se procesa el cambio.
  const next = event?.value ?? form.value.provider;
  form.value.model = (providers[next] || providers.groq).defaultModel;
}
async function load() {
  const current = ++sequence;
  loading.value = true;
  error.value = "";
  success.value = "";
  apiKey.value = "";
  saved.value = null;
  try {
    const { data } = await axios.get(endpoint, auth.portalRequestConfig());
    if (current === sequence) accept(data);
  } catch (e: any) {
    if (current === sequence) error.value = safeError(e);
  } finally {
    if (current === sequence) loading.value = false;
  }
}
async function save(removeKey = false) {
  confirmRemoval.value = false;
  const current = ++sequence;
  saving.value = true;
  error.value = "";
  success.value = "";
  try {
    const { data } = await axios.put(
      endpoint,
      {
        ...form.value,
        enabled: removeKey ? false : form.value.enabled,
        version: saved.value.version,
        apiKey: removeKey ? null : apiKey.value || null,
        removeKey,
      },
      auth.portalRequestConfig(),
    );
    if (current === sequence) {
      accept(data);
      success.value = removeKey
        ? "Clave eliminada e IA desactivada."
        : "Ajustes guardados. Se aplicarán a las nuevas consultas.";
    }
  } catch (e: any) {
    if (current === sequence) {
      apiKey.value = "";
      error.value = safeError(e);
    }
  } finally {
    apiKey.value = "";
    if (current === sequence) saving.value = false;
  }
}
async function test() {
  confirmTest.value = false;
  const current = ++sequence;
  testing.value = true;
  error.value = "";
  success.value = "";
  try {
    const { data } = await axios.post(
      endpoint + "/test",
      {},
      { ...auth.portalRequestConfig(), timeout: 60000 },
    );
    if (current === sequence) success.value = data.message;
  } catch (e: any) {
    if (current === sequence) error.value = safeError(e);
  } finally {
    if (current === sequence) testing.value = false;
  }
}
watch(
  () => auth.user?.pkid,
  () => {
    sequence++;
    apiKey.value = "";
    saved.value = null;
    confirmTest.value = false;
    confirmRemoval.value = false;
  },
);
onMounted(load);
onUnmounted(() => {
  sequence++;
  apiKey.value = "";
});
</script>
<style scoped>
.ai-settings {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}
.ai-settings p,
.ai-settings small {
  color: #657084;
  line-height: 1.6;
}
.status,
.enable {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 18px 0;
}
.status span {
  font-size: 0.9rem;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 24px 0;
}
.fields > div {
  display: grid;
  gap: 8px;
  align-content: start;
}
.fields label {
  display: block;
  margin: 0;
}
.fields .p-select,
.fields .p-inputtext {
  width: 100%;
  margin: 0;
}
.fields label,
.enable label {
  font-weight: 600;
}
.key-field {
  grid-column: 1/-1;
}
.notice {
  background: #f8faf5;
  border: 1px solid #e1e8d7;
  border-radius: 10px;
  padding: 14px;
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  flex-wrap: wrap;
  margin: 18px 0;
}
@media (max-width: 700px) {
  .fields {
    grid-template-columns: 1fr;
  }

}
</style>
