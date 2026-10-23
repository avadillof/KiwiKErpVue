# K_CLIENTES · KiwiKERP Cloud

Proyecto independiente en `C:\Proyectos\KiwiKERP\K_CLIENTES`. Frontend **Vue 3 + PrimeVue 4 + TypeScript + Vite** y backend **Java 17 + Spring Boot**. K_ERP_FREELANDSITE no contiene código, configuración ni dependencias de esta aplicación.

## Estructura

```text
K_CLIENTES/
  frontend/              Vue + PrimeVue; Nginx en producción
  backend/               API Spring Boot, persistencia y pruebas
  compose.yaml           Stack propio: frontend + backend + volumen de datos
  compose.portal.yaml    Conexión opcional del frontend a la red del portal
  integration/           Fragmentos de integración pendientes de aplicar
```

El navegador utiliza un solo origen: Nginx sirve Vue y envía `/api/` al backend por la red privada de la aplicación. El backend no publica puertos del host en Compose. No depende del frontend ni de la API del ERP. SQLite guarda los datos propios en un volumen persistente; la lectura de provisioning utiliza una conexión MySQL independiente y opcional.

## Funciones

- Administración con usuario y contraseña de entorno; las credenciales sólo permanecen en memoria del navegador. Salir o recargar exige volver a acceder.
- Fichas de cliente con contacto, notas, estados comercial y de cobro informativos.
- Inventario de instalaciones desde provisioning; varias instalaciones pueden asociarse al mismo cliente.
- Importación por `installation_code` sin duplicados, sin sobrescribir notas, asociaciones o datos comerciales y sin borrar registros ausentes del origen.
- Planificación de mantenimiento y cierre manual con auditoría. No ejecuta todavía Jenkins, ni suspende o elimina stacks.
- La vista técnica es una fotografía de la última sincronización, no salud en directo. Los eventos se conservan; la interfaz recibe los últimos 200 globales.

Los estados de cobro no acreditan pagos ni modifican el servicio. Contratos, cuotas, roles múltiples y ejecución/seguimiento de Jenkins se incorporarán después.

## Desarrollo local

Requiere JDK 17, Maven 3.8+, Node 24 y npm. No reutiliza `node_modules` ni archivos de los proyectos ERP.

Terminal del backend, en `backend/`:

```powershell
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
mvn test package
$env:CLIENT_MANAGER_PORT = '19084'
$env:CLIENT_MANAGER_PASSWORD = '<establecer un secreto propio de al menos 16 caracteres>'
java -jar target/K_CLIENTES.jar
```

Terminal del frontend, en `frontend/`:

```powershell
npm ci
npm run dev
```

Abrir `http://127.0.0.1:5184/`. Vite envía `/api` a `http://127.0.0.1:19084`; se puede cambiar con `CLIENT_MANAGER_API` en el entorno del frontend. La API sólo escucha en loopback por defecto. La base local es `backend/data/clients.db`.

El backend ya no sirve la interfaz HTML anterior; su JAR contiene únicamente la API. Para compilar Vue: `npm run build`. Las dependencias del frontend están fijadas en su propio lockfile.

## Stack independiente

1. Copiar `.env.example` a `.env` y establecer un secreto propio. No guardar `.env` en Git.
2. Ejecutar desde la raíz:

```sh
docker compose up -d --build
```

El frontend queda en `http://127.0.0.1:9084/` (puerto configurable). `clientes-data` conserva los datos de la aplicación. No requiere la red del portal ni servicios del ERP. Para acceso remoto, publicar mediante un proxy HTTPS de la plataforma; las credenciales Basic requieren HTTPS fuera de loopback. Aplicar el control de intentos de acceso administrativo del proxy.

El nombre de proyecto Compose es `kiwikerp-clientes`. Si hubiera datos de un despliegue anterior bajo otro nombre de proyecto, respaldar y migrar el volumen antes de cambiarlo. No se ha desplegado ninguna de las versiones desde este desarrollo.

## Conexión a provisioning

Configurar `PROVISIONING_READ_URL` (por ejemplo, `jdbc:mysql://HOST:3306/kiwikerp_provisioning?connectTimeout=5000&socketTimeout=15000`), usuario y contraseña. Utilizar una cuenta con **SELECT únicamente sobre `demo_requests`**.

El backend debe poder alcanzar ese servidor MySQL desde su red. Si MySQL sólo está disponible en una red Docker externa, añadir exclusivamente el backend a esa red en una configuración de despliegue; no publicar MySQL para esta aplicación.

Columnas requeridas: `installation_code`, `company`, `contact_name`, `email`, `domain`, `stack_name`, `status`, `expires_at`. Comprobar el esquema desplegado antes de conectar: la tabla elemental original no basta. Fechas en milisegundos. La consulta importa también expirados y estados distintos de READY para mantenimiento; no determina contratación ni autoriza actualizaciones.

Primera importación: una ficha por instalación. Después se reasignan al cliente responsable desde Vue. No se fusionan empresas automáticamente por nombre o correo.

## Acceso desde el portal existente

Opcional; los fragmentos no se han aplicado al portal publicado.

1. Configurar `PORTAL_NETWORK` con su red Docker real.
2. Construir el frontend con el prefijo del portal mediante:

```sh
docker compose -f compose.yaml -f compose.portal.yaml up -d --build
```

3. Incorporar `integration/portal-nginx.conf` dentro del `server` del portal y `integration/portal-link.html` en sus enlaces.
4. Validar HTTPS, recursos Vue, acceso y API en `/gestion-clientes/`. El proxy retira el prefijo antes de enviar la petición al frontend; éste se compila con `PUBLIC_BASE=/gestion-clientes/`. El portal enlaza al frontend, nunca directamente al backend.

El frontend Nginx permite estilos en línea porque PrimeVue inyecta sus estilos. Mantiene scripts y conexiones restringidos al propio origen.

## Respaldo y evolución

Respaldar la base SQLite detenida o mediante una copia consistente con su WAL. No colocarla en una carpeta pública o unidad de red. Para evolucionar a MySQL propio se necesitará una migración explícita; el MySQL de provisioning sigue siendo sólo el origen de lectura.

Siguiente entrega: catálogo de jobs Jenkins permitidos, petición persistente con identificador único, seguimiento de cola/build y resultado auditado. Revalidar estado READY y vigencia antes de actualizar. Baja y borrado requieren un proceso específico con respaldo; no se infieren de un impago.
