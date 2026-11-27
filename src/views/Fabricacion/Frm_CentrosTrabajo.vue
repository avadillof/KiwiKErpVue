<template>
  <main class="work-center-page">
    <Toast />
    <header class="page-toolbar">
      <div class="toolbar-title">
        <span class="toolbar-icon"><i class="pi pi-building"></i></span>
        <div>
          <span class="breadcrumb">KiwiKERP / Fabricación / Configuración</span>
          <h1>Centros de trabajo</h1>
          <p>
            Recursos internos o externos que pueden ejecutar las fases de
            fabricación.
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
        />
        <Button label="Nuevo centro" icon="pi pi-plus" @click="openNew" />
      </div>
    </header>

    <section class="data-panel">
      <div class="panel-heading">
        <div>
          <h2>Maestro de centros</h2>
          <p>
            Una fase puede admitir varios centros compatibles y señalar uno como
            preferente.
          </p>
        </div>
      </div>
      <div class="table-shell">
        <GenericDataTable
          ref="table"
          endpoint="WebGetManufacturingWorkCenters"
          dataKey="pkid"
          :requestConfig="auth.portalRequestConfig"
          :params="{ type: typeFilter || undefined }"
          :showPaginator="true"
          :filterable="true"
          :showActions="true"
          :pageSize="10"
          :pageSizeOptions="[10, 25, 50]"
          @load-error="loadError"
        >
          <template #panelOptions>
            <Select
              v-model="typeFilter"
              :options="typeFilterOptions"
              optionLabel="label"
              optionValue="value"
              class="type-filter"
              @change="refresh(false)"
            />
          </template>
          <template #headerActions
            ><Button label="Nuevo centro" icon="pi pi-plus" @click="openNew"
          /></template>
          <Column field="code" header="Código" sortable style="width: 140px"
            ><template #body="{ data }"
              ><span class="code-pill">{{ data.code }}</span></template
            ></Column
          >
          <Column
            field="name"
            header="Centro de trabajo"
            sortable
            style="min-width: 260px"
            ><template #body="{ data }"
              ><div class="name-cell">
                <strong>{{ data.name }}</strong
                ><small v-if="data.description">{{ data.description }}</small>
              </div></template
            ></Column
          >
          <Column field="type" header="Tipo" sortable style="width: 150px"
            ><template #body="{ data }">{{
              typeLabel(data.type)
            }}</template></Column
          >
          <Column
            field="hourlyCost"
            header="Coste/hora"
            sortable
            style="width: 125px"
            bodyClass="text-right"
            ><template #body="{ data }">{{
              money(data.hourlyCost)
            }}</template></Column
          >
          <Column
            field="simultaneousCapacity"
            header="Capacidad"
            sortable
            style="width: 105px"
            bodyClass="text-right"
          />
          <Column
            field="phaseCount"
            header="Fases"
            style="width: 85px"
            bodyClass="text-right"
          />
          <Column field="active" header="Estado" sortable style="width: 105px"
            ><template #body="{ data }"
              ><span
                :class="[
                  'status-tag',
                  data.active ? 'is-active' : 'is-inactive',
                ]"
                >{{ data.active ? "Activo" : "Inactivo" }}</span
              ></template
            ></Column
          >
          <Column header="Acciones" style="width: 125px"
            ><template #body="{ data }"
              ><div class="row-actions">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  title="Editar centro"
                  @click="openEdit(data)"
                /><Button
                  :icon="data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  text
                  rounded
                  :severity="data.active ? 'danger' : 'success'"
                  :title="data.active ? 'Desactivar centro' : 'Activar centro'"
                  @click="toggle(data)"
                /></div></template
          ></Column>
        </GenericDataTable>
      </div>
    </section>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="
        form.pkid ? 'Editar centro de trabajo' : 'Nuevo centro de trabajo'
      "
      :style="{ width: 'min(760px, 96vw)' }"
      class="kiwik-dialog"
    >
      <div class="dialog-intro">
        <i class="pi pi-info-circle"></i>
        <p>
          Los centros son recursos reutilizables. La fase indicará cuáles son
          compatibles y cuál debe proponerse primero.
        </p>
      </div>
      <div class="center-form">
        <FloatLabel variant="on"
          ><InputText
            id="centerCode"
            v-model="form.code"
            maxlength="50"
            :disabled="Boolean(form.pkid)"
            class="w-full"
            autofocus
          /><label for="centerCode">Código *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputText
            id="centerName"
            v-model="form.name"
            maxlength="145"
            class="w-full"
          /><label for="centerName">Nombre *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><Select
            id="centerType"
            v-model="form.type"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
            @change="typeChanged"
          /><label for="centerType">Tipo *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputNumber
            id="centerCost"
            v-model="form.hourlyCost"
            mode="currency"
            currency="EUR"
            locale="es-ES"
            :min="0"
            :maxFractionDigits="4"
            class="w-full"
          /><label for="centerCost">Coste por hora</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputNumber
            id="centerCapacity"
            v-model="form.simultaneousCapacity"
            :min="1"
            :maxFractionDigits="0"
            class="w-full"
          /><label for="centerCapacity"
            >Capacidad simultánea *</label
          ></FloatLabel
        >
        <label class="check-card"
          ><Checkbox v-model="form.external" binary /><span
            ><strong>Centro externo</strong
            ><small
              >El recurso pertenece a un proveedor o colaborador.</small
            ></span
          ></label
        >
        <FloatLabel variant="on" class="description-field"
          ><Textarea
            id="centerDescription"
            v-model="form.description"
            rows="5"
            maxlength="10000"
            autoResize
            class="w-full"
          /><label for="centerDescription"
            >Descripción y observaciones</label
          ></FloatLabel
        >
      </div>
      <template #footer
        ><div class="dialog-footer">
          <div class="kiwik-separator"></div>
          <div>
            <Button
              label="Cancelar"
              text
              @click="dialogVisible = false"
            /><Button
              :label="form.pkid ? 'Guardar cambios' : 'Crear centro'"
              icon="pi pi-check"
              :loading="saving"
              @click="save"
            />
          </div></div
      ></template>
    </Dialog>
  </main>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

