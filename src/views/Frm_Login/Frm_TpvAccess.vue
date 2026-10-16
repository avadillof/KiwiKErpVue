<template>
  <main class="login-page">
    <section class="login-shell">
      <img
        src="../../assets/logos/corporate.png"
        alt="FreeLandSite"
        class="corporate-divider-logo"
      />

      <aside class="brand-panel">
        <div class="brand-glow brand-glow--top"></div>
        <div class="brand-glow brand-glow--bottom"></div>

        <div class="brand-copy">
          <span class="brand-eyebrow">Terminal punto de venta</span>
          <h1>Marca tu PIN<br />y a vender.</h1>
          <p>Solo operarios con perfil de TPV. Sin usuarios ni contraseñas.</p>
        </div>

        <div class="brand-footer">
          <span
            >Desarrollado por
            <a
              href="https://www.freelandsite.es"
              target="_blank"
              rel="noopener noreferrer"
              >FreeLandSite.es</a
            ></span
          >
        </div>
      </aside>

      <section class="access-panel">
        <div class="access-content">
          <div class="access-intro">
            <h3>Acceso TPV</h3>
            <p>
              {{
                selected
                  ? "Introduce tu PIN para continuar."
                  : "Selecciona tu usuario para acceder."
              }}
            </p>
          </div>

          <p v-if="loading" role="status">
            <i class="pi pi-spin pi-spinner" /> Cargando operarios…
          </p>

          <div v-else-if="!selected">
            <div v-if="zoneTabs.length > 1 || operators.length > 6" class="tpv-access-filters">
              <div v-if="zoneTabs.length > 1" class="tpv-access-zones" role="group" aria-label="Filtrar por zona">
                <button
                  type="button"
                  :class="{ selected: opZoneId === null }"
                  @click="opZoneId = null"
                >
                  Todas
                </button>
                <button
                  v-for="z in zoneTabs"
                  :key="z.id"
                  type="button"
                  :class="{ selected: opZoneId === z.id }"
                  @click="opZoneId = z.id"
                >
                  {{ z.name }}
                </button>
              </div>
              <input
                v-model="opQuery"
                type="search"
                class="tpv-access-search"
                aria-label="Buscar operario"
                placeholder="Buscar por nombre…"
                autocomplete="off"
              />
            </div>
            <div class="tpv-access-grid">
            <button
              v-for="op in filteredOperators"
              :key="op.id"
              type="button"
              class="tpv-access-btn"
              :disabled="busy"
              @click="selectOperator(op)"
            >
              <span class="op-avatar">
                <img
                  v-if="!broken.has(op.id)"
                  :src="photoUrl(op.id)"
                  :alt="op.name"
                  loading="lazy"
                  @error="broken.add(op.id)"
                /><span v-else>{{ initials(op.name) }}</span>
              </span>
              <span>{{ op.name }}</span>
            </button>
            </div>
          </div>
          <p v-if="!loading && !operators.length && !error" class="access-help">
            Sin operarios con acceso a TPV.
          </p>
          <p v-else-if="!loading && !filteredOperators.length" class="access-help">
            Sin coincidencias. Prueba con otro nombre u otra zona.
          </p>

          <div v-if="selected" class="tpv-access-pin">
            <Button
              label="Cambiar usuario"
              icon="pi pi-arrow-left"
              text
              severity="secondary"
              :disabled="busy"
              @click="selectOperator(null)"
            />
            <span class="op-avatar"
              ><img
                v-if="!broken.has(selected.id)"
                :src="photoUrl(selected.id)"
                :alt="selected.name"
                @error="broken.add(selected.id)"
              /><span v-else>{{ initials(selected.name) }}</span></span
            >
            <strong>{{ selected.name }}</strong>
            <div class="op-dots" aria-hidden="true">
              <span
                v-for="i in Math.max(4, pin.length)"
                :key="i"
                :class="{ filled: i <= pin.length }"
              />
            </div>
            <div class="op-pad">
              <button
                v-for="d in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                :key="d"
                type="button"
                :disabled="busy"
                @click="key(d)"
              >
                {{ d }}
              </button>
              <button type="button" :disabled="busy" @click="pin = ''">
                C
              </button>
              <button type="button" :disabled="busy" @click="key('0')">
                0
              </button>
              <button
                type="button"
                :disabled="busy"
                aria-label="Borrar dígito"
                @click="back"
              >
                <i class="pi pi-delete-left" />
              </button>
            </div>
            <Button
              label="Entrar al TPV"
              icon="pi pi-check"
              :loading="busy"
              :disabled="busy || !pin"
              @click="submit"
            />
          </div>

          <Message v-if="error" severity="error" :closable="false">{{
            error
          }}</Message>

          <p class="access-help">
            <i class="pi pi-lock"></i> Acceso con PIN de operario. El login con
            usuario y clave sigue en el ERP.
          </p>
        </div>

        <footer class="access-footer">
          <span>KiwiKERP</span><span class="footer-dot"></span
          ><span
            :title="`Imagen Front ${frontVersion} · Imagen Back ${backVersion}`"
            >Front {{ frontVersion }} · Back {{ backVersion }}</span
          >
        </footer>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { backendUrl } from "@/services/backendUrl";
