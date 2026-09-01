import { defineStore } from 'pinia';

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
      if(token) void fetch(`${import.meta.env.VITE_API_URL}/WebLogoutPortalSession`, {method:'POST',headers:{'X-Portal-Session':token}}).catch(()=>{});
      this.user = null;
      this.isAuthenticated = false;
    },
    refreshUserPhoto() {
      // Al cambiar este valor, cualquier componente que lo use se actualizará
      this.photoTimestamp = Date.now();
    }
  }
});