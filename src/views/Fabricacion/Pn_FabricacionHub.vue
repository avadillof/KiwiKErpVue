<template>
  <main class="manufacturing-hub">
    <header class="manufacturing-toolbar">
      <div class="toolbar-title">
        <div class="app-icon"><i class="pi pi-cog"></i></div>
        <div>
          <span class="breadcrumb">KiwiKERP / Fabricación</span>
          <h1>Módulo de Fabricación</h1>
        </div>
      </div>
      <Button label="Inicio" icon="pi pi-home" text severity="secondary" @click="router.push({ name: 'Dashboard' })" />
    </header>

    <section class="manufacturing-flow" aria-label="Flujo de fabricación">
      <div class="flow-copy">
        <span>Flujo de fabricación</span>
        <small>De la definición técnica del producto a su fabricación y montaje.</small>
      </div>
      <div class="flow-steps">
        <button type="button" @click="openProducts"><i class="pi pi-box"></i><span>Producto</span></button>
        <i class="pi pi-angle-right"></i>
        <button type="button" @click="openProducts"><i class="pi pi-sitemap"></i><span>Lista de materiales</span></button>
        <i class="pi pi-angle-right"></i>
        <button type="button" @click="openPhases"><i class="pi pi-list-check"></i><span>Fases</span></button>
        <i class="pi pi-angle-right"></i>
        <button type="button" disabled><i class="pi pi-sliders-h"></i><span>Proceso</span></button>
        <i class="pi pi-angle-right"></i>
        <button type="button" disabled><i class="pi pi-wrench"></i><span>Orden</span></button>
      </div>
    </section>

    <section class="kpi-row" aria-label="Indicadores de fabricación">
      <article v-for="item in kpis" :key="item.label" class="kpi-card">
        <span class="kpi-icon" :style="{ background: item.gradient }"><i :class="item.icon"></i></span>
        <span class="kpi-copy"><strong>{{ item.value == null ? '—' : fmt(item.value) }}</strong><span>{{ item.label }}</span><small>{{ item.detail }}</small></span>
      </article>
    </section>

    <section class="app-section">
      <div class="section-title">
        <div><i class="pi pi-cog"></i><h2>Configuración de procesos</h2></div>
        <p>Operaciones reutilizables que definirán cómo se fabrica cada producto.</p>
      </div>
      <div class="app-grid">
        <button class="app-card" type="button" @click="openPhases">
          <span class="app-card-icon phases"><i class="pi pi-list-check"></i></span>
          <span class="app-card-copy"><strong>Maestro de fases</strong><small>Define mecanizado, montaje, soldadura, calidad, pruebas, subcontratación y otras operaciones.</small><span><i class="pi pi-check"></i> Catálogo reutilizable <i class="pi pi-check"></i> Costes y centros</span></span>
          <i class="pi pi-angle-right card-arrow"></i>
        </button>
        <article class="app-card app-card--disabled"><span class="app-card-icon process"><i class="pi pi-sliders-h"></i></span><span class="app-card-copy"><strong>Procesos de fabricación</strong><small>Revisiones, operaciones, dependencias, tiempos y asignación a productos.</small><em>Siguiente etapa</em></span><i class="pi pi-lock card-lock"></i></article>
      </div>
    </section>

    <section class="app-section">
      <div class="section-title">
        <div><i class="pi pi-database"></i><h2>Ingeniería de producto</h2></div>
        <p>Información técnica que define qué se fabrica y con qué componentes.</p>
      </div>
      <div class="app-grid">
        <button class="app-card" type="button" @click="openProducts">
          <span class="app-card-icon products"><i class="pi pi-box"></i></span>
          <span class="app-card-copy"><strong>Productos de fabricación</strong><small>Configura estrategia de suministro, naturaleza, clases y características técnicas.</small><span><i class="pi pi-check"></i> Clasificación técnica <i class="pi pi-check"></i> Parámetros de fabricación</span></span>
          <i class="pi pi-angle-right card-arrow"></i>
        </button>
        <button class="app-card" type="button" @click="openProducts">
          <span class="app-card-icon bom"><i class="pi pi-sitemap"></i></span>
          <span class="app-card-copy"><strong>Listas de materiales</strong><small>Gestiona revisiones, componentes directos, estructuras heredadas y usos de cada pieza.</small><span><i class="pi pi-check"></i> Árbol multinivel <i class="pi pi-check"></i> Reporte corporativo</span></span>
          <i class="pi pi-angle-right card-arrow"></i>
        </button>
      </div>
    </section>

    <section class="app-section">
      <div class="section-title">
        <div><i class="pi pi-forward"></i><h2>Siguientes etapas</h2></div>
        <p>Se activarán sobre la base técnica que ya estamos construyendo.</p>
      </div>
      <div class="app-grid future-grid">
        <article class="app-card app-card--disabled"><span class="app-card-icon orders"><i class="pi pi-wrench"></i></span><span class="app-card-copy"><strong>Órdenes de fabricación</strong><small>Ejecución, consumos, trazabilidad, calidad y certificados.</small><em>Próximamente</em></span><i class="pi pi-lock card-lock"></i></article>
        <article class="app-card app-card--disabled"><span class="app-card-icon assembly"><i class="pi pi-th-large"></i></span><span class="app-card-copy"><strong>Órdenes de montaje</strong><small>Montaje de conjuntos, series, lotes y cierre del producto final.</small><em>Próximamente</em></span><i class="pi pi-lock card-lock"></i></article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import axios from "axios";
