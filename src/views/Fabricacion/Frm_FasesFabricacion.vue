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
      <article>
        <span class="summary-icon total"><i class="pi pi-list"></i></span>
        <div>
          <strong>{{ fmt(summary.total) }}</strong
          ><span>Fases registradas</span>
        </div>
      </article>
      <article>
        <span class="summary-icon active"
          ><i class="pi pi-check-circle"></i
        ></span>
        <div>
          <strong>{{ fmt(summary.active) }}</strong
          ><span>Fases activas</span>
        </div>
      </article>
      <article>
        <span class="summary-icon category"><i class="pi pi-tags"></i></span>
        <div>
          <strong>{{ fmt(summary.categories) }}</strong
          ><span>Categorías utilizadas</span>
        </div>
      </article>
      <article>
        <span class="summary-icon external"><i class="pi pi-send"></i></span>
        <div>
          <strong>{{ fmt(summary.subcontracted) }}</strong
          ><span>Subcontratadas</span>
        </div>
      </article>
    </section>

    <section class="phase-panel">
      <div class="panel-heading">
        <div>
          <h2>Fases de fabricación</h2>
          <p>
            El tiempo se asignará más adelante por producto y proceso, no en
            este catálogo general.
          </p>
        </div>
        <div class="phase-filters">
          <IconField
            ><InputIcon class="pi pi-search" /><InputText
              v-model="search"
              placeholder="Buscar por código, descripción o centro…"
          /></IconField>
          <Select
            v-model="categoryFilter"
            :options="categoryFilterOptions"
            optionLabel="label"
            optionValue="value"
            class="category-filter"
          />
        </div>
      </div>

      <DataTable
        :value="filteredPhases"
        :loading="loading"
        stripedRows
        paginator
        :rows="10"
        :rowsPerPageOptions="[10, 25, 50]"
        dataKey="pkid"
        responsiveLayout="scroll"
        class="phase-table"
      >
        <template #empty
          ><div class="empty-state">
            <i class="pi pi-list-check"></i
            ><strong>No hay fases que coincidan con los filtros.</strong
            ><span
              >Crea una nueva fase o cambia los criterios de búsqueda.</span
            >
          </div></template
        >
        <Column field="code" header="Código" sortable style="width: 135px"
          ><template #body="{ data }"
            ><span class="phase-code">{{ data.code }}</span></template
          ></Column
        >
        <Column
          field="description"
          header="Descripción"
          sortable
          style="min-width: 250px"
          ><template #body="{ data }"
            ><div class="description-cell">
              <strong>{{ data.description }}</strong
              ><small v-if="data.instructions">{{ data.instructions }}</small>
            </div></template
          ></Column
        >
        <Column
          field="category"
          header="Categoría"
          sortable
          style="width: 170px"
          ><template #body="{ data }"
            ><span class="category-pill"
              ><i :class="categoryByCode(data.category).icon"></i
              >{{ categoryByCode(data.category).label }}</span
            ></template
          ></Column
        >
        <Column
          field="workCenter"
          header="Centro de trabajo"
          sortable
          style="min-width: 180px"
          ><template #body="{ data }">{{
            data.workCenter || "—"
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
        <Column header="Modalidad" style="width: 145px"
          ><template #body="{ data }"
            ><span v-if="data.subcontracted" class="mode-tag external-mode"
              ><i class="pi pi-send"></i>Externa</span
            ><span v-else class="mode-tag internal-mode"
              ><i class="pi pi-home"></i>Interna</span
            ></template
          ></Column
        >
        <Column header="Estado" style="width: 105px"
          ><template #body="{ data }"
            ><span
              :class="['status-tag', data.active ? 'is-active' : 'is-inactive']"
              >{{ data.active ? "Activa" : "Inactiva" }}</span
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
                title="Editar fase"
                @click="openEditPhase(data)"
              /><Button
                :icon="data.active ? 'pi pi-eye-slash' : 'pi pi-eye'"
                text
                rounded
                :severity="data.active ? 'danger' : 'success'"
                :title="data.active ? 'Desactivar fase' : 'Activar fase'"
                @click="togglePhase(data)"
              /></div></template
        ></Column>
      </DataTable>
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
        <span><i class="pi pi-info-circle"></i></span>
        <p>
          Una fase es una operación reutilizable. Los tiempos específicos se
          definirán al incorporarla a un proceso y asignarlo a un producto.
        </p>
      </div>
      <div class="phase-form">
        <FloatLabel variant="on"
          ><InputText
            id="phaseCode"
            v-model="form.code"
            maxlength="50"
            :disabled="Boolean(form.pkid)"
            class="w-full"
            autofocus
          /><label for="phaseCode">Código *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputText
            id="phaseDescription"
            v-model="form.description"
            maxlength="145"
            class="w-full"
          /><label for="phaseDescription">Descripción *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><Select
            id="phaseCategory"
            v-model="form.category"
            :options="categories"
            optionLabel="label"
            optionValue="code"
            class="w-full"
            @change="categoryChanged"
          /><label for="phaseCategory">Categoría *</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputText
            id="phaseWorkCenter"
            v-model="form.workCenter"
            maxlength="145"
            class="w-full"
          /><label for="phaseWorkCenter">Centro de trabajo</label></FloatLabel
        >
        <FloatLabel variant="on"
          ><InputNumber
            id="phaseHourlyCost"
            v-model="form.hourlyCost"
            mode="currency"
            currency="EUR"
            locale="es-ES"
            :min="0"
            :maxFractionDigits="4"
            class="w-full"
          /><label for="phaseHourlyCost">Coste por hora</label></FloatLabel
        >
        <label class="check-card"
          ><Checkbox v-model="form.subcontracted" binary /><span
            ><strong>Fase subcontratada</strong
            ><small
              >El trabajo lo realiza normalmente un proveedor externo.</small
            ></span
          ></label
        >
        <FloatLabel variant="on" class="instructions-field"
          ><Textarea
            id="phaseInstructions"
            v-model="form.instructions"
            rows="6"
            maxlength="10000"
            autoResize
            class="w-full"
          /><label for="phaseInstructions"
            >Instrucciones generales</label
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
              :label="form.pkid ? 'Guardar cambios' : 'Crear fase'"
              icon="pi pi-check"
              :loading="saving"
              @click="savePhase"
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
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import FloatLabel from "primevue/floatlabel";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
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

