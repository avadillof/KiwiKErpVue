import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { computed, ref, watch, type Ref } from 'vue';

export interface PricedLine {
  productId: number | null;
  priceUnit: number | null;
  quantity?: number | null;
  uomId?: number | null;
  uomFactor?: number;
  basePriceUnit?: number;
  discountPercent?: number;
  discount?: number | null;
  pricingSource?: string;
  pricingError?: string;
  pricingPending?: boolean;
}
export const pricingErrorMessage = (e: any): string => typeof e.response?.data === 'string'
  ? e.response.data : e.response?.data?.message || e.message || 'No se pudo calcular el precio. Revisa la configuración de tarifas.';
export async function resolveSalesPrice(tarifaId: number | null, line: PricedLine) {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/WebResolveSalesPrice`, {
    ...useAuthStore().portalRequestConfig(),
    params: { tarifaId, productId: line.productId, uomId: line.uomId, quantity: line.quantity ?? 1 }, timeout: 15000
  });
  return data as { priceUnit: number; salesTarifaId: number; source: string; currencyCode: string };
}

/** No repricing on document load. Existing amounts only change after an explicit decision. */
export function useSalesPricing(options: {
  lines: () => PricedLine[]; tarifa: Ref<number | null>; enabled: () => boolean;
  currency: (id: number | null) => string | undefined;
}) {
  const confirmVisible = ref(false), batchBusy = ref(false), batchError = ref('');
  const previousTarifa = ref<number | null>(null), changingTarifa = ref(false);
  let reverting = false;
  const versions = new WeakMap<PricedLine, number>();
  const managed = new WeakSet<PricedLine>();
  const isManaged = (line: PricedLine) => managed.has(line);
  const busy = computed(() => batchBusy.value || options.lines().some(l => l.pricingPending));
  const invalid = computed(() => confirmVisible.value || busy.value || !!batchError.value || options.lines().some(l => !!l.pricingError));
  const canKeep = computed(() => !changingTarifa.value || (!!options.currency(previousTarifa.value) && options.currency(previousTarifa.value) === options.currency(options.tarifa.value)));
  const error = computed(() => batchError.value || options.lines().find(l => l.pricingError)?.pricingError || '');
  function commit(line: PricedLine, result: Awaited<ReturnType<typeof resolveSalesPrice>>, resetDiscount = true) {
    managed.add(line);
    line.priceUnit = result.priceUnit;
    line.basePriceUnit = result.priceUnit * (line.uomFactor || 1);
    if (resetDiscount && 'discountPercent' in line) line.discountPercent = 0;
    if (resetDiscount && 'discount' in line) line.discount = 0;
    line.pricingSource = result.source; line.pricingError = ''; line.pricingPending = false;
  }
  async function apply(line: PricedLine, resetDiscount = true) {
    if (!line.productId) return;
    const version = (versions.get(line) || 0) + 1; versions.set(line, version);
    const productId = line.productId, uomId = line.uomId, quantity = line.quantity, tarifa = options.tarifa.value;
    line.pricingPending = true; line.pricingError = ''; line.pricingSource = '';
    try {
      const result = await resolveSalesPrice(tarifa, line);
      if (versions.get(line) !== version || !options.lines().includes(line)) return;
      if (line.productId !== productId || line.uomId !== uomId || line.quantity !== quantity || options.tarifa.value !== tarifa) {
        line.pricingError = 'La selección cambió durante el cálculo. Aplica de nuevo la tarifa.'; return;
      }
      commit(line, result, resetDiscount);
      if (options.tarifa.value == null) { reverting = true; options.tarifa.value = result.salesTarifaId; }
    } catch (e) { if (versions.get(line) === version && options.lines().includes(line)) line.pricingError = pricingErrorMessage(e); }
    finally { if (versions.get(line) === version) line.pricingPending = false; }
  }
  function clear(line: PricedLine) { versions.set(line, (versions.get(line) || 0) + 1); line.pricingPending = false; line.pricingError = ''; line.pricingSource = ''; }
  function request() { if (!options.enabled() || busy.value) return; changingTarifa.value = false; batchError.value = ''; confirmVisible.value = true; }
  function keep() { if (!canKeep.value) return; if (changingTarifa.value) options.lines().forEach(l=>{l.pricingSource='';}); confirmVisible.value = false; changingTarifa.value = false; batchError.value = ''; }
  function quantityChanged(line: PricedLine, quantity: number | null) {
    line.quantity = quantity;
    if (!options.enabled() || confirmVisible.value || batchBusy.value || !line.productId
      || !managed.has(line) || line.pricingSource === 'Precio manual' || (!line.pricingSource && !line.pricingPending && !line.pricingError)) return;
    void apply(line, false);
  }
  function cancel() {
    if (changingTarifa.value && options.tarifa.value !== previousTarifa.value) { reverting = true; options.tarifa.value = previousTarifa.value; }
    changingTarifa.value = false; confirmVisible.value = false; batchError.value = '';
  }
  async function recalculate() {
    batchBusy.value = true; batchError.value = '';
    const tarifa = options.tarifa.value;
    const lines = options.lines().filter(l => !!l.productId);
    const snapshot = lines.map(l => ({ productId: l.productId, uomId: l.uomId, quantity: l.quantity, priceUnit: l.priceUnit }));
    try {
      const results = await Promise.all(lines.map(l => resolveSalesPrice(tarifa, l)));
      if (tarifa !== options.tarifa.value || lines.some((l, i) => !options.lines().includes(l) || l.productId !== snapshot[i].productId || l.uomId !== snapshot[i].uomId || l.quantity !== snapshot[i].quantity || l.priceUnit !== snapshot[i].priceUnit)) throw new Error('La línea cambió durante el cálculo. Aplica de nuevo la tarifa.');
      lines.forEach((l, i) => commit(l, results[i]));
      if (options.tarifa.value == null && results.length) { reverting = true; options.tarifa.value = results[0].salesTarifaId; }
      confirmVisible.value = false; changingTarifa.value = false;
    } catch (e) { batchError.value = pricingErrorMessage(e); }
    finally { batchBusy.value = false; }
  }
  function changed(previous: number | null) {
    if (!options.enabled() || options.tarifa.value === previous || !options.lines().some(l => l.productId)) return;
    previousTarifa.value = previous; changingTarifa.value = true; batchError.value = ''; confirmVisible.value = true;
  }
  watch(options.tarifa, (_next, previous) => {
    if (reverting) { reverting = false; return; }
    changed(previous);
  }, {flush:'sync'});
  return { busy, invalid, error, confirmVisible, batchBusy, canKeep, apply, clear, request, keep, cancel, recalculate, changed, quantityChanged, isManaged };
}
