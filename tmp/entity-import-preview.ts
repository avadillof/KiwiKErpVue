import { createApp, h, ref, onMounted } from 'vue';
import PrimeVue from 'primevue/config';
import axios from 'axios';
import { createPinia } from 'pinia';
import { useAuthStore } from '../src/stores/authStore';
import { useSecurityStore } from '../src/stores/securityStore';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import EntityImportDialog from '../src/views/Ventas/Frm_Clientes/EntityImportDialog.vue';
import 'primeicons/primeicons.css';
import '../src/assets/styles/global.css';
let batch: any;
// Isolated visual fixture: never contacts or writes to a KiwiKERP database.
axios.defaults.adapter = async config => {
    let data: any = {};
    if (config.url?.endsWith('/catalogs')) data = { salesTerms: [{ id: 1, label: 'Contado' }], purchaseTerms: [{ id: 2, label: 'Transferencia a 30 días' }], tariffs: [{ id: 3, label: 'GENERAL · Tarifa general' }] };
    else if (config.url?.endsWith('/preview')) {
        const input = JSON.parse(config.data);
        data = batch = { id: 'visual-fixture', filename: input.filename, sheet_name: input.sheet, state: 'REVIEW', configuration: input.configuration, rows: input.rows.map((r: any) => ({ row_number: r.row, data: r.data, review: { issues: !r.data.cif ? ['Identificación fiscal: obligatoria.'] : r.issues, candidates: [], original: r.data }, state: 'REVIEW', decision: 'SKIP', message: '' })) };
    } else if (config.url?.endsWith('/confirm')) {
        const input = JSON.parse(config.data); batch.state = 'RUNNING';
        batch.rows.forEach((r: any) => { r.decision = input.decisions.find((d: any) => d.row === r.row_number).action; r.state = r.decision === 'SKIP' ? 'SKIPPED' : 'PENDING'; }); data = batch;
    } else if (config.url?.endsWith('/next')) {
        batch.state = 'COMPLETED'; batch.rows.forEach((r: any) => { if (r.state === 'PENDING') { r.state = 'CREATED'; r.message = 'Resultado simulado de prueba visual.'; r.entity_id = r.row_number + 100; } }); data = batch;
    } else data = [];
    return { data: structuredClone(data), status: 200, statusText: 'OK', headers: {}, config };
};
const pinia = createPinia();
const app = createApp({ setup() {
    const dialog = ref(); onMounted(() => dialog.value.open());
    return () => h('main', { style: 'font-family:Arial;padding:20px;background:#f5f7f9;min-height:100vh' }, [h('p', 'Prueba visual aislada · Datos ficticios · Sin conexión a base de datos'), h(EntityImportDialog, { ref: dialog })]);
} }).use(pinia).use(PrimeVue, { theme: { preset: KiwiKTheme } });
useAuthStore(pinia).$patch({ isAuthenticated: true, portalSession: 'visual-fixture-session' });
useSecurityStore(pinia).$patch({ admin: true, loaded: true });
app.mount('#app');
