<template>
  <div
    style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">

    <!-- TOPBAR CORPORATIVA -->
    <div
      style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); position: relative; z-index: 10;">

      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="../../assets/logos/LogTras.png" alt="KiwiKERP Logo"
            style="height: 35px; width: auto; object-fit: contain;" />
        </div>
        <div style="width: 1px; height: 30px; background-color: #e5e7eb;"></div>
        <div style="display: flex; min-width: 0; flex-direction: column;">
          <div
            style="font-size: 0.85rem; color: #9cc10a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            KiwiKERP - Sistema Integrado</div>
          <div style="font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 2px;">{{ fechaActual }}</div>
        </div>
      </div>

<div style="display: flex; align-items: center; gap: 25px;">
        <!-- Búsqueda global -->
        <div role="button" title="Buscar módulos (Ctrl + K)" class="fm-search-pill" @click="searchRef?.open()">
          <i class="pi pi-search"></i>
          <span>Buscar</span>
          <kbd>Ctrl K</kbd>
        </div>

<!-- Notificaciones -->
        <div style="cursor: pointer; display: flex; align-items: center; padding: 5px;" @click="openNotifications">
          <OverlayBadge v-if="mensajesNuevos > 0" :value="mensajesNuevos" severity="danger">
            <i class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
          </OverlayBadge>
          <i v-else class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
        </div>

        <div style="width: 1px; height: 24px; background-color: #e5e7eb;"></div>

        <!-- ZONA DE USUARIO Y DESCONEXIÓN -->
        <div style="display: flex; align-items: center; gap: 20px;">

          <!-- Botón de Salida -->
          <div
            style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 0.9rem; transition: color 0.2s;"
            onmouseover="this.style.color='#ef4444';" onmouseout="this.style.color='#6b7280';" @click="desconectar">
            <i class="pi pi-sign-out"></i>
            <span>Salir</span>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 0.9rem; color: #4b5563; font-weight: 600;">{{ userName }}</span>


            <Frm_UserForm ref="userFormRef" />
            <Avatar size="large" shape="circle"
              style="background-color: #f9fbe7; color: #648506; font-weight: 700; border: 2px solid #9cc10a; cursor: pointer; overflow: hidden; position: relative;"
              @click="verPerfilUsuarioProfile"
              
            >
              <img v-if="userPkid > 0" :src="getProfilePhotoUrl(userPkid)"
                @error="(e: any) => e.target.style.display = 'none'" class="w-full h-full"
                style="object-fit: cover; position: absolute; top: 0; left: 0;" />

              <span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                {{ userInitials }}
              </span>
            </Avatar>




          </div>
        </div>
      </div>
    </div>

    <!-- CUERPO: SIDEBAR + CONTENIDO -->
    <div class="fm-body">
      <aside class="fm-sidebar" :class="{ 'fm-sidebar--collapsed': sidebarCollapsed }">
        <div class="fm-sidebar__head">
          <span v-if="!sidebarCollapsed" class="fm-sidebar__title">Navegación</span>
          <button type="button" class="fm-sidebar__toggle"
            :title="sidebarCollapsed ? 'Expandir menú' : 'Contraer menú'"
            @click="sidebarCollapsed = !sidebarCollapsed">
            <i :class="sidebarCollapsed ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'"></i>
          </button>
        </div>
        <nav class="fm-sidebar__nav">
          <button
            v-for="m in sidebarModules"
            :key="m.id"
            type="button"
            class="fm-sidebar__item"
            :class="{
              'fm-sidebar__item--active': isModuleActive(m),
              'fm-sidebar__item--disabled': !m.disponible
            }"
            :title="sidebarCollapsed ? m.nombre : (m.disponible ? '' : 'Próximamente')"
            @click="navTo(m)">
            <span class="fm-sidebar__item-icon" :style="{ color: m.colorIcono, background: m.bgIcono }"><i :class="m.icono"></i></span>
            <span v-if="!sidebarCollapsed" class="fm-sidebar__item-label">{{ m.nombre }}</span>
            <i v-if="!sidebarCollapsed && m.disponible" class="fm-sidebar__item-arrow pi pi-angle-right"></i>
          </button>
        </nav>
        <div v-if="!sidebarCollapsed" class="fm-sidebar__foot">
          <i class="pi pi-moon"></i>
          <span>KiwiKERP</span>
        </div>
      </aside>

      <!-- CONTENIDO DINÁMICO -->
      <div style="flex: 1; overflow-y: auto;">
        <router-view />
      </div>
    </div>

    <GlobalSearch ref="searchRef" />
    <NotificationPanel ref="notificationRef" />

    <!-- FOOTER CORPORATIVO -->
    <div
      style="background-color: white; border-top: 1px solid #e5e7eb; padding: 12px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;">

      <div style="display: flex; align-items: center; gap: 15px;">
        <i class="pi pi-building" style="color: #9cc10a; font-size: 1.2rem;"></i>
        <div style="display: flex; flex-direction: column;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem;">
            <span style="color: #374151; font-weight: 700;">{{ empresaNombre }}</span>
            <div style="width: 1px; height: 12px; background-color: #d1d5db;"></div>
            <span style="color: #6b7280; font-weight: 500;">{{ companyStore.companyInfo.cifCompany }}</span>
          </div>
          <span style="font-size: 0.75rem; color: #9ca3af; font-style: italic; margin-top: 1px;">
            {{ companyStore.companyInfo.sloganCompany || 'Tu slogan corporativo aquí' }}
          </span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; min-width: 0; font-size: 0.85rem; color: #9ca3af; font-weight: 500;">
        <span v-if="companyStore.companyInfo.documentRoot" :title="companyStore.companyInfo.documentRoot"
          style="display: inline-flex; align-items: center; gap: 6px; min-width: 0; max-width: 430px; color: #6f8c7d; font-size: 0.7rem; font-weight: 600;">
          <i class="pi pi-database" style="flex: 0 0 auto; color: #74a88e; font-size: 0.72rem;"></i>
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            GestDoc · {{ companyStore.companyInfo.documentRoot }}
          </span>
        </span>
        <div v-if="companyStore.companyInfo.documentRoot"
          style="width: 1px; height: 22px; flex: 0 0 auto; background-color: #e1e4e8;"></div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="../../assets/logos/LogTras.png" alt="Logo" style="height: 18px; width: auto; opacity: 0.85;" />
          <span>{{ erpInfo.nombre }} <span style="color: #9cc10a; font-weight: 700;">{{ erpInfo.version }}</span></span>
        </div>
        <div style="width: 4px; height: 4px; background-color: #d1d5db; border-radius: 50%;"></div>
        <span>&copy; {{ erpInfo.copyright }}</span>
      </div>
    </div>
    
  </div>

  <Dialog v-model:visible="configurationDialogVisible" modal :closable="false" :dismissableMask="false"
    class="initial-configuration-dialog" :style="{ width: 'min(590px, 94vw)' }">
    <template #header>
      <div class="initial-configuration-header">
        <span class="initial-configuration-icon"><i class="pi pi-sliders-h"></i></span>
        <div><small>Puesta en marcha de KiwiKERP</small><h2>Completa la configuración inicial</h2></div>
      </div>
    </template>
    <p v-if="configurationState.documentRootManaged" class="initial-configuration-copy">La instalación ya está activa. Antes de comenzar a trabajar, revisa y completa los parámetros generales de tu empresa.</p>
    <p v-else class="initial-configuration-copy">La instalación ya está activa. Antes de comenzar a trabajar, revisa los parámetros generales y confirma el repositorio documental.</p>
    <div class="initial-configuration-mode">
      <i :class="configurationState.documentRootManaged ? 'pi pi-cloud' : 'pi pi-server'"></i>
      <div>
        <span>{{ deploymentLabel }}</span>
        <strong v-if="!configurationState.documentRootManaged">{{ configurationState.documentRoot || 'Ruta pendiente de configurar' }}</strong>
      </div>
    </div>
    <p v-if="!configurationState.documentRootManaged" class="initial-configuration-help">Podrás revisar la carpeta GestDoc. Para finalizar, la ruta debe existir en este servidor y permitir escritura.</p>
    <template #footer>
      <Button label="Completar ahora" icon="pi pi-arrow-right" iconPos="right" class="initial-configuration-action"
        @click="openInitialConfiguration" />
    </template>
  </Dialog>
