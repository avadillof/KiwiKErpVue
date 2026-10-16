<template>
  <Dialog
    :visible="visible"
    :modal="false"
    header="Asignar cliente"
    class="kiwik-dialog"
    :style="{ width: 'min(640px,94vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :closable="!saving"
    :close-on-escape="!saving"
    @update:visible="$emit('close')"
  >
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <template v-if="!creating">
      <p>
        Busca un contacto existente o crea uno nuevo. Puedes cobrar sin
        identificar al cliente. Asignarlo no emite una factura.
      </p>
      <label for="tpv-contact-search">Nombre, NIF o teléfono</label>
      <div class="search-row">
        <InputText
          id="tpv-contact-search"
          ref="searchInput"
          v-model="query"
          data-alpha="1"
          maxlength="100"
          autocomplete="off"
          placeholder="Escribe al menos 2 caracteres"
        /><Button
          icon="pi pi-table"
          aria-label="Mostrar teclado"
          @mousedown.prevent
          @click="keyboard('tpv-contact-search')"
        />
      </div>
      <p v-if="loading" role="status">Buscando contactos…</p>
      <p v-else-if="query.trim().length >= 2 && !results.length && !error">
        No hay contactos activos que coincidan.
      </p>
      <div class="results">
        <button
          v-for="item in results"
          :key="item.id"
          type="button"
          class="contact-option"
          :class="{ selected: chosen?.id === item.id }"
          :aria-pressed="chosen?.id === item.id"
          @click="chosen = item"
        >
          <strong>{{ item.name }}</strong
          ><span
            >{{ item.nif || "Sin NIF" }} ·
            {{ item.phone || "Sin teléfono" }}</span
          ><small>{{
            [item.address, item.postal, item.city]
              .filter(Boolean)
              .join(" · ") || "Sin dirección"
          }}</small>
        </button>
      </div>
      <p v-if="results.length === 30">
        Se muestran 30 resultados. Concreta la búsqueda para encontrar el
        contacto.
      </p>
      <Message v-if="chosen" severity="info" :closable="false"
        >Seleccionado: {{ chosen.name }} ·
        {{ chosen.nif || "Sin NIF" }}</Message
      >
      <Button
        label="Nuevo contacto"
        icon="pi pi-plus"
        outlined
        @click="startCreate"
      />
    </template>
    <template v-else>
      <p>
        Alta en Contactos, sin crear una entidad. Los campos marcados con * son
        obligatorios. Revisa los datos antes de guardar.
      </p>
      <div class="fields">
        <div v-for="field in fields" :key="field.key">
          <label :for="'tpv-contact-' + field.key">{{ field.label }}</label
          ><InputText
            :id="'tpv-contact-' + field.key"
            v-model="form[field.key]"
            data-alpha="1"
            :maxlength="field.max"
            :disabled="saving || uncertain"
            autocomplete="off"
          />
        </div>
      </div>
      <Button
        label="Teclado"
        icon="pi pi-table"
        text
        @mousedown.prevent
        @click="$emit('keyboard')"
      />
      <Message v-if="uncertain" severity="warn" :closable="false"
        >No se ha confirmado el alta. Reintenta la misma operación para
        comprobarla sin duplicar el contacto.</Message
      >
    </template>
    <template #footer
      ><div class="dialog-actions">
        <div class="kiwik-separator" />
        <Button
          v-if="customer && !creating"
          label="Quitar cliente"
          text
          severity="danger"
          @click="$emit('clear')"
        />
        <Button
          :label="creating ? 'Volver a buscar' : 'Cancelar'"
          text
          :disabled="saving || uncertain"
          @click="creating ? (creating = false) : $emit('close')"
        />
        <Button
          v-if="creating"
          :label="uncertain ? 'Comprobar alta' : 'Crear y asignar'"
          :loading="saving"
          :disabled="saving || !valid"
          @click="create"
        />
        <Button
          v-else
          label="Asignar contacto"
          :disabled="!chosen || loading"
          @click="chosen && $emit('save', chosen)"
        /></div
    ></template>
  </Dialog>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { backendUrl } from "../../services/backendUrl";
import { useAuthStore } from "../../stores/authStore";
export interface TpvCustomer {
  id: number;
  name: string;
  nif: string;
  phone?: string;
  email?: string;
  address?: string;
  postal?: string;
  city?: string;
  province?: string;
  country?: string;
}
const props = defineProps<{ visible: boolean; customer: TpvCustomer | null }>();
const emit = defineEmits<{
  close: [];
  clear: [];
  save: [customer: TpvCustomer];
  keyboard: [];
}>();
const auth = useAuthStore();
const query = ref(""),
  results = ref<TpvCustomer[]>([]),
  chosen = ref<TpvCustomer | null>(null),
  creating = ref(false),
  loading = ref(false),
  saving = ref(false),
  uncertain = ref(false),
  error = ref("");
