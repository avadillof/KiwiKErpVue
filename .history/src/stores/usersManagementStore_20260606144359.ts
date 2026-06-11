import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api'; // Asegúrate de tener tu instancia de API importada

export interface UserGroup {
    id: number;
    descriptionEs: string;
    descriptionEn: string;
    admin: boolean;
}

export interface User {
    userKyId: number;
    userDsCode: string;
    userDsName: string;
    userDsEmail: string;
    userDsPassword?: string; // Opcional, ya que normalmente no deberías usarlo en el front
    userBolEnabled: boolean;
    userGroup: UserGroup; // Relación mapeada correctamente
    token?: string;       // Opcional por ser @Transient
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