<template>
  <Dialog
    :visible="visible"
    header="Operaciones de mesa"
    modal
    :closable="!saving"
    :closeOnEscape="!saving"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
    :style="{ width: '42rem', maxWidth: '95vw' }"
    @update:visible="!saving && emit('close')"
  >
    <p>
      <strong>{{ tableName }}</strong> · Los cambios afectan a las cuentas
      guardadas.
    </p>
    <Message v-if="error" severity="error" :closable="false">{{
      error
    }}</Message>
    <div class="table-actions-form">
      <label for="table-operation">Operación</label>
      <Select
        inputId="table-operation"
        v-model="operation"
        :options="operations"
        optionLabel="label"
        optionValue="value"
        :disabled="saving"
      />
      <label for="table-target">{{
        operation === "join"
          ? "Cuenta que se añadirá a esta mesa"
          : "Mesa de destino"
      }}</label>
      <Select
        inputId="table-target"
        v-model="targetId"
        :options="available"
        optionLabel="label"
        optionValue="id"
        filter
        placeholder="Seleccionar mesa"
        :loading="loading"
        :disabled="saving || loading"
      />
      <p v-if="operation === 'move'">
        La cuenta completa pasa a una mesa libre. Se conserva su contacto.
      </p>
      <p v-else-if="operation === 'join'">
        Se añadirán las consumiciones de la otra mesa y se liberará esa mesa. No
        se pueden juntar contactos distintos.
      </p>
      <p v-else>
        Selecciona las líneas que pasarán a la otra mesa. Se mueve toda la
        cantidad de cada línea; las demás permanecen aquí.
      </p>
      <div v-if="operation === 'split'" class="split-lines">
        <label v-for="line in lines" :key="line.savedLineId"
          ><input
            type="checkbox"
            v-model="lineIds"
            :value="line.savedLineId"
            :disabled="saving"
          />
          {{ line.quantity }} × {{ line.name }}</label
        >
      </div>
      <Message v-if="targetRevision !== null" severity="info" :closable="false"
        >Cuenta de destino consultada. Confirma para aplicar la
        operación.</Message
      >
    </div>
    <template #footer
      ><div class="table-actions-footer">
        <div class="kiwik-separator" />
        <Button
          label="Recargar cuentas"
          icon="pi pi-refresh"
          text
          :disabled="saving"
          @click="emit('reload')"
        />
        <Button
          label="Cancelar"
          outlined
          :disabled="saving"
          @click="emit('close')"
        />
        <Button
          label="Confirmar operación"
          :loading="saving"
          :disabled="
            loading ||
            targetRevision === null ||
            !targetId ||
            (operation === 'split' && !lineIds.length) ||
            uncertain
          "
          @click="submit"
        /></div
    ></template>
  </Dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Select from "primevue/select";
import Message from "primevue/message";
import { backendUrl } from "../../services/backendUrl";
import { useAuthStore } from "../../stores/authStore";
const props = defineProps<{
  visible: boolean;
  tableId: number;
  tableName: string;
  zoneId: number;
  openingId: number;
  revision: string;
  lines: Array<{ savedLineId?: number; name: string; quantity: number }>;
}>();
const emit = defineEmits<{ close: []; done: []; reload: [] }>();
const auth = useAuthStore();
const operation = ref("move"),
  targetId = ref<number | null>(null),
  targetRevision = ref<string | null>(null);
const lineIds = ref<number[]>([]),
  loading = ref(false),
  saving = ref(false),
  error = ref(""),
  uncertain = ref(false);
const tables = ref<Array<{ id: number; state: string; label: string }>>([]);
const operations = [
  { label: "Cambiar a otra mesa", value: "move" },
  { label: "Juntar otra cuenta con esta", value: "join" },
  { label: "Separar consumiciones a otra mesa", value: "split" },
];
const available = computed(() =>
  tables.value.filter(
    (t) =>
      t.id !== props.tableId &&
      (operation.value === "move"
        ? t.state === "FREE"
        : operation.value === "join"
          ? t.state !== "FREE"
          : true),
  ),
);
let generation = 0;
let targetGeneration = 0;
function message(e: unknown) {
  if (axios.isAxiosError(e))
    return typeof e.response?.data === "string" &&
      !e.response.data.includes("<")
      ? e.response.data
      : e.response?.data?.message ||
          "No se pudo confirmar la operación. Cierra este diálogo y recarga las mesas antes de repetirla.";
  return e instanceof Error ? e.message : "No se pudo completar la operación.";
}
async function load() {
  const request = ++generation;
  targetId.value = null;
  targetRevision.value = null;
  loading.value = true;
  error.value = "";
  try {
    const r = await axios.get(backendUrl("/WebTpv/halls"), {
      ...auth.portalRequestConfig(),
      params: { zoneId: props.zoneId },
      timeout: 15000,
    });
    if (request !== generation) return;
    tables.value = r.data
      .filter((h: any) => Number(h.zoneId) === props.zoneId)
      .flatMap((h: any) =>
        h.tables.map((t: any) => ({
          ...t,
          label: `${h.name} · ${t.name} (${t.code})`,
        })),
      );
  } catch (e) {
    if (request === generation) error.value = message(e);
  } finally {
    if (request === generation) loading.value = false;
  }
}
watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      operation.value = "move";
      lineIds.value = [];
      uncertain.value = false;
      void load();
    } else {
      generation++;
      targetGeneration++;
    }
  },
);
watch(operation, () => {
  targetId.value = null;
  targetRevision.value = null;
  lineIds.value = [];
});
watch(targetId, async (id) => {
  const request = ++targetGeneration;
  targetRevision.value = null;
  error.value = "";
  if (!id) return;
  try {
    const r = await axios.get(backendUrl(`/WebTpv/tables/${id}/ticket`), {
      ...auth.portalRequestConfig(),
      timeout: 15000,
    });
    if (request !== targetGeneration) return;
    if (
      r.data.openingId != null &&
      Number(r.data.openingId) !== props.openingId
    )
      throw new Error(
        "Esta cuenta pertenece a otra caja. Selecciona una mesa de tu apertura.",
      );
    targetRevision.value = r.data.revision;
  } catch (e) {
    if (request === targetGeneration) error.value = message(e);
  }
});
async function submit() {
  if (
    saving.value ||
    uncertain.value ||
    !targetId.value ||
    targetRevision.value === null
  )
    return;
  saving.value = true;
  error.value = "";
  try {
    await axios.post(
      backendUrl(`/WebTpv/tables/${props.tableId}/${operation.value}`),
      {
        openingId: props.openingId,
        revision: props.revision,
        targetRevision: targetRevision.value,
        toTableId: targetId.value,
        otherTableId: targetId.value,
        lineIds: lineIds.value,
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    emit("done");
  } catch (e) {
    error.value = message(e);
    uncertain.value = true;
  } finally {
    saving.value = false;
  }
}
</script>
<style scoped>
.table-actions-form {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}
.table-actions-form p {
  margin: 0;
  color: #67735c;
  line-height: 1.5;
}
.split-lines {
  display: grid;
  gap: 10px;
  max-height: 250px;
  overflow: auto;
  padding: 10px;
  border: 1px solid #dce4d2;
  border-radius: 8px;
}
.split-lines label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px;
}
.table-actions-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
}
.table-actions-footer .kiwik-separator {
  flex-basis: 100%;
  width: 100%;
}
</style>