import { backendUrl } from "@/services/backendUrl";
import { useAuthStore } from "@/stores/authStore";

const router = useRouter();
const auth = useAuthStore();
const stats = reactive({ manufacturingProducts: null as number | null, productsWithBom: null as number | null, activeBoms: null as number | null, draftBoms: null as number | null });
const fmt = (value: number) => Number(value || 0).toLocaleString("es-ES", { maximumFractionDigits: 0 });
const openProducts = () => router.push({ name: "ProductosFabricacion", query: { from: "fabricacion" } });
const openPhases = () => router.push({ name: "FabricacionFases" });
const kpis = computed(() => [
  { label: "Productos fabricables", value: stats.manufacturingProducts, detail: "Fabricación interna, externa o mixta", icon: "pi pi-box", gradient: "linear-gradient(135deg,#8eaf23,#536d12)" },
  { label: "Productos con formación", value: stats.productsWithBom, detail: "Con lista vigente o en borrador", icon: "pi pi-sitemap", gradient: "linear-gradient(135deg,#38a4d8,#2875b6)" },
  { label: "Listas vigentes", value: stats.activeBoms, detail: "Revisiones activas", icon: "pi pi-check-circle", gradient: "linear-gradient(135deg,#42b99b,#16846e)" },
  { label: "Listas en borrador", value: stats.draftBoms, detail: "Pendientes de completar", icon: "pi pi-file-edit", gradient: "linear-gradient(135deg,#e8a25c,#c96a1e)" },
]);
onMounted(async () => {
  try {
    const { data } = await axios.get(backendUrl("/WebGetManufacturingStatistics"), auth.portalRequestConfig());
    Object.assign(stats, data || {});
  } catch {
    // El panel sigue siendo navegable aunque los indicadores no estén disponibles.
  }
});
</script>

