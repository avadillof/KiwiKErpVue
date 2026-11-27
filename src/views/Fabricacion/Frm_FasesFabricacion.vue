<template>
  <main class="phase-page">
    <Toast />

    <header class="page-toolbar">
      <div class="toolbar-title">
        <span class="toolbar-icon"><i class="pi pi-list-check"></i></span>
        <div>
          <span class="breadcrumb">KiwiKERP / Fabricación / Configuración</span>
          <h1>Maestro de fases</h1>
          <p>
            Operaciones reutilizables para definir posteriormente los procesos
            de fabricación.
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
        <Button label="Nueva fase" icon="pi pi-plus" @click="openNewPhase" />
      </div>
    </header>

    <section class="summary-grid" aria-label="Resumen de fases">
      <article v-for="item in summaryCards" :key="item.label">
        <span :class="['summary-icon', item.style]"
          ><i :class="item.icon"></i
        ></span>
        <div>
          <strong>{{ fmt(item.value) }}</strong
          ><span>{{ item.label }}</span>
        </div>
      </article>
    </section>

    <section class="phase-panel">
      <div class="panel-heading">
        <div>
          <h2>Fases de fabricación</h2>
          <p>
            Los tiempos se asignarán por producto y proceso, no en este catálogo
            general.
          </p>
        </div>
      </div>

      <div class="phase-table-shell">
        <GenericDataTable
          ref="phaseTable"
          endpoint="WebGetManufacturingPhases"
          dataKey="pkid"
          :requestConfig="auth.portalRequestConfig"
          :params="{ category: categoryFilter || undefined }"
          :showPaginator="true"
          :filterable="true"
          :showActions="true"
          :pageSize="10"
          :pageSizeOptions="[10, 25, 50]"
          @load-error="tableLoadError"
        >
          <template #panelOptions>
            <Select
              v-model="categoryFilter"
              :options="categoryFilterOptions"
              optionLabel="label"
              optionValue="value"
              class="category-filter"
              @change="refreshPhases(false)"
            />
            <Button
              label="Categorías"
              icon="pi pi-tags"
              outlined
              severity="secondary"
              @click="openCategoryMaintenance"
            />
          </template>
          <template #headerActions>
            <Button
              label="Nueva fase"
              icon="pi pi-plus"
              @click="openNewPhase"
            />
          </template>

          <Column field="code" header="Código" sortable style="width: 135px">
            <template #body="{ data }"
              ><span class="phase-code">{{ data.code }}</span></template
            >
          </Column>
          <Column
            field="description"
            header="Descripción"
            sortable
            style="min-width: 250px"
          >
            <template #body="{ data }">
              <div class="description-cell">
                <strong>{{ data.description }}</strong>
                <small v-if="data.instructions">{{ data.instructions }}</small>
              </div>
            </template>
          </Column>
          <Column
            field="category"
            header="Categoría"
            sortable
            style="width: 175px"
          >
            <template #body="{ data }">
              <span class="category-pill"
                ><i class="pi pi-tag"></i
                >{{ categoryLabel(data.category) }}</span
              >
            </template>
          </Column>
          <Column
            field="workCenter"
            header="Centro de trabajo"
            sortable
            style="min-width: 180px"
          >
            <template #body="{ data }">{{ data.workCenter || "—" }}</template>
          </Column>
          <Column
            field="hourlyCost"
            header="Coste/hora"
            sortable
            style="width: 125px"
            bodyClass="text-right"
          >
            <template #body="{ data }">{{ money(data.hourlyCost) }}</template>
          </Column>
          <Column header="Modalidad" style="width: 135px">
            <template #body="{ data }">
              <span v-if="data.subcontracted" class="mode-tag external-mode"
                ><i class="pi pi-send"></i>Externa</span
              >
              <span v-else class="mode-tag internal-mode"
                ><i class="pi pi-home"></i>Interna</span
              >
            </template>
          </Column>
          <Column field="active" header="Estado" sortable style="width: 105px">
            <template #body="{ data }">
              <span
                :class="[
                  'status-tag',
                  data.active ? 'is-active' : 'is-inactive',
                ]"
                >{{ data.active ? "Activa" : "Inactiva" }}</span
              >
            </template>
          </Column>
          <Column header="Acciones" style="width: 125px">
            <template #body="{ data }">
              <div class="row-actions">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  title="Editar fase"
                  @click="openEditPhase(data)"
                />
                <Button
                  :icon="data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  text
                  rounded
                  :severity="data.active ? 'danger' : 'success'"
                  :title="data.active ? 'Desactivar fase' : 'Activar fase'"
                  @click="togglePhase(data)"
                />
              </div>
            </template>
          </Column>
        </GenericDataTable>
      </div>
    </section>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="
        form.pkid ? 'Editar fase de fabricación' : 'Nueva fase de fabricación'
      "
      :style="{ width: 'min(850px, 96vw)' }"
      class="kiwik-dialog phase-dialog"
    >
      <div class="dialog-intro">
        <i class="pi pi-info-circle"></i>
        <p>
          Una fase es una operación reutilizable. Los tiempos específicos se
          definirán al incorporarla a un proceso y asignarlo a un producto.
        </p>
      </div>
      <div class="phase-form">
        <FloatLabel variant="on">
          <InputText
            id="phaseCode"
            v-model="form.code"
            maxlength="50"
            :disabled="Boolean(form.pkid)"
            class="w-full"
            autofocus
          />
          <label for="phaseCode">Código *</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            id="phaseDescription"
            v-model="form.description"
            maxlength="145"
            class="w-full"
          />
          <label for="phaseDescription">Descripción *</label>
        </FloatLabel>
        <div class="category-field">
          <FloatLabel variant="on">
            <Select
              id="phaseCategory"
              v-model="form.category"
              :options="categorySelectOptions"
              optionLabel="label"
              optionValue="code"
              class="w-full"
              @change="categoryChanged"
            />
            <label for="phaseCategory">Categoría *</label>
          </FloatLabel>
          <Button
            icon="pi pi-cog"
            outlined
            severity="secondary"
            title="Mantener categorías"
            @click="openCategoryMaintenance"
          />
        </div>
        <FloatLabel variant="on">
          <InputText
            id="phaseWorkCenter"
            v-model="form.workCenter"
            maxlength="145"
            class="w-full"
          />
          <label for="phaseWorkCenter">Centro de trabajo</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputNumber
            id="phaseHourlyCost"
            v-model="form.hourlyCost"
            mode="currency"
            currency="EUR"
            locale="es-ES"
            :min="0"
            :maxFractionDigits="4"
            class="w-full"
          />
          <label for="phaseHourlyCost">Coste por hora</label>
        </FloatLabel>
        <label class="check-card">
          <Checkbox v-model="form.subcontracted" binary />
          <span
            ><strong>Fase subcontratada</strong
            ><small
              >El trabajo lo realiza normalmente un proveedor externo.</small
            ></span
          >
        </label>
        <FloatLabel variant="on" class="instructions-field">
          <Textarea
            id="phaseInstructions"
            v-model="form.instructions"
            rows="6"
            maxlength="10000"
            autoResize
            class="w-full"
          />
          <label for="phaseInstructions">Instrucciones generales</label>
        </FloatLabel>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <div class="kiwik-separator"></div>
          <div>
            <Button
              label="Cancelar"
              text
              @click="dialogVisible = false"
            /><Button
              :label="form.pkid ? 'Guardar cambios' : 'Crear fase'"
              icon="pi pi-check"
              :loading="saving"
              @click="savePhase"
            />
          </div>
        </div>
      </template>
    </Dialog>

    <Dialog
      v-model:visible="categoryMaintenanceVisible"
      modal
      header="Categorías de fabricación"
      :style="{ width: 'min(850px, 96vw)' }"
      class="kiwik-dialog category-maintenance-dialog"
      @hide="categoriesMaintenanceClosed"
    >
      <div class="maintenance-heading">
        <div>
          <strong>Categorías disponibles para las fases</strong
          ><small
            >Las categorías inactivas se conservan en las fases
            históricas.</small
          >
        </div>
        <Button
          label="Nueva categoría"
          icon="pi pi-plus"
          @click="openNewCategory"
        />
      </div>
      <div class="category-table-shell">
        <GenericDataTable
          ref="categoryTable"
          endpoint="WebGetManufacturingPhaseCategories"
          dataKey="pkid"
          :requestConfig="auth.portalRequestConfig"
          :showPaginator="true"
          :filterable="true"
          :showActions="false"
          :pageSize="10"
          :pageSizeOptions="[10, 25, 50]"
          @load-error="tableLoadError"
        >
          <Column field="code" header="Código" sortable style="width: 130px">
            <template #body="{ data }"
              ><span class="phase-code">{{ data.code }}</span></template
            >
          </Column>
          <Column field="description" header="Descripción" sortable />
          <Column
            field="phaseCount"
            header="Fases"
            style="width: 100px"
            bodyClass="text-right"
          />
          <Column field="active" header="Estado" sortable style="width: 110px">
            <template #body="{ data }"
              ><span
                :class="[
                  'status-tag',
                  data.active ? 'is-active' : 'is-inactive',
                ]"
                >{{ data.active ? "Activa" : "Inactiva" }}</span
              ></template
            >
          </Column>
          <Column header="Acciones" style="width: 125px">
            <template #body="{ data }">
              <div class="row-actions">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  severity="secondary"
                  title="Editar categoría"
                  @click="openEditCategory(data)"
                />
                <Button
                  :icon="data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                  text
                  rounded
                  :severity="data.active ? 'danger' : 'success'"
                  :title="
                    data.active ? 'Desactivar categoría' : 'Activar categoría'
                  "
                  @click="toggleCategory(data)"
                />
              </div>
            </template>
          </Column>
        </GenericDataTable>
      </div>
      <template #footer
        ><div class="dialog-footer">
          <div class="kiwik-separator"></div>
          <div>
            <Button
              label="Cerrar"
              icon="pi pi-times"
              @click="categoryMaintenanceVisible = false"
            />
          </div></div
      ></template>
    </Dialog>

    <Dialog
      v-model:visible="categoryDialogVisible"
      modal
      :header="categoryForm.pkid ? 'Editar categoría' : 'Nueva categoría'"
      :style="{ width: 'min(560px, 94vw)' }"
      class="kiwik-dialog"
    >
      <div class="category-form">
        <FloatLabel variant="on"
          ><InputText
            id="categoryCode"
            v-model="categoryForm.code"
            maxlength="20"
            :disabled="Boolean(categoryForm.pkid)"
            class="w-full"
            autofocus
          /><label for="categoryCode">Código *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputText
            id="categoryDescription"
            v-model="categoryForm.description"
            maxlength="145"
            class="w-full"
          /><label for="categoryDescription">Descripción *</label></FloatLabel
        >
      </div>
      <template #footer
        ><div class="dialog-footer">
          <div class="kiwik-separator"></div>
          <div>
            <Button
              label="Cancelar"
              text
              @click="categoryDialogVisible = false"
            /><Button
              :label="categoryForm.pkid ? 'Guardar cambios' : 'Crear categoría'"
              icon="pi pi-check"
              :loading="categorySaving"
              @click="saveCategory"
            />
          </div></div
      ></template>
    </Dialog>
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
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import GenericDataTable from "@/components/shared/GenericDataTable.vue";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

