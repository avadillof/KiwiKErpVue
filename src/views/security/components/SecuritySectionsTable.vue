<template>
  <div class="sections-content">
    <div v-if="module" class="context-strip">
      <span>Módulo seleccionado</span><strong>{{ module.description }}</strong>
    </div>

    <div v-if="!module" class="empty-state">
      <span class="empty-icon"><i class="pi pi-arrow-left" /></span
      ><strong>Selecciona un módulo</strong>
      <p>Elige un módulo de la primera columna para consultar sus secciones.</p>
    </div>
    <div v-else-if="disabled" class="empty-state empty-state--locked">
      <span class="empty-icon"><i class="pi pi-lock" /></span
      ><strong>Módulo sin acceso</strong>
      <p>Habilita el módulo para configurar sus secciones y permisos.</p>
    </div>
    <div v-else-if="loading" class="empty-state">
      <i class="pi pi-spin pi-spinner loading-icon" /><strong
        >Cargando secciones…</strong
      >
    </div>
    <DataTable
      v-else
      v-model:selection="selected"
      :value="sections"
      selectionMode="single"
      scrollable
      scrollHeight="flex"
      class="sections-table"
      @rowSelect="onSelect"
    >
      <Column header="Secciones disponibles">
        <template #body="{ data }">
          <div class="section-row">
            <span class="section-icon"
              ><i :class="data.icon || 'pi pi-folder'"
            /></span>
            <div>
              <strong>{{ data.name }}</strong
              ><small>{{
                data.description || "Configuración de seguridad"
              }}</small>
            </div>
            <i class="pi pi-angle-right row-arrow" />
          </div>
        </template>
      </Column>
      <template #empty
        ><div class="empty-inline">
          <i class="pi pi-folder-open" />Este módulo no contiene secciones.
        </div></template
      >
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { backendUrl } from "@/services/backendUrl";
import { ref, watch } from "vue";

const props = defineProps<{
  module?: any;
  disabled?: boolean;
  userPk: number;
}>();
const emit = defineEmits<{ select: [section: any] }>();
const selected = ref<any>(null);
const sections = ref<any[]>([]);
const loading = ref(false);
let loadVersion = 0;

watch(
  () => [props.module, props.disabled, props.userPk],
  async () => {
    const module = props.module;
    selected.value = null;
    sections.value = [];
    const version = ++loadVersion;
    if (!module || props.disabled) return;
    loading.value = true;
    try {
      const response = await fetch(
        backendUrl("/WebGetSecurityCategoriesUser"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPk: props.userPk,
            securityPk: module.securityPk,
          }),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (version === loadVersion) sections.value = await response.json();
    } catch (error) {
      console.error("Error al cargar secciones de seguridad:", error);
    } finally {
      if (version === loadVersion) loading.value = false;
    }
  },
  { immediate: true },
);

const onSelect = (event: any) => emit("select", event.data);
</script>

<style scoped>
.sections-content {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.context-strip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 13px 15px;
  border-bottom: 1px solid #e8ecf0;
  background: #fff;
}
.context-strip span {
  color: #8b96a5;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.context-strip strong {
  color: #2d3748;
  font-size: 0.88rem;
  line-height: 1.35;
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
  max-width: 260px;
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
.sections-table {
  min-height: 0;
  flex: 1;
  overflow: hidden;
  padding: 8px;
}
.section-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-icon {
  width: 35px;
  height: 35px;
  flex: 0 0 35px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #668600;
  background: #f0f6df;
}
.section-row div {
  min-width: 0;
  display: flex;
  flex: 1;
  flex-direction: column;
}
.section-row strong {
  color: #293548;
  font-size: 0.88rem;
}
.section-row small {
  margin-top: 2px;
  overflow: hidden;
  color: #8a95a4;
  font-size: 0.73rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-arrow {
  color: #b1bac5;
  font-size: 0.78rem;
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
  padding: 10px;
  border-color: #edf0f3;
}
:deep(.p-datatable-tbody > tr.p-datatable-row-selected) {
  color: inherit;
  background: #f3f8e6;
  box-shadow: inset 3px 0 #9cc10a;
}
</style>
