import { reactive, watch } from "vue";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { useCompanyStore } from "../../stores/companyStore";

const IDLE_MINUTES = 15;
const WARNING_SECONDS = 60;
const ACTIVITY_EVENTS = [
  "mousedown",
  "keydown",
  "touchstart",
  "wheel",
  "scroll",
] as const;

// A dedicated dialog keeps activity and global confirmations from swallowing its buttons.
export const idleSessionPrompt = reactive({
  visible: false,
  message: "",
  continueWorking: () => {},
  logout: () => {},
});
let tpvLogoutHandler: (() => Promise<void>) | null = null;
export function registerTpvIdleLogout(handler: () => Promise<void>) {
  tpvLogoutHandler = handler;
  return () => {
    if (tpvLogoutHandler === handler) tpvLogoutHandler = null;
  };
}
let started = false;

export function startIdleWatcher() {
  if (started) return;
  started = true;
  const toast = useToast();
  const router = useRouter();
  const authStore = useAuthStore();
  const companyStore = useCompanyStore();
  let idleTimer: number | null = null;
  let warnTimer: number | null = null;
  let exiting = false;

  const clear = () => {
    if (idleTimer !== null) window.clearTimeout(idleTimer);
    if (warnTimer !== null) window.clearTimeout(warnTimer);
    idleTimer = null;
    warnTimer = null;
  };
  const doLogout = async (detail: string) => {
    if (exiting || !authStore.isAuthenticated) return;
    exiting = true;
    idleSessionPrompt.visible = false;
    clear();
    try {
      if (tpvLogoutHandler) {
        // Let the TPV save tables and confirm pending tickets before revoking authentication.
        await tpvLogoutHandler();
        return;
      }
      const wasTpv = authStore.loginAccess === "tpv";
      authStore.logout();
      toast.add({
        severity: "info",
        summary: "Sesión finalizada",
        detail,
        life: companyStore.companyInfo.toastDuration ?? 3000,
      });
      await router.push(
        wasTpv
          ? { name: "Login", query: { access: "tpv" } }
          : { name: "Login" },
      );
    } catch {
      toast.add({
        severity: "warn",
        summary: "No se pudo cerrar la sesión",
        detail: "Revisa la operación en curso y vuelve a intentarlo.",
        life: 5000,
      });
    } finally {
      exiting = false;
      // A TPV with an unpaid ticket may be awaiting its own confirmation or finishing payment.
      if (authStore.isAuthenticated) arm();
    }
  };
  const arm = () => {
    clear();
    if (!authStore.isAuthenticated) return;
    warnTimer = window.setTimeout(
      showWarning,
      IDLE_MINUTES * 60 * 1000 - WARNING_SECONDS * 1000,
    );
    idleTimer = window.setTimeout(
      () => {
        void doLogout("Se ha cerrado la sesión por inactividad.");
      },
      IDLE_MINUTES * 60 * 1000,
    );
  };
  const showWarning = () => {
    if (!authStore.isAuthenticated) return;
    idleSessionPrompt.message =
      "Tu sesión se cerrará por inactividad en " +
      WARNING_SECONDS / 60 +
      " minuto.";
    idleSessionPrompt.visible = true;
  };
  idleSessionPrompt.continueWorking = () => {
    idleSessionPrompt.visible = false;
    arm();
  };
  idleSessionPrompt.logout = () => {
    void doLogout("Sesión cerrada.");
  };
  const onActivity = () => {
    // Only an explicit answer dismisses the warning; mousedown/touchstart precedes click.
    if (!authStore.isAuthenticated || idleSessionPrompt.visible || exiting)
      return;
    arm();
  };
  const attach = () =>
    ACTIVITY_EVENTS.forEach((ev) =>
      window.addEventListener(ev, onActivity, { passive: true }),
    );
  const detach = () =>
    ACTIVITY_EVENTS.forEach((ev) => window.removeEventListener(ev, onActivity));
  watch(
    () => authStore.isAuthenticated,
    (logged) => {
      idleSessionPrompt.visible = false;
      if (logged) {
        attach();
        arm();
      } else {
        detach();
        clear();
      }
    },
    { immediate: true },
  );
}
