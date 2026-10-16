<template>
  <section class="halls" aria-label="Salas y mesas">
    <header class="halls-heading">
      <div>
        <small>TPV · HOSTELERÍA</small>
        <h2>Salas y mesas</h2>
        <p>Selecciona una mesa para recuperar o empezar su ticket.</p>
      </div>
      <div class="actions">
        <Button
          v-if="auth.user?.admin"
          label="Zonas"
          icon="pi pi-map"
          outlined
          @click="zonesManager?.open()"
        />
        <Button
          v-if="auth.user?.admin"
          label="Nueva sala"
          icon="pi pi-plus"
          outlined
          @click="configure('hall')"
        />
        <Button
          v-if="auth.user?.admin && current"
          class="new-table"
          label="Nueva mesa"
          icon="pi pi-plus"
          @click="configure('table')"
        />
        <Button
          label="Actualizar"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="loading"
          @click="load"
        />
      </div>
    </header>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <section class="hall-summary" aria-label="Resumen de todas las salas">
      <div class="hall-stat hall-stat--free">
        <i class="pi pi-th-large" aria-hidden="true" />
        <div>
          <span>Mesas libres</span><b>{{ count(freeCount) }}</b
          ><small>En todas las salas</small>
        </div>
      </div>
      <div class="hall-stat hall-stat--occupied">
        <i class="pi pi-users" aria-hidden="true" />
        <div>
          <span>Mesas ocupadas</span><b>{{ count(occupiedCount) }}</b
          ><small>{{ euros.format(occupiedTotal) }} en consumiciones</small>
        </div>
      </div>
      <button
        type="button"
        class="hall-stat hall-stat--bill"
        @click="scrollToBills"
      >
        <i class="pi pi-receipt" aria-hidden="true" />
        <div>
          <span>Cuentas solicitadas</span><b>{{ count(billTables.length) }}</b
          ><small>{{ euros.format(billTotal) }} pendientes</small>
        </div>
        <i class="pi pi-arrow-down-right stat-link" aria-hidden="true" />
      </button>
    </section>
    <div class="halls-layout">
      <div class="halls-main">
        <nav class="hall-tabs" aria-label="Salas">
          <button
            v-for="hall in halls"
            :key="hall.id"
            :class="{ selected: current?.id === hall.id }"
            :aria-pressed="current?.id === hall.id"
            @click="hallId = hall.id"
          >
            <i class="pi pi-map-marker" aria-hidden="true" /> {{ hall.name }}
            <span>{{ count(hall.tables.length) }}</span>
          </button>
        </nav>
        <div v-if="current" class="room-heading">
          <div class="room-title">
            <small>SALA ACTUAL</small>
            <h3>{{ current.name }}</h3>
          </div>
          <Button
            v-if="auth.user?.admin && current.zoneId == null"
            label="Asignar esta sala a la zona actual"
            icon="pi pi-map-marker"
            outlined
            :disabled="loading"
            @click="assignHall"
          />
          <span
            >{{ count(current.tables.length) }} mesas · selecciona para
            atender</span
          >
        </div>
        <p v-if="loading" role="status">Cargando salas…</p>
        <div v-else-if="!current?.tables.length" class="empty-hall">
          <i class="pi pi-th-large" />
          <h3>
            {{ current ? "Esta sala no tiene mesas" : "Todavía no hay salas" }}
          </h3>
          <p>
            {{
              auth.user?.admin
                ? "Crea las salas y sus mesas para empezar a trabajar."
                : "Un administrador debe configurar las salas y mesas."
            }}
          </p>
        </div>
        <div v-else class="tables">
          <button
            v-for="table in current.tables"
            :key="table.id"
            class="table-card"
            :class="table.state.toLowerCase()"
            :disabled="disabled || current.zoneId == null"
            @click="emit('select', { ...table, hallName: current.name })"
          >
            <span class="table-top"
              ><b>{{ table.code }}</b
              ><span>{{ stateLabel(table.state) }}</span></span
            >
            <span class="table-illustration" aria-hidden="true">
              <svg viewBox="0 0 132 88" fill="none">
                <rect
                  x="42"
                  y="3"
                  width="48"
                  height="13"
                  rx="6"
                  class="chair"
                />
                <rect
                  x="42"
                  y="72"
                  width="48"
                  height="13"
                  rx="6"
                  class="chair"
                />
                <rect
                  x="8"
                  y="29"
                  width="14"
                  height="30"
                  rx="6"
                  class="chair"
                />
                <rect
                  x="110"
                  y="29"
                  width="14"
                  height="30"
                  rx="6"
                  class="chair"
                />
                <rect
                  x="29"
                  y="21"
                  width="74"
                  height="46"
                  rx="14"
                  class="table-surface"
                />
                <circle cx="66" cy="44" r="11" class="table-plate" />
                <path
                  d="M48 36v16M45 36v7h6v-7M84 36v16M81 36v8h3"
                  class="table-cutlery"
                />
              </svg> </span
            ><strong>{{ table.name }}</strong>
            <small class="table-meta"
              ><span
                ><i class="pi pi-users" />{{ count(table.seats) }} plazas</span
              >
              ·
              <span
                ><i class="pi pi-shopping-bag" />{{ table.lines }}
                {{ table.lines === 1 ? "artículo" : "artículos" }}</span
              ></small
            >
            <span v-if="table.state !== 'FREE'" class="table-service">
              <span
                ><i class="pi pi-users" aria-hidden="true" />
                {{
                  table.guests
                    ? count(table.guests) + " comensales"
                    : "Comensales sin indicar"
                }}</span
              >
              <span v-if="table.openedAt"
                ><i class="pi pi-clock" aria-hidden="true" /> Abierta
                {{ elapsed(table.openedAt) }}</span
              >
              <b v-if="table.state === 'BILL' && table.billRequestedAt"
                >Espera de cuenta: {{ elapsed(table.billRequestedAt) }}</b
              >
            </span>
            <span class="table-bottom"
              ><b v-if="table.state !== 'FREE'" class="table-total">{{
                euros.format(table.total || 0)
              }}</b
              ><b v-else class="table-start">Abrir mesa</b
              ><i class="pi pi-arrow-right" aria-hidden="true"
            /></span>
          </button>
        </div>
      </div>
      <aside class="halls-side" aria-label="Resumen de cuentas solicitadas">
        <div class="bills">
          <header class="bills-heading">
            <div>
              <i class="pi pi-receipt" /><strong>Cuentas solicitadas</strong
              ><small
                >{{ count(billTables.length) }}
                {{ billTables.length === 1 ? "mesa" : "mesas" }} · todas las
                salas</small
              >
            </div>
          </header>
          <b class="bills-total">{{ euros.format(billTotal) }}</b>
          <ul v-if="billTables.length">
            <li v-for="table in billTables" :key="table.id">
              <button
                type="button"
                :disabled="disabled"
                @click="openBillTable(table)"
              >
                <span class="bills-waiter"
                  ><img
                    v-if="table.waiterId && !brokenWaiters.has(table.waiterId)"
                    :src="waiterPhotoUrl(table.waiterId)"
                    :alt="table.waiterName || ''"
                    loading="lazy"
                    @error="
                      table.waiterId && brokenWaiters.add(table.waiterId)
                    " /><i v-else class="pi pi-user"
                /></span>
                <span class="bills-table"
                  ><b>{{ table.code }}</b
                  ><span>{{ table.hallName }} · {{ table.name }}</span
                  ><small v-if="table.waiterName">{{
                    table.waiterName
                  }}</small></span
                >
                <span class="bills-lines"
                  >{{ table.lines }}
                  {{ table.lines === 1 ? "art." : "art." }}</span
                >
                <b>{{ euros.format(table.total || 0) }}</b>
              </button>
            </li>
          </ul>
          <p v-else class="bills-empty">
            <i class="pi pi-check-circle" aria-hidden="true" /> Todo al día ·
            sin cuentas pendientes
          </p>
        </div>
        <div class="bills bills--free">
          <header class="bills-heading">
            <div>
              <i class="pi pi-th-large" /><strong>Mesas libres</strong
              ><small
                >{{ count(freeTables.length) }}
                {{ freeTables.length === 1 ? "mesa" : "mesas" }} · todas las
                salas</small
              >
            </div>
          </header>
          <b class="bills-total">{{ count(freeTables.length) }}</b>
          <ul v-if="freeTables.length">
            <li v-for="table in freeTables" :key="table.id">
              <button
                type="button"
                class="free-row"
                :disabled="disabled"
                @click="openBillTable(table)"
              >
                <span class="bills-table"
                  ><b>{{ table.name }}</b
                  ><span>{{ table.hallName }} · {{ table.code }}</span></span
                >
                <span class="bills-lines"
                  >{{ count(table.seats) }}
                  {{ table.seats === 1 ? "plaza" : "plazas" }}</span
                >
                <b>→</b>
              </button>
            </li>
          </ul>
          <p v-else class="bills-empty">Sin mesas libres.</p>
        </div>
      </aside>
    </div>
    <Dialog
      v-model:visible="dialog"
      modal
      class="kiwik-dialog"
      :closable="!saving"
      :style="{ width: 'min(460px, 94vw)' }"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
    >
      <template #header
        ><strong>{{
          kind === "hall" ? "Nueva sala" : `Nueva mesa · ${current?.name}`
        }}</strong></template
      >
      <form id="tpv-hall-form" class="config-form" @submit.prevent="save">
        <label
          >Nombre<input
            v-model="name"
            maxlength="80"
            required
            :disabled="saving"
            autofocus
        /></label>
        <label v-if="kind === 'hall'"
          >Zona<select v-model="hallZoneId" :disabled="saving">
            <option :value="null">Sin zona (pendiente de asignación)</option>
            <option v-for="z in zoneAdmin" :key="z.id" :value="z.id">
              {{ z.code }} — {{ z.name }}
            </option>
          </select></label
        >
        <template v-if="kind === 'table'"
          ><label
            >Código<input
              v-model="code"
              maxlength="20"
              required
              :disabled="saving" /></label
          ><label
            >Plazas<InputNumber
              locale="de-DE"
              v-model="seats"
              :min="0"
              :max="999"
              :use-grouping="false"
              :disabled="saving" /></label
        ></template>
        <Message v-if="configError" severity="error" :closable="false">{{
          configError
        }}</Message>
      </form>
      <template #footer
        ><div class="config-footer">
          <div class="kiwik-separator" />
          <Button
            label="Cancelar"
            text
            severity="secondary"
            :disabled="saving"
            @click="dialog = false"
          /><Button
            label="Crear"
            type="submit"
            form="tpv-hall-form"
            :loading="saving"
          /></div
      ></template>
    </Dialog>
    <TpvZonesDialog ref="zonesManager" @saved="zonesChanged" />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import axios from "axios";
