import { createApp, h, ref, onMounted } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import axios from 'axios';
import { useAuthStore } from '../src/stores/authStore';
import { useSecurityStore } from '../src/stores/securityStore';
import KiwiKTheme from '../src/theme/KiwiKTheme';
import ProductImportDialog from '../src/views/Frm_Products/ProductImportDialog.vue';
import 'primeicons/primeicons.css';
import '../src/assets/styles/global.css';
// Isolated catalog fixture for visual QA only; no persistence or live service requests.
axios.defaults.adapter = async config => {
    const data = {
        productCategories: [{ id: 1, label: 'Producto físico' }, { id: 2, label: 'Servicio' }],
        categoryTypes: [{ id: 3, label: 'Mercancía', parentId: 1 }, { id: 4, label: 'Servicio por horas', parentId: 2 }],
        families: [{ id: 5, label: 'Familia de ejemplo' }],
        units: [{ id: 1, label: 'Unidades' }, { id: 2, label: 'Horas' }],
        taxes: [{ id: 1, label: 'IVA general 21 %' }, { id: 2, label: 'IVA reducido 10 %' }],
    };
    return { data, status: 200, statusText: 'OK', headers: {}, config };
};
const pinia = createPinia();
const app = createApp({ setup() {
    const dialog = ref(); onMounted(() => dialog.value.open());
    return () => h('main', { style: 'font-family:Arial;padding:20px;background:#f5f7f9;min-height:100vh' }, [h('p', 'Prueba visual aislada · Catálogos ficticios · Sin conexión a base de datos'), h(ProductImportDialog, { ref: dialog })]);
} }).use(pinia).use(PrimeVue, { theme: { preset: KiwiKTheme } });
useAuthStore(pinia).$patch({ isAuthenticated: true, portalSession: 'visual-fixture-session' });
useSecurityStore(pinia).$patch({ admin: true, loaded: true });
app.mount('#app');
