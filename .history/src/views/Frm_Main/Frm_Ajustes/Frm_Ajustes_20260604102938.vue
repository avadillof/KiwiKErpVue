<div style="margin-bottom: 20px;">
  <Button 
    label="Volver al Panel" 
    icon="pi pi-arrow-left" 
    class="p-button-text" 
    @click="volverAlDashboard" 
  />
</div>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';

export default defineComponent({
  components: { Button },
  setup() {
    const router = useRouter();
    
    function volverAlDashboard() {
      // Regresamos al Dashboard (la ruta vacía dentro de Frm_Main)
      router.push({ name: 'Dashboard' });
    }
    
    return { volverAlDashboard };
  }
});
</script>