<template>
  <div style="padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh;">
    
    <div style="margin-bottom: 35px;">
      <h1 style="color: #374151; margin: 0; font-size: 1.8rem; font-weight: 700;">Panel de Control</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">
        Bienvenido de nuevo, <span style="color: #B1D70E; font-weight: bold;">{{ userName }}</span>. Selecciona un módulo para empezar a trabajar.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px;">
      
      <Card 
        v-for="modulo in modulosVisibles" 
        :key="modulo.id"
        style="border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; background-color: white;"
        class="p-shadow-1"
        onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
        @click="navegarA(modulo.ruta)"
      >
        <template #title>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div 
              :style="{ backgroundColor: modulo.bgIcono, color: modulo.colorIcono }" 
              style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"
            >
              <i :class="modulo.icono" style="font-size: 1.25rem;"></i>
            </div>
            <span style="color: #1f2937; font-size: 1.2rem; font-weight: 600;">{{ modulo.nombre }}</span>
          </div>
        </template>

        <template #content>
          <p style="margin: 0; color: #6b7280; font-size: 0.875rem; line-height: 1.5; min-height: 42px;">
            {{ modulo.descripcion }}
          </p>
        </template>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <Button 
              label="Acceder" 
              icon="pi pi-chevron-right" 
              iconPos="right"
              class="p-button-text p-button-sm"
              :style="{ color: modulo.colorIcono }"
              style="padding: 0; font-weight: 600; background: transparent; border: none;"
            />
          </div>
        </template>
      </Card>

    </div>

    <Divider align="left" style="margin: 40px 0 25px 0;">
      <span style="color: #4b5563; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <i class="pi pi-th-large" style="color: #B1D70E;"></i> Vista Rápida
      </span>
    </Divider>

    <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 45px; text-align: center; color: #9ca3af;">
      <i class="pi pi-chart-line" style="font-size: 2rem; margin-bottom: 12px; color: #d1d5db;"></i>
      <p style="margin: 0; font-size: 0.9rem; font-weight: 500;">
        Los widgets informativos (gráficas de ventas, accesos rápidos y alertas de stock) se cargarán en este espacio próximamente.
      </p>
    </div>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// Importamos localmente los componentes de PrimeVue para asegurar su resolución
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';

// Importamos tu controlador TypeScript externo
import Frm_MainController from '../../services/Frm_Main/Frm_Main';

export default defineComponent({
  name: 'Frm_MainView',
  // Combinamos el controlador externo añadiendo el registro de componentes locales
  ...Frm_MainController,
  components: {
    Card,
    Button,
    Divider
  }
});
</script>