<template>
  <div class="modules-table">
    <DataTable
      v-model:selection="selected"
      :value="modules"
      selectionMode="single"
      dataKey="securityPk"
      scrollable
      scrollHeight="flex"
      class="security-data-table"
      @rowSelect="onSelect"
    >
      <Column field="module" header="Módulo">
        <template #body="{ data }">
          <div class="module-cell">
            <span class="module-icon"
              ><i :class="getModuleIcon(data.module)"
            /></span>
            <div>
              <strong>{{ moduleLabel(data.module) }}</strong
              ><small>{{ data.module }}</small>
            </div>
          </div>
        </template>
      </Column>
      <Column
        field="description"
        header="Descripción"
        class="description-column"
      />
      <Column header="Acceso" style="width: 9.5rem">
        <template #body="{ data }">
          <div class="state-cell" @click.stop>
            <ToggleSwitch
              v-model="data.active"
              :aria-label="`Acceso a ${moduleLabel(data.module)}`"
              @click="selectRow(data)"
              @change="changeModuleState(data)"
            />
            <span
              :class="[
                'state-label',
                data.active ? 'state-label--active' : 'state-label--blocked',
              ]"
              >{{ data.active ? "Permitido" : "Denegado" }}</span
            >
          </div>
        </template>
      </Column>
      <template #empty
        ><div class="empty-inline">
          <i class="pi pi-shield" /><span>No hay módulos configurados.</span>
        </div></template
      >
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { updateModuleUser } from "@/services/Frm_Security/SecurityService";
import { useToast } from "primevue/usetoast";

interface SecurityModule {
  securityPk: number;
  module: string;
  description: string;
  active: boolean;
}

const props = defineProps<{
  modules: SecurityModule[];
  selected: SecurityModule | null;
  userPk: number;
}>();
const selected = defineModel<SecurityModule | null>("selected");
const emit = defineEmits<{ select: [module: SecurityModule] }>();
const toast = useToast();

const moduleNames: Record<string, string> = {
  ENTITIES: "Entidades",
  PRODUCTS: "Productos",
  SALES: "Ventas",
  PURCHASES: "Compras",
  REPORTING: "Informes",
  TASKS: "Tareas",
  SYSTEM: "Sistema",
  SITES: "Sitios",
  MANUFACTER: "Fabricación",
  MESSAGES: "Mensajes",
  DOCUMENTUM: "Documentos",
  INVENTARY: "Inventario",
};
const moduleIcons: Record<string, string> = {
  ENTITIES: "pi pi-building",
  SALES: "pi pi-shopping-cart",
  PRODUCTS: "pi pi-box",
  PURCHASES: "pi pi-wallet",
  REPORTING: "pi pi-chart-bar",
  TASKS: "pi pi-list-check",
  SITES: "pi pi-bullseye",
  MANUFACTER: "pi pi-hammer",
  MESSAGES: "pi pi-comments",
  DOCUMENTUM: "pi pi-folder",
  INVENTARY: "pi pi-barcode",
  SYSTEM: "pi pi-cog",
};

const moduleLabel = (code: string) => moduleNames[code] || code;
const getModuleIcon = (code: string) => moduleIcons[code] || "pi pi-th-large";
const onSelect = (event: any) => emit("select", event.data);

async function changeModuleState(module: SecurityModule) {
  const oldValue = !module.active;
  try {
    await updateModuleUser(props.userPk, module.securityPk, module.active);
  } catch {
    module.active = oldValue;
    toast.add({
      severity: "error",
      summary: "No se pudo guardar",
      detail: "No se pudo actualizar el acceso al módulo.",
      life: 3000,
    });
  }
}

function selectRow(module: SecurityModule) {
  selected.value = module;
  emit("select", module);
}
</script>

<style scoped>
.modules-table {
  min-height: 0;
  flex: 1;
  display: flex;
  padding: 8px;
}
.security-data-table {
  min-height: 0;
  flex: 1;
  overflow: hidden;
}
.module-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 130px;
}
.module-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #668600;
  background: #f0f6df;
}
.module-cell div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.module-cell strong {
  color: #263244;
  font-size: 0.9rem;
}
.module-cell small {
  margin-top: 1px;
  color: #9aa4b2;
  font-size: 0.68rem;
  letter-spacing: 0.04em;
}
.state-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.state-label {
  min-width: 60px;
  font-size: 0.72rem;
  font-weight: 700;
}
.state-label--active {
  color: #5d7c00;
}
.state-label--blocked {
  color: #9a4c4c;
}
.empty-inline {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 30px;
  color: #8993a1;
}
:deep(.p-datatable-table-container) {
  height: 100%;
}
:deep(.p-datatable-thead > tr > th) {
  padding: 10px 12px;
  color: #697386;
  background: #f7f9fb;
  border-color: #e8ecf0;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
:deep(.p-datatable-tbody > tr > td) {
  padding: 9px 12px;
  border-color: #edf0f3;
}
:deep(.p-datatable-tbody > tr.p-datatable-row-selected) {
  color: inherit;
  background: #f3f8e6;
  box-shadow: inset 3px 0 #9cc10a;
}
:deep(.description-column) {
  color: #697386;
  font-size: 0.85rem;
  line-height: 1.35;
}
</style>
