import { computed, ref, watch } from "vue";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
export interface TpvZoneRef {
  id: number;
  code: string;
  name: string;
}
export interface TpvWorkplace {
  zoneId: number;
  zoneName: string;
  registerId: number;
  registerName: string;
  openingId: number;
  openedAt?: string | null;
  openedByName?: string | null;
}
const myZones = ref<TpvZoneRef[]>([]);
const workplace = ref<TpvWorkplace | null>(null);
const zonesReady = ref(false);
let session = "";
let generation = 0;
/** Work context is session-scoped, never inherited from another employee's browser storage. */
export function useTpvZones() {
  const auth = useAuthStore();
  watch(
    () => `${auth.user?.pkid ?? ""}:${auth.portalSession ?? ""}`,
    (key) => {
      if (key === session) return;
      session = key;
      ++generation;
      myZones.value = [];
      workplace.value = null;
      zonesReady.value = false;
    },
    { immediate: true, flush: "sync" },
  );
  async function load(force = false) {
    if (zonesReady.value && !force) return;
    const request = ++generation;
    const { data } = await axios.get(backendUrl("/WebTpv/myzones"), {
      ...auth.portalRequestConfig(),
      timeout: 15000,
    });
    if (request !== generation) return;
    myZones.value = Array.isArray(data) ? data : [];
    if (
      workplace.value &&
      !myZones.value.some((z) => z.id === workplace.value?.zoneId)
    )
      workplace.value = null;
    zonesReady.value = true;
  }
  const zoneId = computed(() => workplace.value?.zoneId ?? null);
  const activeZone = computed(
    () => myZones.value.find((z) => z.id === zoneId.value) ?? null,
  );
  return {
    myZones,
    zoneId,
    activeZone,
    workplace,
    load,
    reset: () => {
      workplace.value = null;
    },
  };
}
