import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { pkid: number; name: string } | null,
    isAuthenticated: false
  }),
  actions: {
    setUser(userData: { pkid: number; name: string }) {
      this.user = userData;
      this.isAuthenticated = true;
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    }
  },
  // Opcional: Persistir en localStorage para que no se borre al refrescar F5
  persist: true 
});