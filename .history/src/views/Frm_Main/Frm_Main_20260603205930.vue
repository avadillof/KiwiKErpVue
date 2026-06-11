<template>
  <div style="padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh;">
    
    <div style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
      
      <div style="display: flex; align-items: center; gap: 20px;">
        
        <div style="display: flex; align-items: center;">
          <img 
            src="../../../assets/logos/LogTras.png" 
            alt="KiwiKERP Logo" 
            style="height: 35px; width: auto; object-fit: contain;" 
          />
        </div>

        <div style="width: 1px; height: 30px; background-color: #e5e7eb;"></div>

        <div>
          <div style="font-size: 0.85rem; color: #9cc10a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
            KiwiKERP - Sistema Integrado
          </div>
          <div style="font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 2px;">
            {{ fechaActual }}
          </div>
        </div>

      </div>

      <div style="display: flex; align-items: center; gap: 25px;">
        
        <div style="cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 5px; transition: transform 0.2s;"
             onmouseover="this.style.transform='scale(1.10)';"
             onmouseout="this.style.transform='scale(1)';"
             @click="verMensajes">
          
          <OverlayBadge v-if="mensajesNuevos > 0" :value="mensajesNuevos" severity="danger">
            <i class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
          </OverlayBadge>
          
          <i v-else class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
        </div>

        <div style="width: 1px; height: 24px; background-color: #e5e7eb;"></div>

        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.9rem; color: #4b5563; font-weight: 600;">{{ userName }}</span>
          <Avatar 
            :label="userInitials" 
            size="large" 
            shape="circle" 
            style="background-color: #f9fbe7; color: #648506; font-weight: 700; border: 2px solid #9cc10a; cursor: pointer; transition: transform 0.2s;"
            onmouseover="this.style.transform='scale(1.08)';"
            onmouseout="this.style.transform='scale(1)';"
            @click="verPerfilUsuario"
          />
        </div>

      </div>

    </div>

    <div style="padding: 40px;">
      
      <div style="margin-bottom: 35px;">
        <h1 style="color: #374151; margin: 0; font-size: 1.8rem; font-weight: 700;">Panel de Control</h1>
        <p style="color: #6b7280; margin: 5px 0 0 0;">
          Selecciona un módulo para empezar a trabajar en la plataforma.
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
            <div>
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 12px;">
                <div 
                  :style="{ backgroundColor: modulo.bgIcono, color: modulo.colorIcono }" 
                  style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;"
                >
                  <i :class="modulo.icono" style="font-size: 1.25rem;"></i>
                </div>
                <span style="color: #1f2937; font-size: 1.35rem; font-weight: 700;">{{ modulo.nombre }}</span>
              </div>
              <div style="height: 2px; background-color: #9cc10a; width: 100%; margin-bottom: 5px;"></div>
            </div>
          </template>

          <template #content>
            <p style="margin: 0; color: #888888; font-size: 0.95rem; font-weight: 600; line-height: 1.5; min-height: 45px;">
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
                style="padding: 5px 10px; font-weight: 600; background: transparent; border: none; border-radius: 6px; cursor: pointer; color: #9cc10a; transition: background-color 0.2s, color 0.2s;"
                onmouseover="this.style.backgroundColor='#f9fbe7'; this.style.color='#648506';"
                onmouseout="this.style.backgroundColor='transparent'; this.style.color='#9cc10a';"
              />
            </div>
          </template>
        </Card>

      </div>