</template>





<script lang="ts">
import { computed, defineComponent, ref, defineAsyncComponent, onMounted, watch } from 'vue';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Frm_Main from '../../services/Frm_Main/Frm_Main';
import { useAuthStore } from '../../stores/authStore';
import { useRouter, useRoute } from 'vue-router';
import { getInstallationState, type InstallationState } from '../../services/Installation/installationService';
import { visibleAppModules } from '../../services/Frm_Main/modules';
import GlobalSearch from './GlobalSearch.vue';
import NotificationPanel from './NotificationPanel.vue';

const MODULE_CHILDREN: Record<string, string[]> = {
  Ventas: ['Ventas', 'Clientes', 'Presupuestos', 'Pedidos', 'Albaranes', 'Facturas', 'Rectificativas', 'ListaPrecios', 'AjustesVentas'],
  Frm_Ajustes: ['Frm_Ajustes', 'BankAccounts', 'Certificates', 'FamiliasProductos', 'Productos', 'Taxas', 'security']
};

export default defineComponent({
  name: 'Frm_MainLayout',
  components: {
    Avatar,
    OverlayBadge,
    Dialog,
    Button,
    GlobalSearch,
    NotificationPanel,
    // Usamos Async para evitar que TS valide los tipos internos del formulario durante la compilación
    Frm_UserForm: defineAsyncComponent(() => import('../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue'))
  },


  setup(props, context) {

    const userFormRef = ref<any>(null);
    const searchRef = ref<any>(null);
    const notificationRef = ref<any>(null);
    const authStore = useAuthStore();
    const router = useRouter();
    const route = useRoute();
    const configurationDialogVisible = ref(false);
    const configurationState = ref<InstallationState>({ status: 'COMPLETED' });

    const sidebarCollapsed = ref(window.localStorage.getItem('kiwik.sidebarCollapsed') === '1');
    watch(sidebarCollapsed, (value) => {
      window.localStorage.setItem('kiwik.sidebarCollapsed', value ? '1' : '0');
    });
    const sidebarModules = computed(() => visibleAppModules());

    function isModuleActive(m: { ruta: string }): boolean {
      const name = String(route.name ?? '');
      return name === m.ruta || (MODULE_CHILDREN[m.ruta] || []).includes(name);
    }

    function navTo(m: { ruta: string; disponible: boolean }) {
      if (!m.disponible) return;
      if (String(route.name ?? '') === m.ruta) return;
      router.push({ name: m.ruta });
    }

    const controller = Frm_Main as any;
    const setupResult = controller.setup ? controller.setup(props, context) : {};

    const verPerfilUsuarioProfile = () => {
         userFormRef.value.visibleInputs= false;
         userFormRef.value?.open(authStore.user?.pkid);
    };

    const openNotifications = () => {
         notificationRef.value?.open();
    };

    const deploymentLabel = computed(() => {
      if (configurationState.value.deploymentMode === 'STANDARD_CLOUD') return 'KiwiKERP Standard Cloud';
      if (configurationState.value.deploymentMode === 'CUSTOM_CLOUD') return 'KiwiKERP Custom Cloud';
      return 'Instalación en servidor propio';
    });

    const openInitialConfiguration = async () => {
      configurationDialogVisible.value = false;
      await router.push({ name: 'Frm_Ajustes', query: { setup: '1' } });
    };

    onMounted(async () => {
      if (setupResult.userFormRef) {
        setupResult.userFormRef.value = userFormRef.value;
      }
      const installation = await getInstallationState();
      configurationState.value = installation;
      configurationDialogVisible.value = installation.status === 'COMPLETED'
        && installation.configurationRequired === true
        && authStore.user?.admin === true;
    });

return {
      ...setupResult,
      userFormRef,
      searchRef,
      notificationRef,
      verPerfilUsuarioProfile,
      openNotifications,
      configurationDialogVisible,
      configurationState,
      deploymentLabel,
      openInitialConfiguration,
      sidebarCollapsed,
      sidebarModules,
      isModuleActive,
      navTo
    };
  }


});
</script>