<style scoped>
.manufacturing-hub{width:100%;padding:18px 16px 94px;color:#243044;background:linear-gradient(180deg,#f7faf1 0%,#fff 32%)}
.manufacturing-toolbar{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:15px 20px;border:1px solid #dfe8c8;border-radius:15px;background:#fff;box-shadow:0 6px 18px rgba(31,41,55,.055)}
.manufacturing-toolbar::after{content:"";position:absolute;z-index:0;width:300px;height:300px;right:20px;top:50%;transform:translateY(-50%);background:url('/logos/logo512.png') center/contain no-repeat;filter:grayscale(1);opacity:.075;pointer-events:none}.manufacturing-toolbar>*{position:relative;z-index:1}
.toolbar-title{display:flex;align-items:center;gap:14px}.app-icon{display:grid;width:48px;height:48px;place-items:center;border-radius:12px;color:#fff;background:linear-gradient(135deg,#9cc10a,#536d12);box-shadow:0 7px 16px rgba(83,109,18,.22)}.app-icon i{font-size:1.25rem}.breadcrumb{color:#8a93a2;font-size:.82rem;font-weight:650}.toolbar-title h1{margin:3px 0 0;color:#202939;font-size:1.45rem}
.manufacturing-flow{display:flex;align-items:center;justify-content:space-between;gap:.7rem;margin-top:14px;padding:12px 16px;border:1px solid #dfe8c8;border-left:4px solid #7d9e0b;border-radius:11px;background:#fbfdf7;box-shadow:0 4px 14px rgba(55,75,30,.05)}.flow-copy span,.flow-copy small{display:block}.flow-copy span{color:#44522f;font-size:.86rem;font-weight:800}.flow-copy small{margin-top:.15rem;color:#7d8797;font-size:.75rem}.flow-steps{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:.35rem}.flow-steps>i{color:#aab39d;font-size:.7rem}.flow-steps button{display:flex;align-items:center;gap:.35rem;padding:.45rem .6rem;border:0;border-radius:7px;color:#53623d;background:#f0f5e5;font:inherit;font-size:.75rem;font-weight:700;cursor:pointer}.flow-steps button:disabled{opacity:.52;cursor:default}.flow-steps button:not(:disabled):hover{background:#e7efcf}.flow-steps button i{color:#708d0b}
.kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:16px}.kpi-card{display:flex;align-items:center;gap:14px;padding:14px 16px;border:1px solid #e3e8d2;border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(31,41,55,.05)}.kpi-icon{display:grid;width:46px;height:46px;flex:0 0 auto;place-items:center;border-radius:12px;color:#fff}.kpi-copy{display:flex;min-width:0;flex-direction:column}.kpi-copy strong{font-size:1.35rem;line-height:1.1}.kpi-copy>span{font-size:.82rem;font-weight:700}.kpi-copy small{margin-top:2px;color:#7d8797;font-size:.72rem}
.app-section{margin-top:25px}.section-title{display:flex;align-items:end;justify-content:space-between;gap:24px;margin-bottom:12px}.section-title>div{display:flex;align-items:center;gap:8px}.section-title i{color:#7d9e0b}.section-title h2{margin:0;font-size:1rem}.section-title p{margin:0;color:#8a93a2;font-size:.86rem}.app-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:14px;border:1px solid #dfe4ea;border-radius:14px;background:#f7f9f4}.future-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.app-card{display:flex;align-items:center;gap:15px;min-height:132px;padding:17px 18px;border:1px solid #eef1f4;border-radius:12px;color:inherit;background:#fff;text-align:left;cursor:pointer;box-shadow:0 4px 14px rgba(31,41,55,.05);transition:transform .16s,box-shadow .16s,border-color .16s}.app-card:hover:not(.app-card--disabled){transform:translateY(-3px);border-color:#dceac0;box-shadow:0 10px 24px rgba(31,41,55,.1)}.app-card--disabled{opacity:.58;cursor:default;box-shadow:none}.app-card-icon{display:grid;width:52px;height:52px;flex:0 0 auto;place-items:center;border-radius:12px;color:#fff}.products{background:linear-gradient(135deg,#9cc10a,#719808)}.bom{background:linear-gradient(135deg,#38a4d8,#2875b6)}.process{background:linear-gradient(135deg,#8d78dc,#6250ad)}.orders{background:linear-gradient(135deg,#e8a25c,#c96a1e)}.assembly{background:linear-gradient(135deg,#42b99b,#16846e)}.app-card-copy{display:flex;min-width:0;flex:1;flex-direction:column;gap:5px}.app-card-copy strong{font-size:1.02rem}.app-card-copy small{color:#778192;font-size:.86rem;line-height:1.4}.app-card-copy span{display:flex;flex-wrap:wrap;gap:.35rem .75rem;color:#6e7867;font-size:.7rem}.app-card-copy span i{color:#86a906;font-size:.6rem}.app-card-copy em{align-self:flex-start;padding:3px 7px;border-radius:5px;color:#786a75;background:#eee8ed;font-size:.66rem;font-style:normal;font-weight:800;text-transform:uppercase}.card-arrow{color:#7d9e0b}.card-lock{color:#a3aab5}
@media(max-width:1100px){.kpi-row,.future-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:720px){.manufacturing-hub{padding:12px 10px 84px}.manufacturing-flow{align-items:flex-start;flex-direction:column}.flow-steps{width:100%;justify-content:center}.kpi-row,.app-grid,.future-grid{grid-template-columns:1fr}.section-title{align-items:flex-start;flex-direction:column;gap:5px}}
.phases{background:linear-gradient(135deg,#8d78dc,#6250ad)}
</style>
