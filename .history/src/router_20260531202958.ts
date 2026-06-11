// src/router.ts
import { createRouter, createWebHistory } from 'vue-router';

// La página principal se carga al inicio
import IndexView from './views/IndexView.vue';

const routes = [
  { path: '/', component: IndexView },
  
  // Estas rutas se cargan "bajo demanda" (Lazy Loading)  
  { path: '/Frm_TestComponets', component: () => import('./views/Frm_TestComponets/Frm_TestComponets.vue') },
  { path: '/Frm_Panels', component: ()       => import('./views/Frm_TestComponets/Frm_Panels/Frm_PanelsView.vue') },
  { path: '/Frm_Buttons', component: ()       => import('./views/Frm_TestComponets/Frm_Buttons/Frm_ButtonsView.vue') },
  { path: '/Frm_Tables', component: ()       => import('./views/Frm_TestComponets/Frm_Tables/Frm_TablesView.vue') },


  { path: '/Frm_Login', component: ()       => import('./views/Frm_Login/Frm_Login.vue') }
];

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/Frm_Login' // <--- ESTO ES LO QUE HACE LA MAGIA
    },
    {
      path: '/Frm_Login',
      component: () => import('./views/Frm_Login/Frm_Login.vue')
    },
   
  ]
});