const router = useRouter();
const toast = useToast();
const auth = useAuthStore();
const loading = ref(false);
const saving = ref(false);
const dialogVisible = ref(false);
const search = ref("");
const categoryFilter = ref("ALL");
const phases = ref<Phase[]>([]);
const summary = reactive({
  total: 0,
  active: 0,
  categories: 0,
  subcontracted: 0,
});
const emptyPhase = (): Phase => ({
  pkid: null,
  code: "",
  description: "",
  category: "",
  workCenter: "",
  hourlyCost: null,
  instructions: "",
  subcontracted: false,
  active: true,
});
const form = reactive<Phase>(emptyPhase());
const categories = [
  { code: "PRE", label: "Preparación", icon: "pi pi-cog" },
  { code: "MEC", label: "Mecanizado", icon: "pi pi-wrench" },
  { code: "MON", label: "Montaje", icon: "pi pi-sitemap" },
  { code: "SOL", label: "Soldadura", icon: "pi pi-bolt" },
  { code: "TRA", label: "Tratamiento", icon: "pi pi-sparkles" },
  { code: "MAN", label: "Manipulación", icon: "pi pi-box" },
  { code: "CAL", label: "Calidad", icon: "pi pi-verified" },
  { code: "PRU", label: "Pruebas", icon: "pi pi-check-circle" },
  { code: "SUB", label: "Subcontratación", icon: "pi pi-send" },
  { code: "EMB", label: "Embalaje", icon: "pi pi-inbox" },
];
const categoryFilterOptions = computed(() => [
  { value: "ALL", label: "Todas las categorías" },
  ...categories.map((item) => ({ value: item.code, label: item.label })),
]);
const categoryByCode = (code: string) =>
  categories.find((item) => item.code === code) || {
    code,
    label: code || "Sin categoría",
    icon: "pi pi-tag",
  };
const filteredPhases = computed(() => {
  const term = search.value.trim().toLocaleLowerCase("es");
  return phases.value.filter(
    (item) =>
      (categoryFilter.value === "ALL" ||
        item.category === categoryFilter.value) &&
      (!term ||
        [item.code, item.description, item.workCenter, item.instructions].some(
          (value) =>
            String(value || "")
              .toLocaleLowerCase("es")
              .includes(term),
        )),
  );
});
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

const loadPhases = async () => {
  loading.value = true;
  try {
    const [{ data }, summaryResponse] = await Promise.all([
      axios.get(
        backendUrl("/WebGetManufacturingPhases"),
        auth.portalRequestConfig(),
      ),
      axios.get(
        backendUrl("/WebGetManufacturingPhaseSummary"),
        auth.portalRequestConfig(),
      ),
    ]);
    phases.value = Array.isArray(data) ? data : [];
    Object.assign(summary, summaryResponse.data || {});
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "No se pudieron cargar las fases",
      detail: errorMessage(error, "Revisa la conexión con el servidor."),
      life: 5000,
    });
  } finally {
    loading.value = false;
  }
};
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
    await loadPhases();
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
    await loadPhases();
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
onMounted(loadPhases);
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
.toolbar-icon i {
  font-size: 1.3rem;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 17px 18px;
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
.phase-filters {
  display: flex;
  align-items: center;
  gap: 9px;
}
.phase-filters input {
  width: 310px;
}
.category-filter {
  width: 220px;
}
.phase-table {
  padding: 0 8px 8px;
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
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  padding: 45px;
  color: #7e8796;
}
.empty-state > i {
  font-size: 2rem;
  color: #9cc10a;
}
.empty-state span {
  font-size: 0.82rem;
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
@media (max-width: 1000px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .panel-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .phase-filters {
    width: 100%;
  }
  .phase-filters .p-iconfield,
  .phase-filters input {
    width: 100%;
  }
  .category-filter {
    width: 240px;
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
  .phase-filters {
    align-items: stretch;
    flex-direction: column;
  }
  .category-filter {
    width: 100%;
  }
  .phase-form {
    grid-template-columns: 1fr;
  }
  .instructions-field {
    grid-column: auto;
  }
}
</style>
