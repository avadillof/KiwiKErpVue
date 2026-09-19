<template>
  <Dialog v-model:visible="visible" modal header="Búsqueda global" class="kiwik-dialog" :style="{ width: 'min(560px,95vw)', maxHeight: '78vh' }" :contentStyle="{ overflow: 'auto' }" @hide="q = ''">
    <template #header>
      <span style="display:flex;align-items:center;gap:10px;font-weight:700"><i class="pi pi-search"></i> Búsqueda global</span>
    </template>

    <div class="global-search">
      <div class="global-search__input-wrap">
        <i class="pi pi-search global-search__input-icon"></i>
        <InputText v-model="q" placeholder="Buscar módulos y páginas…" class="global-search__input" autofocus />
        <kbd class="global-search__kbd">ESC</kbd>
      </div>

      <div v-if="!q" class="global-search__section">
        <p class="global-search__section-title">Módulos recientes</p>
        <button v-for="r in recentItems" :key="'recent-' + r.name" type="button" class="global-search__item global-search__item--recent" @click="go(r.name, true)">
          <span class="global-search__item-icon" :style="{ color: r.color }"><i :class="r.icon"></i></span>
          <span class="global-search__item-label">{{ r.label }}</span>
          <span class="global-search__item-tag">Reciente</span>
        </button>
        <p v-if="!recentItems.length" class="global-search__empty">Aún no hay módulos visitados.</p>

        <p class="global-search__section-title" style="margin-top:14px">Todos los módulos</p>
        <button v-for="m in visibleModules" :key="'all-' + m.id" type="button" class="global-search__item" @click="go(m.ruta, false)">
          <span class="global-search__item-icon" :style="{ color: m.colorIcono }"><i :class="m.icono"></i></span>
          <span class="global-search__item-label">{{ m.nombre }}</span>
          <span v-if="!m.disponible" class="global-search__item-tag global-search__item-tag--soon">Próximamente</span>
        </button>
      </div>

      <div v-else class="global-search__section">
        <p class="global-search__section-title">Módulos</p>
        <template v-if="filteredModules.length">
          <button v-for="m in filteredModules" :key="'match-' + m.id" type="button" class="global-search__item" @click="go(m.ruta, m.disponible)">
            <span class="global-search__item-icon" :style="{ color: m.colorIcono }"><i :class="m.icono"></i></span>
            <span class="global-search__item-label">{{ m.nombre }}</span>
            <span class="global-search__item-desc">{{ m.descripcion }}</span>
          </button>
        </template>
        <p v-else class="global-search__empty">No se encontraron módulos para «{{ q }}».</p>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import { visibleAppModules } from '@/services/Frm_Main/modules';
import { getRecentModules, recordRecent } from '@/services/Frm_Main/recentModules';

const router = useRouter();
const visible = ref(false);
const q = ref('');

const recentItems = computed(() => getRecentModules());
const visibleModules = computed(() => visibleAppModules());
const filteredModules = computed(() => {
  const query = q.value.trim().toLowerCase();
  if (!query) return visibleModules.value;
  return visibleModules.value.filter((m) => m.nombre.toLowerCase().includes(query) || m.descripcion.toLowerCase().includes(query));
});

function go(name: string, enabled: boolean) {
  if (!enabled) return;
  router.push({ name });
  recordRecent(name);
  visible.value = false;
  q.value = '';
}

function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    visible.value = !visible.value;
  }
}

function open() {
  visible.value = true;
}

onMounted(() => window.addEventListener('keydown', onKey));
onUnmounted(() => window.removeEventListener('keydown', onKey));

defineExpose({ open });
</script>

<style scoped>
.global-search__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}
.global-search__input-icon {
  position: absolute;
  left: 10px;
  color: #818a96;
  pointer-events: none;
  font-size: 0.85rem;
}
.global-search__input {
  width: 100%;
  padding-left: 28px !important;
}
.global-search__kbd {
  position: absolute;
  right: 10px;
  border: 1px solid #d7dce5;
  border-radius: 4px;
  padding: 2px 6px;
  font-family: inherit;
  font-size: 0.68rem;
  color: #707882;
  background: #f5f6f8;
}
.global-search__section {
  margin-top: 14px;
}
.global-search__section-title {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7683;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.global-search__item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: #1f2937;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.global-search__item:hover,
.global-search__item:focus-visible {
  background: #f2f6eb;
  border-color: #dce5ca;
  outline: none;
}
.global-search__item-icon {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border-radius: 8px;
  background: #f1f3f6;
  font-size: 0.82rem;
  flex-shrink: 0;
}
.global-search__item-label {
  flex: 1;
  font-weight: 700;
}
.global-search__item-desc {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  color: #6d7581;
}
.global-search__item-tag {
  padding: 2px 7px;
  border-radius: 999px;
  background: #edf5d9;
  color: #55730b;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.global-search__item-tag--soon {
  background: #f0f2f5;
  color: #7a8290;
}
.global-search__empty {
  margin: 0;
  padding: 8px 0;
  color: #818a96;
  font-size: 0.88rem;
}
</style>