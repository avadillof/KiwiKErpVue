<template>
    <div style="padding: 20px;">
        <h1 style="color: #C0C0C0; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px;">
            Ajustes del Sistema
        </h1>
        <p style="color: #6b7280; margin: 5px 0 20px 0;">
            Configure parámetros, usuarios establecidos para KiwiKERP.
        </p>

        <div style="margin-bottom: 20px;">
            <Button label="Volver al Panel" icon="pi pi-arrow-left" text @click="volverAlDashboard" />
        </div>

        <div class="card">
            <TabView v-model:activeTab="activeTab">
                <TabPanel header="Configuración General" value="0"> ... </TabPanel>
                <TabPanel header="Gestión de Usuarios" value="1"> ... </TabPanel>
            </TabView>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { Frm_Ajustes } from '../../../services/Frm_Ajustes/Frm_Ajustes';
import { ref } from 'vue';
const activeTab = ref('0');
const router = useRouter();
const { formData, loading, saveData } = Frm_Ajustes();

function volverAlDashboard() {
    router.push({ name: 'Dashboard' });
}
</script>