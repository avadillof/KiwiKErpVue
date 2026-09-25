<template>
  <main class="security-page">
    <header class="security-hero">
      <div class="hero-main">
        <Button
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          rounded
          aria-label="Volver a usuarios"
          @click="volverAlDashboard"
        />
        <span class="hero-icon"><i class="pi pi-shield" /></span>
        <div class="hero-copy">
          <span class="eyebrow">Configuración de acceso</span>
          <h1>Permisos de usuario</h1>
          <p>
            Administra los módulos, secciones y acciones disponibles para este
            usuario.
          </p>
        </div>
      </div>
      <aside class="user-summary" aria-label="Usuario seleccionado">
        <span class="user-avatar">{{ userInitials }}</span>
        <div>
          <small>Usuario seleccionado</small>
          <strong>{{ userName || "Cargando usuario…" }}</strong>
          <span
            >{{ enabledModules }} de {{ modules.length }} módulos
            habilitados</span
          >
        </div>
      </aside>
    </header>

    <div class="autosave-note">
      <i class="pi pi-check-circle" /><span
        >Los cambios se guardan automáticamente.</span
      >
    </div>

    <section class="security-workspace" aria-label="Configuración de permisos">
      <article class="security-panel security-panel--modules">
        <header class="panel-heading">
          <span class="panel-step">1</span>
          <div>
            <span class="panel-kicker">Acceso principal</span>
            <h2>Módulos</h2>
            <p>Activa las áreas disponibles.</p>
          </div>
        </header>
        <SecurityModulesTable
          :modules="modules"
          v-model:selected="selectedModule"
          :userPk="userPk"
          @select="onModuleSelected"
        />
      </article>
      <article class="security-panel">
        <header class="panel-heading">
          <span class="panel-step">2</span>
          <div>
            <span class="panel-kicker">Organización</span>
            <h2>Secciones</h2>
            <p>Selecciona el ámbito de trabajo.</p>
          </div>
        </header>
        <SecuritySectionsTable
          :module="selectedModule"
          :disabled="!moduleEnabled"
          :userPk="userPk"
          @select="onSectionSelected"
        />
      </article>
      <article class="security-panel security-panel--permissions">
        <header class="panel-heading">
          <span class="panel-step">3</span>
          <div>
            <span class="panel-kicker">Acciones permitidas</span>
            <h2>Permisos</h2>
            <p>Define qué puede consultar o modificar.</p>
          </div>
        </header>
        <SecurityPermissionsTable
          :section="selectedSection"
          :disabled="!selectedModule || !selectedModule.active"
          :userPk="userPk"
        />
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { backendUrl } from "@/services/backendUrl";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import SecurityModulesTable from "./components/SecurityModulesTable.vue";
import SecuritySectionsTable from "./components/SecuritySectionsTable.vue";
import SecurityPermissionsTable from "./components/SecurityPermissionsTable.vue";

const userPk = ref(0);
const router = useRouter();
const userName = ref("");
const selectedModule = ref<any>(null);
const selectedSection = ref<any>(null);
const modules = ref<any[]>([]);

const moduleEnabled = computed(() => selectedModule.value?.active === true);
const enabledModules = computed(
  () => modules.value.filter((module) => module.active).length,
);
const userInitials = computed(() => {
  const words = userName.value.trim().split(/\s+/).filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "US"
  );
});

