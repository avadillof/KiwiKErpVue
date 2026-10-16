import { computed, onBeforeUnmount, ref, watch, type Ref } from "vue";
import axios from "axios";
import { backendUrl } from "../../services/backendUrl";
import { useAuthStore } from "../../stores/authStore";
import type { TpvWorkplace } from "./useTpvZones";

/** Presence is a short-lived heartbeat, not proof that an employee is physically at the till. */
export function useTpvPresence(
  workplace: Ref<TpvWorkplace | null>,
  draft: Ref<boolean>,
) {
  const auth = useAuthStore(),
    terminalId = crypto.randomUUID();
  const invalid = ref(false),
    warning = ref("");
  const context = computed(
    () =>
      `${auth.user?.pkid}:${auth.portalSession}:${workplace.value?.openingId}`,
  );
  let stopped = false,
    sending = false,
    queued = false;
  let previousConfig: ReturnType<typeof auth.portalRequestConfig> | null = null;
  let previousOpening: number | null = null;
  async function touch() {
    if (stopped || !workplace.value || !auth.isAuthenticated) return;
    if (sending) {
      queued = true;
      return;
    }
    const key = context.value,
      openingId = workplace.value.openingId;
    sending = true;
    try {
      const config = auth.portalRequestConfig();
      previousConfig = config;
      previousOpening = openingId;
      await axios.post(
        backendUrl(`/WebTpv/openings/${openingId}/presence`),
        { terminalId, hasDraft: draft.value },
        { ...config, timeout: 10000 },
      );
      if (key === context.value) {
        invalid.value = false;
        warning.value = "";
      }
    } catch (e) {
      if (key !== context.value) return;
      if (
        axios.isAxiosError(e) &&
        [401, 403, 404, 409].includes(e.response?.status ?? 0)
      ) {
        invalid.value = true;
        warning.value =
          "Esta apertura ya no está disponible o tu acceso ha cambiado. No se permiten nuevos cobros. Conserva o revisa la venta preparada antes de cambiar de puesto.";
      } else
        warning.value =
          "No se ha podido actualizar la conexión con la caja. El servidor comprobará su estado antes de registrar operaciones.";
    } finally {
      sending = false;
      if (queued) {
        queued = false;
        void touch();
      }
    }
  }
  function leave() {
    if (previousConfig) {
      void axios
        .post(
          backendUrl("/WebTpv/presence/leave"),
          { terminalId, openingId: previousOpening },
          { ...previousConfig, timeout: 10000 },
        )
        .catch(() => {});
      previousConfig = null;
    }
  }
  watch(
    context,
    () => {
      leave();
      invalid.value = false;
      warning.value = "";
      void touch();
    },
    { immediate: true },
  );
  watch(draft, () => void touch());
  const timer = window.setInterval(() => void touch(), 15000);
  onBeforeUnmount(() => {
    stopped = true;
    window.clearInterval(timer);
    leave();
  });
  return { invalid, warning };
}
