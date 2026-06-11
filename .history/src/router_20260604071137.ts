import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/authStore';

// 1. Importaciones (He añadido el nuevo Dashboard)
import Frm_Login from './views/Frm_Login/Frm_Login.vue';
import Frm_Main from './views/Frm_Main/Frm_Main.vue';
import Pn_DashBoard from './views/Frm_Main/Dashboard/Pn_DashBoard.vue';
// ... mantén tus otras importaciones ...

// 2. Definición de rutas anidadas
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
    component: Frm_Main,
    meta: { requiresAuth: true },
    // AQUI ESTA LA MAGIA: Los módulos ahora son "hijos" del Main
    children: [
      {
        path: '', // Si la URL es /Frm_Main, carga el Dashboard dentro
        name: 'Dashboard',
        component: Pn_DashBoard
      },
      {
        path: 'ventas', // La URL sería /Frm_Main/ventas
        name: 'Ventas',
        component: () => import('./views/Ventas/Frm_Ventas.vue') // O tu importación tradicional
      }
      // ... aquí irás añadiendo el resto de módulos ...
    ]
  },
  // ... mantén tus otras rutas ...
];

export const router = createRouter({
  history: createWebHistory(),
  routes: routes
});

// 3. El Guardián se mantiene igual
router.beforeEach(function (to, from, next) {
  const authStore = useAuthStore();
  const requiereAutenticacion = to.matched.some(function (record) {
    return record.meta.requiresAuth;
  });

  if (requiereAutenticacion && !authStore.isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});