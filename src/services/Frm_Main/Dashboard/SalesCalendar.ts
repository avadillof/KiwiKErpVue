import axios from 'axios';
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';

export interface SalesCalendarEvent {
  type: 'invoice' | 'order' | 'quote' | 'delivery' | 'task';
  pkid: number;
  code: string;
  date: string;
  entity: string;
  total: number | null;
  state: string;
}

export const CALENDAR_TYPES: Record<string, { label: string; icon: string; color: string; route: string }> = {
  invoice: { label: 'Cobros', icon: 'pi pi-receipt', color: '#c0446a', route: 'Facturas' },
  order: { label: 'Entregas', icon: 'pi pi-shopping-cart', color: '#d9822b', route: 'Pedidos' },
  quote: { label: 'Presupuestos', icon: 'pi pi-file-edit', color: '#7c5cbf', route: 'Presupuestos' },
  delivery: { label: 'Albaranes', icon: 'pi pi-box', color: '#2875b6', route: 'Albaranes' },
  task: { label: 'Vencimientos', icon: 'pi pi-clipboard', color: '#648506', route: 'Tareas' }
};

export const CALENDAR_WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const EVENT_QUERY_KEYS: Record<SalesCalendarEvent['type'], string> = {
  quote: 'quoteId',
  order: 'orderId',
  invoice: 'invoiceId',
  delivery: 'deliveryId',
  task: 'taskId'
};

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function isoDay(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function useSalesCalendar() {
  const auth = useAuthStore();
  const router = useRouter();

  const anchor = ref<Date>(startOfMonth(new Date()));
  const events = ref<SalesCalendarEvent[]>([]);
  const loading = ref(false);
  const error = ref('');
  const panelVisible = ref(false);
  const panelDate = ref<string | null>(null);

  const byDay = computed(() => {
    const map = new Map<string, SalesCalendarEvent[]>();
    for (const item of events.value) {
      if (!item || !item.date) continue;
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return map;
  });

  const monthsModel = computed(() => [buildMonth(anchor.value), buildMonth(addMonths(anchor.value, 1))]);

  const rangeLabel = computed(() => monthsModel.value.map((m) => m.label).join(' · '));

  function buildMonth(firstDay: Date) {
    const year = firstDay.getFullYear();
    const month = firstDay.getMonth();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let day = 1; day <= total; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    return { key: `${year}-${month}`, label: monthLabel(firstDay), weeks };
  }

  function addMonths(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  }

  function monthLabel(date: Date): string {
    const text = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function dayEvents(date: Date | null): SalesCalendarEvent[] {
    if (!date) return [];
    return byDay.value.get(isoDay(date)) ?? [];
  }

  function dayCounts(date: Date | null) {
    const counts = new Map<string, number>();
    for (const item of dayEvents(date)) counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
    return Array.from(counts.entries()).map(([type, count]) => ({ type, count, color: CALENDAR_TYPES[type]?.color ?? '#94a3b8' }));
  }

  const panelEvents = computed(() => (panelDate.value ? byDay.value.get(panelDate.value) ?? [] : []));

  const panelTitle = computed(() => {
    if (!panelDate.value) return 'Detalle del día';
    const date = new Date(`${panelDate.value}T00:00:00`);
    const text = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    return text.charAt(0).toUpperCase() + text.slice(1);
  });

  const panelGroups = computed(() => {
    const groups = new Map<string, SalesCalendarEvent[]>();
    for (const item of panelEvents.value) {
      const list = groups.get(item.type) ?? [];
      list.push(item);
      groups.set(item.type, list);
    }
    return Array.from(groups.entries()).map(([type, items]) => ({ type, meta: CALENDAR_TYPES[type], items }));
  });

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      const from = isoDay(anchor.value);
      const to = isoDay(new Date(anchor.value.getFullYear(), anchor.value.getMonth() + 2, 0));
      const { data } = await axios.get(backendUrl('/WebGetSalesCalendarEvents'), {
        ...auth.portalRequestConfig(),
        params: { from, to }
      });
      const sales: SalesCalendarEvent[] = Array.isArray(data?.events) ? data.events : [];
      events.value = [...sales, ...(await loadMyTaskEvents())];
    } catch (e: any) {
      events.value = [];
      error.value = typeof e.response?.data === 'string' ? e.response.data : 'No se pudo cargar el calendario comercial.';
    } finally {
      loading.value = false;
    }
  }

  async function loadMyTaskEvents(): Promise<SalesCalendarEvent[]> {
    try {
      const me = auth.user?.pkid;
      if (!me) return [];
      const { data } = await axios.get(backendUrl('/WebGetTasks'), {
        params: { userPkid: me, page: 0, size: 500 }
      });
      const list: any[] = Array.isArray(data) ? data : (data?.content ?? []);
      return list
        .filter((t) => t?.dueDate && (t.state === 'PLANIFICADA' || t.state === 'EN_CURSO'))
        .map((t) => ({
          type: 'task' as const,
          pkid: Number(t.pkid),
          code: String(t.code ?? ''),
          date: String(t.dueDate).slice(0, 10),
          entity: String(t.name ?? ''),
          total: null,
          state: String(t.state ?? '')
        }));
    } catch {
      return [];
    }
  }

  function shift(amount: number) {
    anchor.value = addMonths(anchor.value, amount);
  }

  function goToday() {
    anchor.value = startOfMonth(new Date());
  }

  function openDay(date: Date | null) {
    if (!date || !dayEvents(date).length) return;
    panelDate.value = isoDay(date);
    panelVisible.value = true;
  }

  function goToEvent(event: SalesCalendarEvent) {
    const meta = CALENDAR_TYPES[event.type];
    if (!meta) return;
    panelVisible.value = false;
    const key = EVENT_QUERY_KEYS[event.type];
    router.push({ name: meta.route, query: key && event.pkid ? { [key]: String(event.pkid) } : {} });
  }

  function money(value: number | null): string {
    if (value == null) return '';
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(Number(value));
  }

  onMounted(load);
  watch(anchor, load);

  return {
    anchor,
    events,
    loading,
    error,
    panelVisible,
    panelDate,
    monthsModel,
    rangeLabel,
    weekdays: CALENDAR_WEEKDAYS,
    types: CALENDAR_TYPES,
    isoDay,
    dayEvents,
    dayCounts,
    panelTitle,
    panelGroups,
    shift,
    goToday,
    openDay,
    goToEvent,
    money,
    reload: load
  };
}