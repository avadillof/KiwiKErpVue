<template>
  <section class="sales-calendar">
    <div class="calendar-head">
      <div>
        <span class="section-kicker">Planificación</span>
        <h2>Calendario comercial</h2>
      </div>
<div class="calendar-nav">
        <button type="button" class="calendar-collapse" :title="collapsed ? 'Expandir calendario' : 'Contraer calendario'" @click="toggleCollapsed">
          <i :class="collapsed ? 'pi pi-chevron-down' : 'pi pi-chevron-up'"></i>
        </button>
        <button type="button" title="Mes anterior" @click="shift(-1)"><i class="pi pi-angle-left"></i></button>
        <button type="button" class="calendar-today" @click="goToday">Hoy</button>
        <button type="button" title="Mes siguiente" @click="shift(1)"><i class="pi pi-angle-right"></i></button>
      </div>
    </div>

    <template v-if="!collapsed">
      <div class="calendar-legend">
        <span v-for="t in types" :key="t.label" class="legend-item">
          <i class="legend-dot" :style="{ background: t.color }"></i>{{ t.label }}
        </span>
        <span v-if="loading" class="calendar-state"><i class="pi pi-spin pi-spinner"></i> Cargando…</span>
        <span v-else-if="error" class="calendar-state calendar-state--error"><i class="pi pi-exclamation-triangle"></i> {{ error }}</span>
        <span v-else class="calendar-range">{{ rangeLabel }}</span>
      </div>

      <div class="calendar-months">
        <div v-for="month in monthsModel" :key="month.key" class="calendar-month">
          <h3>{{ month.label }}</h3>
          <div class="weekday-row"><span v-for="d in weekdays" :key="d">{{ d }}</span></div>
          <div class="weeks">
            <div v-for="(week, wi) in month.weeks" :key="wi" class="week">
              <button
                v-for="(day, di) in week"
                :key="di"
                type="button"
                class="day"
                :class="{
                  'day--empty': !day,
                  'day--today': day && isoDay(day) === isoDay(new Date()),
                  'day--active': day && dayEvents(day).length
                }"
                :disabled="!day || !dayEvents(day).length"
                @click="openDay(day)"
              >
                <span v-if="day" class="day-number">{{ day.getDate() }}</span>
                <span v-if="day && dayEvents(day).length" class="day-chips">
                  <span v-for="c in dayCounts(day)" :key="c.type" class="chip" :style="{ background: c.color }">{{ c.count }}</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>

  <Dialog v-model:visible="panelVisible" modal position="right" class="kiwik-dialog calendar-panel"
    :header="panelTitle" :style="{ width: 'min(430px, 96vw)', height: '100vh', margin: 0 }"
    :contentStyle="{ padding: '0 1rem 1.25rem' }">
    <div class="panel-body">
      <section v-for="group in panelGroups" :key="group.type" class="panel-group">
        <header class="panel-group__head">
          <i :class="group.meta.icon" :style="{ color: group.meta.color }"></i>
          <span>{{ group.meta.label }}</span>
          <em>{{ group.items.length }}</em>
        </header>
        <button v-for="item in group.items" :key="item.type + '-' + item.pkid" type="button" class="panel-item" @click="goToEvent(item)">
          <span class="panel-item__main">
            <strong>{{ item.code }}</strong>
            <small>{{ item.entity || '—' }}</small>
          </span>
          <span class="panel-item__side">
            <span v-if="item.total != null" class="panel-item__total">{{ money(item.total) }}</span>
            <i class="pi pi-angle-right"></i>
          </span>
        </button>
      </section>
      <p v-if="!panelGroups.length" class="panel-empty">Sin eventos para este día.</p>
    </div>
  </Dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Dialog from 'primevue/dialog';
import { useSalesCalendar } from '../../../services/Frm_Main/Dashboard/SalesCalendar';

export default defineComponent({
  name: 'SalesCalendar',
  components: { Dialog },
  setup() {
    const calendar = useSalesCalendar();
    const collapsed = ref(window.localStorage.getItem('kiwik.calendarCollapsed') === '1');
    function toggleCollapsed(): void {
      collapsed.value = !collapsed.value;
      window.localStorage.setItem('kiwik.calendarCollapsed', collapsed.value ? '1' : '0');
    }
    return { ...calendar, collapsed, toggleCollapsed };
  }
});
</script>