onMounted(async () => {
  let userData = history.state.user;
  if (!userData) {
    const stored = sessionStorage.getItem("temp_user");
    if (stored) userData = JSON.parse(stored);
  }
  if (!userData?.pkid) {
    console.warn("Acceso sin usuario seleccionado. Redirigiendo a usuarios.");
    router.push("/usuarios");
    return;
  }
  userName.value = String(userData.name || userData.userName || "Usuario");
  userPk.value = Number(userData.pkid);
  try {
    const response = await fetch(backendUrl("/WebGetSecurityModulesUser"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pkid: userPk.value }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    modules.value = await response.json();
  } catch (error) {
    console.error("Error al cargar módulos de seguridad:", error);
  }
});

function onModuleSelected(module: any) {
  selectedModule.value = module;
  selectedSection.value = null;
}
function onSectionSelected(section: any) {
  selectedSection.value = section;
}
function volverAlDashboard() {
  router.push({ name: "Frm_Ajustes", query: { tab: "2" } });
}
</script>

<style scoped>
.security-page {
  width: 100%;
  min-height: calc(100dvh - 66px);
  padding: 18px 16px 72px;
  box-sizing: border-box;
  color: #243044;
}
.security-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 22px;
  border: 1px solid #e1e6eb;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 3px 12px rgba(30, 41, 59, 0.04);
}
.hero-main,
.user-summary,
.panel-heading {
  display: flex;
  align-items: center;
}
.hero-main {
  gap: 14px;
  min-width: 0;
}
.hero-icon {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  color: #668600;
  background: #eef6d7;
  font-size: 1.35rem;
}
.hero-copy {
  min-width: 0;
}
.eyebrow,
.panel-kicker {
  color: #6b7a4c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.hero-copy h1 {
  margin: 2px 0 3px;
  font-size: 1.45rem;
  color: #1f2937;
}
.hero-copy p {
  margin: 0;
  color: #697386;
}
.user-summary {
  min-width: 280px;
  gap: 12px;
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}
.user-avatar {
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #769900;
  font-weight: 800;
}
.user-summary div {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.user-summary small {
  color: #7b8797;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.user-summary strong {
  overflow: hidden;
  color: #273142;
  font-size: 0.96rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.user-summary div > span {
  color: #6b7280;
  font-size: 0.8rem;
}
.autosave-note {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 6px;
  color: #627344;
  font-size: 0.8rem;
  font-weight: 600;
}
.security-workspace {
  display: grid;
  grid-template-columns: minmax(360px, 1.05fr) minmax(260px, 0.72fr) minmax(
      390px,
      1.12fr
    );
  gap: 14px;
  height: calc(100dvh - 238px);
  min-height: 540px;
  max-height: 850px;
}
.security-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dfe5eb;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 3px 11px rgba(30, 41, 59, 0.04);
}
.security-panel--permissions {
  border-top: 3px solid #9cc10a;
}
.panel-heading {
  gap: 11px;
  flex: 0 0 auto;
  min-height: 74px;
  padding: 13px 15px;
  border-bottom: 1px solid #e7ebef;
  background: #fbfcfd;
}
.panel-step {
  width: 31px;
  height: 31px;
  flex: 0 0 31px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: #5e7900;
  background: #edf5d8;
  font-weight: 800;
}
.panel-heading h2 {
  margin: 1px 0;
  color: #263244;
  font-size: 1.05rem;
}
.panel-heading p {
  margin: 0;
  color: #7a8594;
  font-size: 0.8rem;
}
@media (max-width: 1180px) {
  .security-workspace {
    grid-template-columns: minmax(320px, 1fr) minmax(240px, 0.75fr) minmax(
        340px,
        1fr
      );
    overflow-x: auto;
  }
}
@media (max-width: 860px) {
  .security-hero {
    align-items: flex-start;
    flex-direction: column;
  }
  .user-summary {
    width: 100%;
    box-sizing: border-box;
  }
  .security-workspace {
    display: flex;
    flex-direction: column;
    height: auto;
    max-height: none;
    overflow: visible;
  }
  .security-panel {
    min-height: 360px;
  }
  .security-panel--permissions {
    min-height: 440px;
  }
}
@media (max-width: 540px) {
  .security-page {
    padding: 10px 8px 54px;
  }
  .security-hero {
    padding: 14px 12px;
  }
  .hero-main {
    align-items: flex-start;
  }
  .hero-copy h1 {
    font-size: 1.2rem;
  }
}
</style>
