import axios from 'axios';
import { onMounted, ref } from 'vue';
import { backendUrl } from '@/services/backendUrl';
import { useAuthStore } from '@/stores/authStore';

export const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function monthlyRow(quotes: Record<string, any> | null, orders: Record<string, any> | null, invoices: Record<string, any> | null) {
  const labels = MONTHS.slice();
  const quotesData = Array.from({ length: 12 }, (_, i) => Number(quotes?.monthlyTotal?.[i] ?? 0));
  const ordersData = Array.from({ length: 12 }, (_, i) => Number(orders?.monthlyTotal?.[i] ?? 0));
  const invoicesData = Array.from({ length: 12 }, (_, i) => Number(invoices?.monthly?.[i] ?? 0));
  return { labels, quotesData, ordersData, invoicesData };
}

export function useCompanyStats() {
  const auth = useAuthStore();
  const loading = ref(false);
  const error = ref('');
  const quotes = ref<Record<string, any> | null>(null);
  const orders = ref<Record<string, any> | null>(null);
  const invoices = ref<Record<string, any> | null>(null);
  const topYear = new Date().getFullYear();
  const prevYear = topYear - 1;
  const prevInvoices = ref<Record<string, any> | null>(null);
  const topProducts = ref<Array<Record<string, any>>>([]);
  const topError = ref(false);

  async function load() {
    loading.value = true;
    error.value = '';
    const paths = [
      '/WebGetSalesQuoteStatistics',
      '/WebGetSalesOrderStatistics',
      '/WebGetSalesInvoiceStatistics'
    ];
    try {
      const results = await Promise.allSettled(
        paths.map((path) => axios.get(backendUrl(path), { ...auth.portalRequestConfig() }))
      );
      quotes.value = (results[0] as PromiseFulfilledResult<any>)?.value?.data ?? null;
      orders.value = (results[1] as PromiseFulfilledResult<any>)?.value?.data ?? null;
      invoices.value = (results[2] as PromiseFulfilledResult<any>)?.value?.data ?? null;
    } catch {
      error.value = 'No se pudieron cargar las estadísticas de la empresa.';
    }

    try {
      const resp = await axios.get(backendUrl('/WebGetSalesInvoiceStatistics'), {
        params: { year: prevYear },
        ...auth.portalRequestConfig()
      });
      prevInvoices.value = resp.data ?? null;
    } catch {
      prevInvoices.value = null;
    }

    topError.value = false;
    try {
      const resp = await axios.get(backendUrl('/WebGetSalesTopProducts'), {
        params: { year: topYear },
        ...auth.portalRequestConfig()
      });
      topProducts.value = Array.isArray(resp.data?.top) ? resp.data.top : [];
    } catch {
      topError.value = true;
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  return {
    loading,
    error,
    quotes,
    orders,
    invoices,
    topYear,
    prevYear,
    prevInvoices,
    topProducts,
    topError,
    reload: load
  };
}