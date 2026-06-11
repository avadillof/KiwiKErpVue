import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as { pkid: number; name: string; isAdmin: false } | null,
    isAuthenticated: false
  }),
  actions: {
    setUser(userData: { pkid: number; name: string; isAdmin: boolean}) {
      this.user = userData;
      this.isAuthenticated = true;
      this.isAdmin=isN
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    }
  }
  // persist: true, // <--- ELIMINA ESTA LÍNEA
});