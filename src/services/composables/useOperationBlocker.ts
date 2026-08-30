import { computed, ref } from 'vue';

const operations = ref<Record<string, { title: string; message: string }>>({});
export const activeOperation = computed(() => Object.values(operations.value).at(-1));
export function blockOperation(key: string, title: string, message: string) {
    operations.value = { ...operations.value, [key]: { title, message } };
}
export function unblockOperation(key: string) {
    const next = { ...operations.value };
    delete next[key];
    operations.value = next;
}