type WorkCenter = {
  pkid: number | null;
  code: string;
  name: string;
  description: string;
  type: string;
  hourlyCost: number | null;
  simultaneousCapacity: number;
  external: boolean;
  active: boolean;
  phaseCount?: number;
};

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const table = ref<InstanceType<typeof GenericDataTable>>();
const saving = ref(false);
const dialogVisible = ref(false);
const typeFilter = ref("");
const typeOptions = [
  { value: "MACHINE", label: "Máquina" },
  { value: "WORKSTATION", label: "Puesto de trabajo" },
  { value: "LINE", label: "Línea" },
  { value: "AREA", label: "Área" },
  { value: "EXTERNAL", label: "Centro externo" },
];
const typeFilterOptions = computed(() => [
  { value: "", label: "Todos los tipos" },
  ...typeOptions,
]);
const form = reactive<WorkCenter>(emptyCenter());

function emptyCenter(): WorkCenter {
  return {
    pkid: null,
    code: "",
    name: "",
    description: "",
    type: "WORKSTATION",
    hourlyCost: null,
    simultaneousCapacity: 1,
    external: false,
    active: true,
  };
}
const typeLabel = (value: string) =>
  typeOptions.find((item) => item.value === value)?.label || value;
const money = (value: number | null) =>
  value == null
    ? "—"
    : Number(value).toLocaleString("es-ES", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });
const errorMessage = (error: any, fallback: string) =>
  typeof error?.response?.data === "string" ? error.response.data : fallback;
const refresh = (silent = true) => table.value?.refresh(silent);
const loadError = (error: any) =>
  toast.add({
    severity: "error",
    summary: "No se pudieron cargar los centros",
    detail: errorMessage(error, "Revisa la conexión con el servidor."),
    life: 5000,
  });
