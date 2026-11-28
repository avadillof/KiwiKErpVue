<template>
  <main class="process-page">
    <Toast />
    <header class="page-toolbar">
      <div class="toolbar-title">
        <span class="toolbar-icon"><i class="pi pi-sliders-h"></i></span>
        <div>
          <span>KiwiKERP / Fabricación / Configuración</span>
          <h1>Procesos de fabricación</h1>
          <p>
            Define revisiones, operaciones, tiempos y dependencias reutilizando
            el maestro de fases.
          </p>
        </div>
      </div>
      <div class="toolbar-actions">
        <Button
          label="Fabricación"
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          @click="router.push({ name: 'Fabricacion' })"
        /><Button label="Nuevo proceso" icon="pi pi-plus" @click="openNew" />
      </div>
    </header>

    <section class="table-panel">
      <GenericDataTable
        ref="processTable"
        endpoint="WebGetManufacturingProcesses"
        dataKey="pkid"
        :requestConfig="auth.portalRequestConfig"
        :showPaginator="true"
        :filterable="true"
        :showActions="true"
        :pageSize="10"
        :pageSizeOptions="[10, 25, 50]"
        @load-error="loadError"
      >
        <template #headerActions
          ><Button label="Nuevo proceso" icon="pi pi-plus" @click="openNew"
        /></template>
        <Column field="code" header="Código" sortable style="width: 150px"
          ><template #body="{ data }"
            ><strong class="process-code">{{ data.code }}</strong></template
          ></Column
        >
        <Column
          field="description"
          header="Descripción"
          sortable
          style="min-width: 280px"
        />
        <Column field="currentRevision" header="Revisión" style="width: 100px"
          ><template #body="{ data }">{{
            data.currentRevision || "—"
          }}</template></Column
        >
        <Column
          field="currentStatus"
          header="Estado revisión"
          style="width: 145px"
          ><template #body="{ data }"
            ><span
              :class="[
                'status-pill',
                String(data.currentStatus || '').toLowerCase(),
              ]"
              >{{ statusLabel(data.currentStatus) }}</span
            ></template
          ></Column
        >
        <Column
          field="operationCount"
          header="Operaciones"
          style="width: 115px"
        />
        <Column
          field="revisionCount"
          header="Revisiones"
          style="width: 105px"
        />
        <Column field="active" header="Proceso" style="width: 100px"
          ><template #body="{ data }"
            ><span
              :class="['status-pill', data.active ? 'active' : 'inactive']"
              >{{ data.active ? "Activo" : "Inactivo" }}</span
            ></template
          ></Column
        >
        <Column header="Acciones" style="width: 110px"
          ><template #body="{ data }"
            ><div class="row-actions">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                severity="secondary"
                title="Editar proceso"
                @click="openEdit(data)"
              /><Button
                :icon="data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                text
                rounded
                :severity="data.active ? 'danger' : 'success'"
                @click="toggleProcess(data)"
              /></div></template
        ></Column>
      </GenericDataTable>
    </section>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="
        form.pkid ? 'Proceso de fabricación' : 'Nuevo proceso de fabricación'
      "
      :style="{ width: 'min(1540px,98vw)' }"
      class="kiwik-dialog process-dialog"
    >
      <div class="process-form">
        <section class="identity-grid">
          <FloatLabel variant="on"
            ><InputText
              id="processCode"
              v-model="form.code"
              maxlength="50"
              :disabled="Boolean(form.pkid)"
            /><label for="processCode">Código *</label></FloatLabel
          >
          <FloatLabel variant="on"
            ><InputText
              id="processDescription"
              v-model="form.description"
              maxlength="145"
            /><label for="processDescription">Descripción *</label></FloatLabel
          >
          <Button
            :label="form.notes ? 'Editar notas' : 'Añadir notas'"
            icon="pi pi-file-edit"
            outlined
            severity="secondary"
            @click="notesVisible = true"
          />
        </section>

        <section class="revision-card">
          <div class="section-heading">
            <div>
              <i class="pi pi-history"></i
              ><span
                ><strong>Revisión del proceso</strong
                ><small
                  >Una revisión vigente no se modifica; se crea otra para
                  conservar el histórico.</small
                ></span
              >
            </div>
            <div class="revision-actions">
              <Select
                v-model="selectedRevisionId"
                :options="form.revisions"
                optionLabel="revision"
                optionValue="pkid"
                placeholder="Seleccionar revisión"
                :disabled="!form.pkid"
                @change="selectStoredRevision"
              /><Button
                label="Nueva revisión"
                icon="pi pi-plus"
                outlined
                @click="newRevision"
              />
            </div>
          </div>
          <div class="revision-grid">
            <FloatLabel variant="on"
              ><InputText
                id="revisionCode"
                v-model="revision.revision"
                :disabled="!editable"
              /><label for="revisionCode">Revisión *</label></FloatLabel
            >
            <FloatLabel variant="on"
              ><Select
                id="revisionStatus"
                v-model="revision.status"
                :options="revisionStatuses"
                optionLabel="label"
                optionValue="value"
                :disabled="!editable"
              /><label for="revisionStatus">Estado *</label></FloatLabel
            >
            <FloatLabel variant="on"
              ><InputText
                id="validFrom"
                v-model="revision.validFrom"
                type="date"
                :disabled="!editable"
              /><label for="validFrom">Válida desde</label></FloatLabel
            >
            <FloatLabel variant="on"
              ><InputText
                id="validTo"
                v-model="revision.validTo"
                type="date"
                :disabled="!editable"
              /><label for="validTo">Válida hasta</label></FloatLabel
            >
            <FloatLabel variant="on" class="change-description"
              ><InputText
                id="changeDescription"
                v-model="revision.changeDescription"
                :disabled="!editable"
              /><label for="changeDescription"
                >Motivo / descripción del cambio</label
              ></FloatLabel
            >
          </div>
          <Message v-if="!editable" severity="info" :closable="false"
            >Esta revisión está
            {{ statusLabel(revision.status).toLowerCase() }} y se muestra sólo
            para consulta. Crea una revisión nueva para cambiarla.</Message
          >
        </section>

        <section class="operations-card">
          <div class="section-heading">
            <div>
              <i class="pi pi-sitemap"></i
              ><span
                ><strong>Operaciones y dependencias</strong
                ><small
                  >Si una operación tiene varias predecesoras, sólo se abrirá
                  cuando todas hayan terminado.</small
                ></span
              >
            </div>
            <Button
              label="Añadir operación"
              icon="pi pi-plus"
              :disabled="!editable"
              @click="addOperation"
            />
          </div>
          <div v-if="!revision.operations.length" class="empty-state">
            <i class="pi pi-list-check"></i
            ><strong>Añade la primera operación</strong
            ><span
              >Las operaciones sin predecesoras podrán comenzar en
              paralelo.</span
            >
          </div>
          <div v-else class="operation-list">
            <article
              v-for="(operation, index) in revision.operations"
              :key="operation.clientKey || operation.pkid || index"
              class="operation-row"
            >
              <div class="operation-number">
                <span>Operación</span
                ><InputNumber
                  v-model="operation.sequence"
                  :min="1"
                  :useGrouping="false"
                  :disabled="!editable"
                />
              </div>
              <div class="operation-main">
                <FloatLabel variant="on"
                  ><Select
                    :id="`phase-${index}`"
                    v-model="operation.phaseId"
                    :options="phases"
                    optionLabel="displayName"
                    optionValue="pkid"
                    filter
                    :disabled="!editable"
                    @change="phaseChanged(operation)"
                  /><label :for="`phase-${index}`">Fase *</label></FloatLabel
                >
                <FloatLabel variant="on"
                  ><InputText
                    :id="`description-${index}`"
                    v-model="operation.description"
                    maxlength="145"
                    :disabled="!editable"
                  /><label :for="`description-${index}`"
                    >Descripción en este proceso</label
                  ></FloatLabel
                >
                <FloatLabel variant="on"
                  ><Select
                    :id="`center-${index}`"
                    v-model="operation.preferredWorkCenterId"
                    :options="workCenters"
                    optionLabel="displayName"
                    optionValue="pkid"
                    showClear
                    filter
                    :disabled="!editable"
                  /><label :for="`center-${index}`"
                    >Centro preferente</label
                  ></FloatLabel
                >
                <FloatLabel variant="on"
                  ><MultiSelect
                    :id="`dependencies-${index}`"
                    v-model="operation.predecessorSequences"
                    :options="dependencyOptions(operation)"
                    optionLabel="label"
                    optionValue="value"
                    display="chip"
                    :disabled="!editable"
                  /><label :for="`dependencies-${index}`"
                    >Depende de</label
                  ></FloatLabel
                >
              </div>
              <div class="time-grid">
                <FloatLabel variant="on"
                  ><InputNumber
                    v-model="operation.setupMinutes"
                    :min="0"
                    :maxFractionDigits="2"
                    :disabled="!editable"
                  /><label>Preparación (min)</label></FloatLabel
                >
                <FloatLabel variant="on"
                  ><InputNumber
                    v-model="operation.unitMinutes"
                    :min="0"
                    :maxFractionDigits="2"
                    :disabled="!editable"
                  /><label>Por unidad (min)</label></FloatLabel
                >
                <FloatLabel variant="on"
                  ><InputNumber
                    v-model="operation.waitMinutes"
                    :min="0"
                    :maxFractionDigits="2"
                    :disabled="!editable"
                  /><label>Espera (min)</label></FloatLabel
                >
              </div>
              <div class="operation-flags">
                <label
                  ><Checkbox
                    v-model="operation.qualityControl"
                    binary
                    :disabled="!editable"
                  />
                  Calidad</label
                ><label
                  ><Checkbox
                    v-model="operation.finalOperation"
                    binary
                    :disabled="!editable"
                  />
                  Operación final</label
                >
              </div>
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                :disabled="!editable"
                title="Eliminar operación"
                @click="removeOperation(index)"
              />
            </article>
          </div>
        </section>

        <section v-if="revision.operations.length" class="flow-card">
          <div class="section-heading">
            <div>
              <i class="pi pi-share-alt"></i
              ><span
                ><strong>Flujo resultante</strong
                ><small
                  >Las ramas de una misma columna pueden ejecutarse
                  simultáneamente.</small
                ></span
              >
            </div>
          </div>
          <div class="flow-board">
            <template
              v-for="(level, levelIndex) in operationLevels"
              :key="levelIndex"
              ><div v-if="levelIndex" class="flow-arrow">
                <i class="pi pi-angle-right"></i>
              </div>
              <div class="flow-column">
                <small>{{
                  levelIndex === 0 ? "Inicio" : `Nivel ${levelIndex + 1}`
                }}</small>
                <div
                  v-for="operation in level"
                  :key="operation.sequence"
                  class="flow-operation"
                >
                  <strong>{{ operation.sequence }}</strong
                  ><span>{{ phaseName(operation.phaseId) }}</span
                  ><em v-if="operation.predecessorSequences?.length"
                    >Tras {{ operation.predecessorSequences.join(", ") }}</em
                  ><em v-else>Sin dependencias</em>
                </div>
              </div></template
            >
          </div>
        </section>
      </div>
      <template #footer
        ><div class="dialog-footer">
          <Button
            label="Cerrar"
            text
            severity="secondary"
            @click="dialogVisible = false"
          /><Button
            label="Guardar proceso"
            icon="pi pi-check"
            :loading="saving"
            :disabled="!editable"
            @click="saveProcess"
          /></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="notesVisible"
      modal
      header="Notas del proceso"
      :style="{ width: 'min(720px,94vw)' }"
      class="kiwik-dialog"
      ><Textarea v-model="form.notes" rows="8" class="w-full" /><template
        #footer
        ><div class="dialog-footer">
          <Button
            label="Aceptar"
            icon="pi pi-check"
            @click="notesVisible = false"
          /></div></template
    ></Dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

