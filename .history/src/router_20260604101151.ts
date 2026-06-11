import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';

// 1. Importaciones tradicionales
import IndexView from './views/IndexView.vue';
import Frm_Login from './views/Frm_Login/Frm_Login.vue';
import Frm_Main from './views/Frm_Main/Frm_Main.vue';
import Pn_DashBoard from './views/Frm_Main/Dashboard/Pn_DashBoard.vue';
import Frm_TestComponets from './views/Frm_TestComponets/Frm_TestComponets.vue';
import Frm_PanelsView from './views/Frm_TestComponets/Frm_Panels/Frm_PanelsView.vue';
import Frm_ButtonsView from './views/Frm_TestComponets/Frm_Buttons/Frm_ButtonsView.vue';
import Frm_TablesView from './views/Frm_TestComponets/Frm_Tables/Frm_TablesView.vue';

// 2. Definición de rutas con jerarquía (Layout Persistente)
const routes = [
  { 
    path: '/', 
    redirect: '/Frm_Login' 
  },
  { 
    path: '/Frm_Login', 
    name: 'Login',
    component: Frm_Login 
  },
  { 
    path: '/Frm_Main', 
    name: 'MainPanel',
    component: Frm_Main, // Este componente contiene ahora el <router-view />
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Ruta por defecto dentro de Frm_Main
        name: 'Dashboard',
        component: Pn_DashBoard
      },
      {
        path: 'ajustes', // URL: /Frm_Main/ajustes
        name: 'Frm_Ajustes',
        component: () => import('./views/Frm_Main/Frm_Ajustes/Frm_Ajustes.vue') 
      }
    ]
  },
  { 
    path: '/Index', 
    component: IndexView 
  },
  { 
    path: '/Frm_TestComponets', 
    component: Frm_TestComponets 
  },
  { 
    path: '/Frm_Panels', 
    component: Frm_PanelsView 
  },
  { 
    path: '/Frm_Buttons', 
    component: Frm_ButtonsView 
  },
  { 
    path: '/Frm_Tables', 
    component: Frm_TablesView 
  }
];

// 3. Inicialización del Enrutador
export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

// 4. El Guardián de seguridad
router.beforeEach(function (to, from, next) {
  const authStore = useAuthStore();

  const requiereAutenticacion = to.matched.some(function (record) {
    return record.meta.requiresAuth;
  });

  if (requiereAutenticacion) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});