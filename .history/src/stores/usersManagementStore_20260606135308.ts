import { defineStore } from 'pinia';
import { ref } from 'vue';
// Importa aquí tu servicio de API, por ejemplo:
// import { api } from '@/services/api'; 

export const useUsersManagementStore = defineStore('usersManagement', () => {
    const allUsers = ref([]);
    const loading = ref(false);

    // Acción para cargar todos los usuarios
    async function loadAllUsers() {
        loading.value = true;
        try {
            // Ejemplo de llamada a tu endpoint
            // const response = await api.get('/WebGetUsers');
            // allUsers.value = response.data;
            
            // Simulando una carga si aún no tienes el endpoint conectado
            allUsers.value = [
                { USER_DS_CODE: 'U001', USER_DS_NAME: 'Andrés Vadillo', USER_DS_EMAIL: 'andres@freelandsite.com', USER_BOL_ENABLED: true },
                { USER_DS_CODE: 'U002', USER_DS_NAME: 'Usuario Demo', USER_DS_EMAIL: 'demo@angodos.es', USER_BOL_ENABLED: false }
            ];
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            loading.value = false;
        }
    }

    return { allUsers, loading, loadAllUsers };
});