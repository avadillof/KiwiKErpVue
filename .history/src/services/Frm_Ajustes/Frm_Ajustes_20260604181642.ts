// Frm_Ajustes.ts

import { ref } from 'vue';
// ... otros imports necesarios


// src/services/Frm_Ajustes/Frm_Ajustes.ts

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
  address: string;
  addressNumber: string;
  zipCode: string;
  city: string;
  province: s
  // Añade aquí cualquier otro campo que necesites
}

export function Frm_Ajustes() {
  // Inicializamos con valores por defecto
  const formData = ref<ConfigData>({
    entitie: '',
    cif: '',
    logoHtml: '',
    email: '',
    phone: '',
    portalWeb: '',
    smtpServer: '',
    smtpPort: 587,
    smtpUser: ''
  });

  const loading = ref(false);

  function saveData() {
    console.log("Guardando...", formData.value);
  }

  return { formData, loading, saveData };
}