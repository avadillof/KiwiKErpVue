import { defineStore } from 'pinia';

// Definimos la estructura del usuario para que TypeScript sea feliz
interface User {
  pkid: number;
  name: string;
  admin: boolean; 
  code: string
  
  // Agregamos la propiedad necesaria
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Actualizamos el tipo para que acepte la nueva estructura
    user: null as User | null,
    isAuthenticated: false
  }),
  actions: {
    // Actualizamos el tipo en el parámetro para que coincida
      setUser(userData: User) {
      this.user = userData;
      this.isAuthenticated = true;
      this.co
    },
    logout() {
      this.user = null;
      this.isAuthenticated = false;
    }
  }
});