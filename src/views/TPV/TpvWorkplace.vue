<template>
  <section class="workplace" aria-label="Elegir puesto de trabajo">
    <header>
      <div>
        <small>ANTES DE EMPEZAR</small>
        <h2>¿Dónde vas a trabajar?</h2>
        <p>
          Hola, {{ auth.user?.name }}. Selecciona tu zona y la caja de esta
          sesión.
        </p>
      </div>
      <Button
        v-if="auth.user?.admin"
        label="Gestionar zonas"
        icon="pi pi-map"
        outlined
        :disabled="busy"
        @click="zonesManager?.open()"
      />
    </header>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <div class="steps">
      <section>
        <h3><b>1</b> Zona de trabajo</h3>
        <div class="search-row">
          <input
            ref="filterInput"
            v-model="filter"
            type="search"
            data-alpha="1"
            placeholder="Buscar zona por nombre o código…"
            aria-label="Buscar zona"
            :disabled="busy"
            @focus="showKeyboard"
          />
          <Button
            label="Teclado"
            aria-label="Mostrar teclado en pantalla"
            :disabled="busy"
            @click="showKeyboard"
          >
            <template #icon="iconProps">
              <svg
                :class="iconProps.class"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path
                  d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6"
                />
              </svg>
            </template>
          </Button>
        </div>
        <p v-if="!myZones.length && !loading">
          No tienes zonas disponibles. Un administrador debe crear una zona y
          asignártela.
        </p>
        <div class="choices">
          <button
            v-for="zone in filteredZones"
            :key="zone.id"
            type="button"
            :aria-pressed="selectedZone === zone.id"
            :class="{ selected: selectedZone === zone.id }"
            :disabled="busy"
            @click="chooseZone(zone.id)"
          >
            <i class="pi pi-map-marker" /><span
              ><strong>{{ zone.name }}</strong
              ><small>{{ zone.code }}</small></span
            ><i v-if="selectedZone === zone.id" class="pi pi-check-circle" />
          </button>
        </div>
        <p v-if="myZones.length && !filteredZones.length">
          No hay zonas que coincidan con la búsqueda.
        </p>
      </section>
      <section>
        <h3><b>2</b> Caja</h3>
        <Button
          v-if="canViewClosures && selectedZone"
          label="Histórico de cierres"
          icon="pi pi-history"
          text
          :disabled="busy"
          @click="$emit('closures', selectedZone)"
        />
        <p v-if="!selectedZone">Selecciona una zona para ver sus cajas.</p>
        <p v-else-if="!registers.length && !loading">
          Esta zona aún no tiene cajas.
        </p>
        <div class="choices">
          <button
            v-for="register in registers"
            :key="register.id"
            type="button"
            :aria-pressed="selectedRegister === register.id"
            :class="{ selected: selectedRegister === register.id }"
            :disabled="busy || loading"
            @click="selectedRegister = register.id"
          >
            <i class="pi pi-wallet" /><span
              ><strong>{{ register.name }}</strong
              ><small
                >{{ register.code }} ·
                {{
                  register.openingId
                    ? "Abierta · #" + register.openingId
                    : "Pendiente de apertura"
                }}</small
              ></span
            ><i
              v-if="selectedRegister === register.id"
              class="pi pi-check-circle"
            />
          </button>
        </div>
        <Button
          v-if="auth.user?.admin && selectedZone"
          label="Nueva caja"
          icon="pi pi-plus"
          text
          :disabled="busy || loading"
          @click="newRegister = true"
        />
      </section>
      <section class="access">
        <h3><b>3</b> Empezar turno</h3>
        <template v-if="currentRegister">
          <strong
            >{{ myZones.find((z) => z.id === selectedZone)?.name }} ·
            {{ currentRegister.name }}</strong
          >
          <p v-if="currentRegister.openingId">
            La caja ya está abierta. Entrarás en la misma apertura; las
            operaciones identificarán al empleado que las realiza.
          </p>
          <template v-else
            ><p>Indica el efectivo inicial para abrir la caja.</p>
            <label for="opening-float">Fondo inicial</label
            ><InputNumber
              input-id="opening-float"
              v-model="amount"
              mode="currency"
              currency="EUR"
              locale="de-DE"
              :min="0"
              :max-fraction-digits="2"
              :disabled="busy"
          /></template>
          <Button
            :label="
              currentRegister.openingId
                ? 'Entrar en esta caja'
                : 'Abrir caja y entrar'
            "
            icon="pi pi-arrow-right"
            :loading="busy"
            :disabled="
              loading || (!currentRegister.openingId && amount == null)
            "
            @click="enter"
          />
        </template>
        <p v-else>Selecciona una caja para continuar.</p>
        <small
          >Cambiar de empleado o de puesto no cierra la caja. Factura siempre la
          entidad titular de KiwiKERP.</small
        >
      </section>
    </div>
    <Button
      label="Actualizar zonas y cajas"
      icon="pi pi-refresh"
      text
      :loading="loading"
      :disabled="busy"
      @click="reload"
    />
    <TpvZonesDialog ref="zonesManager" @saved="reload" />
    <Dialog
      v-model:visible="newRegister"
      header="Nueva caja"
      modal
      class="kiwik-dialog"
      :pt="{ header: { class: 'kiwik-dialog-header' } }"
      :style="{ width: 'min(440px, 94vw)' }"
      :closable="!busy"
      :close-on-escape="!busy"
    >
      <p>Zona: {{ myZones.find((z) => z.id === selectedZone)?.name }}</p>
      <div class="register-fields">
        <label for="register-code">Código</label
        ><input
          id="register-code"
          v-model="code"
          maxlength="20"
          :disabled="busy"
        /><label for="register-name">Nombre</label
        ><input
          id="register-name"
          v-model="name"
          maxlength="100"
          :disabled="busy"
        />
      </div>
      <Message v-if="registerError" severity="error" :closable="false">{{
        registerError
      }}</Message>
      <template #footer
        ><div class="register-footer">
          <div class="kiwik-separator" />
          <div class="register-buttons">
            <Button
              label="Cancelar"
              text
              :disabled="busy"
              @click="newRegister = false"
            /><Button
              label="Crear caja"
              :loading="busy"
              :disabled="!code.trim() || !name.trim()"
              @click="createRegister"
            />
          </div></div
      ></template>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
