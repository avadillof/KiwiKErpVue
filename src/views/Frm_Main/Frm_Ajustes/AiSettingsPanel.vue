<template>
  <section class="ai-settings">
    <header>
      <span class="ai-icon"><i class="pi pi-sparkles" /></span>
      <div>
        <h2>Inteligencia artificial</h2>
        <p>Conexión común con OpenAI · Funciones específicas por módulo</p>
      </div>
    </header>
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
          >Proveedor: OpenAI · Módulos conectados: Facturas y Presupuestos (solo
          lectura)</span
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
            <label for="ai-model">Modelo OpenAI</label
            ><InputText
              id="ai-model"
              v-model="form.model"
              maxlength="100"
              :disabled="busy"
              placeholder="gpt-4.1-mini"
            /><small
              >KiwiKERP propone gpt-4.1-mini por defecto. No necesitas buscar un
              modelo; cambia este campo sólo si tu administrador indica otro
              compatible.</small
            >
          </div>
          <div>
            <label for="ai-api-key">Clave API de OpenAI</label
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
              devuelve al navegador. El consumo API se factura aparte de ChatGPT
              y Codex.</small
            >
          </div>
        </div>
        <Message v-if="!secureTransport" severity="warn" :closable="false"
          >La entrada de claves requiere HTTPS tanto para la página como para la
          API, o direcciones locales de desarrollo.</Message
        >
        <p class="notice">
          Guardar no contacta con OpenAI. Probar conexión envía una pregunta
          técnica fija, sin facturas ni datos de clientes, y puede generar un
          pequeño consumo en tu proyecto API. La prueba utiliza la configuración
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
      <aside>
        <h3>Qué permite el piloto de Ventas</h3>
        <p>
          En Facturas permite consultar facturación, pendientes, vencidos y
          explicar una factura con sus cobros. En Presupuestos permite consultar
          importes, aceptación, validez, estados, conversión y explicar un
          documento. Los cálculos siguen en el ERP.
        </p>
        <p>
          La IA no emite ni envía documentos, no registra cobros, no aprueba o
          cancela presupuestos y no crea pedidos. Las consultas guiadas siguen
          disponibles con la IA desactivada. Los cambios guardados se aplican a
          nuevas peticiones sin reiniciar el servidor.
        </p>
      </aside>
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
      header="Probar conexión con OpenAI"
      :draggable="false"
      class="kiwik-dialog"
      :style="{ width: 'min(520px,94vw)' }"
      ><p>
        Se enviará una pregunta técnica fija al modelo guardado. Puede generar
        consumo API. No se enviarán facturas ni datos de clientes.
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
        Se eliminará la copia cifrada de KiwiKERP y se desactivará la IA. Las
        consultas guiadas seguirán disponibles. Para recuperar la conexión
        tendrás que introducir la clave otra vez. Esto no revoca la clave en
        OpenAI.
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
  </section>
</template>
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import axios from "axios";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import ToggleSwitch from "primevue/toggleswitch";
import Message from "primevue/message";
import Tag from "primevue/tag";
import Dialog from "primevue/dialog";
import { useAuthStore } from "@/stores/authStore";
const auth = useAuthStore();
const saved = ref<any>(null),
  form = ref({ enabled: false, model: "" }),
  apiKey = ref("");
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
      form.value.model !== saved.value.model),
);
const endpoint = `${import.meta.env.VITE_API_URL}/WebAiSettings`;
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
  [() => form.value.enabled, () => form.value.model, apiKey],
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
  form.value = { enabled: data.enabled, model: data.model };
  apiKey.value = "";
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
        ? "Clave eliminada e IA desactivada. Las consultas guiadas siguen disponibles."
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
  max-width: 1100px;
  margin: auto;
  background: white;
  padding: 20px;
}
.ai-settings header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.ai-icon {
  background: #eef5dc;
  color: #648506;
  padding: 16px;
  border-radius: 12px;
}
.ai-settings h2 {
  margin: 0;
  font-size: 1.3rem;
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
}
.fields label,
.enable label {
  font-weight: 600;
}
.key-field {
  grid-column: 1/-1;
}
.notice,
aside {
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
aside {
  margin-top: 25px;
}
aside h3 {
  margin-top: 0;
}
@media (max-width: 700px) {
  .fields {
    grid-template-columns: 1fr;
  }
  .ai-settings {
    padding: 12px;
  }
}
</style>
