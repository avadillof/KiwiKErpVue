<template>
  <Teleport to="body"
    ><div
      v-if="connectionLost || auth.sessionExpired || activeOperation"
      class="connection-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="operation-title"
      @keydown.stop
    >
      <div ref="connectionCard" class="connection-card">
        <CorporateLoader
          v-if="!auth.sessionExpired || connectionLost"
          label=""
          aria-hidden="true"
        />
        <h2 id="operation-title">
          {{
            connectionLost
              ? "Esperando conexión..."
              : auth.sessionExpired
                ? "Vuelve a iniciar sesión"
                : activeOperation?.title
          }}
        </h2>
        <p>
          {{
            connectionLost
              ? "Intentando reconectar con el servidor."
              : auth.sessionExpired
                ? "El servidor vuelve a responder, pero tu sesión ha caducado o se ha perdido tras un reinicio."
                : activeOperation?.message
          }}
        </p>
        <template v-if="auth.sessionExpired && !connectionLost">
          <p>
            Al volver al acceso se cerrará esta pantalla. Los cambios sin
            guardar pueden perderse. Comprueba el estado de cualquier operación
            interrumpida antes de repetirla.
          </p>
          <Button
            label="Ir al acceso"
            icon="pi pi-sign-in"
            @click="loginAgain"
          />
        </template>
      </div></div
  ></Teleport>
</template>

<script setup>
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { watch, onUnmounted, ref, nextTick } from "vue";
import CorporateLoader from "./CorporateLoader.vue";
import { activeOperation } from "../../services/composables/useOperationBlocker";
import { useConnectionMonitor } from "../../services/composables/Sv_MonitorConnectionBack.ts";
const connectionCard = ref(null);
const auth = useAuthStore();
const router = useRouter();
const loginAgain = () => {
  const access = auth.loginAccess;
  auth.logout();
  void router.replace({
    name: "Login",
    query: access === "tpv" ? { access: "tpv" } : {},
  });
};
const { connectionLost } = useConnectionMonitor(true);
// PrimeVue dialogs can be teleported outside #app, so also block their keyboard shortcuts.
const blockKeyboard = (event) => {
  if (
    connectionLost.value ||
    (!auth.sessionExpired && activeOperation.value) ||
    (auth.sessionExpired && !connectionCard.value?.contains(event.target))
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
};
watch(
  () => auth.sessionExpired && !connectionLost.value,
  async (expired) => {
    if (expired) {
      await nextTick();
      connectionCard.value?.querySelector("button")?.focus();
    }
  },
);
document.addEventListener("keydown", blockKeyboard, true);
const setInert = (blocked) => {
  const app = document.getElementById("app");
  if (app) app.inert = blocked;
};
watch(
  () => connectionLost.value || auth.sessionExpired || !!activeOperation.value,
  setInert,
  { immediate: true, flush: "sync" },
);
onUnmounted(() => {
  document.removeEventListener("keydown", blockKeyboard, true);
  setInert(false);
});
</script>