type Phase = {
  pkid: number | null;
  code: string;
  description: string;
  category: string;
  workCenter: string;
  hourlyCost: number | null;
  instructions: string;
  subcontracted: boolean;
  active: boolean;
};
type PhaseCategory = {
  pkid: number | null;
  code: string;
  description: string;
  active: boolean;
  phaseCount?: number;
};

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const phaseTable = ref<InstanceType<typeof GenericDataTable>>();
const categoryTable = ref<InstanceType<typeof GenericDataTable>>();
const saving = ref(false);
const categorySaving = ref(false);
const dialogVisible = ref(false);
const categoryMaintenanceVisible = ref(false);
const categoryDialogVisible = ref(false);
const categoryFilter = ref("");
const categories = ref<PhaseCategory[]>([]);
const summary = reactive({
  total: 0,
  active: 0,
  categories: 0,
  subcontracted: 0,
});
const form = reactive<Phase>(emptyPhase());
const categoryForm = reactive<PhaseCategory>(emptyCategory());

function emptyPhase(): Phase {
  return {
    pkid: null,
    code: "",
    description: "",
    category: "",
    workCenter: "",
    hourlyCost: null,
    instructions: "",
    subcontracted: false,
    active: true,
  };
}
function emptyCategory(): PhaseCategory {
  return { pkid: null, code: "", description: "", active: true, phaseCount: 0 };
}

