<!-- Frm_Ajustes.vue -->
<template>
    

    <div style="padding: 20px;">
      
       <h1 style="color: #C0C0C0; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px;">
        Ajustes del Sistema
      </h1>

      <p style="color: #6b7280; margin: 5px 0 0 0;">
        Configure los parámetros, usuarios, establecidos para KiwiKERP.
      </p>
    </div>

    


    <div style="margin-bottom: 20px;">
        <Button label="Volver al Panel" icon="pi pi-arrow-left" class="p-button-text" @click="volverAlDashboard" />
    </div>
</template>

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