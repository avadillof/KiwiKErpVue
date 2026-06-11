// Frm_Ajustes.ts

import { ref } from 'vue';
// ... otros imports necesarios


interface ConfigData {
  entitie: string;
  cif: string;
  logoHtml: string;
  email: string;
  phone: string;
  portalWeb: string;
  smtpServer: string;
  smtpPort: number;
  smtpUser: string;
  // Añade aquí cualquier otro campo que necesites
}

export function Frm_Ajustes() {
    // 1. Definimos las variables reactivas
    const loading = ref(false);
    const formData = ref({
        loc1: '',
        loc2: '',
        locFull: ''
    });

    // 2. Definimos la función de guardado
    async function saveData() {
        // ... lógica de tu fetch ...
    }

    // 3. ¡IMPORTANTE! Debes retornar el objeto para que el .vue pueda verlo
    return {
        formData,
        loading,
        saveData
    };
}