defineProps<{ canViewClosures?: boolean }>();
defineEmits<{ closures: [zoneId: number] }>();
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import InputNumber from "primevue/inputnumber";
import TpvZonesDialog from "./TpvZonesDialog.vue";
import { useTpvZones, type TpvWorkplace } from "./useTpvZones";
import { useAuthStore } from "@/stores/authStore";
import { backendUrl } from "@/services/backendUrl";
interface Register {
  id: number;
  code: string;
  name: string;
  openingId: number | null;
}
const auth = useAuthStore();
const { myZones, workplace, load } = useTpvZones();
const registers = ref<Register[]>([]);
const selectedZone = ref<number | null>(null);
const selectedRegister = ref<number | null>(null);
const filter = ref("");
const filterInput = ref<HTMLInputElement | null>(null);
/**
 * Abre el teclado flotante del TPV (vive en Frm_Tpv). Se pide de forma
 * explícita para que funcione también si el auto-foco está bloqueado.
 */
function showKeyboard() {
  filterInput.value?.focus();
  window.dispatchEvent(new CustomEvent("kiwik:alpha-show"));
}
const loading = ref(false);
const busy = ref(false);
const error = ref("");
const amount = ref<number | null>(null);
const newRegister = ref(false);
const code = ref("");
const name = ref("");
const registerError = ref("");
const zonesManager = ref<InstanceType<typeof TpvZonesDialog>>();
let generation = 0;
let disposed = false;
const session = auth.portalSession;
const stillCurrent = () => !disposed && session === auth.portalSession;
const filteredZones = computed(() =>
  myZones.value.filter((z) =>
    `${z.name} ${z.code}`
      .toLocaleLowerCase("es")
      .includes(filter.value.trim().toLocaleLowerCase("es")),
  ),
);
const currentRegister = computed(() =>
  registers.value.find((r) => r.id === selectedRegister.value),
);
const detail = (e: unknown) =>
  axios.isAxiosError(e)
    ? e.response?.data?.message ||
      "No se pudo completar la operación. Revisa la conexión y vuelve a intentarlo."
    : "No se pudo completar la operación.";
