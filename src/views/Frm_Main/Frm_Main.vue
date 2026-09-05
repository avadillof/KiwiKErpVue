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
        <!-- Manual de usuario -->
        <div
          role="button"
          title="Abrir el manual de usuario"
          style="cursor: pointer; display: flex; align-items: center; gap: 7px; padding: 5px; color: #6b7280; font-size: 0.9rem;"
          @click="$router.push({ name: 'ManualUsuario' })">
          <i class="pi pi-question-circle" style="font-size: 1.35rem; color: #648506;"></i>
          <span>Manual</span>
        </div>

        <!-- Notificaciones -->
        <div style="cursor: pointer; display: flex; align-items: center; padding: 5px;" @click="verMensajes">
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

    <!-- CONTENIDO DINÁMICO -->
    <div style="flex: 1; overflow-y: auto;">
      <router-view />
    </div>

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
import { computed, defineComponent, ref, defineAsyncComponent, onMounted } from 'vue';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Frm_Main from '../../services/Frm_Main/Frm_Main';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'vue-router';
import { getInstallationState, type InstallationState } from '../../services/Installation/installationService';

export default defineComponent({
  name: 'Frm_MainLayout',
  components: {
    Avatar,
    OverlayBadge,
    Dialog,
    Button,
    // Usamos Async para evitar que TS valide los tipos internos del formulario durante la compilación
    Frm_UserForm: defineAsyncComponent(() => import('../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue'))
  },


  setup(props, context) {

    const userFormRef = ref<any>(null);
    const authStore = useAuthStore();
    const router = useRouter();
    const configurationDialogVisible = ref(false);
    const configurationState = ref<InstallationState>({ status: 'COMPLETED' });

    const controller = Frm_Main as any;
    const setupResult = controller.setup ? controller.setup(props, context) : {};

    const verPerfilUsuarioProfile = () => {
         userFormRef.value.visibleInputs= false;
         userFormRef.value?.open(authStore.user?.pkid);
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
      verPerfilUsuarioProfile,
      configurationDialogVisible,
      configurationState,
      deploymentLabel,
      openInitialConfiguration
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
</style>
