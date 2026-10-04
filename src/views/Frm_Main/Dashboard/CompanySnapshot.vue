<template>
  <section class="estado-empresa">
    <div class="widget-head">
      <div>
        <span class="section-kicker">Indicadores por área</span>
        <h2>{{ activeTab === 'summary' ? 'Resumen de la empresa' : activeTab === 'sales' ? 'Resumen de ventas' : 'Resumen de compras' }}</h2>
        <p v-if="loading" class="widget-state"><i class="pi pi-spin pi-spinner"></i> Cargando estadísticas…</p>
        <p v-else-if="error" class="widget-state widget-state--error"><i class="pi pi-exclamation-triangle"></i> {{ error }}</p>
        <p v-else class="widget-state widget-state--ok">{{ activeTab === 'summary' ? 'Ventas y compras claramente diferenciadas' : `Datos del ejercicio · ${activeTab === 'sales' ? 'clientes' : 'proveedores'}` }}</p>
      </div>
      <div class="widget-head__actions">
        <div class="area-tabs" role="tablist" aria-label="Área de indicadores">
          <button v-for="tab in tabs" :key="tab.value" type="button" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value"><i :class="tab.icon" />{{ tab.label }}</button>
        </div>
        <button type="button" class="widget-reload" title="Actualizar" :disabled="loading" @click="reload"><i :class="loading ? 'pi pi-spin pi-refresh' : 'pi pi-refresh'"></i></button>
      </div>
    </div>

    <div v-if="activeTab === 'summary'" class="summary-grid">
      <article class="area-summary area-summary--sales">
        <header><span class="area-summary__icon"><i class="pi pi-shopping-cart" /></span><div><small>VENTAS</small><strong>Actividad con clientes</strong></div></header>
        <div class="summary-kpis">
          <div><small>Facturado</small><strong>{{ money(invoices?.issuedAmount) }}</strong></div>
          <div><small>Pendiente de cobro</small><strong>{{ money(invoices?.pendingAmount) }}</strong></div>
          <div><small>Pedidos</small><strong>{{ integer(orders?.totalCount) }}</strong></div>
          <div><small>Facturas vencidas</small><strong>{{ integer(invoices?.overdueCount) }}</strong></div>
        </div>
      </article>
      <article v-if="canPurchases" class="area-summary area-summary--purchases">
        <header><span class="area-summary__icon"><i class="pi pi-truck" /></span><div><small>COMPRAS</small><strong>Actividad con proveedores</strong></div></header>
        <div class="summary-kpis">
          <div><small>Recepciones</small><strong>{{ integer(purchaseDeliveries?.confirmedCount) }}</strong></div>
          <div><small>Pendientes de facturar</small><strong>{{ integer(purchaseDeliveries?.pendingInvoiceCount) }}</strong></div>
          <div><small>Facturas pendientes</small><strong>{{ integer(purchaseInvoices?.pendingCount) }}</strong></div>
          <div><small>Facturas vencidas</small><strong>{{ integer(purchaseInvoices?.overdueCount) }}</strong></div>
        </div>
      </article>
      <article class="summary-note">
        <i class="pi pi-info-circle" />
        <div><strong>Lectura clara del negocio</strong><span>Los importes de Ventas corresponden a facturas emitidas a clientes. Compras muestra recepciones y facturas recibidas de proveedores.</span></div>
      </article>
    </div>

    <div v-else-if="activeTab === 'sales'" class="widgets-grid">
      <article class="widget-card widget-card--wide">
        <header class="widget-card__head">
          <span>Evolución de ventas</span>
          <small>Documentos comerciales (€)</small>
        </header>
        <div class="widget-legend">
          <span v-for="s in chartLine.series" :key="s.label" class="widget-legend__item">
            <i class="widget-legend__dot" :style="{ background: s.color }"></i>{{ s.label }}
          </span>
        </div>
        <div class="widget-chart">
          <svg class="chart-line" viewBox="0 0 640 200" preserveAspectRatio="xMidYMid meet" role="img">
            <g v-for="g in chartLine.grid" :key="g.y">
              <line :x1="chartLine.padL" :y1="g.y" :x2="chartLine.w - chartLine.padR" :y2="g.y" class="chart-line__grid" />
              <text class="chart-line__y" :x="chartLine.padL - 8" :y="g.y + 3" text-anchor="end">{{ g.label }}</text>
            </g>
            <path v-for="s in chartLine.series" :key="s.label + '-area'" :d="s.area" :fill="s.color" class="chart-line__area"></path>
            <path v-for="s in chartLine.series" :key="s.label + '-line'" :d="s.line" :stroke="s.color" fill="none" class="chart-line__stroke"></path>
            <g v-for="(m, i) in chartLine.labels" :key="m">
              <line v-if="i % 2 === 0" :x1="chartLine.x(i)" :y1="chartLine.padT" :x2="chartLine.x(i)" :y2="chartLine.h - chartLine.padB" class="chart-line__xtick" />
              <text class="chart-line__x" :x="chartLine.x(i)" :y="chartLine.h - 7" text-anchor="middle">{{ m }}</text>
            </g>
          </svg>
        </div>
      </article>

      <article class="widget-card">
        <header class="widget-card__head"><span>Cobros de clientes</span><small>Facturación emitida</small></header>
        <div class="widget-doughnut">
          <div class="widget-chart widget-chart--donut">
            <svg class="chart-donut" viewBox="0 0 140 140" role="img">
              <circle class="chart-donut__track" cx="70" cy="70" :r="donut.radius" fill="none"></circle>
              <circle
                v-for="a in donut.arcs"
                :key="a.label"
                cx="70"
                cy="70"
                :r="donut.radius"
                fill="none"
                :stroke="a.color"
                :stroke-dasharray="a.dash + ' ' + donut.circumference"
                :stroke-dashoffset="a.offset"
                transform="rotate(-90 70 70)"
                class="chart-donut__arc"
              ></circle>
            </svg>
            <span class="widget-doughnut__total">
              <small>Total €</small>
              <strong>{{ money(invoices?.issuedAmount) }}</strong>
            </span>
          </div>
          <div class="widget-bars">
            <div v-for="row in doughnutRows" :key="row.label" class="widget-row">
              <span class="widget-row__label"><i :style="{ background: row.color }"></i>{{ row.label }}</span>
              <strong>{{ money(row.value) }}</strong>
            </div>
          </div>
        </div>
        <div class="widget-yearchart">
          <span class="widget-yearchart__title">Facturación del año pasado ({{ prevYear }})</span>
          <svg class="chart-bars" viewBox="0 0 300 130" preserveAspectRatio="xMidYMid meet" role="img">
            <line :x1="yearBars.padL" :y1="yearBars.h - yearBars.padB" :x2="yearBars.w - yearBars.padR" :y2="yearBars.h - yearBars.padB" class="chart-bars__axis" />
            <g v-for="b in yearBars.bars" :key="b.label">
              <rect
                class="chart-bars__bar"
                :class="{ 'chart-bars__bar--max': b.max }"
                :x="b.x"
                :y="b.y"
                :width="b.w"
                :height="b.h"
                rx="2"
              >
                <title>{{ b.label }}: {{ money(b.value) }}</title>
              </rect>
            </g>
            <text
              v-for="(b, i) in yearBars.bars"
              :key="'x' + b.label"
              class="chart-bars__x"
              :x="b.x + b.w / 2"
              :y="yearBars.h - 5"
              text-anchor="middle"
            >{{ i % 2 === 0 ? b.label : '' }}</text>
          </svg>
        </div>
      </article>

      <article class="widget-card">
        <header class="widget-card__head"><span>Embudo comercial</span><small>Documentos del ejercicio</small></header>
        <div class="widget-funnel">
          <div v-for="f in funnel" :key="f.label" class="funnel-row">
            <span class="funnel-row__label">{{ f.label }}</span>
            <span class="funnel-row__bar"><i :style="{ width: f.pct + '%', background: f.color }"></i></span>
            <strong class="funnel-row__count">{{ f.count }}</strong>
          </div>
        </div>
      </article>

      <article class="widget-card widget-card--wide widget-card--top">
        <header class="widget-card__head"><span>Productos más vendidos</span><small>Facturados en {{ topYear }}</small></header>
        <ol v-if="!topError" class="top-products">
          <li v-for="(p, idx) in topProducts" :key="p.productId ?? p.productName" class="top-product">
            <span class="top-product__rank">{{ idx + 1 }}</span>
            <span class="top-product__body">
              <span class="top-product__name">{{ p.productName }}</span>
              <span class="top-product__bar"><i :style="{ width: barWidth(p.amount) }"></i></span>
            </span>
            <span class="top-product__qty">{{ fmtQty(p.quantity) }}</span>
            <span class="top-product__amount">{{ money(p.amount) }}</span>
          </li>
          <li v-if="topProducts.length === 0" class="top-product top-product--empty">
            Sin ventas facturadas en el ejercicio.
          </li>
        </ol>
        <p v-else class="widget-fallback">No se pudo cargar el ranking de productos.</p>
      </article>
    </div>

    <div v-else class="widgets-grid purchases-grid">
      <article class="widget-card widget-card--wide">
        <header class="widget-card__head"><span>Recepciones mensuales</span><small>Albaranes confirmados</small></header>
        <div class="purchase-bars" aria-label="Recepciones mensuales">
          <div v-for="bar in purchaseMonthlyBars" :key="bar.label" class="purchase-bar"><span><i :style="{ height: bar.height }"><em>{{ bar.value }}</em></i></span><small>{{ bar.label }}</small></div>
        </div>
      </article>
      <article class="widget-card purchase-status-card">
        <header class="widget-card__head"><span>Situación de compras</span><small>Ejercicio {{ topYear }}</small></header>
        <div class="purchase-status-list">
          <div><span><i class="pi pi-file-edit" /> Albaranes en borrador</span><strong>{{ integer(purchaseDeliveries?.draftCount) }}</strong></div>
          <div><span><i class="pi pi-clock" /> Pendientes de facturar</span><strong>{{ integer(purchaseDeliveries?.pendingInvoiceCount) }}</strong></div>
          <div><span><i class="pi pi-receipt" /> Facturados</span><strong>{{ integer(purchaseDeliveries?.invoicedCount) }}</strong></div>
          <div><span><i class="pi pi-wallet" /> Facturas por pagar</span><strong>{{ integer(purchaseInvoices?.pendingCount) }}</strong></div>
          <div class="danger"><span><i class="pi pi-exclamation-triangle" /> Facturas vencidas</span><strong>{{ integer(purchaseInvoices?.overdueCount) }}</strong></div>
        </div>
      </article>
      <article class="widget-card widget-card--wide">
        <header class="widget-card__head"><span>Principales proveedores</span><small>Volumen de albaranes en {{ topYear }}</small></header>
        <ol class="top-products top-suppliers">
          <li v-for="(supplier, idx) in purchaseSuppliers" :key="`${supplier.name}-${idx}`" class="top-product">
            <span class="top-product__rank">{{ idx + 1 }}</span><span class="top-product__body"><span class="top-product__name">{{ supplier.name }}</span><span class="top-product__bar"><i :style="{ width: supplier.width }" /></span></span><span class="top-product__qty">{{ supplier.count }} alb.</span><span class="top-product__amount">{{ money(supplier.amount) }}</span>
          </li>
          <li v-if="!purchaseSuppliers.length" class="top-product top-product--empty">Sin compras registradas en el ejercicio.</li>
        </ol>
      </article>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, ref } from 'vue';
