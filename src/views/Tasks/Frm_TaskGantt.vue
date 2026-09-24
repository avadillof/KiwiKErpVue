<template>
    <div class="gantt">
        <div class="gantt-legend">
            <span v-for="s in legend" :key="s.label" class="gantt-legend-item">
                <i :style="{ background: s.color }"></i>{{ s.label }}
            </span>
            <span class="gantt-legend-item"><i class="today-mark"></i>Hoy</span>
            <span class="archive-toggle"><ToggleButton v-model="showDone" onLabel="Hechas" offLabel="Hechas" onIcon="pi pi-check"
                offIcon="pi pi-check" size="small" title="Mostrar también finalizadas y descartadas" /></span>
            <span class="gantt-zoom">
                <Button icon="pi pi-minus" rounded text size="small" title="Reducir zoom"
                    :disabled="zoomIndex <= 0" @click="zoomOut" />
                <span class="gantt-zoom-label">{{ zoomLabel }}</span>
                <Button icon="pi pi-plus" rounded text size="small" title="Ampliar zoom"
                    :disabled="zoomIndex >= ZOOM_LEVELS.length - 1" @click="zoomIn" />
                <Button label="Hoy" size="small" text @click="scrollToToday()" />
            </span>
        </div>

        <div v-if="rows.length" ref="scrollBox" class="gantt-scroll">
            <div class="gantt-grid" :style="{ width: gridWidth + 'px' }">
                <div class="gantt-header">
                    <div class="gantt-label head">Tarea</div>
                    <div class="gantt-timeline">
                        <div v-for="m in months" :key="m.key" class="gantt-month" :style="{ width: m.days * dayWidth + 'px' }">
                            {{ m.label }}
                        </div>
                        <div class="gantt-days">
                            <span v-for="d in days" :key="d.key" class="gantt-day"
                                :class="{ weekend: d.weekend, today: d.today }" :style="{ width: dayWidth + 'px' }">
                                {{ d.num }}
                            </span>
                        </div>
                    </div>
                </div>

                <div v-for="row in rows" :key="row.task.pkid ?? row.task.code" class="gantt-row"
                    @click="emit('edit', row.task)">
                    <div class="gantt-label" :title="row.task.name">
                        <div class="gantt-label-main"><strong>{{ row.task.code }}</strong><span>{{ row.task.name }}</span></div>
                        <small class="gantt-label-who">{{ assigneeName(row.task) }}</small>
                    </div>
                    <div class="gantt-timeline gantt-track">
                        <span v-for="d in days" :key="d.key" class="gantt-cell"
                            :class="{ weekend: d.weekend }" :style="{ width: dayWidth + 'px' }"></span>
                        <div class="gantt-bar" :style="barStyle(row)" :title="barTitle(row.task)">
                            <div class="gantt-fill" :style="{ width: progressPct(row.task) + '%' }"></div>
                            <span v-if="barWide(row)" class="gantt-pct">{{ progressPct(row.task) }} %</span>
                            <span class="gantt-after">
                                <span class="gantt-who">
                                    <img v-if="row.task.userPkid && !photoErrors[row.task.userPkid]"
                                        :src="userPhotoUrl(row.task.userPkid)" :alt="assigneeName(row.task)"
                                        @error="onPhotoError(row.task.userPkid)" />
                                    <span v-else class="gantt-who-initials">{{ initials(assigneeName(row.task)) }}</span>
                                </span>
                                <span class="gantt-who-name">{{ assigneeName(row.task) }}</span>
                                <span v-if="!barWide(row)" class="gantt-after-pct">{{ progressPct(row.task) }} %</span>
                            </span>
                            <span v-if="row.task.overdue" class="gantt-flag">Vencida</span>
                        </div>
                        <div v-if="showToday" class="gantt-today" :style="{ left: todayOffset + 'px' }"></div>
                    </div>
                </div>
            </div>
        </div>
        <div v-else class="kanban-empty">Sin tareas con fecha para mostrar.</div>

        <div v-if="unscheduled.length" class="gantt-unscheduled">
            <h4>Sin planificar (sin vencimiento ni alta)</h4>
            <button v-for="t in unscheduled" :key="t.pkid ?? t.code" type="button" class="recent-chip"
                @click="emit('edit', t)">
                <span class="recent-icon" style="color:#648506;background:#eef4d8"><i class="pi pi-clipboard" /></span>
                <span>{{ t.code }} · {{ t.name }}</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import { backendUrl } from '@/services/backendUrl';