import { FRONT_VERSION, getBackVersion } from "@/services/appVersion";
import { useAuthStore } from "@/stores/authStore";
import { useSecurityStore } from "@/stores/securityStore";

interface TpvOperator {
  id: number;
  name: string;
  code: string;
  zones?: Array<{ id: number; name: string }>;
}

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const frontVersion = FRONT_VERSION;
const backVersion = ref("…");

const operators = ref<TpvOperator[]>([]);
const loading = ref(false);
const opQuery = ref('');
const opZoneId = ref<number | null>(null);
const zoneTabs = computed(() => {
  const map = new Map<number, string>();
  for (const op of operators.value) {
    for (const z of op.zones ?? []) {
      if (!map.has(z.id)) map.set(z.id, z.name);
    }
  }
  return [...map.entries()].map(([id, name]) => ({ id, name }));
});
const filteredOperators = computed(() => {
  const q = opQuery.value.trim().toLocaleLowerCase('es');
  return operators.value.filter((op) => {
    if (opZoneId.value != null && !(op.zones ?? []).some((z) => z.id === opZoneId.value)) return false;
    if (!q) return true;
    return op.name.toLocaleLowerCase('es').includes(q) || op.code.toLocaleLowerCase('es').includes(q);
  });
});
const selected = ref<TpvOperator | null>(null);
const pin = ref("");
const busy = ref(false);
const error = ref("");
const broken = ref(new Set<number>());

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toLocaleUpperCase("es") || "?";
const photoUrl = (id: number) =>
  backendUrl(`/gestdoc/users/${id}/photoPerfil.jpg`);

// Changing identity always clears the previous PIN, including when returning to the list.
function selectOperator(operator: TpvOperator | null) {
  if (busy.value) return;
  selected.value = operator;
  pin.value = "";
  error.value = "";
}
function key(digit: string) {
  if (busy.value || pin.value.replace(/\D/g, "").length >= 12) return;
  pin.value += digit;
}
function back() {
  pin.value = pin.value.slice(0, -1);
}

async function submit() {
  if (!selected.value || busy.value || !pin.value) return;
  busy.value = true;
  error.value = "";
  try {
    const response = await axios.post(
      backendUrl("/WebTpv/quickLogin"),
      { userId: selected.value.id, pin: pin.value },
      { timeout: 15000 },
    );
    authStore.setUser(
      response.data,
      (response.headers as any)["x-portal-session"] || "",
      "tpv",
    );
    try {
      await useSecurityStore().loadSecurity(response.data.pkid);
    } catch {
      /* la ruta reintentará */
    }
    await router.replace({ name: "TPV" });
  } catch (e: any) {
    // El fallo de PIN sale en Toast (no en Message) para no mover el teclado.
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      toast.add({ severity: "error", summary: "PIN incorrecto", life: 3000 });
    } else {
      toast.add({
        severity: "error",
        summary: "No se pudo entrar al TPV",
        life: 3000,
      });
    }
    pin.value = "";
  } finally {
    busy.value = false;
  }
}

onMounted(async () => {
  getBackVersion().then((v) => {
    backVersion.value = v;
  });
  loading.value = true;
  try {
    const { data } = await axios.get(backendUrl("/WebTpv/operators"), {
      timeout: 15000,
    });
    operators.value = Array.isArray(data) ? data : [];
  } catch {
    error.value =
      "No se pudo cargar la lista de operarios. Comprueba la conexión.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.tpv-access-filters {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 14px 0 4px;
}
.tpv-access-zones {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tpv-access-zones button {
  border: 1px solid #dce3d4;
  background: white;
  padding: 8px 15px;
  border-radius: 10px;
  font: inherit;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  color: #526047;
}
.tpv-access-zones button.selected {
  background: #253000;
  border-color: #253000;
  color: #eef5d9;
}
.tpv-access-search {
  padding: 10px 13px;
  border: 1px solid #dce3d4;
  border-radius: 10px;
  font: inherit;
  font-size: 14px;
  outline: none;
}
.tpv-access-search:focus {
  border-color: #9cc10a;
  box-shadow: 0 0 0 2px #9cc10a55;
}
.tpv-access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.tpv-access-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 10px;
  border: 1px solid #d9e1d1;
  border-radius: 12px;
  background: white;
  color: #253000;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
.tpv-access-btn:hover {
  border-color: #9cc10a;
}
.tpv-access-btn.selected {
  border-color: #9cc10a;
  background: #eef5d9;
}
.op-avatar {
  display: grid;
  place-items: center;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: #eef5d9;
  color: #4d6500;
  font-size: 24px;
  font-weight: 800;
  overflow: hidden;
}
.op-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tpv-access-pin {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.op-dots {
  display: flex;
  gap: 10px;
  margin: 6px 0;
}
.op-dots span {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #9cc10a;
}
.op-dots span.filled {
  background: #9cc10a;
}
.op-pad {
  display: grid;
  grid-template-columns: repeat(3, 76px);
  gap: 8px;
  justify-content: center;
}
.op-pad button {
  min-height: 52px;
  border: 1px solid #d9e1d1;
  border-radius: 10px;
  background: white;
  color: #253000;
  font-size: 19px;
  font-weight: 700;
  cursor: pointer;
}
.op-pad button:hover:not(:disabled) {
  border-color: #9cc10a;
}
</style>
