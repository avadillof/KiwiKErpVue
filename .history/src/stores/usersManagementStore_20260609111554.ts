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
    userDtLastAccess?: string;
}

export const useUsersManagementStore = defineStore('usersManagement', () => {
    const allUsers = ref<User[]>([]);
    const loading = ref(false);

   

    // En tu store (usersManagementStore.ts)
    function getRoleDetails(roleName: string) {
        const name = roleName?.toLowerCase() || '';

        if (name.includes('administrador') || name.includes('administrator')) {
            return { severity: 'danger', icon: 'pi pi-shield', label: 'Administrador' };
        }
        if (name.includes('tpv')) {
            return { severity: 'warn', icon: 'pi pi-desktop', label: 'Usuario TPV' };
        }
        return { severity: 'info', icon: 'pi pi-user', label: 'Usuario' };
    }

    return { allUsers, loading, loadAllUsers, getRoleDetails };
});