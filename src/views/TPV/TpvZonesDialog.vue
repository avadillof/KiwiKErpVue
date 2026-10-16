<template>
  <Dialog
    v-model:visible="zoneDialog"
    modal
    class="kiwik-dialog"
    :closable="!zSaving"
    :style="{ width: 'min(680px, 96vw)' }"
    :pt="{ header: { class: 'kiwik-dialog-header' } }"
  >
    <template #header
      ><strong><i class="pi pi-map" /> Zonas TPV</strong></template
    >
    <div class="zone-layout">
      <div class="zone-list">
        <Button
          label="Nueva zona"
          icon="pi pi-plus"
          size="small"
          outlined
          :disabled="zSaving"
          @click="newZone"
        />
        <button
          v-for="z in zoneAdmin"
          :key="z.id"
          type="button"
          class="zone-row"
          :disabled="zSaving"
          :class="{ selected: zForm.id === z.id }"
          @click="selectZone(z)"
        >
          <b>{{ z.code }}</b
          ><span>{{ z.name }}</span>
        </button>
      </div>
      <div class="zone-form">
        <label
          >Código<input v-model="zForm.code" maxlength="20" :disabled="zSaving"
        /></label>
        <label
          >Nombre<input
            v-model="zForm.name"
            maxlength="100"
            :disabled="zSaving"
        /></label>
        <label class="zone-check"
          ><input type="checkbox" v-model="zForm.active" :disabled="zSaving" />
          Activa</label
        >
        <Button
          label="Guardar zona"
          icon="pi pi-save"
          size="small"
          :loading="zSaving"
          :disabled="zSaving || !zForm.code.trim() || !zForm.name.trim()"
          @click="saveZone"
        />
        <p class="zone-note">
          Las zonas organizan el trabajo y el acceso a las salas. La facturación
          corresponde siempre a la entidad titular de KiwiKERP.
        </p>
      </div>
    </div>
    <Message v-if="zError" severity="error" :closable="false">{{
      zError
    }}</Message>
    <template #footer
      ><div class="config-footer">
        <div class="kiwik-separator" />
        <Button
          label="Cerrar"
          text
          severity="secondary"
          :disabled="zSaving"
          @click="zoneDialog = false"
        /></div
    ></template>
  </Dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Message from "primevue/message";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";
const auth = useAuthStore();
const emit = defineEmits<{ saved: [] }>();
function detail(e: unknown) {
  return axios.isAxiosError(e)
    ? e.response?.data?.message || "No se pudo guardar o cargar las zonas."
    : "No se pudo completar la operación.";
}
// Both TPV modes share the same management form and server contract.
interface TpvZoneAdmin {
  id: number;
  code: string;
  name: string;
  active: boolean;
}
const zoneDialog = ref(false);
const zoneAdmin = ref<TpvZoneAdmin[]>([]);
const zForm = ref({
  id: null as number | null,
  code: "",
  name: "",
  active: true,
});
const zSaving = ref(false);
const zError = ref("");
async function openZones() {
  if (!auth.user?.admin) return;
  zError.value = "";
  zoneDialog.value = true;
  await loadZoneAdmin();
  if (!zForm.value.id && zoneAdmin.value.length) selectZone(zoneAdmin.value[0]);
}
async function loadZoneAdmin() {
  try {
    const { data } = await axios.get(backendUrl("/WebTpv/zones"), {
      ...auth.portalRequestConfig(),
      timeout: 15000,
    });
    zoneAdmin.value = Array.isArray(data) ? data : [];
  } catch (e) {
    zError.value = detail(e);
    zoneAdmin.value = [];
  }
}
function newZone() {
  zForm.value = { id: null, code: "", name: "", active: true };
  zError.value = "";
}
function selectZone(z: TpvZoneAdmin) {
  zForm.value = {
    id: z.id,
    code: z.code,
    name: z.name,
    active: z.active !== false,
  };
  zError.value = "";
}
async function saveZone() {
  if (
    !auth.user?.admin ||
    zSaving.value ||
    !zForm.value.code.trim() ||
    !zForm.value.name.trim()
  )
    return;
  zSaving.value = true;
  zError.value = "";
  try {
    const { data } = await axios.post(
      backendUrl("/WebTpv/zones"),
      {
        id: zForm.value.id,
        code: zForm.value.code.trim(),
        name: zForm.value.name.trim(),
        active: zForm.value.active,
      },
      { ...auth.portalRequestConfig(), timeout: 15000 },
    );
    emit("saved");
    zForm.value.id = Number(data.id);
    await loadZoneAdmin();
    const updated = zoneAdmin.value.find((z) => z.id === zForm.value.id);
    if (updated) selectZone(updated);
  } catch (e) {
    zError.value = detail(e);
  } finally {
    zSaving.value = false;
  }
}

defineExpose({ open: openZones });
</script>
<style scoped>
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

.zone-list {
  max-height: 360px;
  overflow: auto;
}
.zone-note {
  color: #66736b;
  font-size: 12px;
  line-height: 1.5;
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
@media (max-width: 520px) {
  .zone-layout {
    grid-template-columns: 1fr;
  }
  .zone-list {
    max-height: 160px;
  }
}
</style>
