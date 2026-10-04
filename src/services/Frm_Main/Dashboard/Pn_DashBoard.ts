import axios from 'axios';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '../../../stores/authStore';
import { useSecurityStore } from '@/stores/securityStore';
import { PERM } from '../permissions';
import { getBillingPending } from '@/services/Tasks/taskService';
import { visibleRecentModules, type RecentModule } from '../recentModules';

interface Stats {
  quotes: any | null;
  orders: any | null;
  invoices: any | null;
  rects: any | null;
  tasks: { mine: number; overdue: number } | null;
  billing: { count: number; hours: number } | null;
  purchaseDeliveries: any | null;
  purchaseInvoices: any | null;
}

export function DashboardController() {
    const router = useRouter();
    const authStore = useAuthStore();
    const securityStore = useSecurityStore();

    const canCard = (perm: string): boolean => {
        if (authStore.user?.admin === true) return true;
        try { return securityStore.hasPermission(perm); } catch { return false; }
    };

    /** Permiso exigido por cada ruta navegable desde el panel. */
    const ROUTE_PERMS: Record<string, string> = {
        Tareas: PERM.TASK_ACCESS,
        TareasPendientes: PERM.TASK_BILLING_PENDING,
        Ventas: PERM.SALES_OPTIONS,
        Presupuestos: PERM.SALES_NAV_QUOTES,
        Pedidos: PERM.SALES_NAV_ORDERS,
        Albaranes: PERM.SALES_NAV_DELIVERY,
        Facturas: PERM.SALES_NAV_INVOICES,
        AlbaranesCompra: PERM.PURCHASE_NAV_DELIVERY,
        FacturasCompra: PERM.PURCHASE_NAV_INVOICES,
        Rectificativas: PERM.SALES_NAV_CREDIT,
        ListaPrecios: PERM.SALES_NAV_PRICELIST,
        AjustesVentas: PERM.SALES_SETTINGS,
        InformesVentas: PERM.RPT_SALES,
        Frm_Ajustes: PERM.SYS_ACCESS,
    };

    const recents = ref<RecentModule[]>(visibleRecentModules());

    const stats = ref<Stats>({ quotes: null, orders: null, invoices: null, rects: null, tasks: null, billing: null, purchaseDeliveries: null, purchaseInvoices: null });

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
        const purchasePaths = ['/WebGetPurchasesDeliveryStatistics', '/WebGetPurchasesInvoiceStatistics'];
        const purchaseSettled = await Promise.allSettled(
            purchasePaths.map((p) => axios.get(backendUrl(p), apiConfig()))
        );
        const [pd, pi] = purchaseSettled.map((s) => (s.status === 'fulfilled' ? s.value.data : null));
        stats.value = { quotes: q, orders: o, invoices: f, rects: r, tasks: t, billing: b, purchaseDeliveries: pd, purchaseInvoices: pi };
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
        const pd = stats.value.purchaseDeliveries;
        const pi = stats.value.purchaseInvoices;
        const rectTotal = Array.isArray(r)
            ? r.filter((item: any) => item && item.state?.toLowerCase().includes('confirm')).reduce((acc: number, item: any) => acc + (item.count || 0), 0)
            : null;
        return [
            {
                key: 'tasks', icon: 'pi pi-clipboard', label: 'Mis tareas abiertas',
                value: t?.mine ?? null,
                sub: t ? (t.overdue ? `${fmt(t.overdue)} vencidas` : 'Al día') : 'Pendiente de carga',
                route: 'Tareas',
                perm: PERM.TASK_ACCESS,
                area: 'general',
                gradient: 'linear-gradient(135deg,#9cc10a,#648506)'
            },
            {
                key: 'tasks-billing', icon: 'pi pi-wallet', label: 'Tareas pendientes de facturar',
                value: b?.count ?? null,
                sub: b ? `${fmt(Math.round(b.hours * 100) / 100)} h sin facturar` : 'Pendiente de carga',
                route: 'TareasPendientes',
                perm: PERM.TASK_BILLING_PENDING,
                area: 'general',
                gradient: 'linear-gradient(135deg,#e46e8e,#b74267)'
            },
            {
                key: 'quotes', icon: 'pi pi-file-edit', label: 'Presupuestos de venta por aprobar',
                value: q?.pendingCount ?? null,
                sub: q ? `${fmtMoney(q.pendingAmount)} por confirmar` : 'Pendiente de carga',
                route: 'Presupuestos',
                perm: PERM.SALES_NAV_QUOTES,
                area: 'sales',
                gradient: 'linear-gradient(135deg,#8d78dc,#6250ad)'
            },
            {
                key: 'orders', icon: 'pi pi-shopping-cart', label: 'Pedidos de venta pendientes',
                value: o ? (o.deliveryPendingLines ?? 0) + (o.directInvoiceLines ?? 0) : null,
                sub: o ? `${fmt(o.deliveryPendingQuantity)} uds. a servir` : 'Pendiente de carga',
                route: 'Pedidos',
                perm: PERM.SALES_NAV_ORDERS,
                area: 'sales',
                gradient: 'linear-gradient(135deg,#f3ae48,#dc7c22)'
            },
            {
                key: 'invoices', icon: 'pi pi-receipt', label: 'Facturas de clientes por cobrar',
                value: f?.pendingCount ?? null,
                sub: f ? `${fmtMoney(f.pendingAmount)} en cartera` : 'Pendiente de carga',
                route: 'Facturas',
                perm: PERM.SALES_NAV_INVOICES,
                area: 'sales',
                gradient: 'linear-gradient(135deg,#e46e8e,#b74267)'
            },
            {
                key: 'overdue', icon: 'pi pi-exclamation-triangle', label: 'Facturas de clientes vencidas',
                value: f?.overdueCount ?? null,
                sub: f ? 'Requieren seguimiento' : 'Pendiente de carga',
                route: 'Facturas',
                perm: PERM.SALES_NAV_INVOICES,
                area: 'sales',
                gradient: 'linear-gradient(135deg,#f28b82,#c53030)'
            },
            {
                key: 'rects', icon: 'pi pi-undo', label: 'Rectificativas de venta',
                value: rectTotal,
                sub: r ? 'Confirmadas / emitidas' : 'Pendiente de carga',
                route: 'Rectificativas',
                perm: PERM.SALES_NAV_CREDIT,
                area: 'sales',
                gradient: 'linear-gradient(135deg,#e56b6f,#bd3e43)'
            },
            {
                key: 'purchase-delivery-drafts', icon: 'pi pi-truck', label: 'Albaranes de compra en borrador',
                value: pd?.draftCount ?? null,
                sub: pd ? 'Pendientes de confirmar' : 'Pendiente de carga',
                route: 'AlbaranesCompra', perm: PERM.PURCHASE_NAV_DELIVERY, area: 'purchases',
                gradient: 'linear-gradient(135deg,#4fb3bf,#287c87)'
            },
            {
                key: 'purchase-deliveries', icon: 'pi pi-box', label: 'Albaranes pendientes de facturar',
                value: pd?.pendingInvoiceCount ?? null,
                sub: pd ? 'Recepciones confirmadas' : 'Pendiente de carga',
                route: 'AlbaranesCompra', perm: PERM.PURCHASE_NAV_DELIVERY, area: 'purchases',
                gradient: 'linear-gradient(135deg,#e8a25c,#c96a1e)'
            },
            {
                key: 'purchase-invoices', icon: 'pi pi-credit-card', label: 'Facturas de proveedor pendientes',
                value: pi?.pendingCount ?? null,
                sub: pi ? 'Borradores o por pagar' : 'Pendiente de carga',
                route: 'FacturasCompra', perm: PERM.PURCHASE_NAV_INVOICES, area: 'purchases',
                gradient: 'linear-gradient(135deg,#5d8fc7,#37679d)'
            },
            {
                key: 'purchase-overdue', icon: 'pi pi-exclamation-circle', label: 'Facturas de proveedor vencidas',
                value: pi?.overdueCount ?? null,
                sub: pi ? 'Requieren revisión' : 'Pendiente de carga',
                route: 'FacturasCompra', perm: PERM.PURCHASE_NAV_INVOICES, area: 'purchases',
                gradient: 'linear-gradient(135deg,#ef8c73,#bd4e36)'
            },
        ].filter((k) => canCard((k as any).perm));
    });

    const generalActionCards = computed(() => actionCards.value.filter((card: any) => card.area === 'general'));
    const salesActionCards = computed(() => actionCards.value.filter((card: any) => card.area === 'sales'));
    const purchaseActionCards = computed(() => actionCards.value.filter((card: any) => card.area === 'purchases'));

    function fmt(value: number): string {
        return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(value ?? 0));
    }

    function fmtMoney(value: unknown): string {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value ?? 0));
    }

    function navegarA(nombreRuta: string, disponible = true): void {
        if (!disponible) return;
        // Defensa en el propio panel: no navegar a rutas sin permiso.
        const need = ROUTE_PERMS[nombreRuta];
        if (need && !canCard(need)) return;
        router.push({ name: nombreRuta });
    }

    return {
        recents,
        actionCards,
        generalActionCards,
        salesActionCards,
        purchaseActionCards,
        fmt,
        navegarA,
        refresh: loadStats
    };
}
