<template>
  <main class="dashboard">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <span class="hero-eyebrow"><i class="pi pi-th-large"></i> Espacio de trabajo</span>
        <h1>Panel de control</h1>
        <p>Accede a las áreas de KiwiKERP y continúa con la gestión diaria de tu empresa.</p>
      </div>
    </section>

    <section class="modules-section" aria-labelledby="modules-title">
      <div class="section-heading">
        <div><span class="section-kicker">Módulos</span><h2 id="modules-title">¿Por dónde quieres empezar?</h2></div>
        <span class="module-counter">{{ modulosVisibles.length }} módulos visibles</span>
      </div>

      <div class="module-grid">
        <article v-for="modulo in modulosVisibles" :key="modulo.id" class="module-card"
          :class="{ 'module-card--disabled': !modulo.disponible }"
          :style="{ '--module-color': modulo.colorIcono, '--module-bg': modulo.bgIcono }"
          :tabindex="modulo.disponible ? 0 : -1" :role="modulo.disponible ? 'button' : undefined"
          @click="navegarA(modulo.ruta, modulo.disponible)"
          @keydown.enter="navegarA(modulo.ruta, modulo.disponible)">
          <div class="card-accent"></div>
          <div class="card-header">
            <div class="module-icon"><i :class="modulo.icono"></i></div>
            <span class="status-pill" :class="{ 'status-pill--soon': !modulo.disponible }">
              <i :class="modulo.disponible ? 'pi pi-check-circle' : 'pi pi-clock'"></i>
              {{ modulo.disponible ? 'Disponible' : 'Próximamente' }}
            </span>
          </div>
          <div class="card-body">
            <h3>{{ modulo.nombre }}</h3>
            <p>{{ modulo.descripcion }}</p>
            <div class="feature-list">
              <span v-for="funcionalidad in modulo.funcionalidades" :key="funcionalidad">
                <i class="pi pi-check"></i>{{ funcionalidad }}
              </span>
            </div>
          </div>
          <div class="card-footer">
            <span>{{ modulo.disponible ? 'Abrir módulo' : 'En preparación' }}</span>
            <i :class="modulo.disponible ? 'pi pi-arrow-right' : 'pi pi-lock'"></i>
          </div>
        </article>
      </div>
    </section>

    <section class="quick-view quick-view--available" role="button" tabindex="0" @click="navegarA('Ventas')" @keydown.enter="navegarA('Ventas')">
      <div class="quick-icon"><i class="pi pi-chart-bar"></i></div>
      <div><h2>Indicadores comerciales</h2><p>Consulta los widgets actualizados de entidades, artículos, presupuestos, pedidos, albaranes y facturas desde el módulo de Ventas. Lista de precios muestra las tarifas y reglas guardadas. La entrega, la facturación y el cobro se siguen por separado; las facturas permiten consultar sus vencimientos.</p></div>
      <span class="available-link">Abrir Ventas <i class="pi pi-arrow-right"></i></span>
    </section>
  </main>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DashboardController } from '../../../services/Frm_Main/Dashboard/Pn_DashBoard';

export default defineComponent({
  name: 'Pn_DashBoard',
  setup() {
    const { modulosVisibles, navegarA } = DashboardController();
    return { modulosVisibles, navegarA };
  }
});
</script>

