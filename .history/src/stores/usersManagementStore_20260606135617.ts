import { defineStore } from 'pinia';
import { ref } from 'vue';
// Importa aquí tu servicio de API, por ejemplo:
// import { api } from '@/services/api'; 


export interface User {
    USER_DS_CODE: string;
    USER_DS_NAME: string;
    USER_DS_EMAIL: string;
    USER_BOL_ENABLED: boolean;
}

export const useUsersManagementStore = defineStore('usersManagement', () => {
    // Aquí le decimos explícitamente que es un array de User
    const allUsers = ref<User[]>([]); 
    const loading = ref(false);

    async function loadAllUsers() {
        loading.value = true;
        try {
            // Ahora TypeScript te permitirá asignar objetos de este tipo
            // ... tu lógica de fetch ...
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            loading.value = false;
        }
    }

    return { allUsers, loading, loadAllUsers };
});



async function loadAllUsers() {
        loading.value = true;
        try {
            // Ejemplo usando una función de servicio genérica (ajusta a tu proyecto)
            const response = await api.get('/WebGetUsers'); 
            
            // Asignamos la respuesta al estado
            allUsers.value = response.data as User[];
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        } finally {
            loading.value = false;
        }
    }