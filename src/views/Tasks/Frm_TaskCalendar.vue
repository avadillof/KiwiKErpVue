<template>
    <div class="task-calendar">
        <div class="calendar-bar">
            <Button icon="pi pi-angle-left" text rounded size="small" title="Mes anterior" @click="shift(-1)" />
            <strong class="calendar-title">{{ monthLabel }}</strong>
            <Button icon="pi pi-angle-right" text rounded size="small" title="Mes siguiente" @click="shift(1)" />
            <Button label="Hoy" size="small" text @click="goToday" />
            <span class="calendar-count">
                {{ monthCount }} tarea{{ monthCount === 1 ? '' : 's' }} vencen este mes
            </span>
        </div>

        <div class="calendar-weekdays">
            <span v-for="d in WEEKDAYS" :key="d">{{ d }}</span>
        </div>

        <div class="calendar-grid">
            <div v-for="cell in cells" :key="cell.key" class="calendar-cell"
                :class="{ other: !cell.inMonth, today: cell.today, weekend: cell.weekend }">
                <span class="calendar-daynum">{{ cell.date.getDate() }}</span>
                <div class="calendar-events">
                    <button v-for="t in cell.tasks.slice(0, 3)" :key="t.pkid ?? t.code" type="button"
                        class="calendar-event" :class="eventClass(t)"
                        :title="`${t.code} · ${t.name}`" @click="emit('edit', t)">
                        <span class="ev-code">{{ t.code }}</span>
                        <span class="ev-name">{{ t.name }}</span>
                    </button>
                    <span v-if="cell.tasks.length > 3" class="calendar-more">
                        +{{ cell.tasks.length - 3 }} más
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import type { TaskDTO } from '@/services/Tasks/taskService';

const props = defineProps<{ tasks: TaskDTO[] }>();
const emit = defineEmits<{ edit: [task: TaskDTO] }>();

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

const today = new Date();
today.setHours(0, 0, 0, 0);
const cursor = ref(new Date(today.getFullYear(), today.getMonth(), 1));

const monthLabel = computed(() => `${MONTHS[cursor.value.getMonth()]} ${cursor.value.getFullYear()}`);

function shift(delta: number) {
    cursor.value = new Date(cursor.value.getFullYear(), cursor.value.getMonth() + delta, 1);
}

function goToday() {
    cursor.value = new Date(today.getFullYear(), today.getMonth(), 1);
}

function parseDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dateKey(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function taskDate(task: TaskDTO): Date | null {
    return parseDate((task as any).dueDate) ?? parseDate((task as any).startDate);
}

const byDay = computed(() => {
    const map = new Map<string, TaskDTO[]>();
    for (const t of props.tasks) {
        const d = taskDate(t);
        if (!d) continue;
        const key = dateKey(d);
        const list = map.get(key) ?? [];
        list.push(t);
        map.set(key, list);
    }
    for (const list of map.values()) {
        list.sort((a, b) => Number(b.overdue) - Number(a.overdue) || String(a.code).localeCompare(String(b.code)));
    }
    return map;
});

const cells = computed(() => {
    const first = new Date(cursor.value.getFullYear(), cursor.value.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // lunes = 0
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    const out: { key: string; date: Date; inMonth: boolean; today: boolean; weekend: boolean; tasks: TaskDTO[] }[] = [];
    for (let i = 0; i < 42; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const w = date.getDay();
        out.push({
            key: `${dateKey(date)}_${i}`,
            date,
            inMonth: date.getMonth() === cursor.value.getMonth() && date.getFullYear() === cursor.value.getFullYear(),
            today: date.getTime() === today.getTime(),
            weekend: w === 0 || w === 6,
            tasks: byDay.value.get(dateKey(date)) ?? []
        });
    }
    return out;
});

const monthCount = computed(() =>
    props.tasks.filter((t) => {
        const d = taskDate(t);
        return d != null && d.getMonth() === cursor.value.getMonth() && d.getFullYear() === cursor.value.getFullYear();
    }).length
);

function eventClass(task: TaskDTO): string {
    if (task.overdue) return 'ev-overdue';
    if (task.state === 'EN_CURSO') return 'ev-doing';
    if (task.state === 'EN_VALIDACION') return 'ev-validating';
    if (task.state === 'FINALIZADA') return 'ev-done';
    if (task.state === 'DESCARTADA') return 'ev-discarded';
    return 'ev-planned';
}
</script>

<style scoped>
.task-calendar {
    margin-top: 14px;
    background: #fff;
    border: 1px solid #e3e8d2;
    border-radius: 14px;
    padding: 1rem;
}
.calendar-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.8rem;
}
.calendar-title {
    min-width: 160px;
    text-align: center;
    font-size: 1rem;
    color: #344054;
    text-transform: capitalize;
}
.calendar-count {
    margin-left: auto;
    color: #7d8797;
    font-size: 0.78rem;
}
.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
    margin-bottom: 4px;
}
.calendar-weekdays span {
    padding: 0.3rem 0.5rem;
    color: #687386;
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 4px;
}
.calendar-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 108px;
    padding: 4px;
    border: 1px solid #eef0e8;
    border-radius: 9px;
    background: #fbfcfa;
}
.calendar-cell.weekend {
    background: #f6f7f3;
}
.calendar-cell.other {
    opacity: 0.45;
}
.calendar-cell.today {
    border-color: var(--kiwi, #9cc10a);
    box-shadow: inset 0 0 0 1px var(--kiwi, #9cc10a);
}
.calendar-daynum {
    align-self: flex-end;
    color: #687386;
    font-size: 0.74rem;
    font-weight: 800;
}
.calendar-cell.today .calendar-daynum {
    color: #648506;
}
.calendar-events {
    display: flex;
    flex-direction: column;
    gap: 3px;
}
.calendar-event {
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 2px 5px;
    border: 0;
    border-left: 3px solid #7fb3d5;
    border-radius: 5px;
    background: #eef5fb;
    color: #344054;
    font-size: 0.68rem;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
}
.calendar-event:hover {
    filter: brightness(0.97);
    box-shadow: 0 1px 4px rgba(31, 41, 55, 0.15);
}
.ev-code {
    font-weight: 800;
    color: #526029;
    white-space: nowrap;
}
.ev-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.calendar-event.ev-planned { border-left-color: #7fb3d5; background: #eef5fb; }
.calendar-event.ev-doing { border-left-color: #f0b429; background: #fdf6e6; }
.calendar-event.ev-validating { border-left-color: #9b7fd4; background: #f3eefb; }
.calendar-event.ev-done { border-left-color: #7fb069; background: #eef6ec; }
.calendar-event.ev-discarded { border-left-color: #c9ccd1; background: #f3f4f5; color: #899184; }
.calendar-event.ev-overdue { border-left-color: #e05252; background: #fdecec; }
.calendar-more {
    color: #899184;
    font-size: 0.66rem;
    font-weight: 700;
    padding-left: 4px;
}
@media (max-width: 900px) {
    .calendar-cell { min-height: 84px; }
    .calendar-event .ev-name { display: none; }
}
</style>