<style scoped>
.dashboard { --kiwi: #9cc10a; --kiwi-dark: #648506; width: 100%; padding: 18px 16px 92px; color: #1f2937; }
.dashboard-hero { position: relative; isolation:isolate; display: flex; align-items: center; justify-content: space-between; min-height: 96px; padding: 15px 24px; overflow: hidden; border: 1px solid #e7edcf; border-radius: 16px; background:#fff; box-shadow: 0 6px 18px rgba(31,41,55,.07); }
.dashboard-hero::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.hero-copy { position: relative; z-index: 1; max-width: 720px; }
.hero-eyebrow,.section-kicker { color: var(--kiwi-dark); font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; }
.dashboard-hero h1 { margin: 5px 0 3px; color: #172033; font-size: clamp(1.5rem,2.5vw,1.85rem); line-height: 1.05; }
.dashboard-hero p { margin: 0; color: #657084; font-size: 1rem; line-height: 1.4; }
.modules-section { margin-top: 34px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
.section-heading h2 { margin: 5px 0 0; color: #253047; font-size: 1.45rem; }
.module-counter { padding: 7px 12px; border-radius: 999px; color: #667085; background: #eef1f5; font-size: .88rem; font-weight: 700; }
.module-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(275px,1fr)); gap: 20px; }
.module-card { position: relative; display: flex; min-height: 330px; flex-direction: column; overflow: hidden; border: 1px solid #e5e9f0; border-radius: 18px; background: #fff; box-shadow: 0 5px 18px rgba(17,24,39,.055); cursor: pointer; transition: transform 180ms ease,box-shadow 180ms ease,border-color 180ms ease; }
.module-card:hover,.module-card:focus-visible { transform: translateY(-5px); border-color: var(--module-color); box-shadow: 0 16px 35px rgba(17,24,39,.11); outline: none; }
.module-card--disabled { cursor: default; filter: saturate(.55); }
.module-card--disabled:hover { transform: none; border-color: #e5e9f0; box-shadow: 0 5px 18px rgba(17,24,39,.055); }
.card-accent { height: 5px; background: var(--module-color); }
.card-header { display: flex; align-items: center; justify-content: space-between; padding: 24px 24px 0; }
.module-icon { display: grid; width: 52px; height: 52px; place-items: center; border-radius: 15px; color: var(--module-color); background: var(--module-bg); }
.module-icon i { font-size: 1.45rem; }
.status-pill { display: inline-flex; align-items: center; gap: 5px; padding: 6px 9px; border-radius: 999px; color: #497006; background: #f1f8d9; font-size: .76rem; font-weight: 800; text-transform: uppercase; }
.status-pill--soon { color: #7a8290; background: #f0f2f5; }
.card-body { flex: 1; padding: 19px 24px 22px; }
.card-body h3 { margin: 0 0 9px; color: #202a3d; font-size: 1.35rem; }
.card-body>p { min-height: 66px; margin: 0; color: #697386; font-size: 1rem; line-height: 1.55; }
.feature-list { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 18px; }
.feature-list span { display: inline-flex; align-items: center; gap: 5px; padding: 5px 8px; border-radius: 7px; color: #596275; background: #f6f7f9; font-size: .82rem; font-weight: 600; }
.feature-list i { color: var(--module-color); font-size: .62rem; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding: 15px 24px; border-top: 1px solid #edf0f4; color: var(--module-color); background: #fbfcfd; font-size: .92rem; font-weight: 800; }
.quick-view { display: flex; align-items: center; gap: 18px; margin-top: 26px; padding: 22px 26px; border: 1px dashed #ced5df; border-radius: 16px; background: rgba(255,255,255,.62); }
.quick-view--available{border-style:solid;border-color:#dfe8c8;background:#fbfdf7;cursor:pointer;transition:transform 160ms ease,box-shadow 160ms ease}.quick-view--available:hover,.quick-view--available:focus-visible{transform:translateY(-2px);box-shadow:0 8px 20px rgba(31,41,55,.07);outline:2px solid #9cc10a;outline-offset:2px}
.quick-icon { display: grid; width: 46px; height: 46px; flex: 0 0 auto; place-items: center; border-radius: 13px; color: var(--kiwi-dark); background: #f2f8d9; }
.quick-view h2 { margin: 0 0 4px; color: #344054; font-size: 1rem; }
.quick-view p { margin: 0; color: #8a94a5; font-size: .92rem; }
.coming-soon { margin-left: auto; padding: 6px 10px; border-radius: 8px; color: #7b8494; background: #eef1f5; font-size: .72rem; font-weight: 700; }
.available-link{display:inline-flex;align-items:center;gap:.45rem;margin-left:auto;padding:7px 11px;border-radius:8px;color:#55730b;background:#edf5d9;font-size:.76rem;font-weight:800;white-space:nowrap}
@media (max-width:720px) { .dashboard { padding: 18px 16px 82px; } .dashboard-hero { min-height: auto; padding: 27px 24px; } .dashboard-hero::after { width:220px; height:220px; right:-25px; opacity:.05; }.section-heading { align-items: flex-start; flex-direction: column; } .module-grid { grid-template-columns: 1fr; } .quick-view { align-items: flex-start; } .coming-soon { display: none; } }
</style>
