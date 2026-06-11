
<script lang="ts">
import { defineComponent, type ComponentOptions } from 'vue'; // <--- Fíjate en el 'type' aquí
import Avatar from 'primevue/avatar';
import OverlayBadge from 'primevue/overlaybadge';
import Frm_Main from '../../services/Frm_Main/Frm_Main';

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