import type { TaskDTO } from '@/services/Tasks/taskService';

const emit = defineEmits(['edit']);
const props = defineProps<{ tasks: TaskDTO[] }>();

const showDone = ref(false);
const photoErrors = ref<Record<number, boolean>>({});

function assigneeName(task: TaskDTO): string {
    return task.userName || task.contactName || '—';
}

function initials(name?: string): string {
    return (name || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('');
}

const userPhotoUrl = (userPkid: number) => backendUrl(`/gestdoc/users/${userPkid}/photoPerfil.jpg`);
const onPhotoError = (userPkid: number) => {
    photoErrors.value[userPkid] = true;
};

function isOpen(task: TaskDTO): boolean {
    return task.state === 'PLANIFICADA' || task.state === 'EN_CURSO';
}

const ZOOM_LEVELS = [12, 18, 26, 38, 54];
const ZOOM_LABELS = ['Día', 'Semana', 'Mes', 'Detalle', 'Max'];
const zoomIndex = ref(2);
const dayWidth = computed(() => ZOOM_LEVELS[zoomIndex.value]);
const zoomLabel = computed(() => ZOOM_LABELS[zoomIndex.value]);
const scrollBox = ref<HTMLElement | null>(null);

function zoomIn() {
    if (zoomIndex.value < ZOOM_LEVELS.length - 1) {
        zoomIndex.value++;
        nextTick(() => scrollToToday(false));
    }
}

function zoomOut() {
    if (zoomIndex.value > 0) {
        zoomIndex.value--;
        nextTick(() => scrollToToday(false));
    }
}

function scrollToToday(smooth = true) {
    const el = scrollBox.value;
    if (!el || !showToday.value) return;
    el.scrollTo({ left: Math.max(0, todayOffset.value - el.clientWidth / 3), behavior: smooth ? 'smooth' : 'auto' });
}

onMounted(() => nextTick(() => scrollToToday(false)));

const legend = [
    { label: 'Planificado', color: '#7fb3d5' },
    { label: 'Realizándose', color: '#f0b429' },
    { label: 'Hecho', color: '#7fb069' },
    { label: 'Descartado', color: '#c9ccd1' },
    { label: 'Vencida', color: '#e05252' }
];

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface Row {
    task: TaskDTO;
    start: Date;
    end: Date;
}

function taskStart(task: TaskDTO): Date | null {
    return parseDate((task as any).startDate) ?? parseDate((task as any).dateUp);
}

const dated = computed(() =>
    props.tasks.filter((t) => (showDone.value || isOpen(t)) && (parseDate(t.dueDate) || taskStart(t)))
);

const unscheduled = computed(() =>
    props.tasks.filter((t) => (showDone.value || isOpen(t)) && !parseDate(t.dueDate) && !taskStart(t))
);

const range = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let min: Date = today;
    let max: Date = new Date(today.getTime() + 30 * 86400000);
    for (const t of dated.value) {
        const s = taskStart(t) ?? parseDate(t.dueDate);
        const e = parseDate(t.dueDate) ?? taskStart(t);
        if (s && s < min) min = s;
        if (e && e > max) max = e;
    }
    min = new Date(min.getTime() - 3 * 86400000);
    max = new Date(max.getTime() + 7 * 86400000);
    const spanDays = Math.round((max.getTime() - min.getTime()) / 86400000);
    if (spanDays > 150) max = new Date(min.getTime() + 150 * 86400000);
    return { min, max };
});