<style scoped>
.initial-configuration-header { display:flex; align-items:center; gap:14px; }
.initial-configuration-header small { color:#71805f; font-size:.7rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
.initial-configuration-header h2 { margin:3px 0 0; color:#202a37; font-size:1.25rem; }
.initial-configuration-icon { display:grid; width:44px; height:44px; place-items:center; border-radius:12px; color:#5f7d07; background:#edf5d5; font-size:1.15rem; }
.initial-configuration-copy { margin:0 0 18px; color:#687386; line-height:1.55; }
.initial-configuration-mode { display:flex; align-items:center; gap:13px; padding:15px; border:1px solid #dce7c3; border-radius:12px; background:#f8fbef; }
.initial-configuration-mode>i { color:#769808; font-size:1.3rem; }
.initial-configuration-mode span,.initial-configuration-mode strong { display:block; }
.initial-configuration-mode span { color:#6e7b62; font-size:.72rem; font-weight:800; text-transform:uppercase; }
.initial-configuration-mode strong { margin-top:4px; color:#344054; font-size:.84rem; word-break:break-all; }
.initial-configuration-help { margin:13px 2px 0; color:#758093; font-size:.82rem; line-height:1.5; }
.initial-configuration-action { border-color:#9cc10a!important; background:#9cc10a!important; color:#253000!important; font-weight:750!important; }

.fm-search-pill { display:inline-flex; align-items:center; gap:8px; padding:7px 12px; border:1px solid #e3e7ee; border-radius:999px; background:#fbfcfd; color:#5a6472; font-size:.86rem; cursor:pointer; transition:border-color .15s, box-shadow .15s; }
.fm-search-pill:hover { border-color:#9cc10a; box-shadow:0 4px 12px rgba(156,193,10,.18); }
.fm-search-pill kbd { padding:1px 6px; border:1px solid #d9dfe8; border-radius:5px; background:#f1f3f6; color:#7a8392; font-size:.66rem; font-family:inherit; font-weight:700; }

.fm-body { flex:1; display:flex; min-height:0; }

.fm-sidebar { flex:0 0 240px; display:flex; flex-direction:column; background:#fff; border-right:1px solid #e8ebf1; box-shadow:2px 0 12px rgba(17,24,39,.04); transition:flex-basis .22s ease; }
.fm-sidebar--collapsed { flex-basis:64px; }
.fm-sidebar__head { display:flex; align-items:center; justify-content:space-between; padding:10px 10px 8px 20px; min-height:50px; }
.fm-sidebar--collapsed .fm-sidebar__head { justify-content:center; padding:10px 8px; }
.fm-sidebar__title { color:#707a88; font-size:.72rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
.fm-sidebar__toggle { display:grid; width:30px; height:30px; place-items:center; border:none; border-radius:8px; background:#f1f3f6; color:#5a6472; cursor:pointer; font-size:.8rem; transition:background .15s, color .15s; }
.fm-sidebar__toggle:hover { background:#e7f2cd; color:#5f7d07; }
.fm-sidebar__nav { flex:1; display:flex; flex-direction:column; gap:6px; padding:8px 10px; overflow-y:auto; overflow-x:hidden; }
.fm-sidebar__item { display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border:none; border-radius:10px; background:transparent; color:#374151; font:inherit; font-weight:700; text-align:left; cursor:pointer; transition:background .15s, color .15s; }
.fm-sidebar__item:hover { background:#f2f5ea; }
.fm-sidebar__item--active { background:#eef5d7; color:#42560c; box-shadow:inset 2.5px 0 0 #9cc10a; }
.fm-sidebar__item--disabled { opacity:.5; cursor:default; }
.fm-sidebar__item--disabled:hover { background:transparent; }
.fm-sidebar__item-icon { display:grid; width:32px; height:32px; flex:0 0 auto; place-items:center; border-radius:9px; font-size:.9rem; }
.fm-sidebar__item-label { flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.fm-sidebar__item-arrow { font-size:.72rem; color:#a7afbc; flex:0 0 auto; }
.fm-sidebar--collapsed .fm-sidebar__item { justify-content:center; padding:9px 0; }
.fm-sidebar__foot { display:flex; align-items:center; gap:10px; padding:14px 20px; border-top:1px dashed #e5e9f0; color:#98a0ad; font-size:.76rem; font-weight:800; letter-spacing:.05em; }

@media (max-width: 920px) {
  .fm-sidebar { flex-basis:64px; }
  .fm-sidebar__title, .fm-sidebar__item-label, .fm-sidebar__item-arrow, .fm-sidebar__foot { display:none; }
  .fm-sidebar__head { justify-content:center; padding:10px 8px; }
  .fm-sidebar__item { justify-content:center; padding:9px 0; }
  .fm-search-pill kbd { display:none; }
}
</style>
