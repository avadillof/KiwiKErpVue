import { ref } from 'vue';

// 1. Definimos la interfaz una sola vez fuera de la función
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
    address: string;
    addressNumber: string;
    zipCode: string;
    city: string;
    province: string;
    slogan: string;
    
    // Propiedades booleanas para SMTP
    smtpAuth: boolean;
    starttlsEnable: boolean;
    starttlsRequired: boolean;
    
    // Propiedades de texto
    sslProtocols: string;
    mailSender: string;
}

export function Frm_Ajustes() {
    // 2. Inicializamos el estado
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
    address: '',
    addressNumber: '',
    zipCode: '',
    city: '',
    province: '',
    slogan: '',
    // Valores booleanos por defecto
    smtpAuth: true,
    starttlsEnable: true,
    starttlsRequired: true,
    // Valores de texto por defecto
    sslProtocols: 'TLSv1.2',
    mailSender: ''
});
    // 3. Lista de provincias
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

    // 4. Devolvemos todo lo necesario para usarlo en el componente .vue
    return { 
        formData, 
        loading, 
        saveData, 
        provincias 
    };
}