const days = computed(() => {
    const list: { key: string; num: number; weekend: boolean; today: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cur = new Date(range.value.min);
    while (cur <= range.value.max) {
        const w = cur.getDay();
        list.push({
            key: dayKey(cur) + '_' + list.length,
            num: cur.getDate(),
            weekend: w === 0 || w === 6,
            today: cur.getTime() === today.getTime()
        });
        cur.setDate(cur.getDate() + 1);
    }
    return list;
});

const months = computed(() => {
    const names = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const groups: { key: string; label: string; days: number }[] = [];
    const cur = new Date(range.value.min);
    while (cur <= range.value.max) {
        const key = `${cur.getFullYear()}-${cur.getMonth()}`;
        const last = groups[groups.length - 1];
        if (last && last.key === key) last.days++;
        else groups.push({ key, label: `${names[cur.getMonth()]} ${cur.getFullYear()}`, days: 1 });
        cur.setDate(cur.getDate() + 1);
    }
    return groups;
});

const rows = computed<Row[]>(() => {
    const list = dated.value.map((task) => {
        const start = taskStart(task) ?? parseDate(task.dueDate) ?? new Date();
        let end = parseDate(task.dueDate) ?? new Date(start.getTime() + 86400000);
        if (end < start) end = start;
        return { task, start, end };
    });
    list.sort((a, b) => a.end.getTime() - b.end.getTime());
    return list;
});

const gridWidth = computed(() => 280 + days.value.length * dayWidth.value);

const showToday = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today >= range.value.min && today <= range.value.max;
});

const todayOffset = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((today.getTime() - range.value.min.getTime()) / 86400000) * dayWidth.value;
});

function barColor(task: TaskDTO): string {
    if (task.overdue) return '#e05252';
    switch (task.state) {
        case 'EN_CURSO': return '#f0b429';
        case 'FINALIZADA': return '#7fb069';
        case 'DESCARTADA': return '#c9ccd1';
        default: return '#7fb3d5';
    }
}

function barWidthPx(row: Row): number {
    const w = dayWidth.value;
    return Math.max(w, (Math.round((row.end.getTime() - row.start.getTime()) / 86400000) + 1) * w);
}

function barWide(row: Row): boolean {
    return barWidthPx(row) >= 52;
}

function barStyle(row: Row): Record<string, string> {
    const w = dayWidth.value;
    const left = Math.max(0, Math.round((row.start.getTime() - range.value.min.getTime()) / 86400000)) * w;
    return {
        left: left + 'px',
        width: barWidthPx(row) + 'px',
        background: barColor(row.task)
    };
}

function barTitle(task: TaskDTO): string {
    return `${task.code} · ${task.name} (${progressPct(task)} %)`;
}

function progressPct(task: TaskDTO): number {
    if (task.state === 'FINALIZADA') return 100;
    return Math.min(100, Math.max(0, Math.round(Number((task as any).progress ?? 0))));
}
</script>