const summaryCards = computed(() => [
  {
    label: "Fases registradas",
    value: summary.total,
    icon: "pi pi-list",
    style: "total",
  },
  {
    label: "Fases activas",
    value: summary.active,
    icon: "pi pi-check-circle",
    style: "active",
  },
  {
    label: "Categorías utilizadas",
    value: summary.categories,
    icon: "pi pi-tags",
    style: "category",
  },
  {
    label: "Subcontratadas",
    value: summary.subcontracted,
    icon: "pi pi-send",
    style: "external",
  },
]);
const categoryFilterOptions = computed(() => [
  { value: "", label: "Todas las categorías" },
  ...categories.value.map((item) => ({
    value: item.code,
    label: item.description,
  })),
]);
const categorySelectOptions = computed(() =>
  categories.value
    .filter((item) => item.active || item.code === form.category)
    .map((item) => ({ code: item.code, label: item.description })),
);
const categoryLabel = (code: string) =>
  categories.value.find((item) => item.code === code)?.description ||
  code ||
  "Sin categoría";
const fmt = (value: number) =>
  Number(value || 0).toLocaleString("es-ES", { maximumFractionDigits: 0 });
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

const loadSummary = async () => {
  const { data } = await axios.get(
    backendUrl("/WebGetManufacturingPhaseSummary"),
    auth.portalRequestConfig(),
  );
  Object.assign(summary, data || {});
};
const loadCategories = async () => {
  const { data } = await axios.get(
    backendUrl("/WebGetManufacturingPhaseCategories"),
    { ...auth.portalRequestConfig(), params: { page: 0, size: 500 } },
  );
  categories.value = Array.isArray(data?.content) ? data.content : [];
};
const refreshPhases = (silent = true) => phaseTable.value?.refresh(silent);
const refreshCategories = (silent = true) =>
  categoryTable.value?.refresh(silent);
