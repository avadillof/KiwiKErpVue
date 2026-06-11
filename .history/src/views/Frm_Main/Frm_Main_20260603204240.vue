<script lang="ts">
import { defineComponent } from 'vue';

// 1. Importamos localmente los componentes de PrimeVue para la vista
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

// 2. Importamos tu controlador TypeScript externo
import Frm_MainController from '../../services/Frm_Main/Frm_Main';

export default defineComponent({
  name: 'Frm_MainView',
  
  // Registramos los componentes de PrimeVue que usa la plantilla HTML
  components: {
    Card,
    Button,
    Divider
  },
  
  // Conectamos con el método setup del controlador de forma tradicional
  setup(props, context) {
    return Frm_MainController.setup(props, context);
  }
});
</script>