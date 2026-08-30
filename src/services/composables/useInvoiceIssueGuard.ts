import { ref } from 'vue';

// Keep uncertain submissions protected across navigation and page reloads.
// Store identifiers only; never the certificate password or invoice contents.
const storageKey = 'kiwik.invoice-issue-pending';
function restore(): number[] {
  try {
    const value = JSON.parse(sessionStorage.getItem(storageKey) || '[]');
    return Array.isArray(value) ? value.filter(id => Number.isSafeInteger(id) && id > 0) : [];
  } catch { return []; }
}
const pending = ref(new Set<number>(restore()));
function persist() {
  try { sessionStorage.setItem(storageKey, JSON.stringify([...pending.value])); }
  catch { /* In-memory protection remains active if browser storage is unavailable. */ }
}
export function isInvoiceIssuePending(id: unknown): boolean {
  return pending.value.has(Number(id));
}
export function beginInvoiceIssue(id: number): boolean {
  if (!Number.isSafeInteger(id) || id <= 0 || isInvoiceIssuePending(id)) return false;
  pending.value.add(id);
  persist();
  return true;
}
export function finishInvoiceIssue(id: number): void {
  pending.value.delete(id);
  persist();
}
