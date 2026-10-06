export interface HelpTutorial {
  id: string;
  title: string;
  description: string;
  module: string;
  needs: string[];
  keywords: string[];
  duration: string;
  src: string;
  topics: string[];
  /** Texto corto de la portada del tutorial (se muestra sobre la miniatura). */
  coverTitle: string;
}

// Los archivos se sirven con el Front, respetando también instalaciones bajo una subruta.
const helpBase = `${import.meta.env.BASE_URL}help/`;
export const userManualUrl = `${helpBase}manual-usuario-v0-54.pdf`;

// Añadir aquí cada tutorial publicado. No mostrar tarjetas de vídeos todavía inexistentes.
export const helpTutorials: HelpTutorial[] = [
  {
    id: 'acceso-recuperar-password',
    title: 'Iniciar sesión y recuperar tu contraseña',
    description: 'Aprende a acceder a KiwiKERP y a recuperar el acceso cuando hayas olvidado tu contraseña.',
    module: 'Primeros pasos',
    needs: ['Acceder a KiwiKERP', 'Recuperar mi contraseña'],
    keywords: ['login', 'loguearse', 'logearse', 'usuario', 'clave', 'acceso', 'password', 'olvide'],
    duration: '0:56',
    src: `${helpBase}acceso-recuperar-password.mp4`,
    topics: ['Acceder con tu usuario y contraseña', 'Solicitar la recuperación de contraseña'],
    coverTitle: 'Tu primer acceso,\npaso a paso.',
  },
  {
    id: 'primera-cuenta-bancaria',
    title: 'Crear mi primera cuenta bancaria',
    description: 'Aprende a dar de alta tu primera cuenta bancaria en la configuración de KiwiKERP.',
    module: 'Configuración',
    needs: ['Crear una cuenta bancaria'],
    keywords: ['banco', 'bancos', 'iban', 'cuenta', 'bancaria', 'alta', 'añadir', 'registrar', 'guardar'],
    duration: '0:34',
    src: `${helpBase}primera-cuenta-bancaria.mp4`,
    topics: ['Localizar las cuentas bancarias en Configuración', 'Crear y guardar una cuenta bancaria'],
    coverTitle: 'Tu primera cuenta\nbancaria.',
  },
  {
    id: 'primera-familia-productos-servicios',
    title: 'Crear una familia de productos o servicios',
    description: 'Aprende a crear una familia para organizar tus productos o servicios en KiwiKERP.',
    module: 'Productos y servicios',
    needs: ['Crear una familia de productos o servicios'],
    keywords: ['familia', 'familias', 'producto', 'productos', 'servicio', 'servicios', 'artículos', 'clasificar', 'agrupar', 'alta'],
    duration: '0:55',
    src: `${helpBase}primera-familia-productos-servicios.mp4`,
    topics: ['Crear una familia de productos o servicios'],
    coverTitle: 'Tu primera familia\nde productos o servicios.',
  },
];
