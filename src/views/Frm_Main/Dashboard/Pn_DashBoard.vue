<template>
  <main class="dashboard">
    <section class="dashboard-hero">
      <div class="hero-copy">
        <span class="hero-eyebrow"><i class="pi pi-th-large"></i> Espacio de trabajo</span>
        <h1>Panel de control</h1>
        <p>Accede a las áreas de KiwiKERP y continúa con la gestión diaria de tu empresa.</p>
      </div>
    </section>

    <section v-if="recents.length" class="recents-section" aria-label="Módulos recientes">
      <div class="section-heading compact">
        <div><span class="section-kicker">Continuar</span><h2>Accesos recientes</h2></div>
      </div>
      <div class="recents-row">
        <button
          v-for="r in recents"
          :key="r.name"
          type="button"
          class="recent-chip"
          @click="navegarA(r.name)"
        >
          <span class="recent-icon" :style="{ color: r.color }" style="background: #f1f3f6"
            ><i :class="r.icon" /></span
          ><span>{{ r.label }}</span>
        </button>
      </div>
    </section>

    <section class="actions-section" aria-label="Acciones pendientes">
      <div class="section-heading compact">
        <div><span class="section-kicker">Acciones pendientes</span><h2>En espera de tu atención</h2></div>
      </div>
      <div class="actions-grid">
        <button
          v-for="k in actionCards"
          :key="k.key"
          type="button"
          class="action-card"
          :class="{ 'action-card--quiet': !k.value }"
          @click="navegarA(k.route)"
        >
          <span class="action-icon" :style="{ background: k.gradient }"><i :class="k.icon" /></span>
          <span class="action-copy">
            <strong>{{ k.value == null ? "—" : fmt(k.value) }}</strong>
            <span>{{ k.label }}</span>
            <small>{{ k.sub }}</small>
          </span>
          <i class="pi pi-chevron-right action-arrow" />
        </button>
      </div>
    </section>

    <SalesCalendar />
    <CompanySnapshot />
  </main>
</template>

<script lang="ts">
import { defineComponent, watch } from 'vue';
import { DashboardController } from '../../../services/Frm_Main/Dashboard/Pn_DashBoard';
import { useMessagesStore } from '@/stores/messagesStore';
import SalesCalendar from './SalesCalendar.vue';
import CompanySnapshot from './CompanySnapshot.vue';

export default defineComponent({
  name: 'Pn_DashBoard',
  components: { SalesCalendar, CompanySnapshot },
  setup() {
    const { recents, actionCards, fmt, navegarA, refresh } = DashboardController();
    const messagesStore = useMessagesStore();
    watch(
      () => messagesStore.feedVersion,
      () => refresh()
    );
    return { recents, actionCards, fmt, navegarA };
  }
});
</script>

<style scoped>
.dashboard { --kiwi: #9cc10a; --kiwi-dark: #648506; width: 100%; padding: 18px 18px 88px; color: #1f2937; }
.dashboard-hero { position: relative; isolation:isolate; display: flex; align-items: center; justify-content: space-between; min-height: 96px; padding: 15px 24px; overflow: hidden; border: 1px solid #e7edcf; border-radius: 16px; background:#fff; box-shadow: 0 6px 18px rgba(31,41,55,.07); }
.dashboard-hero::after { content:""; position:absolute; z-index:0; width:300px; height:300px; right:20px; top:50%; transform:translateY(-50%); background:url('/logos/logo512.png') center/contain no-repeat; filter:grayscale(1); opacity:.075; pointer-events:none; }
.hero-copy { position: relative; z-index: 1; max-width: 720px; }
.hero-eyebrow,.section-kicker { color: var(--kiwi-dark); font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; }
.dashboard-hero h1 { margin: 5px 0 3px; color: #172033; font-size: clamp(1.5rem,2.5vw,1.85rem); line-height: 1.05; }
.dashboard-hero p { margin: 0; color: #657084; font-size: 1rem; line-height: 1.4; }

.recents-section { margin-top: 22px; }
.section-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 16px; }
.section-heading.compact { margin-bottom: 10px; }
.section-heading h2 { margin: 4px 0 0; color: #253047; font-size: 1.3rem; }
.recents-row { display: flex; flex-wrap: wrap; gap: 10px; }
.recent-chip { display: inline-flex; align-items: center; gap: 9px; padding: 7px 14px 7px 8px; border: 1px solid #e5e9f0; border-radius: 999px; background: #fff; color: #344054; font: inherit; font-size: .88rem; font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(17,24,39,.05); transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease; }
.recent-chip:hover { transform: translateY(-2px); border-color: #cfe0a8; box-shadow: 0 8px 18px rgba(17,24,39,.09); }
.recent-icon { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 50%; font-size: .8rem; }

.actions-section { margin-top: 22px; }
.actions-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 12px; }
.action-card { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1px solid #e3e8d2; border-radius: 12px; background: #fff; text-align: left; cursor: pointer; box-shadow: 0 4px 14px rgba(31,41,55,.05); transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }
.action-card:hover { transform: translateY(-3px); border-color: #cfe0a8; box-shadow: 0 10px 24px rgba(31,41,55,.1); }
.action-card--quiet { opacity: .62; }
.action-icon { display: grid; width: 44px; height: 44px; flex: 0 0 auto; place-items: center; border-radius: 12px; color: #fff; box-shadow: inset 0 1px rgba(255,255,255,.25), 0 4px 10px rgba(38,48,68,.12); }
.action-icon i { font-size: 1.15rem; }
.action-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; }
.action-copy strong { font-size: 1.3rem; line-height: 1.1; color: #172033; font-variant-numeric: tabular-nums; }
.action-copy > span { font-size: .82rem; font-weight: 700; color: #202939; }
.action-copy small { overflow: hidden; color: #7d8797; font-size: .7rem; margin-top: 2px; text-overflow: ellipsis; white-space: nowrap; }
.action-arrow { flex: 0 0 auto; color: #c3cad6; font-size: .75rem; }

@media (max-width: 1400px) { .actions-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 1180px) { .actions-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 720px) {
  .dashboard { padding: 18px 15px 78px; }
  .dashboard-hero { min-height: auto; padding: 27px 24px; }
  .dashboard-hero::after { width: 220px; height: 220px; right: -25px; opacity: .05; }
  .section-heading { align-items: flex-start; flex-direction: column; }
  .actions-grid { grid-template-columns: 1fr; }
}
</style>