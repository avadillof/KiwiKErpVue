// src/main.ts
import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import KiwiKTheme from './theme/KiwiKTheme.ts';
import App from './App.vue';
import { router } from './router';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

import './assets/styles/global.css'; 
import './assets/styles/Frm_Login/frm_login.css';
import './assets/styles/ConnectionMonitor/connectionmonitor.css';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import ConfirmPopup from 'primevue/confirmpopup';
import { recordRecent } from './services/Frm_Main/recentModules';

const app = createApp(App);

// 1. Crear la instancia de Pinia
const pinia = createPinia();


// 2. Registrar el plugin de persistencia EN LA INSTANCIA DE PINIA
pinia.use(piniaPluginPersistedstate);

// 3. Registrar Pinia en la App
app.use(pinia);
app.use(ConfirmationService);

app.use(PrimeVue, {
    theme: {
        preset: KiwiKTheme,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'tailwind-base, primevue, tailwind-utilities'
            }
        }
    },
    size: 'small'
});

app.use(ToastService);
app.use(router);
app.directive('tooltip', Tooltip);

router.afterEach((to) => {
  if (typeof to.name === 'string') recordRecent(to.name);
});

app.mount('#app');