import { computed, ref } from 'vue';

/**
 * Cronómetros de tareas: varios simultáneos, uno por tarea.
 * Persisten en localStorage para sobrevivir a recargas y navegación.
 */

export interface TimerEntry {
  taskPkid: number;
  taskCode: string;
  taskName: string;
  startedAt: number;
}

const KEY = 'kiwik.tasks.timer.v2';

function load(): Record<number, TimerEntry> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as Record<number, TimerEntry>;
  } catch {
    /* sin almacenamiento */
  }
  return {};
}

const timers = ref<Record<number, TimerEntry>>(load());
const now = ref(Date.now());

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(timers.value));
  } catch {
    /* sin almacenamiento */
  }
}

setInterval(() => {
  if (Object.keys(timers.value).length) now.value = Date.now();
}, 1000);

export const activeTimers = timers;
export const runningCount = computed(() => Object.keys(timers.value).length);

export function isTimerRunning(taskPkid?: number | null): boolean {
  return taskPkid != null && timers.value[taskPkid] != null;
}

export function timerElapsed(taskPkid?: number | null): number {
  if (taskPkid == null) return 0;
  const entry = timers.value[taskPkid];
  return entry ? Math.max(0, now.value - entry.startedAt) : 0;
}

export function startTimer(task: { pkid: number | null; code?: string; name?: string }): void {
  if (task.pkid == null) return;
  timers.value = {
    ...timers.value,
    [task.pkid]: {
      taskPkid: task.pkid,
      taskCode: task.code ?? '',
      taskName: task.name ?? '',
      startedAt: Date.now()
    }
  };
  now.value = Date.now();
  persist();
}

export function clearTimer(taskPkid?: number | null): void {
  if (taskPkid == null || timers.value[taskPkid] == null) return;
  const next = { ...timers.value };
  delete next[taskPkid];
  timers.value = next;
  persist();
}

/** Detiene el cronómetro de una tarea y devuelve las horas (2 decimales, mínimo 0,01). */
export function stopTimer(taskPkid?: number | null): number {
  const hours = Math.round((timerElapsed(taskPkid) / 3600000) * 100) / 100;
  clearTimer(taskPkid);
  return Math.max(0.01, hours);
}

export function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
