import { backendUrl } from '@/services/backendUrl';
import { defineStore } from 'pinia';
import { useSecurityStore } from './securityStore';

// Definimos la estructura del usuario para que TypeScript sea feliz
interface User {
  pkid: number;
  name: string;
  admin: boolean; 
  userDsCode: string
  
  // Agregamos la propiedad necesaria
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Actualizamos el tipo para que acepte la nueva estructura
    user: null as User | null,
    isAuthenticated: false,
    portalSession: '',
    photoTimestamp: Date.now()
  }),
  actions: {
    // Actualizamos el tipo en el parámetro para que coincida
      setUser(userData: User, portalSession = '') {
      this.user = userData;
      this.portalSession = portalSession;
      this.isAuthenticated = true;      
    },
    portalRequestConfig() {
      if (!this.isAuthenticated || !this.portalSession) throw new Error('Vuelve a iniciar sesión en el portal para autorizar esta acción.');
      return {headers: {'X-Portal-Session': this.portalSession}};
    },
    logout() {
      const token=this.portalSession;
      this.portalSession='';
      if(token) void fetch(backendUrl(`/WebLogoutPortalSession`), {method:'POST',headers:{'X-Portal-Session':token}}).catch(()=>{});
      try {
        useSecurityStore().clearSecurity();
      } catch { /* sin pinia activo: no hay seguridad que limpiar */ }
      this.user = null;
      this.isAuthenticated = false;
      // Los recientes son por navegador: limpiarlos evita que el siguiente
      // usuario vea (y reabra) módulos del anterior.
      try { window.localStorage.removeItem('kiwik.menuRecents'); } catch { /* sin almacenamiento */ }
    },
    refreshUserPhoto() {
      // Al cambiar este valor, cualquier componente que lo use se actualizará
      this.photoTimestamp = Date.now();
    }
  }
});