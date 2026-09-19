<template>
  <section class="estado-empresa">
    <div class="widget-head">
      <div>
        <span class="section-kicker">Visión general</span>
        <h2>Estado de la empresa</h2>
        <p v-if="loading" class="widget-state"><i class="pi pi-spin pi-spinner"></i> Cargando estadísticas…</p>
        <p v-else-if="error" class="widget-state widget-state--error"><i class="pi pi-exclamation-triangle"></i> {{ error }}</p>
        <p v-else class="widget-state widget-state--ok">Datos consolidados del ejercicio</p>
      </div>
      <button type="button" class="widget-reload" title="Actualizar" :disabled="loading" @click="reload">
        <i :class="loading ? 'pi pi-spin pi-refresh' : 'pi pi-refresh'"></i>
      </button>
    </div>

    <div class="widgets-grid">
      <article class="widget-card widget-card--wide">
        <header class="widget-card__head">
          <span>Evolución mensual</span>
          <small>Importe por tipo (€)</small>
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
        <header class="widget-card__head"><span>Cobros del año</span><small>Facturación emitida</small></header>
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
        <header class="widget-card__head"><span>Top 10 productos</span><small>Facturados en {{ topYear }}</small></header>
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
  </section>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useCompanyStats, monthlyRow, MONTHS } from '../../../services/Frm_Main/Dashboard/CompanyStats';

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

    return {
      ...stats,
      chartLine,
      doughnutRows,
      donut,
      yearBars,
      funnel,
      fmtQty,
      barWidth,
      money
    };
  }
};
</script>

<style scoped>
.estado-empresa { margin-top: 26px; }
.section-kicker { color: #648506; font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.widget-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.widget-head h2 { margin: 4px 0 0; color: #253047; font-size: 1.3rem; }
.widget-state { margin: 6px 0 0; color: #8a93a3; font-size: .78rem; }
.widget-state--error { color: #b91c1c; }
.widget-state--ok { color: #6f8f0a; }
.widget-reload { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid #e2e6ee; border-radius: 9px; background: #fff; color: #5a6472; cursor: pointer; font-size: .9rem; transition: border-color .15s, background .15s; }
.widget-reload:hover { border-color: #9cc10a; background: #f6f9ef; }
.widget-reload:disabled { opacity: .55; cursor: default; }

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
@media (max-width: 720px) { .widgets-grid { grid-template-columns: 1fr; } .widget-card--wide { grid-column: span 1; } .widget-doughnut { flex-direction: column; } }
</style>