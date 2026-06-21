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
        <div>
          <div
            style="font-size: 0.85rem; color: #9cc10a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            KiwiKERP - Sistema Integrado</div>
          <div style="font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 2px;">{{ fechaActual }}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 25px;">
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



            <Avatar size="large" shape="circle"
              style="background-color: #f9fbe7; color: #648506; font-weight: 700; border: 2px solid #9cc10a; cursor: pointer; overflow: hidden; position: relative;"
              @click="verPerfilUsuario">
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

      <div style="display: flex; align-items: center; gap: 1px; font-size: 0.85rem; color: #9ca3af; font-weight: 500;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="../../assets/logos/LogTras.png" alt="Logo" style="height: 18px; width: auto; opacity: 0.85;" />
          <span>{{ erpInfo.nombre }} <span style="color: #9cc10a; font-weight: 700;">{{ erpInfo.version }}</span></span>
        </div>
        <div style="width: 4px; height: 4px; background-color: #d1d5db; border-radius: 50%;"></div>
        <span>&copy; {{ erpInfo.copyright }}</span>
      </div>
    </div>
    
    <Frm_UserForm ref="userFormRef" />
  </div>


</template>





<script lang="ts">
import { defineComponent, ref, defineAsyncComponent } from 'vue';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Frm_Main from '../../services/Frm_Main/Frm_Main';

export default defineComponent({
  name: 'Frm_MainLayout',
  components: { 
    Avatar, 
    OverlayBadge,
    // Usamos Async para evitar que TS valide los tipos internos del formulario durante la compilación
    Frm_UserForm: defineAsyncComponent(() => import('../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue'))
  },
  setup(props, context) {
    // 1. Definimos la referencia aquí en la vista
    const userFormRef = ref<any>(null);
    
    // 2. Ejecutamos el setup del controlador
    const controller = Frm_Main as any;
    const setupResult = controller.setup ? controller.setup(props, context) : {};

    // 3. Inyectamos nuestra referencia al resultado del controlador
    // Esto permite que 'verPerfilUsuario' en Frm_Main.ts acceda al formulario
    if (setupResult) {
        setupResult.userFormRef = userFormRef;
    }

    // 4. Retornamos todo fusionado para que el template acceda a las funciones del controlador
    // y a la referencia del formulario
    return {
      ...setupResult,
      userFormRef
    };
  }
});
</script>

<template>
  <Frm_UserForm ref="userFormRef" />
</template>