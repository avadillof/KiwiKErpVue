<template>
  <div class="permissions-content">
    <div v-if="section" class="context-strip">
      <div>
        <span>Sección seleccionada</span
        ><strong>{{ section.description || section.name }}</strong>
      </div>
      <span class="permission-count"
        >{{ enabledCount }}/{{ permissions.length }} permitidos</span
      >
    </div>

    <div v-if="disabled" class="empty-state empty-state--locked">
      <span class="empty-icon"><i class="pi pi-lock" /></span
      ><strong>Permisos no disponibles</strong>
      <p>Habilita el módulo para gestionar las acciones de sus secciones.</p>
    </div>
    <div v-else-if="!section" class="empty-state">
      <span class="empty-icon"><i class="pi pi-hand-pointer" /></span
      ><strong>Selecciona una sección</strong>
      <p>
        Elige una sección de la columna anterior para consultar sus permisos.
      </p>
    </div>
    <div v-else-if="loading" class="empty-state">
      <i class="pi pi-spin pi-spinner loading-icon" /><strong
        >Cargando permisos…</strong
      >
    </div>
    <DataTable
      v-else
      :value="permissions"
      scrollable
      scrollHeight="flex"
      class="permissions-table"
    >
      <Column header="Permiso / Acción">
        <template #body="{ data }">
          <div class="permission-row">
            <span class="permission-icon"><i class="pi pi-shield" /></span>
            <div>
              <strong>{{ data.description }}</strong
              ><small>{{ data.code }}</small>
            </div>
          </div>
        </template>
      </Column>
      <Column header="Acceso" style="width: 10rem">
        <template #body="{ data }">
          <div class="state-cell">
            <ToggleSwitch
              v-model="data.active"
              :aria-label="`Permiso ${data.description}`"
              @change="changePermissionState(data)"
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
          <i class="pi pi-shield" />Esta sección no contiene permisos.
        </div></template
      >
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
  getSecurityAttributesUser,
  updatePermissionUser,
} from "@/services/Frm_Security/SecurityService";
import { useToast } from "primevue/usetoast";

const props = defineProps<{
  section: any;
  disabled?: boolean;
  userPk: number;
}>();
const toast = useToast();
const permissions = ref<any[]>([]);
const loading = ref(false);
let loadVersion = 0;
const enabledCount = computed(
  () => permissions.value.filter((permission) => permission.active).length,
);

async function loadPermissions(section: any) {
  const version = ++loadVersion;
  permissions.value = [];
  if (!section || props.disabled) return;
  loading.value = true;
  try {
    const result = await getSecurityAttributesUser(
      props.userPk,
      section.categoryPk,
    );
    if (version === loadVersion) permissions.value = result;
  } catch (error) {
    console.error("Error al cargar permisos de seguridad:", error);
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

async function changePermissionState(permission: any) {
  const oldValue = !permission.active;
  try {
    await updatePermissionUser(
      props.userPk,
      permission.attributePk,
      permission.active,
    );
  } catch {
    permission.active = oldValue;
    toast.add({
      severity: "error",
      summary: "No se pudo guardar",
      detail: "No se pudo actualizar el permiso.",
      life: 3000,
    });
  }
}

watch(
  () => [props.section, props.disabled, props.userPk],
  () => loadPermissions(props.section),
  { immediate: true },
);
</script>

<style scoped>
.permissions-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.context-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 15px;
  border-bottom: 1px solid #e8ecf0;
  background: #fff;
}
.context-strip > div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.context-strip div > span {
  color: #8b96a5;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.context-strip strong {
  overflow: hidden;
  color: #2d3748;
  font-size: 0.9rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.permission-count {
  flex: 0 0 auto;
  padding: 5px 8px;
  border-radius: 999px;
  color: #5f7b00;
  background: #eff6db;
  font-size: 0.72rem;
  font-weight: 800;
}
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 32px 22px;
  text-align: center;
}
.empty-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  border-radius: 16px;
  color: #769900;
  background: #f0f6df;
  font-size: 1.35rem;
}
.empty-state--locked .empty-icon {
  color: #8a94a3;
  background: #eef1f4;
}
.empty-state strong {
  color: #344054;
  font-size: 1rem;
}
.empty-state p {
  max-width: 290px;
  margin: 6px 0 0;
  color: #7b8797;
  font-size: 0.84rem;
  line-height: 1.5;
}
.loading-icon {
  margin-bottom: 12px;
  color: #769900;
  font-size: 1.6rem;
}
.permissions-table {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 8px;
}
.permission-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.permission-icon {
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #587100;
  background: #f0f6df;
}
.permission-row div {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.permission-row strong {
  color: #293548;
  font-size: 0.87rem;
  line-height: 1.3;
}
.permission-row small {
  margin-top: 2px;
  color: #98a2b0;
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: 0.7rem;
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
  padding: 28px 12px;
  color: #8993a1;
  font-size: 0.84rem;
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
</style>