const fields = [
  { key: "name", label: "Nombre o razón social *", max: 150 },
  { key: "nif", label: "NIF / documento *", max: 20 },
  { key: "address", label: "Dirección *", max: 145 },
  { key: "postal", label: "Código postal *", max: 10 },
  { key: "city", label: "Población *", max: 220 },
  { key: "province", label: "Provincia", max: 220 },
  { key: "country", label: "País *", max: 120 },
  { key: "phone", label: "Teléfono", max: 45 },
  { key: "email", label: "Correo electrónico", max: 125 },
];
const form = reactive<Record<string, string>>({
  name: "",
  nif: "",
  address: "",
  postal: "",
  city: "",
  province: "",
  country: "España",
  phone: "",
  email: "",
});
const valid = computed(() =>
  ["name", "nif", "address", "postal", "city", "country"].every((k) =>
    form[k].trim(),
  ),
);
let timer: ReturnType<typeof setTimeout> | undefined,
  generation = 0,
  operationKey = "";
function keyboard(id: string) {
  document.getElementById(id)?.focus();
  emit("keyboard");
}
function detail(e: unknown) {
  if (axios.isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string") return d;
    if (d?.message) return d.message;
    if (d?.error) return d.error;
  }
  return "No se pudo completar la operación. Inténtalo de nuevo.";
}
watch(query, () => {
  clearTimeout(timer);
  const token = ++generation;
  results.value = [];
  chosen.value = null;
  error.value = "";
  loading.value = false;
  if (query.value.trim().length < 2) return;
  loading.value = true;
  timer = setTimeout(() => search(token), 300);
});
async function search(token: number) {
  try {
    const { data } = await axios.get<TpvCustomer[]>(
      backendUrl("/WebTpv/contacts"),
      {
        ...auth.portalRequestConfig(),
        params: { query: query.value.trim() },
        timeout: 15000,
      },
    );
    if (token === generation && props.visible) results.value = data;
  } catch (e) {
    if (token === generation) error.value = detail(e);
  } finally {
    if (token === generation) loading.value = false;
  }
}
watch(
  () => props.visible,
  (open) => {
    if (open) {
      error.value = "";
      if (!uncertain.value) {
        creating.value = false;
        query.value = "";
        results.value = [];
        nextTick(() => {
          chosen.value = props.customer;
          document.getElementById("tpv-contact-search")?.focus();
        });
      }
    } else {
      clearTimeout(timer);
      generation++;
      loading.value = false;
    }
  },
);
function startCreate() {
  creating.value = true;
  error.value = "";
  operationKey = crypto.randomUUID();
  for (const f of fields) form[f.key] = f.key === "country" ? "España" : "";
  nextTick(() => document.getElementById("tpv-contact-name")?.focus());
}
async function create() {
  if (saving.value || !valid.value) return;
  saving.value = true;
  error.value = "";
  try {
    const { data } = await axios.post<TpvCustomer>(
      backendUrl("/WebTpv/contacts"),
      { ...form, operationKey },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    uncertain.value = false;
    emit("save", data);
  } catch (e) {
    error.value = detail(e);
    uncertain.value =
      !axios.isAxiosError(e) || !e.response || e.response.status >= 500;
  } finally {
    saving.value = false;
  }
}
onBeforeUnmount(() => {
  clearTimeout(timer);
  generation++;
});
</script>
<style scoped>
p {
  line-height: 1.5;
  color: #647064;
}
.search-row {
  display: flex;
  gap: 8px;
}
.search-row input {
  flex: 1;
  min-width: 0;
}
label {
  display: block;
  font-weight: 700;
  margin: 10px 0 6px;
}
.results {
  max-height: 280px;
  overflow: auto;
  margin: 12px 0;
}
.contact-option {
  display: grid;
  gap: 5px;
  width: 100%;
  text-align: left;
  background: white;
  border: 1px solid #dce4d5;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 8px;
  font: inherit;
  cursor: pointer;
}
.contact-option.selected {
  border-color: #9cc10a;
  background: #f4f8e8;
}
.fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
}
.fields input {
  width: 100%;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
}
.kiwik-separator {
  flex-basis: 100%;
}
@media (max-width: 540px) {
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