import { useCompanyStats, monthlyRow, MONTHS } from '../../../services/Frm_Main/Dashboard/CompanyStats';
import { useAuthStore } from '@/stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '@/services/Frm_Main/permissions';

const C = {
  quote: '#7c5cbf',
  order: '#d9822b',
  invoice: '#c0446a',
  paid: '#9cc10a',
  pending: '#d97706',
  draft: '#94a3b8'
};

function money(value: unknown): string {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
}

const LINE_W = 640;
const LINE_H = 200;
const PAD_L = 48;
const PAD_R = 14;
const PAD_T = 12;
const PAD_B = 24;

export default {
  name: 'CompanySnapshot',
  setup() {
    const stats = useCompanyStats();
    const auth = useAuthStore();
    const security = useSecurityStore();
    const canPurchases = computed(() => auth.user?.admin === true || security.hasPermission(PERM.PURCHASE_OPTIONS));
    const activeTab = ref<'summary' | 'sales' | 'purchases'>('summary');
    const tabs = computed(() => [
      { value: 'summary' as const, label: 'Resumen', icon: 'pi pi-th-large' },
      { value: 'sales' as const, label: 'Ventas', icon: 'pi pi-shopping-cart' },
      ...(canPurchases.value ? [{ value: 'purchases' as const, label: 'Compras', icon: 'pi pi-truck' }] : [])
    ]);

    const chartLine = computed(() => {
      const row = monthlyRow(stats.quotes.value, stats.orders.value, stats.invoices.value);
      const maxV = Math.max(1, ...row.quotesData, ...row.ordersData, ...row.invoicesData);
      const x = (i: number) => PAD_L + (i * (LINE_W - PAD_L - PAD_R)) / 11;
      const y = (v: number) => PAD_T + (LINE_H - PAD_T - PAD_B) * (1 - v / maxV);
      const series = [
        { label: 'Presupuestos', color: C.quote, data: row.quotesData },
        { label: 'Pedidos', color: C.order, data: row.ordersData },
        { label: 'Facturas', color: C.invoice, data: row.invoicesData }
      ].map((s) => {
        const pts = s.data.map((v, i) => [x(i), y(v)] as [number, number]);
        const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        const baseY = LINE_H - PAD_B;
        const area = `${line} L${pts[pts.length - 1][0].toFixed(1)} ${baseY} L${pts[0][0].toFixed(1)} ${baseY} Z`;
        return { label: s.label, color: s.color, line, area };
      });
      const grid = [0, 0.25, 0.5, 0.75, 1].map((f) => {
        const amount = maxV * f;
        const raw = money(amount);
        const label = raw.length > 9 ? `${Math.round(amount / 1000)} K€` : raw;
        return { y: +y(amount).toFixed(1), label };
      });
      return {
        w: LINE_W,
        h: LINE_H,
        padL: PAD_L,
        padR: PAD_R,
        padT: PAD_T,
        padB: PAD_B,
        labels: row.labels,
        series,
        grid,
        x
      };
    });

    const doughnutRows = computed(() => {
      const inv = stats.invoices.value;
      return [
        { label: 'Cobrado', value: Number(inv?.paidAmount ?? 0), color: C.paid },
        { label: 'Pendiente de cobro', value: Number(inv?.pendingAmount ?? 0), color: C.pending },
        { label: 'Borradores', value: Number(inv?.draftAmount ?? 0), color: C.draft }
      ];
    });

    const donut = computed(() => {
      const slices = doughnutRows.value;
      const total = slices.reduce((a, s) => a + s.value, 0);
      const radius = 52;
      const circumference = 2 * Math.PI * radius;
      let acc = 0;
      const arcs = slices
        .filter((s) => s.value > 0 && total > 0)
        .map((s) => {
          const frac = s.value / total;
          const arc = { label: s.label, color: s.color, dash: +(frac * circumference).toFixed(2), offset: +(-acc * circumference).toFixed(2) };
          acc += frac;
          return arc;
        });
      return { radius, circumference, arcs, hasData: total > 0 };
    });

    const YEAR_W = 300;
    const YEAR_H = 130;
    const YEAR_PAD_L = 2;
    const YEAR_PAD_R = 2;
    const YEAR_PAD_B = 18;
    const YEAR_PAD_T = 4;

    const yearBars = computed(() => {
      const monthly = (stats.prevInvoices.value?.monthly as number[] | undefined) ?? new Array(12).fill(0);
      const maxV = Math.max(...monthly, 1);
      const innerW = YEAR_W - YEAR_PAD_L - YEAR_PAD_R;
      const gap = 3;
      const bw = (innerW - gap * 11) / 12;
      const bars = monthly.map((v, i) => {
        const h = maxV > 0 ? (v / maxV) * (YEAR_H - YEAR_PAD_T - YEAR_PAD_B) : 0;
        const x = YEAR_PAD_L + i * (bw + gap);
        const y = YEAR_H - YEAR_PAD_B - h;
        return {
          x: +x.toFixed(1),
          y: +y.toFixed(1),
          w: +bw.toFixed(1),
          h: +h.toFixed(1),
          max: v > 0 && v >= maxV && maxV > 1,
          label: MONTHS[i],
          value: v
        };
      });
      return { w: YEAR_W, h: YEAR_H, padL: YEAR_PAD_L, padR: YEAR_PAD_R, padB: YEAR_PAD_B, bars };
    });

    const funnel = computed(() => {
      const rows = [
        { label: 'Presupuestos', count: Number(stats.quotes.value?.totalCount ?? 0), color: C.quote },
        { label: 'Pedidos', count: Number(stats.orders.value?.totalCount ?? 0), color: C.order },
        { label: 'Facturas', count: Number(stats.invoices.value?.issuedCount ?? 0), color: C.invoice }
      ];
      const max = Math.max(1, ...rows.map((r) => r.count));
      return rows.map((r) => ({ ...r, pct: Math.max(2, Math.round((r.count / max) * 100)) }));
    });

    const maxTopAmount = computed(() =>
      stats.topProducts.value.reduce((acc, p) => Math.max(acc, Number(p.amount ?? 0)), 0)
    );

    function fmtQty(q: unknown): string {
      return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(q ?? 0));
    }

    function barWidth(amount: unknown): string {
      const max = maxTopAmount.value;
      if (!max) return '0%';
      const pct = Math.round((Number(amount ?? 0) / max) * 100);
      return `${Math.max(3, pct)}%`;
    }

    function integer(value: unknown): string {
      return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(value ?? 0));
    }

    const purchaseMonthlyBars = computed(() => {
      const values = Array.from({ length: 12 }, (_, i) => Number(stats.purchaseDeliveries.value?.monthlyConfirmed?.[i] ?? 0));
      const max = Math.max(1, ...values);
      return MONTHS.map((label, index) => ({ label, value: values[index], height: `${Math.max(values[index] ? 8 : 2, Math.round((values[index] / max) * 100))}%` }));
    });

    const purchaseSuppliers = computed(() => {
      const rows = Array.isArray(stats.purchaseDeliveries.value?.topSuppliers) ? stats.purchaseDeliveries.value.topSuppliers : [];
      const max = Math.max(1, ...rows.map((row: any) => Number(row.amount ?? 0)));
      return rows.map((row: any) => ({ ...row, width: `${Math.max(3, Math.round((Number(row.amount ?? 0) / max) * 100))}%` }));
    });

    return {
      ...stats,
      chartLine,
      doughnutRows,
      donut,
      yearBars,
      funnel,
      fmtQty,
      barWidth,
      money,
      integer,
      activeTab,
      tabs,
      purchaseMonthlyBars,
      purchaseSuppliers,
      canPurchases
    };
  }
};
</script>