const openNew = () => {
  Object.assign(form, emptyCenter());
  dialogVisible.value = true;
};
const openEdit = (center: WorkCenter) => {
  Object.assign(form, { ...center });
  dialogVisible.value = true;
};
const typeChanged = () => {
  if (form.type === "EXTERNAL") form.external = true;
};
const save = async () => {
  if (!form.code.trim() || !form.name.trim() || !form.type) {
    toast.add({
      severity: "warn",
      summary: "Datos incompletos",
      detail: "Indica el código, el nombre y el tipo.",
      life: 4000,
    });
    return;
  }
  saving.value = true;
  try {
    await axios.post(
      backendUrl("/WebSaveManufacturingWorkCenter"),
      form,
      auth.portalRequestConfig(),
    );
    dialogVisible.value = false;
    refresh(false);
    toast.add({
      severity: "success",
      summary: "Centro guardado",
      detail: form.name,
      life: 3500,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "No se pudo guardar el centro",
      detail: errorMessage(error, "Revisa los datos e inténtalo de nuevo."),
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
};
const toggle = async (center: WorkCenter) => {
  try {
    await axios.post(
      backendUrl(`/WebToggleManufacturingWorkCenter/${center.pkid}`),
      {},
      auth.portalRequestConfig(),
    );
    refresh(false);
    toast.add({
      severity: "success",
      summary: center.active ? "Centro desactivado" : "Centro activado",
      detail: center.name,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "No se pudo cambiar el estado",
      detail: errorMessage(error, "Inténtalo de nuevo."),
      life: 4500,
    });
  }
};
</script>

<style scoped>
.work-center-page {
  width: 100%;
  padding: 18px 16px 94px;
  color: #243044;
  background: linear-gradient(180deg, #f7faf1 0%, #fff 32%);
}
.page-toolbar {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 20px;
  border: 1px solid #dfe8c8;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 41, 55, 0.055);
}
.toolbar-title {
  display: flex;
  align-items: center;
  gap: 15px;
}
.toolbar-icon {
  display: grid;
  width: 50px;
  height: 50px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 13px;
  color: #fff;
  background: linear-gradient(135deg, #38a4d8, #2875b6);
  box-shadow: 0 7px 16px rgba(40, 117, 182, 0.22);
}
.breadcrumb {
  color: #7d9e0b;
  font-size: 0.76rem;
  font-weight: 750;
}
.toolbar-title h1 {
  margin: 2px 0 0;
  font-size: 1.45rem;
}
.toolbar-title p {
  margin: 3px 0 0;
  color: #778192;
  font-size: 0.84rem;
}
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 7px;
}
.data-panel {
  overflow: hidden;
  margin-top: 16px;
  border: 1px solid #dde4d1;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 18px rgba(31, 41, 55, 0.055);
}
.panel-heading {
  padding: 14px 18px;
  border-bottom: 2px solid #9cc10a;
  background: #fbfdf7;
}
.panel-heading h2 {
  margin: 0;
  font-size: 1rem;
}
.panel-heading p {
  margin: 3px 0 0;
  color: #7d8797;
  font-size: 0.78rem;
}
.table-shell {
  height: 650px;
}
.type-filter {
  width: 220px;
}
.code-pill {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 6px;
  color: #315f7d;
  background: #e8f5fb;
  font-size: 0.78rem;
  font-weight: 800;
}
.name-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}
.name-cell small {
  overflow: hidden;
  max-width: 430px;
  color: #8992a0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.status-tag {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 750;
}
.is-active {
  color: #22774a;
  background: #dcf7e7;
}
.is-inactive {
  color: #7c6470;
  background: #f1e9ed;
}
.row-actions {
  display: flex;
  gap: 2px;
}
.dialog-intro {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 18px;
  padding: 11px 13px;
  border: 1px solid #cbdafd;
  border-radius: 9px;
  color: #2758a5;
  background: #f0f6ff;
}
.dialog-intro p {
  margin: 0;
  font-size: 0.82rem;
  line-height: 1.45;
}
.center-form {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px 12px;
}
.description-field {
  grid-column: 1/-1;
}
.check-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid #e3e8d7;
  border-radius: 8px;
  background: #fbfcf8;
  cursor: pointer;
}
.check-card span {
  display: flex;
  flex-direction: column;
}
.check-card strong {
  font-size: 0.78rem;
}
.check-card small {
  color: #7d8797;
  font-size: 0.68rem;
}
.dialog-footer {
  width: 100%;
}
.dialog-footer > div:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.kiwik-separator {
  height: 1px;
  margin: 4px 0 12px;
  background: #9cc10a;
}
@media (max-width: 680px) {
  .page-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .center-form {
    grid-template-columns: 1fr;
  }
  .description-field {
    grid-column: auto;
  }
}
</style>
