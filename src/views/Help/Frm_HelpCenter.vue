<template>
  <main class="help-center">
    <header class="help-header">
      <div class="help-heading">
        <span class="help-heading-icon"><i class="pi pi-play-circle" aria-hidden="true"></i></span>
        <div>
          <span class="eyebrow">APRENDE CON KIWIKERP</span>
          <h1>Autoayuda</h1>
          <p>Una tarea, un vídeo. Encuentra la respuesta y sigue trabajando.</p>
        </div>
      </div>
      <a :href="userManualUrl" target="_blank" rel="noopener noreferrer" class="manual-link">
        <i class="pi pi-file-pdf" aria-hidden="true"></i> Manual PDF
        <i class="pi pi-external-link" aria-hidden="true"></i>
      </a>
    </header>

    <section class="search-panel" aria-label="Buscar ayuda">
      <label for="help-search">¿Qué necesitas hacer?</label>
      <div class="search-field">
        <i class="pi pi-search" aria-hidden="true"></i>
        <input id="help-search" v-model="search" type="search" placeholder="Busca una tarea, un módulo o una duda…" />
      </div>
      <div class="suggestions">
        <span>Quiero…</span>
        <button v-for="need in needs" :key="need" type="button" :aria-pressed="selectedNeed === need"
          @click="selectedNeed = selectedNeed === need ? '' : need">
          {{ need }}
        </button>
      </div>
    </section>

    <div class="help-layout">
      <aside class="help-sidebar" aria-label="Módulos de ayuda">
        <h2>Explora por módulo</h2>
        <button v-for="category in categories" :key="category" type="button" class="category"
          :class="{ active: selectedModule === category }" :aria-pressed="selectedModule === category"
          @click="selectedModule = category">
          <i :class="category === 'Todos' ? 'pi pi-th-large' : 'pi pi-compass'" aria-hidden="true"></i>
          <span>{{ category }}</span>
          <span class="category-count">{{ categoryCount(category) }}</span>
        </button>
        <div class="sidebar-note">
          <i class="pi pi-lightbulb" aria-hidden="true"></i>
          <strong>A tu ritmo</strong>
          <p>Pausa, vuelve atrás o amplía el vídeo a pantalla completa para seguir cada paso.</p>
        </div>
      </aside>

      <section class="library" aria-labelledby="library-title">
        <div class="library-heading">
          <h2 id="library-title">{{ isFiltered ? 'Resultados de búsqueda' : 'Empieza aquí' }}</h2>
          <span role="status">{{ filteredTutorials.length }} {{ filteredTutorials.length === 1 ? 'tutorial' : 'tutoriales' }}</span>
          <button v-if="isFiltered" type="button" class="text-button" @click="clearFilters">Limpiar filtros</button>
        </div>

        <div v-if="!filteredTutorials.length" class="empty-state">
          <i class="pi pi-search" aria-hidden="true"></i>
          <h3>No encontramos un vídeo para esa búsqueda</h3>
          <p>Prueba con otras palabras o consulta el manual PDF.</p>
          <button type="button" class="primary-button" @click="clearFilters">Ver todos los tutoriales</button>
        </div>

        <div v-else class="tutorial-grid">
          <button v-for="tutorial in filteredTutorials" :key="tutorial.id" type="button" class="tutorial-card"
            :aria-label="`Ver vídeo: ${tutorial.title}`" @click="openTutorial(tutorial)">
            <span class="thumbnail">
              <span class="thumbnail-brand">KiwiKERP <span>· AUTOAYUDA</span></span>
              <span class="thumbnail-title">{{ tutorial.coverTitle }}</span>
              <span class="play-icon"><i class="pi pi-play" aria-hidden="true"></i></span>
              <span class="duration">{{ tutorial.duration }}</span>
            </span>
            <span class="card-body">
              <span class="module-label">{{ tutorial.module }}</span>
              <strong>{{ tutorial.title }}</strong>
              <span class="card-description">{{ tutorial.description }}</span>
              <span class="watch-link">Ver tutorial <i class="pi pi-arrow-right" aria-hidden="true"></i></span>
            </span>
          </button>
        </div>

        <!-- El reproductor se monta solo al elegir un vídeo: no descarga ni reproduce al entrar. -->
        <section v-if="selectedTutorial" ref="playerSection" class="player-section" tabindex="-1"
          aria-labelledby="playing-title">
          <div class="player-heading">
            <div><span class="eyebrow">ESTÁS VIENDO</span><h2 id="playing-title">{{ selectedTutorial.title }}</h2></div>
            <button type="button" class="text-button" @click="closeTutorial">Cerrar vídeo <i class="pi pi-times" aria-hidden="true"></i></button>
          </div>
          <video :key="selectedTutorial.id" controls playsinline preload="metadata" :src="selectedTutorial.src"
            :aria-label="selectedTutorial.title" @error="videoError = true">
            Tu navegador no permite reproducir este vídeo.
          </video>
          <p v-if="videoError" class="video-error" role="alert">
            No se ha podido cargar el vídeo. <a :href="selectedTutorial.src" target="_blank" rel="noopener noreferrer">Abrir el archivo de vídeo</a>.
          </p>
          <div class="player-details">
            <div><h3>En este vídeo aprenderás a…</h3><ul><li v-for="topic in selectedTutorial.topics" :key="topic">{{ topic }}</li></ul></div>
            <a :href="userManualUrl" target="_blank" rel="noopener noreferrer" class="manual-link"><i class="pi pi-book" aria-hidden="true"></i> Consultar el manual</a>
          </div>
        </section>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { helpTutorials, userManualUrl, type HelpTutorial } from '@/services/Help/tutorials';