type Operation = {
  pkid?: number | null;
  clientKey?: string;
  sequence: number;
  phaseId: number | null;
  description: string;
  preferredWorkCenterId: number | null;
  setupMinutes: number | null;
  unitMinutes: number | null;
  waitMinutes: number | null;
  subcontractMinutes: number | null;
  instructions: string;
  qualityControl: boolean;
  finalOperation: boolean;
  predecessorSequences: number[];
};
type Revision = {
  pkid: number | null;
  revision: string;
  status: string;
  validFrom: string;
  validTo: string;
  changeDescription: string;
  operations: Operation[];
};
const router = useRouter(),
  auth = useAuthStore(),
  toast = useToast();
const processTable = ref<any>(),
  dialogVisible = ref(false),
  notesVisible = ref(false),
  saving = ref(false),
  selectedRevisionId = ref<number | null>(null);
const revisionReadOnly = ref(false);
const phases = ref<any[]>([]),
  workCenters = ref<any[]>([]);
const form = reactive<any>({
  pkid: null,
  code: "",
  description: "",
  notes: "",
  active: true,
  revisions: [],
});
const revision = reactive<Revision>(blankRevision());
const revisionStatuses = [
  { label: "Borrador", value: "DRAFT" },
  { label: "Vigente", value: "ACTIVE" },
  { label: "Obsoleta", value: "OBSOLETE" },
];
const editable = computed(() => !revisionReadOnly.value);
function blankRevision(code = "01"): Revision {
  return {
    pkid: null,
    revision: code,
    status: "DRAFT",
    validFrom: "",
    validTo: "",
    changeDescription: "",
    operations: [],
  };
}
function blankOperation(sequence: number): Operation {
  return {
    clientKey: `new-${Date.now()}-${Math.random()}`,
    pkid: null,
    sequence,
    phaseId: null,
    description: "",
    preferredWorkCenterId: null,
    setupMinutes: null,
    unitMinutes: null,
    waitMinutes: null,
    subcontractMinutes: null,
    instructions: "",
    qualityControl: false,
    finalOperation: false,
    predecessorSequences: [],
  };
}
function applyRevision(value: any) {
  Object.assign(
    revision,
    blankRevision(),
    JSON.parse(JSON.stringify(value || blankRevision())),
  );
  revision.operations = (revision.operations || []).map((op: any) => ({
    ...blankOperation(op.sequence || 10),
    ...op,
    predecessorSequences: op.predecessorSequences || [],
  }));
  selectedRevisionId.value = revision.pkid;
  revisionReadOnly.value = Boolean(
    revision.pkid && revision.status !== "DRAFT",
  );
}
function resetForm() {
  Object.assign(form, {
    pkid: null,
    code: "",
    description: "",
    notes: "",
    active: true,
    revisions: [],
  });
  applyRevision(blankRevision());
}
const statusLabel = (value: string) =>
  (({ DRAFT: "Borrador", ACTIVE: "Vigente", OBSOLETE: "Obsoleta" }) as any)[
    value
  ] || "Sin revisión";