async function chooseZone(id: number) {
  const request = ++generation;
  selectedZone.value = id;
  selectedRegister.value = null;
  registers.value = [];
  amount.value = null;
  loading.value = true;
  error.value = "";
  try {
    const { data } = await axios.get<Register[]>(
      backendUrl("/WebTpv/registers"),
      { ...auth.portalRequestConfig(), params: { zoneId: id }, timeout: 15000 },
    );
    if (request !== generation || !stillCurrent()) return;
    registers.value = data;
    if (data.length === 1) selectedRegister.value = data[0].id;
  } catch (e) {
    if (request === generation && stillCurrent()) error.value = detail(e);
  } finally {
    if (request === generation && stillCurrent()) loading.value = false;
  }
}
async function reload() {
  loading.value = true;
  error.value = "";
  try {
    await load(true);
    if (!stillCurrent()) return;
    const id = myZones.value.some((z) => z.id === selectedZone.value)
      ? selectedZone.value
      : myZones.value.length === 1
        ? myZones.value[0].id
        : null;
    if (id != null) await chooseZone(id);
    else {
      selectedZone.value = null;
      registers.value = [];
      selectedRegister.value = null;
    }
  } catch (e) {
    if (stillCurrent()) error.value = detail(e);
  } finally {
    if (stillCurrent()) loading.value = false;
  }
}
async function enter() {
  if (!currentRegister.value || busy.value || loading.value) return;
  busy.value = true;
  error.value = "";
  try {
    const { data } = await axios.post<TpvWorkplace>(
      backendUrl(`/WebTpv/registers/${currentRegister.value.id}/enter`),
      { openingId: currentRegister.value.openingId, amount: amount.value },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    // A response started by a previous PIN session must never select the next employee's context.
    if (stillCurrent()) workplace.value = data;
  } catch (e) {
    if (stillCurrent()) error.value = detail(e);
  } finally {
    busy.value = false;
  }
}
async function createRegister() {
  if (busy.value || !selectedZone.value) return;
  busy.value = true;
  registerError.value = "";
  try {
    await axios.post(
      backendUrl("/WebTpv/registers"),
      {
        zoneId: selectedZone.value,
        code: code.value.trim(),
        name: name.value.trim(),
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    if (!stillCurrent()) return;
    newRegister.value = false;
    code.value = "";
    name.value = "";
    await chooseZone(selectedZone.value);
  } catch (e) {
    registerError.value = detail(e);
  } finally {
    busy.value = false;
  }
}
onMounted(reload);
onBeforeUnmount(() => {
  disposed = true;
  ++generation;
});
</script>

<style scoped>
/* The separator has its own row; buttons cannot shrink it into their baseline. */
.register-footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}
.register-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.register-buttons :deep(.p-button) {
  flex: 0 0 auto;
  white-space: nowrap;
}
.register-buttons :deep(.p-button:not(.p-button-text)) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.access :deep(.p-button) {
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}

.workplace {
  margin: 24px;
  padding: 28px;
  border: 1px solid #dce4d5;
  border-radius: 18px;
  background: white;
  overflow: auto;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 24px;
}
header small {
  color: #607049;
  letter-spacing: 0.12em;
  font-weight: 700;
}
h2 {
  margin: 8px 0;
  color: #253000;
  font-size: 28px;
}
p {
  color: #647064;
  line-height: 1.55;
}
.steps {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
}
.steps > section {
  min-width: 0;
}
h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
}
h3 b {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  background: #edf4d8;
  border-radius: 50%;
  color: #506900;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dce4d5;
  border-radius: 8px;
  font: inherit;
}
.search-row {
  display: flex;
  gap: 8px;
  align-items: stretch;
}
.search-row input {
  flex: 1;
  min-width: 0;
}
.search-row :deep(.p-button) {
  flex: 0 0 auto;
  white-space: nowrap;
  background: #9cc10a;
  border-color: #9cc10a;
  color: #253000;
}
.choices {
  display: grid;
  gap: 10px;
  max-height: 390px;
  overflow: auto;
  margin-top: 12px;
}
.choices button {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  border: 1px solid #dce4d5;
  border-radius: 12px;
  background: #fafbf8;
  padding: 16px;
  color: #253000;
  cursor: pointer;
  font: inherit;
}
.choices button.selected {
  background: #eef6d7;
  border-color: #9cc10a;
  box-shadow: inset 3px 0 #9cc10a;
}
.choices button:focus-visible {
  outline: 2px solid #628000;
  outline-offset: 2px;
}
.choices span {
  flex: 1;
  display: grid;
  gap: 6px;
}
.choices small {
  color: #69765b;
}
.access {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 20px 20px;
  background: #f5f8ef;
  border-radius: 12px;
}
.access > small {
  color: #69765b;
  line-height: 1.6;
  margin-top: 12px;
}
.register-fields {
  display: grid;
  gap: 10px;
}
.kiwik-separator {
  width: 100%;
  height: 1.5px;
  flex: 0 0 1.5px;
  background: #9cc10a;
  margin: 0;
}
@media (max-width: 1000px) {
  .steps {
    grid-template-columns: 1fr 1fr;
  }
  .access {
    grid-column: 1 / -1;
  }
}
@media (max-width: 650px) {
  .workplace {
    margin: 8px;
    padding: 16px;
  }
  header {
    align-items: flex-start;
    flex-direction: column;
  }
  .steps {
    grid-template-columns: 1fr;
  }
}
</style>
