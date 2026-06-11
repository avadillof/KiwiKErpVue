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
  province: string;
  // Añade aquí cualquier otro campo que necesites
}

export function Frm_Ajustes() {
  // Inicializamos con valores por defecto
  // 1. Asegúrate de tener la interfaz actualizada
export interface ConfigData {
  entitie: string;
  cif: string;
  logoHtml: string;
  email: string;
  phone: string;
  portalWeb: string;
  smtpServer: string;
  smtpPort: number;
  smtpUser: string;
  // Nuevos campos de dirección
  address: string;
  addressNumber: string;
  zipCode: string;
  city: string;
  province: string;
}

// 2. Actualiza tu objeto formData con los valores iniciales
const formData = ref<ConfigData>({
  entitie: '',
  cif: '',
  logoHtml: '',
  email: '',
  phone: '',
  portalWeb: '',
  smtpServer: '',
  smtpPort: 587,
  smtpUser: '',
  // Inicializa los nuevos campos como strings vacíos
  address: '',
  addressNumber: '',
  zipCode: '',
  city: '',
  province: ''
});

  // En tu componente <script setup lang="ts">
const provincias = [
  { nombre: 'Álava' }, { nombre: 'Albacete' }, { nombre: 'Alicante' }, { nombre: 'Almería' },
  { nombre: 'Ávila' }, { nombre: 'Badajoz' }, { nombre: 'Baleares' }, { nombre: 'Barcelona' },
  { nombre: 'Burgos' }, { nombre: 'Cáceres' }, { nombre: 'Cádiz' }, { nombre: 'Castellón' },
  { nombre: 'Ciudad Real' }, { nombre: 'Córdoba' }, { nombre: 'A Coruña' }, { nombre: 'Cuenca' },
  { nombre: 'Girona' }, { nombre: 'Granada' }, { nombre: 'Guadalajara' }, { nombre: 'Gipuzkoa' },
  { nombre: 'Huelva' }, { nombre: 'Huesca' }, { nombre: 'Jaén' }, { nombre: 'León' },
  { nombre: 'Lleida' }, { nombre: 'La Rioja' }, { nombre: 'Lugo' }, { nombre: 'Madrid' },
  { nombre: 'Málaga' }, { nombre: 'Murcia' }, { nombre: 'Navarra' }, { nombre: 'Ourense' },
  { nombre: 'Asturias' }, { nombre: 'Palencia' }, { nombre: 'Las Palmas' }, { nombre: 'Pontevedra' },
  { nombre: 'Salamanca' }, { nombre: 'Santa Cruz de Tenerife' }, { nombre: 'Cantabria' },
  { nombre: 'Segovia' }, { nombre: 'Sevilla' }, { nombre: 'Soria' }, { nombre: 'Tarragona' },
  { nombre: 'Teruel' }, { nombre: 'Toledo' }, { nombre: 'Valencia' }, { nombre: 'Valladolid' },
  { nombre: 'Bizkaia' }, { nombre: 'Zamora' }, { nombre: 'Zaragoza' }
];

  const loading = ref(false);

  function saveData() {
    console.log("Guardando...", formData.value);
  }

  return { formData, loading, saveData };
}