import { recordRecent } from '@/services/Frm_Main/recentModules';

const search = ref('');
const selectedModule = ref('Todos');
const selectedNeed = ref('');
const selectedTutorial = ref<HelpTutorial | null>(null);
const videoError = ref(false);
const playerSection = ref<HTMLElement | null>(null);
let opener: HTMLElement | null = null;
const categories = ['Todos', ...new Set(helpTutorials.map((tutorial) => tutorial.module))];
const needs = [...new Set(helpTutorials.flatMap((tutorial) => tutorial.needs))];
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
const isFiltered = computed(() => !!search.value.trim() || selectedModule.value !== 'Todos' || !!selectedNeed.value);
const filteredTutorials = computed(() => {
  const terms = normalize(search.value).split(/\s+/).filter(Boolean);
  return helpTutorials.filter((tutorial) => {
    const content = normalize([tutorial.title, tutorial.description, tutorial.module, ...tutorial.needs, ...tutorial.keywords].join(' '));
    return (selectedModule.value === 'Todos' || tutorial.module === selectedModule.value)
      && (!selectedNeed.value || tutorial.needs.includes(selectedNeed.value))
      && terms.every((term) => content.includes(term));
  });
});

function categoryCount(category: string) {
  return helpTutorials.filter((tutorial) => category === 'Todos' || tutorial.module === category).length;
}

function clearFilters() {
  search.value = '';
  selectedModule.value = 'Todos';
  selectedNeed.value = '';
}

async function openTutorial(tutorial: HelpTutorial) {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  videoError.value = false;
  selectedTutorial.value = tutorial;
  await nextTick();
  playerSection.value?.focus({ preventScroll: true });
  playerSection.value?.scrollIntoView({ behavior: 'auto', block: 'start' });
}

function closeTutorial() {
  // Desmontar el reproductor detiene también el audio al cerrar.
  selectedTutorial.value = null;
  opener?.focus();
}

onMounted(() => {
  recordRecent('Autoayuda');
});
</script>