const phaseName = (id: number | null) =>
  phases.value.find((item) => item.pkid === id)?.description ||
  "Fase pendiente";
const dependencyOptions = (current: Operation) =>
  revision.operations
    .filter((item) => item !== current && item.sequence)
    .map((item) => ({
      label: `${item.sequence} · ${phaseName(item.phaseId)}`,
      value: item.sequence,
    }));
const operationLevels = computed(() => {
  const remaining = [...revision.operations],
    placed = new Set<number>(),
    levels: Operation[][] = [];
  while (remaining.length) {
    const level = remaining.filter((op) =>
      (op.predecessorSequences || []).every((seq) => placed.has(seq)),
    );
    if (!level.length) {
      levels.push(remaining.splice(0));
      break;
    }
    levels.push(level);
    level.forEach((op) => placed.add(op.sequence));
    level.forEach((op) => remaining.splice(remaining.indexOf(op), 1));
  }
  return levels;
});
async function loadCatalogs() {
  const [phaseResponse, centerResponse] = await Promise.all([
    axios.get(backendUrl("/WebGetManufacturingPhases"), {
      ...auth.portalRequestConfig(),
      params: { page: 0, size: 500 },
    }),
    axios.get(backendUrl("/WebGetManufacturingWorkCenters"), {
      ...auth.portalRequestConfig(),
      params: { page: 0, size: 500, activeOnly: true },
    }),
  ]);
  phases.value = (phaseResponse.data.content || [])
    .filter((item: any) => item.active)
    .map((item: any) => ({
      ...item,
      displayName: `${item.code} — ${item.description}`,
    }));
  workCenters.value = (centerResponse.data.content || []).map((item: any) => ({
    ...item,
    displayName: `${item.code} — ${item.name}`,
  }));
}
async function openNew() {
  resetForm();
  dialogVisible.value = true;
  await loadCatalogs();
}
async function openEdit(row: any) {
  try {
    await loadCatalogs();
    const { data } = await axios.get(
      backendUrl(`/WebGetManufacturingProcess/${row.pkid}`),
      auth.portalRequestConfig(),
    );
    Object.assign(form, data);
    applyRevision(
      data.revisions?.find((item: any) => item.status === "ACTIVE") ||
        data.revisions?.[0] ||
        blankRevision(),
    );
    dialogVisible.value = true;
  } catch (error: any) {
    showError("No se pudo cargar el proceso", error);
  }
}
function selectStoredRevision() {
  applyRevision(
    form.revisions.find((item: any) => item.pkid === selectedRevisionId.value),
  );
}
function nextRevisionCode() {
  const max = Math.max(
    0,
    ...form.revisions.map(
      (item: any) => Number.parseInt(item.revision, 10) || 0,
    ),
  );
  return String(max + 1).padStart(2, "0");
}
function newRevision() {
  const clone = JSON.parse(JSON.stringify(revision));
  clone.pkid = null;
  clone.revision = nextRevisionCode();
  clone.status = "DRAFT";
  clone.validFrom = "";
  clone.validTo = "";
  clone.changeDescription = "";
  clone.operations = (clone.operations || []).map((op: any) => ({
    ...op,
    pkid: null,
    clientKey: `new-${Date.now()}-${Math.random()}`,
  }));
  applyRevision(clone);
}
function addOperation() {
  const max = Math.max(
    0,
    ...revision.operations.map((item) => Number(item.sequence) || 0),
  );
  revision.operations.push(blankOperation(Math.ceil((max + 1) / 10) * 10));
}
function removeOperation(index: number) {
  const removed = revision.operations[index].sequence;
  revision.operations.splice(index, 1);
  revision.operations.forEach(
    (op) =>
      (op.predecessorSequences = (op.predecessorSequences || []).filter(
        (seq) => seq !== removed,
      )),
  );
}
function phaseChanged(operation: Operation) {
  const phase = phases.value.find((item) => item.pkid === operation.phaseId);
  if (!phase) return;
  operation.description = operation.description || phase.description;
  operation.preferredWorkCenterId =
    operation.preferredWorkCenterId || phase.preferredWorkCenterId || null;
}
async function saveProcess() {
  try {
    saving.value = true;
    const payload = {
      pkid: form.pkid,
      code: form.code,
      description: form.description,
      notes: form.notes,
      active: form.active,
      revisions: [revision],
    };
    const { data } = await axios.post(
      backendUrl("/WebSaveManufacturingProcess"),
      payload,
      auth.portalRequestConfig(),
    );
    Object.assign(form, data);
    applyRevision(
      data.revisions?.find(
        (item: any) => item.revision === revision.revision,
      ) || data.revisions?.[0],
    );
    toast.add({
      severity: "success",
      summary: "Proceso guardado",
      detail: "La revisión y sus dependencias se han guardado.",
      life: 3500,
    });
    processTable.value?.loadData?.();
  } catch (error: any) {
    showError("No se pudo guardar el proceso", error);
  } finally {
    saving.value = false;
  }
}
async function toggleProcess(row: any) {
  try {
    await axios.post(
      backendUrl(`/WebToggleManufacturingProcess/${row.pkid}`),
      {},
      auth.portalRequestConfig(),
    );
    processTable.value?.loadData?.();
  } catch (error: any) {
    showError("No se pudo cambiar el estado", error);
  }
}
function showError(summary: string, error: any) {
  toast.add({
    severity: "error",
    summary,
    detail:
      typeof error?.response?.data === "string"
        ? error.response.data
        : error?.message || "Error inesperado",
    life: 6500,
  });
}
const loadError = (error: any) =>
  showError("No se pudieron cargar los procesos", error);
