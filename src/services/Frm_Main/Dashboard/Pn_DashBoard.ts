import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '../../../stores/authStore';
import { getBillingPending } from '@/services/Tasks/taskService';
import { getRecentModules, type RecentModule } from '../recentModules';

interface Stats {
  quotes: any | null;
  orders: any | null;
  invoices: any | null;
  rects: any | null;
  tasks: { mine: number; overdue: number } | null;
  billing: { count: number; hours: number } | null;
}

export function DashboardController() {
    const router = useRouter();
    const authStore = useAuthStore();

    const recents = ref<RecentModule[]>(getRecentModules());

    const stats = ref<Stats>({ quotes: null, orders: null, invoices: null, rects: null, tasks: null, billing: null });

    async function loadStats() {
        const paths = [
            "/WebGetSalesQuoteStatistics",
            "/WebGetSalesOrderStatistics",
            "/WebGetSalesInvoiceStatistics",
            "/WebGetSalesRecInvoiceStatistics",
        ];
        const settled = await Promise.allSettled(
            paths.map((p) => axios.get(backendUrl(p), apiConfig()))
        );
        const [q, o, f, r] = settled.map((s) => (s.status === "fulfilled" ? s.value.data : null));
        let t: Stats['tasks'] = null;
        try {
            const { data } = await axios.get(backendUrl("/WebGetTaskStats"), {
                ...apiConfig(),
                params: { userPkid: authStore.user?.pkid ?? '' }
            });
            t = { mine: Number(data?.mine ?? 0), overdue: Number(data?.overdue ?? 0) };
        } catch {
            t = null;
        }
        let b: Stats['billing'] = null;
        try {
            const list = await getBillingPending(authStore.user?.admin === true ? null : (authStore.user?.pkid ?? null));
            b = { count: list.length, hours: list.reduce((acc, x) => acc + Number(x.pendingHours ?? 0), 0) };
        } catch {
            b = null;
        }
        stats.value = { quotes: q, orders: o, invoices: f, rects: r, tasks: t, billing: b };
    }

    function apiConfig() {
        const config: any = {};
        if (authStore.isAuthenticated && authStore.portalSession) {
            config.headers = { 'X-Portal-Session': authStore.portalSession };
        }
        return config;
    }

    onMounted(() => {
        loadStats();
    });

    const actionCards = computed(() => {
        const q = stats.value.quotes;
        const o = stats.value.orders;
        const f = stats.value.invoices;
        const r = stats.value.rects;
        const t = stats.value.tasks;
        const b = stats.value.billing;
        const rectTotal = Array.isArray(r)
            ? r.filter((item: any) => item && item.state?.toLowerCase().includes('confirm')).reduce((acc: number, item: any) => acc + (item.count || 0), 0)
            : null;
        return [
            {
                key: 'tasks', icon: 'pi pi-clipboard', label: 'Mis tareas abiertas',
                value: t?.mine ?? null,
                sub: t ? (t.overdue ? `${fmt(t.overdue)} vencidas` : 'Al día') : 'Pendiente de carga',
                route: 'Tareas',
                gradient: 'linear-gradient(135deg,#9cc10a,#648506)'
            },
            {
                key: 'tasks-billing', icon: 'pi pi-wallet', label: 'Tareas pendientes de facturar',
                value: b?.count ?? null,
                sub: b ? `${fmt(Math.round(b.hours * 100) / 100)} h sin facturar` : 'Pendiente de carga',
                route: 'TareasPendientes',
                gradient: 'linear-gradient(135deg,#e46e8e,#b74267)'
            },
            {
                key: 'quotes', icon: 'pi pi-file-edit', label: 'Presupuestos por aprobar',
                value: q?.pendingCount ?? null,
                sub: q ? `${fmtMoney(q.pendingAmount)} por confirmar` : 'Pendiente de carga',
                route: 'Presupuestos',
                gradient: 'linear-gradient(135deg,#8d78dc,#6250ad)'
            },
            {
                key: 'orders', icon: 'pi pi-shopping-cart', label: 'Pedidos pendientes',
                value: o ? (o.deliveryPendingLines ?? 0) + (o.directInvoiceLines ?? 0) : null,
                sub: o ? `${fmt(o.deliveryPendingQuantity)} uds. a servir` : 'Pendiente de carga',
                route: 'Pedidos',
                gradient: 'linear-gradient(135deg,#f3ae48,#dc7c22)'
            },
            {
                key: 'invoices', icon: 'pi pi-receipt', label: 'Facturas por cobrar',
                value: f?.pendingCount ?? null,
                sub: f ? `${fmtMoney(f.pendingAmount)} en cartera` : 'Pendiente de carga',
                route: 'Facturas',
                gradient: 'linear-gradient(135deg,#e46e8e,#b74267)'
            },
            {
                key: 'overdue', icon: 'pi pi-exclamation-triangle', label: 'Facturas vencidas',
                value: f?.overdueCount ?? null,
                sub: f ? 'Requieren seguimiento' : 'Pendiente de carga',
                route: 'Facturas',
                gradient: 'linear-gradient(135deg,#f28b82,#c53030)'
            },
            {
                key: 'rects', icon: 'pi pi-undo', label: 'Rectificativas',
                value: rectTotal,
                sub: r ? 'Confirmadas / emitidas' : 'Pendiente de carga',
                route: 'Rectificativas',
                gradient: 'linear-gradient(135deg,#e56b6f,#bd3e43)'
            },
        ];
    });

    function fmt(value: number): string {
        return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(value ?? 0));
    }

    function fmtMoney(value: unknown): string {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value ?? 0));
    }

    function navegarA(nombreRuta: string, disponible = true): void {
        if (!disponible) return;
        router.push({ name: nombreRuta });
    }

    return {
        recents,
        actionCards,
        fmt,
        navegarA,
        refresh: loadStats
    };
}