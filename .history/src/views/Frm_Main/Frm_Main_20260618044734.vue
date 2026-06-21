<template>
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">
    
    <div style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); position: relative; z-index: 10;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="../../assets/logos/LogTras.png" alt="KiwiKERP Logo" style="height: 35px; width: auto; object-fit: contain;" />
        </div>
        <div style="width: 1px; height: 30px; background-color: #e5e7eb;"></div>
        <div>
          <div style="font-size: 0.85rem; color: #9cc10a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">KiwiKERP - Sistema Integrado</div>
          <div style="font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 2px;">{{ fechaActual }}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 25px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="cursor: pointer; display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 0.9rem;" @click="desconectar">
            <i class="pi pi-sign-out"></i>
            <span>Salir</span>
          </div>

          <Avatar size="large" shape="circle" style="cursor: pointer; overflow: hidden; position: relative;" @click="verPerfilUsuario">
            <img v-if="userPkid > 0" :src="getProfilePhotoUrl(userPkid)" @error="(e: any) => e.target.style.display = 'none'" class="w-full h-full" style="object-fit: cover; position: absolute; top: 0; left: 0;" />
            <span style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">{{ userInitials }}</span>
          </Avatar>
        </div>
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto;">
      <router-view />
    </div>

    <Frm_UserForm ref="userFormRef" />
  </div>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent, ref } from 'vue';
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Frm_Main from '../../services/Frm_Main/Frm_Main';

export default defineComponent({
  name: 'Frm_MainLayout',
  components: { 
    Avatar, 
    OverlayBadge,
    Frm_UserForm: defineAsyncComponent(() => import('../../views/Frm_Main/Frm_Ajustes/Frm_UserForm.vue'))
  },
  setup(props, context) {
    const userFormRef = ref<any>(null);
    const controller = Frm_Main as any;
    
    // Ejecutar el setup del controlador
    const setupResult = controller.setup ? controller.setup(props, context) : {};
    
    // Inyectar la ref definida en la vista hacia el controlador
    setupResult.userFormRef = userFormRef;
    
    return {
      ...setupResult,
      userFormRef
    };
  }
});
</script>