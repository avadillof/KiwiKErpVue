<template>
  <div style="padding: 40px; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh;">
    
    <div style="margin-bottom: 35px;">
      <h1 style="color: #374151; margin: 0; font-size: 1.8rem;">Panel de Control</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">
        Bienvenido de nuevo, <span style="color: #B1D70E; font-weight: bold;">{{ userName }}</span>. Selecciona un módulo para empezar a trabajar.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 25px; margin-bottom: 40px;">
      
      <div 
        v-for="modulo in modulosVisibles" 
        :key="modulo.id"
        @click="navegarA(modulo.ruta)"
        style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 25px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"
        onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 15px -3px rgba(0,0,0,0.1)';"
        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)';"
      >
        <div 
          :style="{ backgroundColor: modulo.colorBg, color: modulo.colorTexto }" 
          style="width: 45px; height: 45px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin-bottom: 15px; font-weight: bold;"
        >
          {{ modulo.icono }}
        </div>
        
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 1.2rem;">{{ modulo.nombre }}</h3>
        <p style="margin: 0; color: #6b7280; font-size: 0.85rem; line-height: 1.4;">{{ modulo.descripcion }}</p>
      </div>

    </div>

    <div style="border-top: 1px dashed #e5e7eb; padding-top: 30px;">
      <h2 style="color: #4b5563; font-size: 1.3rem; margin-bottom: 15px;">Vista Rápida</h2>
      <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 8px; padding: 40px; text-align: center; color: #9ca3af;">
        <p style="margin: 0; font-size: 0.9rem;">
          Los widgets informativos (gráficas, accesos rápidos y alertas) se cargarán en este espacio próximamente.
        </p>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
// CORRECCIÓN DE RUTA: Apunta directamente a la carpeta de servicios asignada
import Frm_MainController from '../../services/Frm_Main/Frm_Main';
export default Frm_MainController;
</script>