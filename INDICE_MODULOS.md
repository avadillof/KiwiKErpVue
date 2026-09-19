# Índice de Módulos - KiwiKErpVue

## Estructura General del Proyecto

```
KiwiKErpVue/
├── src/
│   ├── views/           # Vistas principales de la aplicación
│   ├── components/      # Componentes reutilizables
│   ├── services/        # Servicios y lógica de negocio
│   ├── stores/          # Gestión de estado (Pinia/Vuex)
│   ├── models/          # Modelos de datos
│   ├── libs/            # Librerías personalizadas
│   ├── data/            # Datos estáticos
│   ├── theme/           # Configuración de temas
│   └── assets/          # Recursos estáticos
├── docs/                # Documentación
├── tests/               # Pruebas
├── tools/               # Herramientas
└── public/              # Archivos públicos
```

## Módulos Principales (Views)

### 1. Frm_Contacts
- **Descripción**: Módulo de gestión de contactos
- **Ubicación**: `src/views/Frm_Contacts/`

### 2. Frm_Login
- **Descripción**: Módulo de autenticación y login
- **Ubicación**: `src/views/Frm_Login/`

### 3. Frm_Main
- **Descripción**: Vista principal de la aplicación
- **Ubicación**: `src/views/Frm_Main/`

### 4. Frm_Products
- **Descripción**: Módulo de gestión de productos
- **Ubicación**: `src/views/Frm_Products/`

### 5. Frm_SalexTax
- **Descripción**: Módulo de impuestos de ventas
- **Ubicación**: `src/views/Frm_SalexTax/`

### 6. Help
- **Descripción**: Sistema de ayuda y soporte
- **Ubicación**: `src/views/Help/`

### 7. Informes
- **Descripción**: Módulo de generación de informes
- **Ubicación**: `src/views/Informes/`

### 8. Installation
- **Descripción**: Módulo de instalación y configuración
- **Ubicación**: `src/views/Installation/`

### 9. System
- **Descripción**: Configuración del sistema
- **Ubicación**: `src/views/System/`

### 10. Ventas
- **Descripción**: Módulo de gestión de ventas
- **Ubicación**: `src/views/Ventas/`

### 11. Security
- **Descripción**: Módulo de seguridad
- **Ubicación**: `src/views/security/`

## Componentes

### Componentes Principales
- **CertificateInfoCard.vue**: Componente para mostrar información de certificados
- **CertificatePasswordDialog.vue**: Diálogo para contraseña de certificados

### Sub-módulos de Componentes
- **Frm_Ajustes**: Componentes de ajustes y configuración
- **attachments**: Componentes para gestión de archivos adjuntos
- **dialogs**: Componentes de diálogo modales
- **shared**: Componentes compartidos entre módulos

## Servicios

### Servicios por Módulo
- **Frm_Ajustes**: Servicios de configuración y ajustes
- **Frm_Login**: Servicios de autenticación
- **Frm_Main**: Servicios de la vista principal
- **Frm_Security**: Servicios de seguridad
- **Informes**: Servicios de generación de informes
- **Installation**: Servicios de instalación

### Servicios Generales
- **api.ts**: Configuración principal de API
- **backendUrl.ts**: Gestión de URLs del backend
- **salesPricing.ts**: Servicios de precios de ventas
- **composables**: Composables de Vue reutilizables

## Otros Módulos

### Stores
- **Ubicación**: `src/stores/`
- **Descripción**: Gestión de estado global de la aplicación

### Models
- **Ubicación**: `src/models/`
- **Descripción**: Definiciones de modelos de datos

### Libs
- **Ubicación**: `src/libs/`
- **Descripción**: Librerías personalizadas y utilidades

### Data
- **Ubicación**: `src/data/`
- **Descripción**: Datos estáticos y configuraciones

### Theme
- **Ubicación**: `src/theme/`
- **Descripción**: Configuración de temas y estilos

### Assets
- **Ubicación**: `src/assets/`
- **Descripción**: Imágenes, fuentes y otros recursos estáticos

## Archivos de Configuración

- **router.ts**: Configuración de rutas de Vue Router
- **main.ts**: Punto de entrada principal de la aplicación
- **App.vue**: Componente raíz de la aplicación
- **vite.config.ts**: Configuración de Vite
- **package.json**: Dependencias del proyecto
- **tsconfig.json**: Configuración de TypeScript

## Resumen de Módulos Funcionales

| Módulo | Funcionalidad Principal |
|--------|------------------------|
| Frm_Contacts | Gestión de contactos y clientes |
| Frm_Login | Autenticación de usuarios |
| Frm_Main | Interfaz principal del sistema |
| Frm_Products | Catálogo y gestión de productos |
| Frm_SalexTax | Configuración de impuestos |
| Ventas | Proceso de ventas |
| Informes | Reportes y estadísticas |
| Installation | Configuración inicial |
| System | Ajustes del sistema |
| Security | Control de accesos y seguridad |
| Help | Documentación y ayuda |

---
*Generado automáticamente para el proyecto KiwiKErpVue*
*Fecha: 2026-09-19*