<style scoped>
.help-center { padding: 24px 28px 88px; color: #253328; font-family: 'Segoe UI', Arial, sans-serif; }
.help-header, .help-heading, .manual-link, .library-heading, .player-heading, .player-details { display: flex; align-items: center; gap: 16px; }
.help-header, .player-heading, .player-details { justify-content: space-between; }
.help-header { flex-wrap: wrap; margin-bottom: 24px; }
.help-heading-icon { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 16px; background: #eef4d8; color: #648506; font-size: 26px; flex-shrink: 0; }
.eyebrow { font-size: 11px; font-weight: 800; letter-spacing: 1.3px; color: #648506; }
h1 { font-size: 28px; margin: 3px 0 5px; letter-spacing: -.6px; }
h2 { font-size: 19px; margin: 0; }
h3 { font-size: 16px; }
p { line-height: 1.6; }
.help-heading p { margin: 0; color: #67726a; font-size: 14px; }
.manual-link { color: #465339; text-decoration: none; padding: 11px 15px; border: 1px solid #dbe3ce; border-radius: 10px; background: white; font-size: 13px; font-weight: 650; width: fit-content; }
.manual-link:hover { background: #f2f6e8; }
.search-panel { padding: 24px; border: 1px solid #dfe7ce; border-radius: 18px; background: linear-gradient(115deg, #f0f6dd, #fafcf5); }
.search-panel > label { display: block; font-size: 22px; font-weight: 700; margin-bottom: 14px; }
.search-field { display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #cad5b5; border-radius: 12px; padding: 0 15px; max-width: 820px; color: #748458; }
.search-field:focus-within { outline: 2px solid #648506; outline-offset: 2px; }
.search-field input { width: 100%; min-width: 0; padding: 15px 0; background: transparent; border: 0; outline: 0; font: inherit; color: #253328; }
.suggestions { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 14px; font-size: 13px; color: #5e6a51; }
button { font: inherit; cursor: pointer; }
.suggestions button { border: 1px solid #d4dfbf; background: #ffffffb8; border-radius: 20px; padding: 7px 12px; color: #43532e; }
.suggestions button[aria-pressed='true'] { background: #e0edb6; border-color: #648506; }
.help-layout { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 28px; margin-top: 28px; }
.help-sidebar h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #788175; margin: 3px 0 15px; }
.category { display: flex; align-items: center; gap: 10px; width: 100%; border: 0; border-radius: 10px; padding: 13px 12px; margin-bottom: 5px; background: transparent; color: #52604b; text-align: left; font-size: 14px; }
.category.active { background: #eaf2d5; color: #405714; font-weight: 700; }
.category-count { margin-left: auto; font-size: 12px; }
.sidebar-note { margin-top: 30px; padding: 18px; border: 1px solid #e3e7dd; border-radius: 12px; background: white; color: #67715f; font-size: 13px; }
.sidebar-note > i { color: #648506; margin-right: 8px; }
.sidebar-note p { margin-bottom: 0; }
.library-heading { flex-wrap: wrap; margin-bottom: 18px; }
.library-heading > span { color: #7a8477; font-size: 13px; }
.text-button { border: 0; background: transparent; color: #567310; font-weight: 650; padding: 8px; font-size: 13px; }
.tutorial-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 310px), 400px)); gap: 22px; }
.tutorial-card { display: block; overflow: hidden; padding: 0; border: 1px solid #e0e5d9; border-radius: 15px; background: white; text-align: left; color: inherit; transition: box-shadow .15s; }
.tutorial-card:hover { box-shadow: 0 8px 24px #30431916; border-color: #a9bf75; }
.thumbnail { position: relative; display: flex; flex-direction: column; justify-content: space-between; aspect-ratio: 16 / 9; padding: 22px; background: radial-gradient(ellipse at top right, #547329, transparent 65%), #243d27; color: white; }
.thumbnail-brand { font-size: 17px; font-weight: 800; letter-spacing: -.4px; color: #c4e05d; }
.thumbnail-brand > span { font-size: 9px; font-weight: 600; letter-spacing: 1px; color: #d9e4cc; }
.thumbnail-title { font-size: 24px; font-weight: 700; line-height: 1.2; max-width: 80%; padding-bottom: 18px; white-space: pre-line; }
.play-icon { position: absolute; right: 22px; top: 44%; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: #9cc10a; color: #253000; }
.duration { position: absolute; right: 12px; bottom: 10px; padding: 3px 6px; background: #162215db; border-radius: 4px; font-size: 12px; }
.card-body { display: flex; flex-direction: column; gap: 10px; padding: 19px; }
.module-label { font-size: 11px; font-weight: 750; color: #648506; text-transform: uppercase; letter-spacing: .7px; }
.card-body > strong { font-size: 17px; line-height: 1.4; }
.card-description { color: #6c7668; font-size: 13px; line-height: 1.55; }
.watch-link { display: flex; align-items: center; gap: 10px; margin-top: 3px; font-size: 13px; font-weight: 700; color: #567310; }
.empty-state { border: 1px dashed #ced9c1; border-radius: 14px; padding: 35px 20px; text-align: center; color: #67715f; }
.primary-button { background: #9cc10a; color: #253000; border: 0; border-radius: 9px; padding: 12px 18px; font-weight: 700; }
.primary-button:hover { background: #8bad09; }
.player-section { margin-top: 28px; border: 1px solid #dce4d2; background: white; border-radius: 15px; overflow: hidden; scroll-margin-top: 20px; }
.player-heading { padding: 20px; flex-wrap: wrap; }
.player-heading h2 { margin-top: 5px; }
video { display: block; width: 100%; max-height: 65vh; background: #111a12; }
.player-details { padding: 0 20px 16px; flex-wrap: wrap; }
.player-details li { margin-bottom: 8px; color: #63705a; font-size: 14px; }
.video-error { padding: 10px 20px; color: #a12a23; }
button:focus-visible, a:focus-visible, .player-section:focus-visible { outline: 3px solid #648506; outline-offset: 3px; }
@media (max-width: 800px) {
  .help-center { padding: 18px 14px 85px; }
  .help-layout { grid-template-columns: minmax(0, 1fr); gap: 18px; }
  .help-sidebar { display: flex; flex-wrap: wrap; gap: 6px; }
  .help-sidebar h2 { width: 100%; margin-bottom: 5px; }
  .category { width: auto; gap: 12px; }
  .sidebar-note { display: none; }
  .search-panel { padding: 18px; }
  .tutorial-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