<style scoped>
.sales-calendar { margin-top: 30px; padding: 20px 22px; border: 1px solid #e5e9f0; border-radius: 16px; background: #fff; box-shadow: 0 5px 16px rgba(17,24,39,.05); }
.calendar-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.calendar-head h2 { margin: 4px 0 0; color: #253047; font-size: 1.3rem; }
.section-kicker { color: #648506; font-size: .78rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.calendar-nav { display: flex; align-items: center; gap: 8px; }
.calendar-collapse { border-style: dashed !important; color: #7a8392 !important; }
.calendar-nav button { display: grid; width: 34px; height: 34px; place-items: center; border: 1px solid #e2e6ee; border-radius: 9px; background: #fff; color: #5a6472; cursor: pointer; font-size: .85rem; transition: border-color .15s, background .15s; }
.calendar-nav button:hover { border-color: #9cc10a; background: #f6f9ef; }
.calendar-nav .calendar-today { width: auto; padding: 0 14px; font-size: .82rem; font-weight: 700; }
.calendar-legend { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 14px 0 12px; }
.legend-item { display: inline-flex; align-items: center; gap: 6px; color: #5d6675; font-size: .8rem; font-weight: 700; }
.legend-dot { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
.calendar-state { display: inline-flex; align-items: center; gap: 7px; color: #7a8290; font-size: .78rem; font-style: italic; }
.calendar-state--error { color: #b91c1c; font-style: normal; }
.calendar-range { color: #98a0ad; font-size: .76rem; }
.calendar-months { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
.calendar-month { min-width: 0; }
.calendar-month h3 { margin: 0 0 8px; color: #39435a; font-size: .92rem; font-weight: 800; }
.weekday-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 4px; }
.weekday-row span { text-align: center; color: #9aa3b1; font-size: .66rem; font-weight: 700; text-transform: uppercase; }
.weeks { display: flex; flex-direction: column; gap: 4px; }
.week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.day { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: 4px; min-height: 56px; border: 1px solid transparent; border-radius: 9px; background: #f7f8fa; color: #374151; cursor: default; padding: 5px 2px; }
.day--empty { background: transparent; }
.day--today .day-number { color: #648506; font-weight: 900; box-shadow: inset 0 0 0 1.5px #9cc10a; border-radius: 50%; }
.day--active { background: #f2f6eb; cursor: pointer; border-color: #e3e9d3; }
.day--active:hover { background: #eaf2d8; border-color: #bcd29a; }
.day-number { display: grid; width: 22px; height: 22px; place-items: center; font-size: .78rem; font-weight: 700; }
.day-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 3px; }
.chip { min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; color: #fff; font-size: .64rem; font-weight: 800; line-height: 16px; text-align: center; }
.panel-body { display: flex; flex-direction: column; gap: 14px; }
.panel-group { display: flex; flex-direction: column; gap: 6px; }
.panel-group__head { display: flex; align-items: center; gap: 9px; padding-bottom: 5px; border-bottom: 1px solid #edf0f4; }
.panel-group__head i { font-size: .9rem; }
.panel-group__head span { flex: 1; font-size: .8rem; font-weight: 800; color: #344054; }
.panel-group__head em { font-style: normal; padding: 1px 8px; border-radius: 999px; background: #eef2e4; color: #55730b; font-size: .72rem; font-weight: 800; }
.panel-item { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid transparent; border-radius: 9px; background: transparent; font: inherit; text-align: left; cursor: pointer; transition: background .12s, border-color .12s; }
.panel-item:hover { background: #f3f7ea; border-color: #e0e9cb; }
.panel-item__main { display: flex; min-width: 0; flex: 1; flex-direction: column; }
.panel-item__main strong { color: #2b3446; font-size: .82rem; }
.panel-item__main small { color: #78808f; font-size: .72rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.panel-item__side { display: flex; align-items: center; gap: 8px; }
.panel-item__total { color: #5f7d07; font-size: .76rem; font-weight: 800; font-variant-numeric: tabular-nums; }
.panel-empty { color: #8a93a3; font-size: .85rem; text-align: center; padding: 18px 0; }
@media (max-width: 980px) { .calendar-months { grid-template-columns: 1fr; } }
@media (max-width: 720px) { .sales-calendar { padding: 16px 14px; } .day { min-height: 48px; } }
</style>