<style scoped>
.gantt {
    margin-top: 14px;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    padding: 1rem;
}
.gantt-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0.8rem;
    font-size: 0.78rem;
    color: #687386;
}
.gantt-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
}
.gantt-legend-item i {
    width: 14px;
    height: 14px;
    border-radius: 4px;
    display: inline-block;
}
.today-mark {
    width: 3px !important;
    height: 16px !important;
    background: #c53030;
}
.gantt-scroll {
    overflow-x: auto;
    border: 1px solid #edf0e4;
    border-radius: 10px;
}
.gantt-header,
.gantt-row {
    display: flex;
}
.gantt-header {
    background: #fbfcfa;
    border-bottom: 1px solid #e3e8d2;
    font-weight: 700;
    font-size: 0.78rem;
    color: #687386;
}
.gantt-label {
    flex: 0 0 280px;
    width: 280px;
    padding: 0.25rem 0.7rem;
    border-right: 1px solid #e3e8d2;
    background: #fff;
    position: sticky;
    left: 0;
    z-index: 2;
    overflow: hidden;
    cursor: pointer;
}
.gantt-label-main {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.25;
}
.gantt-label-who {
    display: block;
    font-size: 0.66rem;
    font-weight: 700;
    color: #bcc2cd;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.2;
}
.gantt-label strong {
    margin-right: 0.4rem;
    color: #648506;
}
.gantt-label.head {
    cursor: default;
    background: #fbfcfa;
}
.gantt-timeline {
    position: relative;
}
.gantt-month {
    display: inline-block;
    padding: 0.3rem 0.4rem 0.1rem;
    font-weight: 800;
    text-transform: capitalize;
    border-left: 1px solid #e3e8d2;
    white-space: nowrap;
    overflow: hidden;
}
.gantt-days {
    display: flex;
    border-top: 1px solid #edf0e4;
}
.gantt-day {
    text-align: center;
    font-weight: 400;
    padding: 0.15rem 0;
    border-left: 1px solid #f1f3ec;
    font-size: 0.72rem;
}
.gantt-day.weekend {
    background: #f5f6f3;
}
.gantt-day.today {
    background: #fde8e8;
    color: #c53030;
    font-weight: 800;
}
.gantt-row {
    border-bottom: 1px solid #f1f3ec;
}
.gantt-row:hover .gantt-label {
    background: #f6f8ec;
}
.gantt-track {
    display: flex;
}
.gantt-cell {
    border-left: 1px solid #f5f6f3;
    height: 34px;
}
.gantt-cell.weekend {
    background: #fafbf8;
}
.gantt-bar {
    position: absolute;
    top: 7px;
    height: 20px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(31, 41, 55, 0.18);
    cursor: pointer;
    min-width: 26px;
    overflow: hidden;
}
.gantt-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.28);
    border-radius: 6px 0 0 6px;
}
.gantt-pct {
    position: absolute;
    left: 6px;
    top: 2px;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.55);
    white-space: nowrap;
}
.gantt-pct-out {
    display: none;
}
.gantt-after {
    position: absolute;
    left: calc(100% + 6px);
    top: -2px;
    display: flex;
    align-items: center;
    gap: 5px;
}
.gantt-who {
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    overflow: hidden;
    background: #eef4d8;
    border: 2px solid #fff;
    box-shadow: 0 1px 4px rgba(31, 41, 55, 0.3);
    flex: 0 0 auto;
}
.gantt-who img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.gantt-who-initials {
    font-size: 0.58rem;
    font-weight: 800;
    color: #648506;
}
.gantt-who-name {
    font-size: 0.68rem;
    font-weight: 800;
    color: #344054;
    background: rgba(255, 255, 255, 0.92);
    border-radius: 6px;
    padding: 1px 6px;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(31, 41, 55, 0.15);
}
.gantt-after-pct {
    font-size: 0.68rem;
    font-weight: 800;
    color: #344054;
    white-space: nowrap;
}
.gantt-zoom {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
}
.gantt-zoom-label {
    min-width: 52px;
    text-align: center;
    font-weight: 800;
    color: #344054;
}
.archive-toggle .p-togglebutton,
.archive-toggle [data-pc-name="togglebutton"] {
    background: transparent !important;
    border-color: transparent !important;
}
.archive-toggle .p-togglebutton-checked,
.archive-toggle [data-p-checked="true"] {
    color: #344054 !important;
    font-weight: 800;
}
.gantt-flag {
    position: absolute;
    right: -2px;
    top: -9px;
    background: #c53030;
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
    border-radius: 6px;
    padding: 0 0.3rem;
}
.gantt-today {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #c53030;
    opacity: 0.7;
}
.gantt-unscheduled {
    margin-top: 1rem;
}
.gantt-unscheduled h4 {
    margin: 0 0 0.5rem;
    color: #687386;
    font-size: 0.85rem;
}
.gantt-unscheduled .recent-chip {
    margin: 0 0.4rem 0.4rem 0;
}
.recent-chip {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    padding: 7px 14px 7px 8px;
    border: 1px solid #e5e9f0;
    border-radius: 999px;
    background: #fff;
    color: #344054;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
}
.recent-icon {
    display: grid;
    width: 26px;
    height: 26px;
    place-items: center;
    border-radius: 50%;
    font-size: 0.75rem;
}
.kanban-empty {
    border: 1px dashed #dfe4ea;
    border-radius: 10px;
    padding: 1.2rem 0.8rem;
    text-align: center;
    color: #899184;
    font-size: 0.8rem;
    margin-top: 0.6rem;
}
</style>