onMounted(() => loadCatalogs().catch(() => undefined));
</script>

<style scoped>
.process-page {
  width: 100%;
  padding: 18px 16px 94px;
  color: #253044;
  background: linear-gradient(180deg, #f7faf1, #fff 320px);
}
.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 16px 20px;
  border: 1px solid #dfe8c8;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055);
}
.toolbar-title {
  display: flex;
  align-items: center;
  gap: 14px;
}
.toolbar-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(135deg, #9cc10a, #637d09);
}
.toolbar-title span {
  color: #8993a2;
  font-size: 0.78rem;
}
.toolbar-title h1 {
  margin: 2px 0;
  font-size: 1.45rem;
}
.toolbar-title p {
  margin: 0;
  color: #778192;
  font-size: 0.84rem;
}
.toolbar-actions,
.row-actions,
.dialog-footer,
.revision-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.table-panel {
  margin-top: 16px;
  padding: 8px;
  border: 1px solid #e1e7d5;
  border-radius: 13px;
  background: #fff;
}
.process-code {
  color: #58700a;
}
.status-pill {
  display: inline-flex;
  padding: 4px 9px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
}
.status-pill.active,
.status-pill.active {
  color: #087443;
  background: #d9f6e5;
}
.status-pill.draft {
  color: #976400;
  background: #fff0c7;
}
.status-pill.obsolete,
.status-pill.inactive {
  color: #687181;
  background: #eceff3;
}
.process-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.identity-grid {
  display: grid;
  grid-template-columns: 220px minmax(340px, 1fr) auto;
  gap: 12px;
}
.identity-grid input,
.revision-grid input {
  width: 100%;
}
.revision-card,
.operations-card,
.flow-card {
  padding: 16px;
  border: 1px solid #dfe5d5;
  border-radius: 12px;
  background: #fff;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 16px;
}
.section-heading > div:first-child {
  display: flex;
  align-items: center;
  gap: 11px;
}
.section-heading > div:first-child > i {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 9px;
  color: #708d0b;
  background: #eff6d8;
}
.section-heading span {
  display: flex;
  flex-direction: column;
}
.section-heading small {
  margin-top: 2px;
  color: #7b8594;
}
.revision-grid {
  display: grid;
  grid-template-columns: 130px 160px 150px 150px minmax(260px, 1fr);
  gap: 10px;
}
.operation-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.operation-row {
  display: grid;
  grid-template-columns: 105px minmax(520px, 1fr) 390px 145px 38px;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #e4e9dc;
  border-left: 4px solid #9cc10a;
  border-radius: 10px;
  background: #fafcf7;
}
.operation-number {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.operation-number > span {
  color: #74805f;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
}
.operation-number :deep(input) {
  width: 95px;
}
.operation-main {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr 1.2fr;
  gap: 9px;
}
.time-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.time-grid :deep(input) {
  width: 100%;
}
.operation-flags {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.76rem;
}
.operation-flags label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.empty-state {
  display: flex;
  min-height: 150px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  color: #7f8996;
  border: 1px dashed #d7ddcb;
  border-radius: 10px;
}
.empty-state i {
  font-size: 1.6rem;
  color: #92b40b;
}
.flow-board {
  display: flex;
  align-items: stretch;
  gap: 10px;
  overflow: auto;
  padding: 8px 4px 14px;
}
.flow-column {
  display: flex;
  min-width: 210px;
  flex-direction: column;
  gap: 8px;
}
.flow-column > small {
  color: #718047;
  font-weight: 800;
  text-transform: uppercase;
}
.flow-operation {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border: 1px solid #dce5c5;
  border-radius: 9px;
  background: #f8fbea;
  box-shadow: 0 3px 10px rgba(68, 85, 32, 0.06);
}
.flow-operation strong {
  color: #6d8908;
}
.flow-operation span {
  font-weight: 700;
}
.flow-operation em {
  margin-top: 3px;
  color: #7b8594;
  font-size: 0.69rem;
  font-style: normal;
}
.flow-arrow {
  display: grid;
  place-items: center;
  color: #91ae24;
}
.dialog-footer {
  width: 100%;
  justify-content: flex-end;
  border-top: 1px solid #9cc10a;
  padding-top: 12px;
}
.w-full {
  width: 100%;
}
@media (max-width: 1250px) {
  .operation-row {
    grid-template-columns: 95px 1fr 1fr;
  }
  .operation-main {
    grid-column: 2/4;
  }
  .time-grid {
    grid-column: 2;
  }
  .operation-flags {
    grid-column: 3;
  }
  .revision-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .change-description {
    grid-column: 1/-1;
  }
}
@media (max-width: 760px) {
  .process-page {
    padding: 10px 8px 84px;
  }
  .page-toolbar,
  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .identity-grid,
  .revision-grid,
  .operation-row,
  .operation-main,
  .time-grid {
    grid-template-columns: 1fr;
  }
  .operation-main,
  .time-grid,
  .operation-flags {
    grid-column: auto;
  }
  .toolbar-actions {
    flex-wrap: wrap;
  }
}
</style>
