<!-- Frm_Ajustes.vue -->
<template>
    <div style="padding: 20px;">
        <h1>Ajustes del Sistema</h1>
        <p>Configuración general y gestión de usuarios.</p>
        <!-- Aquí puedes añadir tus formularios de configuración -->
    </div>

    <div style="margin-bottom: 35px;">
      <h1 style="color: #374151; margin: 0; font-size: 1.8rem; font-weight: 700;">Panel de Control</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">
        Selecciona un módulo para empezar a trabajar en la plataforma.
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