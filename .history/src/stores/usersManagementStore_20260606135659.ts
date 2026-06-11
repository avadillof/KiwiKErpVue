import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api'; // Asegúrate de tener tu instancia de API importada

export interface User {
    USER_DS_CODE: string;
    USER_DS_NAME: string;
    USER_DS_EMAIL: string;
    USER_BOL_ENABLED: boolean;
}

export const useUsersManagementStore = defineStore('usersManagement', () => {
    const allUsers = ref<User[]>([]); 
    const loading = ref(false);

    async function loadAllUsers() {
        loading.value = true;
        try {
            // Realizamos la petición al endpoint
            const response = await api.get('/WebGetUsers'); 
            
            // Asignamos los datos tipados
            allUsers.value = response.data as User[];
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            // Opcional: podrías resetear allUsers.value = [] en caso de error
        } finally {
            loading.value = false;
        }
    }

    return { allUsers, loading, loadAllUsers };
});