import TpvZonesDialog from "./TpvZonesDialog.vue";
import { useTpvZones } from "./useTpvZones";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import InputNumber from "primevue/inputnumber";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
export interface BarTable {
  id: number;
  code: string;
  name: string;
  seats: number;
  guests?: number | null;
  openedAt?: number | null;
  billRequestedAt?: number | null;
  state: string;
  lines: number;
  total: number;
  hallId?: number;
  hallName?: string;
  waiterId?: number | null;
  waiterName?: string | null;
}
interface Hall {
  id: number;
  name: string;
  tables: BarTable[];
  zoneId: number | null;
}
const props = defineProps<{ disabled: boolean; zoneId?: number }>();
const emit = defineEmits<{ select: [table: BarTable] }>();
const auth = useAuthStore();
const halls = ref<Hall[]>([]);
const hallId = ref<number | null>(null);
const { zoneId: workZoneId } = useTpvZones();
// Central can manage a zone without entering or opening one of its cash registers.
const zoneId = computed(() => props.zoneId ?? workZoneId.value);
const current = computed(
  () => halls.value.find((h) => h.id === hallId.value) || halls.value[0],
);
const clockNow = ref(Date.now());
let clockTimer: ReturnType<typeof setInterval>;
onMounted(() => {
  clockTimer = setInterval(() => {
    clockNow.value = Date.now();
  }, 15000);
});
onUnmounted(() => clearInterval(clockTimer));
function elapsed(value?: number | null) {
  if (!value) return "";
  const minutes = Math.max(
    0,
    Math.floor((clockNow.value - Number(value)) / 60000),
  );
  return minutes < 60
    ? minutes + " min"
    : Math.floor(minutes / 60) + " h " + (minutes % 60) + " min";
}
const loading = ref(false);
const error = ref("");
const brokenWaiters = ref(new Set<number>());
const waiterPhotoUrl = (id: number) =>
  backendUrl(`/gestdoc/users/${id}/photoPerfil.jpg?t=${auth.photoTimestamp}`);