<style scoped>
.estado-empresa { margin-top: 26px; }
.section-kicker { color: #648506; font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.widget-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.widget-head__actions { display: flex; align-items: center; gap: 10px; }
.area-tabs { display: inline-flex; gap: 4px; padding: 4px; border: 1px solid #e2e7ed; border-radius: 11px; background: #f5f7f9; }
.area-tabs button { display: inline-flex; align-items: center; gap: 7px; padding: 7px 12px; border: 0; border-radius: 8px; background: transparent; color: #687386; font: inherit; font-size: .78rem; font-weight: 750; cursor: pointer; }
.area-tabs button:hover { color: #344054; background: #fff; }
.area-tabs button.active { color: #344600; background: #fff; box-shadow: 0 2px 7px rgba(17,24,39,.09); }
.area-tabs button.active:last-child { color: #914c13; }
.widget-head h2 { margin: 4px 0 0; color: #253047; font-size: 1.3rem; }
.widget-state { margin: 6px 0 0; color: #8a93a3; font-size: .78rem; }
.widget-state--error { color: #b91c1c; }
.widget-state--ok { color: #6f8f0a; }
.widget-reload { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid #e2e6ee; border-radius: 9px; background: #fff; color: #5a6472; cursor: pointer; font-size: .9rem; transition: border-color .15s, background .15s; }
.widget-reload:hover { border-color: #9cc10a; background: #f6f9ef; }
.widget-reload:disabled { opacity: .55; cursor: default; }

.summary-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.area-summary { overflow: hidden; padding: 18px; border: 1px solid #e5e9f0; border-radius: 16px; background: #fff; box-shadow: 0 5px 16px rgba(17,24,39,.05); }
.area-summary--sales { border-top: 4px solid #9cc10a; }
.area-summary--purchases { border-top: 4px solid #dc7c22; }
.area-summary header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.area-summary header > div { display: flex; flex-direction: column; gap: 2px; }
.area-summary header small { color: #8791a0; font-size: .68rem; font-weight: 850; letter-spacing: .1em; }
.area-summary header strong { color: #253047; font-size: 1rem; }
.area-summary__icon { display: grid; width: 42px; height: 42px; place-items: center; border-radius: 11px; background: #eef5dc; color: #648506; }
.area-summary--purchases .area-summary__icon { background: #fbe9d7; color: #c96a1e; }
.summary-kpis { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.summary-kpis > div { padding: 12px; border-radius: 10px; background: #f7f9fb; }
.area-summary--purchases .summary-kpis > div { background: #fff8f1; }
.summary-kpis small, .summary-kpis strong { display: block; }
.summary-kpis small { color: #7d8797; font-size: .72rem; }
.summary-kpis strong { margin-top: 3px; color: #253047; font-size: 1.08rem; font-variant-numeric: tabular-nums; }
.summary-note { grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; padding: 13px 16px; border: 1px solid #dfe7cc; border-radius: 12px; background: #f8faF2; color: #5d6675; }
.summary-note > i { color: #789b08; font-size: 1.1rem; }
.summary-note > div { display: flex; flex-direction: column; gap: 2px; }
.summary-note strong { color: #344054; font-size: .82rem; }
.summary-note span { font-size: .75rem; line-height: 1.4; }

.widgets-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.widget-card { display: flex; flex-direction: column; padding: 16px 18px; border: 1px solid #e5e9f0; border-radius: 16px; background: #fff; box-shadow: 0 5px 16px rgba(17,24,39,.05); }
.widget-card--wide { grid-column: span 2; }
.widget-card__head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
.widget-card__head span { color: #39435a; font-size: .9rem; font-weight: 800; }
.widget-card__head small { color: #98a0ad; font-size: .7rem; }
.widget-legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 12px 0 6px; }
.widget-legend__item { display: inline-flex; align-items: center; gap: 6px; color: #5d6675; font-size: .76rem; font-weight: 700; }
.widget-legend__dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.widget-chart { position: relative; width: 100%; margin-top: 8px; }
.widget-chart--donut { display: grid; place-items: center; padding: 6px 0; }
.chart-line { width: 100%; height: auto; }
.chart-line__grid { stroke: #e8ecf3; stroke-width: 1; }
.chart-line__y { fill: #9aa3b1; font-size: 10px; }
.chart-line__x { fill: #9aa3b1; font-size: 9px; }
.chart-line__xtick { stroke: #e8ecf3; stroke-width: 1; }
.chart-line__area { opacity: .08; }
.chart-line__stroke { stroke-width: 2; }

.widget-doughnut { display: flex; align-items: center; gap: 18px; margin-top: 8px; }
.chart-donut { width: 140px; height: 140px; }
.chart-donut__track { stroke: #eef1f6; stroke-width: 14; }
.chart-donut__arc { stroke-width: 14; stroke-linecap: butt; transition: stroke-dasharray .4s ease, stroke-dashoffset .4s ease; }
.widget-doughnut__total { position: absolute; display: flex; flex-direction: column; gap: 2px; align-items: center; }
.widget-doughnut__total small { color: #98a0ad; font-size: .68rem; letter-spacing: .04em; text-transform: uppercase; }
.widget-doughnut__total strong { color: #344054; font-size: .95rem; font-variant-numeric: tabular-nums; }
.widget-bars { display: flex; flex: 1; flex-direction: column; gap: 10px; }
.widget-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.widget-row__label { display: inline-flex; align-items: center; gap: 7px; color: #5d6675; font-size: .76rem; font-weight: 700; }
.widget-row__label i { width: 8px; height: 8px; border-radius: 50%; }
.widget-row strong { color: #344054; font-size: .82rem; font-variant-numeric: tabular-nums; }

.widget-yearchart { display: flex; flex-direction: column; gap: 8px; margin-top: auto; padding-top: 14px; border-top: 1px dashed #e8ecf3; }
.widget-yearchart__title { color: #98a0ad; font-size: .68rem; font-weight: 800; letter-spacing: .05em; text-transform: uppercase; }
.chart-bars { width: 100%; height: auto; }
.chart-bars__axis { stroke: #e8ecf3; stroke-width: 1; }
.chart-bars__bar { fill: #dde6f3; transition: fill .15s ease, opacity .15s ease; }
.chart-bars__bar:hover { opacity: .8; fill: #c0446a; }
.chart-bars__bar--max { fill: #c0446a; }
.chart-bars__x { fill: #9aa3b1; font-size: 8px; }

.widget-funnel { display: flex; flex-direction: column; gap: 12px; margin-top: 14px; }
.funnel-row { display: grid; grid-template-columns: 92px 1fr 34px; align-items: center; gap: 10px; }
.funnel-row__label { color: #5d6675; font-size: .78rem; font-weight: 700; }
.funnel-row__bar { display: block; height: 10px; overflow: hidden; border-radius: 999px; background: #f1f3f7; }
.funnel-row__bar i { display: block; height: 100%; border-radius: 999px; }
.funnel-row__count { color: #253047; font-size: .85rem; font-weight: 800; text-align: right; font-variant-numeric: tabular-nums; }

.widget-fallback { margin: 12px 0; color: #98a0ad; font-size: .8rem; }

.purchase-bars { display: flex; align-items: end; gap: 8px; height: 205px; margin-top: 15px; padding: 12px 8px 0; border-bottom: 1px solid #e5e9f0; }
.purchase-bar { display: flex; min-width: 0; height: 100%; flex: 1; flex-direction: column; justify-content: flex-end; align-items: center; gap: 6px; }
.purchase-bar > span { display: flex; width: 100%; height: 165px; align-items: end; justify-content: center; }
.purchase-bar i { position: relative; display: block; width: min(28px, 72%); min-height: 2px; border-radius: 6px 6px 2px 2px; background: linear-gradient(180deg,#f1ad69,#c96a1e); }
.purchase-bar em { position: absolute; top: -18px; left: 50%; transform: translateX(-50%); color: #687386; font-size: .65rem; font-style: normal; font-weight: 800; }
.purchase-bar small { color: #9099a7; font-size: .65rem; }
.purchase-status-list { display: flex; flex-direction: column; gap: 0; margin-top: 12px; }
.purchase-status-list > div { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 0; border-bottom: 1px solid #edf0f4; }
.purchase-status-list > div:last-child { border-bottom: 0; }
.purchase-status-list span { display: inline-flex; align-items: center; gap: 8px; color: #5d6675; font-size: .76rem; font-weight: 700; }
.purchase-status-list i { color: #c96a1e; }
.purchase-status-list strong { color: #253047; font-size: .94rem; font-variant-numeric: tabular-nums; }
.purchase-status-list .danger i, .purchase-status-list .danger strong { color: #bd4e36; }
.top-suppliers .top-product__bar i { background: linear-gradient(90deg,#e8a25c,#c96a1e); }

.top-products { display: flex; flex-direction: column; gap: 9px; margin: 12px 0 0; padding: 0; list-style: none; }
.top-product { display: flex; align-items: center; gap: 12px; min-width: 0; }
.top-product__rank { display: grid; width: 22px; height: 22px; flex: 0 0 auto; place-items: center; border-radius: 6px; background: #eef1f6; color: #5a6472; font-size: .72rem; font-weight: 800; }
.top-product:nth-child(-n+3) .top-product__rank { background: var(--kiwi, #9cc10a); color: #fff; }
.top-product__body { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 4px; }
.top-product__name { overflow: hidden; color: #344054; font-size: .8rem; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.top-product__bar { display: block; height: 6px; overflow: hidden; border-radius: 999px; background: #eef1f6; }
.top-product__bar i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #9cc10a, #648506); }
.top-product__qty { flex: 0 0 auto; color: #5d6675; font-size: .76rem; font-variant-numeric: tabular-nums; }
.top-product__amount { flex: 0 0 auto; min-width: 84px; color: #253047; font-size: .82rem; font-weight: 800; text-align: right; font-variant-numeric: tabular-nums; }
.top-product--empty { justify-content: center; padding: 16px 0; color: #98a0ad; font-size: .8rem; }

@media (max-width: 1180px) { .widgets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .widget-card--wide { grid-column: span 2; } }
@media (max-width: 720px) { .widget-head { flex-direction: column; } .widget-head__actions { width: 100%; } .area-tabs { flex: 1; } .area-tabs button { flex: 1; justify-content: center; } .summary-grid,.widgets-grid { grid-template-columns: 1fr; } .widget-card--wide { grid-column: span 1; } .widget-doughnut { flex-direction: column; } .summary-kpis { grid-template-columns: 1fr; } }
</style>
