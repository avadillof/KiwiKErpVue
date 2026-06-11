<template>
  <div style="padding: 20px;">

    <div style="margin-bottom: 35px;">
      <h1 style="color: #C0C0C0; margin: 0; font-size: 2rem; font-weight: 700; letter-spacing: -0.5px;">
        Panel de Control
      </h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">
        Selecciona un módulo para empezar a trabajar en la plataforma.
      </p>
    </div>


    <div
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px;">
      <Card v-for="modulo in modulosVisibles" :key="modulo.id"
        style="border: 1px solid #e5e7eb; border-radius: 12px; cursor: pointer; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; background-color: white;"
        class="p-shadow-1"
        onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
        @click="navegarA(modulo.ruta)">
        <template #title>
          <div>
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
              <div :style="{ backgroundColor: modulo.bgIcono, color: modulo.colorIcono }"
                style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i :class="modulo.icono" style="font-size: 1.25rem;"></i>
              </div>
              <span style="color: #1f2937; font-size: 1.35rem; font-weight: 700;">{{ modulo.nombre }}</span>
            </div>
            <div style="height: 2px; background-color: #9cc10a; width: 100%; margin-bottom: 5px;"></div>
          </div>
        </template>

        <template #content>
          <p
            style="margin: 0; color: #888888; font-size: 0.95rem; font-weight: 600; line-height: 1.5; min-height: 45px;">
            {{ modulo.descripcion }}
          </p>
        </template>

        <template #footer>
          <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
            <Button label="Acceder" icon="pi pi-chevron-right" iconPos="right" class="p-button-text p-button-sm"
              style="padding: 5px 10px; font-weight: 600; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #9cc10a; transition: background-color 0.2s, color 0.2s;"
              onmouseover="this.style.backgroundColor='#f9fbe7'; this.style.color='#648506';"
              onmouseout="this.style.backgroundColor='transparent'; this.style.color='#9cc10a';" />
          </div>
        </template>
      </Card>
    </div>

    <Divider align="left" style="margin: 40px 0 25px 0;">
      <span style="color: #4b5563; font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <i class="pi pi-th-large" style="color: #9cc10a;"></i> Vista Rápida
      </span>
    </Divider>

    <div
      style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 45px; text-align: center; color: #9ca3af;">
      <i class="pi pi-chart-line" style="font-size: 2rem; margin-bottom: 12px; color: #d1d5db;"></i>
      <p style="margin: 0; font-size: 0.9rem; font-weight: 500;">
        Los widgets informativos se cargarán en este espacio próximamente.
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRouter } from 'vue-router';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import { useAuthStore } from '../../../stores/authStore'

export default defineComponent({
  name: 'Pn_DashBoard',
  components: { Card, Button, Divider },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    


    const listaModulos = [
      { id: 'ventas', nombre: 'Ventas', descripcion: 'Facturación, presupuestos y control de cobros.', icono: 'pi pi-briefcase', ruta: '/ventas', colorIcono: '#3b82f6', bgIcono: '#eff6ff' },
      { id: 'compras', nombre: 'Compras', descripcion: 'Albaranes, proveedores y gestión de gastos.', icono: 'pi pi-shopping-cart', ruta: '/compras', colorIcono: '#ef4444', bgIcono: '#fef2f2' },
      { id: 'informes', nombre: 'Informes', descripcion: 'Estadísticas, balances y analítica del negocio.', icono: 'pi pi-chart-bar', ruta: '/informes', colorIcono: '#22c55e', bgIcono: '#f0fdf4' },
      { id: 'contactos', nombre: 'Contactos', descripcion: 'Directorio de clientes, proveedores y leads.', icono: 'pi pi-users', ruta: '/contactos', colorIcono: '#ec4899', bgIcono: '#fdf2f8' },
      {
        id: 'ajustes',
        nombre: 'Ajustes',
        descripcion: 'Configuración del sistema y gestión de usuarios.',
        icono: 'pi pi-cog',
        ruta: 'Frm_Ajustes', // Usamos el nombre definido en el router
        colorIcono: '#6b7280',
        bgIcono: '#f9fafb',
        autorized: authStore.isAuthenticated
      }

    ];

    const modulosVisibles = computed(function () {
      return listaModulos.filter(function (modulo) {
        return modulo.autorized === true;
      });
    });

    function navegarA(nombreRuta: string): void {
      router.push({ name: nombreRuta });
    }

    return { modulosVisibles, navegarA };
  }
});
</script>