const allTables = computed(() =>
  halls.value
    .filter((h) => h.zoneId === zoneId.value)
    .flatMap((h) =>
      h.tables.map((t) => ({ ...t, hallId: h.id, hallName: h.name })),
    ),
);
const billTables = computed(() =>
  allTables.value.filter((t) => t.state === "BILL"),
);
const billTotal = computed(() =>
  billTables.value.reduce((sum, t) => sum + (Number(t.total) || 0), 0),
);
const freeCount = computed(
  () => allTables.value.filter((t) => t.state === "FREE").length,
);
const freeTables = computed(() =>
  allTables.value.filter((t) => t.state === "FREE"),
);
const occupiedCount = computed(
  () =>
    allTables.value.filter(
      (t) => t.state === "OCCUPIED" || t.state === "ORDERING",
    ).length,
);
const occupiedTotal = computed(() =>
  allTables.value
    .filter((t) => t.state === "OCCUPIED" || t.state === "ORDERING")
    .reduce((sum, t) => sum + (Number(t.total) || 0), 0),
);
function openBillTable(table: BarTable) {
  if (table.hallId) hallId.value = table.hallId;
  emit("select", { ...table });
}
function scrollToBills() {
  document
    .querySelector(".halls-side .bills")
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
const count = (n: number) => n.toLocaleString("de-DE");
const euros = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const stateLabel = (state: string) =>
  ({
    FREE: "Libre",
    OCCUPIED: "Ocupada",
    ORDERING: "Pedido en curso",
    BILL: "Cuenta solicitada",
  })[state] || state;
function detail(e: unknown) {
  return axios.isAxiosError(e)
    ? e.response?.data?.message ||
        "No se pudo completar la operación. Revisa la conexión y los permisos."
    : "No se pudo completar la operación.";
}
async function load() {
  loading.value = true;
  error.value = "";
  try {
    if (zoneId.value == null) {
      halls.value = [];
      return;
    }
    halls.value = (
      await axios.get<Hall[]>(backendUrl("/WebTpv/halls"), {
        ...auth.portalRequestConfig(),
        params: zoneId.value != null ? { zoneId: zoneId.value } : {},
        timeout: 15000,
      })
    ).data;
  } catch (e) {
    error.value = detail(e);
  } finally {
    loading.value = false;
  }
}
async function assignHall() {
  if (
    !current.value ||
    !auth.user?.admin ||
    zoneId.value == null ||
    loading.value
  )
    return;
  loading.value = true;
  error.value = "";
  try {
    await axios.post(
      backendUrl("/WebTpv/halls"),
      { id: current.value.id, name: current.value.name, zoneId: zoneId.value },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    await load();
  } catch (e) {
    error.value = detail(e);
  } finally {
    loading.value = false;
  }
}
const dialog = ref(false);
const kind = ref<"hall" | "table">("hall");
const name = ref("");
const code = ref("");
const seats = ref<number>(4);
const hallZoneId = ref<number | null>(null);
const saving = ref(false);
const configError = ref("");
const zonesManager = ref<InstanceType<typeof TpvZonesDialog>>();
const zoneAdmin = ref<Array<{ id: number; code: string; name: string }>>([]);
async function loadZoneAdmin() {
  try {
    zoneAdmin.value = (
      await axios.get(backendUrl("/WebTpv/zones"), {
        ...auth.portalRequestConfig(),
        timeout: 15000,
      })
    ).data;
  } catch (e) {
    configError.value = detail(e);
  }
}
const sharedZones = useTpvZones();
async function zonesChanged() {
  await sharedZones.load(true);
  await loadZoneAdmin();
  await load();
}
function configure(value: "hall" | "table") {
  kind.value = value;
  name.value = "";
  code.value = "";
  seats.value = 4;
  hallZoneId.value = zoneId.value;
  configError.value = "";
  if (value === "hall") void loadZoneAdmin();
  dialog.value = true;
}
async function save() {
  if (
    saving.value ||
    !name.value.trim() ||
    (kind.value === "table" && !code.value.trim())
  )
    return;
  saving.value = true;
  configError.value = "";
  try {
    const body =
      kind.value === "hall"
        ? { name: name.value.trim(), zoneId: hallZoneId.value }
        : {
            hallId: current.value?.id,
            name: name.value.trim(),
            code: code.value.trim(),
            seats: seats.value ?? 0,
          };
    const result = await axios.post(
      backendUrl(`/WebTpv/${kind.value === "hall" ? "halls" : "tables"}`),
      body,
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    if (kind.value === "hall") hallId.value = result.data.id;
    dialog.value = false;
    await load();
  } catch (e) {
    configError.value = detail(e);
  } finally {
    saving.value = false;
  }
}
onMounted(load);
</script>

<style scoped>
/* Keep the room grid and cross-room summaries visually distinct at every width. */
.halls {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  color: #29352e;
}
.halls-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}
.halls-heading small {
  color: #628000;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
}
h2 {
  margin: 5px 0;
  font-size: 26px;
  letter-spacing: -0.7px;
}
.halls-heading p {
  margin: 0;
  color: #66736b;
  font-size: 13px;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.new-table {
  background: #9cc10a;
  color: #253000;
  border-color: #9cc10a;
}
.hall-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 0 0 20px;
}
.hall-stat {
  display: flex;
  position: relative;
  align-items: center;
  gap: 16px;
  padding: 17px 20px;
  background: #fff;
  border: 1px solid #e0e6dd;
  border-radius: 14px;
  font: inherit;
  color: inherit;
  text-align: left;
}
.hall-stat > i:first-child {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  height: 44px;
  background: #f1f4ed;
  border-radius: 12px;
  color: #71815f;
  font-size: 21px;
}
.hall-stat > div {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  column-gap: 16px;
  row-gap: 3px;
  min-width: 0;
}
.hall-stat span {
  grid-column: 1 / -1;
  font-size: 13px;
  font-weight: 600;
  color: #53614f;
}
.hall-stat b {
  font-size: 30px;
  line-height: 1.2;
  letter-spacing: -1px;
}
.hall-stat small {
  font-size: 12px;
  color: #74806e;
}
.hall-stat--occupied > i:first-child {
  background: #edf5d7;
  color: #638000;
}
.hall-stat--bill {
  border-color: #e9d6af;
  background: #fffcf5;
  cursor: pointer;
}
.hall-stat--bill > i:first-child {
  background: #faedcf;
  color: #956517;
}
.hall-stat .stat-link {
  margin-left: auto;
  color: #956517;
  font-size: 14px;
}
.halls-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: 20px;
}
.halls-main {
  min-width: 0;
}
.hall-tabs {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 0 0 12px;
  border-bottom: 1px solid #dfe5d9;
}
.hall-tabs button {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  border: 1px solid transparent;
  background: transparent;
  color: #66736b;
  padding: 11px 16px;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.hall-tabs button.selected {
  background: #fff;
  color: #253000;
  border-color: #a9c348;
  font-weight: 700;
  box-shadow: 0 2px 4px #25300006;
}
.hall-tabs span {
  display: grid;
  place-items: center;
  min-width: 24px;
  height: 24px;
  padding: 0 5px;
  border-radius: 6px;
  font-size: 12px;
  background: #e9eee2;
}
.hall-tabs .selected span {
  background: #9cc10a;
  color: #253000;
}
.zone-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
  padding: 10px 14px;
  background: white;
  border: 1px solid #e1e6eb;
  border-radius: 14px;
  box-shadow: 0 3px 11px rgba(30, 41, 59, 0.05);
  color: #66736b;
}
.zone-bar > i {
  color: #7d9e0b;
  font-size: 18px;
}
.zone-bar button {
  border: 1px solid #dce3d4;
  background: white;
  padding: 8px 16px;
  border-radius: 10px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: #526047;
}
.zone-bar button.selected {
  background: #253000;
  border-color: #253000;
  color: #eef5d9;
}
.room-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0 14px;
}
.room-heading h3 {
  margin: 0;
  font-size: 18px;
  letter-spacing: -0.3px;
}
.room-heading span {
  font-size: 12px;
  color: #74806e;
}
.tables {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 14px;
}
.table-card {
  --state: #7b8970;
  --tint: #f1f4ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 14px 16px 0;
  border: 1px solid #dfe5d9;
  border-radius: 14px;
  background: #fff;
  color: #29352e;
  font: inherit;
  cursor: pointer;
  overflow: hidden;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.table-card.occupied,
.table-card.ordering {
  --state: #628000;
  --tint: #edf5d7;
  border-color: #c4d69b;
}
.table-card.bill {
  --state: #936219;
  --tint: #fcf0d6;
  border-color: #e5c88f;
}
.table-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 8px;
}
.table-top > b {
  font-size: 12px;
  color: #71806b;
}
.table-top > span {
  font-size: 11px;
  font-weight: 700;
  padding: 5px 8px;
  border-radius: 6px;
  color: var(--state);
  background: var(--tint);
}
.table-card > i {
  display: grid;
  place-items: center;
  height: 42px;
  width: 56px;
  margin: 2px 0 0;
  background: var(--tint);
  color: var(--state);
  border: 1px solid color-mix(in srgb, var(--state) 25%, transparent);
  border-radius: 11px;
  font-size: 23px;
}
.table-card > strong {
  font-size: 17px;
  text-align: center;
  overflow-wrap: anywhere;
}
.table-meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
  color: #75806e;
  font-size: 12px;
  margin-bottom: 4px;
}
.table-meta i {
  font-size: 11px;
  margin-right: 4px;
}
.table-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  margin: 0 -16px;
  padding: 12px 16px;
  border-top: 1px solid #edf0e8;
  background: #fafbf8;
}
.table-total {
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.4px;
}
.table-bottom > i {
  font-size: 13px;
  color: var(--state);
}
.table-card.bill .table-bottom {
  background: #fffbf3;
}
.table-card:hover:not(:disabled),
.bills li button:hover:not(:disabled) {
  border-color: #8aaa32;
  box-shadow: 0 4px 12px #25300010;
}
button:disabled {
  cursor: default;
  opacity: 0.6;
}
button:focus-visible {
  outline: 3px solid #829f27;
  outline-offset: 3px;
}
.halls-side {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.bills {
  border: 1px solid #e1e6dc;
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
}
.bills-heading {
  padding: 16px 18px 0;
}
.bills-heading > div {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  column-gap: 10px;
  row-gap: 4px;
  align-items: center;
}
.bills-heading i {
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  height: 34px;
  width: 34px;
  border-radius: 9px;
  color: #936219;
  background: #fcf0d6;
  font-size: 16px;
}
.bills-heading strong {
  font-size: 15px;
}
.bills-heading small {
  font-size: 11px;
  color: #7a8274;
}
.bills-total {
  display: block;
  padding: 15px 18px;
  margin-top: 2px;
  border-bottom: 1px solid #eef0ea;
  font-size: 27px;
  color: #29352e;
  letter-spacing: -0.7px;
}
.bills ul {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 12px;
  margin: 0;
  max-height: 340px;
  overflow: auto;
}
.bills li button {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto;
  column-gap: 10px;
  row-gap: 6px;
  align-items: center;
  width: 100%;
  border: 1px solid #ede6d6;
  background: #fffcf6;
  padding: 12px;
  border-radius: 10px;
  text-align: left;
  color: #29352e;
  font: inherit;
  cursor: pointer;
}
.bills-waiter {
  grid-row: 1 / 3;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #f2e8d2;
  color: #947037;
  overflow: hidden;
}
.bills-waiter img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bills-table {
  min-width: 0;
  grid-column: 2 / -1;
}
.bills-table b {
  font-size: 14px;
}
.bills-table span,
.bills-table small {
  display: block;
  font-size: 11px;
  color: #77816e;
  margin-top: 3px;
  overflow-wrap: anywhere;
}
.bills-table small {
  color: #65734f;
}
.bills-lines {
  grid-column: 2;
  font-size: 11px;
  color: #7a8274;
}
.bills li button > b:last-child {
  font-size: 15px;
  justify-self: end;
  white-space: nowrap;
}
.bills--free .bills-heading i {
  color: #638000;
  background: #edf5d7;
}
.bills--free .bills-total {
  display: none;
}
.bills--free .bills-heading {
  padding-bottom: 16px;
  border-bottom: 1px solid #eef0ea;
}
.bills--free li button {
  grid-template-columns: minmax(0, 1fr) auto 16px;
  background: #fafcf7;
  border-color: #e5ebde;
}
.bills--free .bills-table {
  grid-column: 1;
}
.bills--free .bills-lines {
  grid-column: 2;
}
.bills--free li button > b:last-child {
  color: #638000;
}
.bills-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 84px;
  padding: 18px;
  margin: 0;
  font-size: 13px;
  color: #7a8274;
}
.empty-hall {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border: 1px dashed #d4ddc8;
  border-radius: 14px;
}
.empty-hall i {
  font-size: 32px;
  color: #8aaa32;
}
.empty-hall p {
  color: #74806e;
  font-size: 14px;
}
.config-form,
.config-form label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.config-form {
  gap: 18px;
}
.config-form input {
  padding: 12px;
  border: 1px solid #dce3d4;
  border-radius: 8px;
  font: inherit;
}
.config-form select {
  padding: 12px;
  border: 1px solid #dce3d4;
  border-radius: 8px;
  font: inherit;
  background: white;
}
.zone-layout {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 16px;
}
.zone-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zone-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 9px 11px;
  border: 1px solid #d9e1d1;
  border-radius: 10px;
  background: white;
  font: inherit;
  cursor: pointer;
  text-align: left;
}
.zone-row.selected {
  border-color: #9cc10a;
  background: #eef5d9;
}
.zone-row b {
  font-size: 13px;
}
.zone-row span {
  font-size: 12px;
  color: #66736b;
}
.zone-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.zone-form > label {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
}
.zone-form input {
  padding: 9px 11px;
  border: 1px solid #d9e1d1;
  border-radius: 9px;
  font: inherit;
}
.zone-check {
  flex-direction: row !important;
  align-items: center;
  gap: 8px !important;
}
.zone-venues {
  margin-top: 6px;
  padding-top: 10px;
  border-top: 1px dashed #dfe5d9;
}
.zone-venues strong {
  font-size: 13px;
}
.zone-venues ul {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zone-venues li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #e1e6eb;
  border-radius: 9px;
  font-size: 13px;
}
.zone-venues li button {
  border: 0;
  background: transparent;
  color: #b93a3a;
  cursor: pointer;
  font-size: 14px;
}
.zone-venues small {
  color: #66736b;
}
.config-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
.kiwik-separator {
  flex-basis: 100%;
  border-top: 1px solid #e0e6dd;
  margin-bottom: 8px;
}
@media (min-width: 1600px) {
  .halls-layout {
    grid-template-columns: minmax(0, 1fr) 370px;
  }
  .tables {
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  }
}
@media (max-width: 1100px) {
  .halls-layout {
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: 14px;
  }
  .hall-stat {
    padding: 14px;
    gap: 10px;
  }
  .hall-stat > div {
    column-gap: 8px;
  }
  .hall-stat small {
    grid-column: 1 / -1;
  }
  .tables {
    grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
  }
}
@media (max-width: 800px) {
  .halls {
    padding: 14px;
  }
  .halls-heading {
    flex-wrap: wrap;
    gap: 14px;
  }
  .halls-layout {
    grid-template-columns: 1fr;
  }
  .halls-side {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .hall-stat > i:first-child {
    display: none;
  }
  .hall-stat .stat-link {
    display: none;
  }
  .hall-stat b {
    font-size: 25px;
  }
}
@media (max-width: 520px) {
  .hall-summary {
    gap: 6px;
  }
  .hall-stat {
    padding: 12px 9px;
  }
  .hall-stat span {
    font-size: 11px;
  }
  .hall-stat small {
    font-size: 10px;
  }
  .halls-side {
    grid-template-columns: 1fr;
  }
  .tables {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;
  }
  .table-card {
    padding: 12px 10px 0;
  }
  .table-bottom {
    margin: 0 -10px;
    padding: 10px;
  }
  .table-top {
    flex-wrap: wrap;
  }
}

.table-service {
  display: grid;
  gap: 5px;
  width: 100%;
  font-size: 11px;
  color: #687563;
  padding: 6px 0;
}
.table-service i {
  margin-right: 4px;
}
.table-service b {
  color: #936219;
  font-weight: 600;
}
/* Room surface and table silhouettes make availability readable at a glance. */
.halls-heading h2 {
  font-size: 28px;
  letter-spacing: -0.8px;
}
.halls-heading > div:first-child {
  border-left: 4px solid #9cc10a;
  padding-left: 14px;
}
.hall-stat {
  box-shadow: 0 4px 16px #25300005;
  border-radius: 16px;
}
.hall-stat--occupied {
  background: linear-gradient(115deg, #f4f8e9, #fff);
  border-color: #d6e3b5;
}
.hall-stat--bill {
  background: linear-gradient(115deg, #fff6e5, #fffdf9);
}
.halls-main {
  padding: 20px;
  border: 1px solid #dfe6d7;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 5px 22px #25300004;
}
.hall-tabs {
  gap: 10px;
}
.hall-tabs button {
  background: #f5f7f0;
  border: 1px solid #e7ebdf;
}
.hall-tabs button.selected {
  background: #253000;
  color: #fff;
  border-color: #253000;
  box-shadow: 0 3px 8px #25300015;
}
.hall-tabs button > i {
  font-size: 14px;
}
.hall-tabs .selected span {
  background: #b9da44;
  color: #253000;
}
.room-title small {
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 700;
  color: #83916c;
  display: block;
  margin-bottom: 5px;
}
.room-heading {
  margin: 24px 0 18px;
}
.room-heading h3 {
  font-size: 21px;
}
.tables {
  padding: 18px;
  min-height: 350px;
  align-content: start;
  border-radius: 14px;
  background-color: #f6f8f2;
  background-image: radial-gradient(#cbd6bc 0.7px, transparent 0.7px);
  background-size: 18px 18px;
}
.table-card {
  border-top: 3px solid #dce4d3;
  box-shadow: 0 3px 10px #25300006;
  gap: 9px;
  transition:
    transform 0.15s,
    box-shadow 0.15s,
    border-color 0.15s;
}
.table-card.occupied,
.table-card.ordering {
  border-top-color: #9cc10a;
  background: linear-gradient(180deg, #fbfdf4, #fff 70%);
}
.table-card.bill {
  border-top-color: #d49a28;
  background: linear-gradient(180deg, #fff9eb, #fff 70%);
}
.table-top > span {
  border-radius: 20px;
  padding: 5px 10px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.table-top > span::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.table-illustration {
  width: 132px;
  height: 88px;
  display: block;
  margin: 5px 0 0;
}
.table-illustration svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.chair {
  fill: var(--tint);
  stroke: var(--state);
  stroke-opacity: 0.35;
  stroke-width: 1.3;
}
.table-surface {
  fill: var(--tint);
  stroke: var(--state);
  stroke-opacity: 0.55;
  stroke-width: 1.5;
  filter: drop-shadow(0 3px 2px #25300010);
}
.table-plate {
  fill: white;
  stroke: var(--state);
  stroke-opacity: 0.25;
}
.table-cutlery {
  stroke: var(--state);
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.65;
}
.table-card > strong {
  font-size: 18px;
}
.table-bottom {
  margin-top: 5px;
  width: calc(100% + 32px);
  min-height: 54px;
}
.table-card.occupied .table-bottom,
.table-card.ordering .table-bottom {
  background: #f2f7e5;
  border-color: #e1ebcb;
}
.table-start {
  font-size: 14px;
  color: #6a7959;
}
.table-card:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px #25300012;
}
.bills {
  box-shadow: 0 4px 16px #25300005;
  border-radius: 16px;
}
.bills:not(.bills--free) {
  border-top: 3px solid #e8c481;
}
.bills-empty {
  gap: 8px;
  font-size: 12px;
  background: #fcfdf9;
}
.bills-empty i {
  color: #8ba64c;
  font-size: 17px;
}
@media (max-width: 1100px) {
  .halls-main {
    padding: 14px;
  }
  .tables {
    padding: 12px;
    gap: 12px;
  }
}
@media (max-width: 800px) {
  .tables {
    min-height: 280px;
  }
  .halls-heading h2 {
    font-size: 25px;
  }
}
@media (max-width: 520px) {
  .halls-main {
    padding: 10px;
    border-radius: 14px;
  }
  .tables {
    padding: 8px;
    gap: 8px;
  }
  .table-illustration {
    width: 108px;
    height: 74px;
  }
  .table-card > strong {
    font-size: 15px;
  }
  .table-top > span {
    font-size: 10px;
    padding: 4px 7px;
  }
  .table-bottom {
    width: calc(100% + 20px);
  }
  .table-total {
    font-size: 17px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .table-card {
    transition: none;
  }
  .table-card:hover:not(:disabled) {
    transform: none;
  }
}
</style>