const tableLoadError = (error: any) =>
  toast.add({
    severity: "error",
    summary: "No se pudieron cargar los datos",
    detail: errorMessage(error, "Revisa la conexión con el servidor."),
    life: 5000,
  });
const openNewPhase = () => {
  Object.assign(form, emptyPhase());
  dialogVisible.value = true;
};
const openEditPhase = (phase: Phase) => {
  Object.assign(form, { ...phase });
  dialogVisible.value = true;
};
const categoryChanged = () => {
  if (form.category === "SUB") form.subcontracted = true;
};

const savePhase = async () => {
  if (!form.code.trim() || !form.description.trim() || !form.category) {
    toast.add({
      severity: "warn",
      summary: "Datos incompletos",
      detail: "Indica el código, la descripción y la categoría.",
      life: 4000,
    });
    return;
  }
  saving.value = true;
  try {
    await axios.post(
      backendUrl("/WebSaveManufacturingPhase"),
      form,
      auth.portalRequestConfig(),
    );
    dialogVisible.value = false;
    await Promise.all([refreshPhases(false), loadSummary()]);
    toast.add({
      severity: "success",
      summary: "Fase guardada",
      detail: "El maestro de fases se ha actualizado correctamente.",
      life: 3500,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "No se pudo guardar la fase",
      detail: errorMessage(error, "Revisa los datos e inténtalo de nuevo."),
      life: 5000,
    });
  } finally {
    saving.value = false;
  }
};
const togglePhase = async (phase: Phase) => {
  try {
    await axios.post(
      backendUrl(`/WebToggleManufacturingPhase/${phase.pkid}`),
      {},
      auth.portalRequestConfig(),
    );
    await Promise.all([refreshPhases(false), loadSummary()]);
    toast.add({
      severity: "success",
      summary: phase.active ? "Fase desactivada" : "Fase activada",
      detail: phase.description,
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

const openCategoryMaintenance = async () => {
  categoryMaintenanceVisible.value = true;
  await loadCategories();
};
const openNewCategory = () => {
  Object.assign(categoryForm, emptyCategory());
  categoryDialogVisible.value = true;
};
const openEditCategory = (category: PhaseCategory) => {
  Object.assign(categoryForm, { ...category });
  categoryDialogVisible.value = true;
};
const saveCategory = async () => {
  if (!categoryForm.code.trim() || !categoryForm.description.trim()) {
    toast.add({
      severity: "warn",
      summary: "Datos incompletos",
      detail: "Indica el código y la descripción.",
      life: 4000,
    });
    return;
  }
  categorySaving.value = true;
  try {
    await axios.post(
      backendUrl("/WebSaveManufacturingPhaseCategory"),
      categoryForm,
      auth.portalRequestConfig(),
    );
    categoryDialogVisible.value = false;
    await Promise.all([refreshCategories(false), loadCategories()]);
    toast.add({
      severity: "success",
      summary: "Categoría guardada",
      detail: categoryForm.description,
      life: 3000,
    });
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "No se pudo guardar la categoría",
      detail: errorMessage(error, "Revisa los datos e inténtalo de nuevo."),
      life: 5000,
    });
  } finally {
    categorySaving.value = false;
  }
};
const toggleCategory = async (category: PhaseCategory) => {
  try {
    await axios.post(
      backendUrl(`/WebToggleManufacturingPhaseCategory/${category.pkid}`),
      {},
      auth.portalRequestConfig(),
    );
    await Promise.all([refreshCategories(false), loadCategories()]);
    toast.add({
      severity: "success",
      summary: category.active ? "Categoría desactivada" : "Categoría activada",
      detail: category.description,
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
const categoriesMaintenanceClosed = async () => {
  await loadCategories();
  refreshPhases();
};

onMounted(async () => {
  try {
    await Promise.all([loadCategories(), loadSummary()]);
  } catch (error) {
    tableLoadError(error);
  }
});
</script>

<style scoped>
.phase-page {
  width: 100%;
  min-height: 100%;
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
.page-toolbar::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  right: 25px;
  top: 50%;
  transform: translateY(-50%);
  background: url("/logos/logo512.png") center/contain no-repeat;
  filter: grayscale(1);
  opacity: 0.06;
  pointer-events: none;
}
.page-toolbar > * {
  position: relative;
  z-index: 1;
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
  background: linear-gradient(135deg, #8d78dc, #6250ad);
  box-shadow: 0 7px 16px rgba(98, 80, 173, 0.22);
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
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.summary-grid article {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 14px 16px;
  border: 1px solid #e3e8d2;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 14px rgba(31, 41, 55, 0.05);
}
.summary-icon {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: #fff;
}
.summary-icon.total {
  background: linear-gradient(135deg, #8d78dc, #6250ad);
}
.summary-icon.active {
  background: linear-gradient(135deg, #9cc10a, #6f9009);
}
.summary-icon.category {
  background: linear-gradient(135deg, #38a4d8, #2875b6);
}
.summary-icon.external {
  background: linear-gradient(135deg, #e8a25c, #c96a1e);
}
.summary-grid article div {
  display: flex;
  flex-direction: column;
}
.summary-grid strong {
  font-size: 1.3rem;
}
.summary-grid article span:last-child {
  color: #6f7887;
  font-size: 0.78rem;
  font-weight: 650;
}
.phase-panel {
  overflow: hidden;
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
.phase-table-shell {
  height: 620px;
}
.category-filter {
  width: 230px;
}
.phase-code {
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 6px;
  color: #4b5e17;
  background: #eef5d9;
  font-size: 0.78rem;
  font-weight: 800;
}
.description-cell {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}
.description-cell small {
  overflow: hidden;
  max-width: 430px;
  color: #8992a0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.category-pill,
.mode-tag,
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 750;
}
.category-pill {
  color: #594b96;
  background: #f0edfb;
}
.internal-mode {
  color: #336e59;
  background: #e5f7ef;
}
.external-mode {
  color: #9a5c1c;
  background: #fff0df;
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
.phase-form {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px 12px;
}
.category-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 6px;
}
.instructions-field {
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
.check-card span,
.maintenance-heading > div {
  display: flex;
  flex-direction: column;
}
.check-card strong {
  font-size: 0.78rem;
}
.check-card small,
.maintenance-heading small {
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
.maintenance-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 12px;
}
.category-table-shell {
  height: 470px;
}
.category-form {
  display: grid;
  gap: 16px;
  padding: 4px 0;
}
@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 680px) {
  .phase-page {
    padding: 10px 8px 80px;
  }
  .page-toolbar,
  .toolbar-title {
    align-items: flex-start;
  }
  .page-toolbar {
    flex-direction: column;
  }
  .toolbar-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .summary-grid {
    grid-template-columns: 1fr 1fr;
  }
  .phase-form {
    grid-template-columns: 1fr;
  }
  .instructions-field {
    grid-column: auto;
  }
  .maintenance-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
