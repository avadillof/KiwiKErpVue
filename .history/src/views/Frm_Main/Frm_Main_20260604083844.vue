<template>
  <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafb; min-height: 100vh; display: flex; flex-direction: column;">
    
    <div style="background-color: white; border-bottom: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.03); position: relative; z-index: 10;">
      <div style="display: flex; align-items: center; gap: 20px;">
        <div style="display: flex; align-items: center;">
          <img src="../../assets/logos/LogTras.png" alt="KiwiKERP Logo" style="height: 35px; width: auto; object-fit: contain;" />
        </div>
        <div style="width: 1px; height: 30px; background-color: #e5e7eb;"></div>
        <div>
          <div style="font-size: 0.85rem; color: #9cc10a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">KiwiKERP - Sistema Integrado</div>
          <div style="font-size: 0.9rem; color: #6b7280; font-weight: 500; margin-top: 2px;">{{ fechaActual }}</div>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 25px;">
        <div style="cursor: pointer; display: flex; align-items: center; padding: 5px;" @click="verMensajes">
          <OverlayBadge v-if="mensajesNuevos > 0" :value="mensajesNuevos" severity="danger">
            <i class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
          </OverlayBadge>
          <i v-else class="pi pi-bell" style="font-size: 1.4rem; color: #4b5563;"></i>
        </div>
        <div style="width: 1px; height: 24px; background-color: #e5e7eb;"></div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 0.9rem; color: #4b5563; font-weight: 600;">{{ userName }}</span>
          <Avatar :label="userInitials" size="large" shape="circle" style="background-color: #f9fbe7; color: #648506; font-weight: 700; border: 2px solid #9cc10a; cursor: pointer;" @click="verPerfilUsuario" />
        </div>
      </div>
    </div>

    <div style="flex: 1; overflow-y: auto;">
      <router-view />
    </div>

    <div style="background-color: white; border-top: 1px solid #e5e7eb; padding: 15px 40px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); position: fixed; bottom: 0; left: 0; right: 0; z-index: 20;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <i class="pi pi-building" style="color: #9ca3af; font-size: 1rem;"></i>
        <span style="font-size: 0.85rem; color: #6b7280; font-weight: 600;">Entidad: <span style="color: #374151;">{{ empresaNombre }}</span></span>
      </div>
      <div style="display: flex; align-items: center; gap: 15px; font-size: 0.85rem; color: #9ca3af; font-weight: 500;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="../../assets/logos/LogTras.png" alt="Logo" style="height: 18px; width: auto; opacity: 0.85;" />
          <span>{{ erpInfo.nombre }} <span style="color: #9cc10a; font-weight: 700;">{{ erpInfo.version }}</span></span>
        </div>
        <div style="width: 4px; height: 4px; background-color: #d1d5db; border-radius: 50%;"></div>
        <span>&copy; {{ erpInfo.copyright }}</span>
      </div>
    </div>

  </div>
</template>