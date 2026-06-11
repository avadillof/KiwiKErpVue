import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUsersManagementStore = defineStore('usersManagement', () => {
    const allUsers = ref([]);
    const loading = ref(false);

    // Acción para cargar todos los usuarios
    async function loadAllUsers() {
        loading.value = true;
        try {
            // Ejemplo: const response = await api.get('/WebGetUsers');
            // allUsers.value = response.data;
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            loading.value = false;
        }
    }

    return { allUsers, loading, loadAllUsers };
});