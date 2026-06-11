<template>
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">
    
    <div style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); position: relative; z-index: 10;">
       </div>

    <div style="flex: 1; padding: 40px 40px 70px 40px; overflow-y: auto;">
      <router-view />
    </div>

    <div style="background-color: white; border-top: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;">
       </div>

  </div>
</template>

<script lang="ts">
import { defineComponent, type ComponentOptions } from 'vue'; // <--- Fíjate en el 'type' aquí
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Frm_Main from '../../../services/Frm_Main/Frm_Main';

export default defineComponent({
  name: 'Frm_MainLayout',
  components: { Avatar, OverlayBadge },
  setup(props, context) {
    // Al usar 'as ComponentOptions', TypeScript ahora sabe que es solo una interfaz
    const controller = Frm_Main as ComponentOptions;
    
    if (controller.setup) {
      return controller.setup(props, context) as any;
    }
    
    return {};
  }
});
</script>