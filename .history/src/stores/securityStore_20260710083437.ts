import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSecurityStore = defineStore('security', () => {

    /**
     * Todos los permisos del usuario
     * clave -> código
     * valor -> acceso
     */
    const permissions = ref(new Map<string, boolean>())

    /**
     * Vaciar seguridad
     */
    function clear() {
        permissions.value.clear()
    }

    /**
     * Añadir un permiso
     */
    function setPermission(code: string, value: boolean) {
        permissions.value.set(code, value)
    }

    /**
     * Consultar permiso
     */
    function can(code: string): boolean {
        return permissions.value.get(code) === true
    }

    return {
        permissions,
        clear,
        setPermission,
        can
    }

})