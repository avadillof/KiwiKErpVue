import { createApp } from 'vue';
import { createRouter, createMemoryHistory } from 'vue-router';
import Manual from '../src/views/Help/Frm_UserManual.vue';
import 'primeicons/primeicons.css';
// Documentation-only preview: no authentication state, business data or API calls.
const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: Manual }] });
createApp(Manual).use(router).mount('#app');
