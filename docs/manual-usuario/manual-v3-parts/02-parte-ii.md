# Parte II — Puesta en marcha y acceso

## Capítulo 5. Instalación y asistente de puesta en marcha

Cuando KiwiKERP no encuentra una identidad de instalación válida, el portal abre el asistente de puesta en marcha en lugar del acceso habitual. La detección utiliza dos archivos externos a la aplicación que deben conservarse juntos:

```
<KIWIKERP_DATA_DIR>/installation/installation.properties
<KIWIKERP_DATA_DIR>/installation/installation.key
```

Sin `KIWIKERP_DATA_DIR`, en Windows se utiliza por defecto `%USERPROFILE%\.kiwikerp`; por ejemplo, `C:\Users\usuario\.kiwikerp`. En Linux se utiliza el directorio personal del usuario que ejecuta el servidor, bajo `.kiwikerp`. La variable `KIWIK_INSTALLATION_FILE` permite indicar directamente otra ubicación para `installation.properties`; la clave se guarda a su lado. No copie uno de los dos archivos por separado ni publique su contenido.

Como segunda protección, la base de datos registra su identidad en `kiwikerp_installation`. La aplicación sólo considera nueva una instalación cuando faltan los archivos externos, la base está disponible y no contiene la marca ni tablas de la aplicación. Si se borra uno o ambos archivos de una instalación completada, KiwiKERP los vuelve a crear con una clave nueva y conserva el mismo `installation_id` registrado en la base. Si la recuperación no puede escribirse, hay tablas sin marca, la base no responde o las identidades no coinciden, el instalador se bloquea por seguridad; nunca interpreta esa situación como permiso para borrar datos.

### 5.1 Pasos del asistente

1. El primer paso comprueba la disponibilidad del servidor, la conexión con la base de datos y la posibilidad de crear y proteger la identidad externa. **Continuar** permanece desactivado mientras una comprobación esté pendiente o haya fallado.
2. Si el servidor de KiwiKERP no responde, se muestra una pantalla corporativa de servicio no disponible con la opción de volver a intentarlo; no se envía al usuario al acceso como si la instalación estuviera operativa.
3. A continuación se solicitan los datos esenciales de la empresa, NIF/CIF, contacto, dirección, logotipo y el primer administrador.
4. El repositorio documental predeterminado es `<KIWIKERP_DATA_DIR>/gestdoc`; si no existe, KiwiKERP intenta crearlo. La instalación sólo puede continuar si la carpeta permite lectura y escritura al usuario que ejecuta el servidor.

### 5.2 Base de datos y esquema inicial

El esquema de referencia para una instalación limpia se mantiene en el backend, en `BackUpBBDD/SchemaEmptyBBDD/BBDD.sql`. El responsable del proyecto debe conservarlo actualizado. Se ejecutará exactamente el contenido preparado en ese archivo.

> **Advertencia:** el flujo automático de copia y recreación final todavía está pendiente de implementación. El comportamiento acordado será: comprobar el esquema; crear un dump fechado en `<KIWIKERP_DATA_DIR>/backups`; verificar que el dump terminó correctamente y no está vacío; recrear la base; ejecutar el esquema; guardar empresa y administrador; y sólo entonces marcar la instalación como completada. Si el dump falla, la base existente no debe borrarse ni modificarse. Hasta que este flujo esté implementado y probado con una base real, no utilice el botón final como sustituto de una copia de seguridad administrada.

### 5.3 Repositorio documental (GestDoc) después de instalar

La ruta activa aparece discretamente al extremo derecho del pie del portal, antes del logo y la versión: `GestDoc · ruta`. Un administrador puede cambiarla en **Configuración / Ajustes → Preferencias → Repositorio documental**. La ruta debe ser absoluta, existir y permitir lectura y escritura.

Guardar otra ruta **no mueve** los documentos históricos, facturas, adjuntos, imágenes ni logotipos existentes. Conserve la ubicación anterior y traslade los archivos de forma controlada.

La configuración se guarda inmediatamente, pero actualmente es necesario reiniciar el servidor de KiwiKERP para que las direcciones públicas de imágenes y documentos se registren con la nueva ubicación. Después compruebe un documento histórico, un adjunto, una imagen y un PDF antes de retirar la carpeta anterior.

### 5.4 Correo y sesión administrativa

**Verificar conexión** en la configuración SMTP realiza una conexión y autenticación con los valores del formulario, sin enviar un correo. La petición utiliza la sesión iniciada en el portal mediante `X-Portal-Session`; sólo un administrador activo puede ejecutarla. Si la sesión ha caducado o el servidor se ha reiniciado, cierre la sesión y vuelva a entrar antes de repetir la prueba. No confunda una verificación SMTP correcta con la entrega de un mensaje a un destinatario.

## Capítulo 6. Acceso al sistema

La pantalla de acceso identifica visualmente la empresa y muestra el logotipo del cliente cuando está configurado. En la parte inferior se muestra el enlace del desarrollador FreeLandSite.

![Pantalla de inicio de sesión de KiwiK ERP](imagenes/iniciar-sesion.png)

### 6.1 Iniciar sesión

1. Introduzca su nombre de usuario en el campo **Usuario**.
2. Escriba su clave de acceso en el campo **Contraseña**. Puede pulsar el icono con forma de ojo para mostrar u ocultar temporalmente la contraseña.
3. Pulse **Acceder a KiwiKERP**.
4. Una vez validadas las credenciales, el sistema abre el panel de control.

Si el sistema rechaza el acceso, compruebe que el usuario y la contraseña sean correctos y que no esté activado el bloqueo de mayúsculas. Los mensajes distinguen entre campos obligatorios, credenciales incorrectas y problemas de conexión.

Antes de introducir sus credenciales, compruebe que utiliza la dirección de acceso facilitada por su administrador y una conexión HTTPS válida. No comparta su contraseña ni la deje anotada en un lugar accesible a otras personas.

### 6.2 Recuperar credenciales

Si no recuerda su contraseña:

1. Pulse **¿La has olvidado?** junto al campo Contraseña.
2. Introduzca la dirección de correo asociada a su usuario.
3. Pulse **Enviar instrucciones**.
4. Cuando aparezca la confirmación, revise la bandeja de entrada de esa cuenta.
5. Abra el mensaje **Acceso a KiwiKERP** y utilice la contraseña indicada para iniciar sesión.

El correo se envía únicamente cuando la dirección pertenece a un usuario registrado y tiene un email configurado. Si la aplicación no puede procesar la solicitud, compruebe que la dirección esté escrita correctamente o contacte con el administrador del sistema.

> **Advertencia:** no reenvíe el mensaje de recuperación ni comparta su contenido. Cambie la contraseña desde la configuración del usuario después de recuperar el acceso y cierre la sesión cuando utilice un equipo compartido.

Si el mensaje no aparece, revise las carpetas de correo no deseado, promociones o cuarentena. El tiempo de recepción también puede depender del servidor de correo de la empresa.

### 6.3 Servidor no disponible y problemas frecuentes de acceso

- **Usuario o contraseña inválidos:** revise mayúsculas, minúsculas y espacios introducidos accidentalmente.
- **Usuario desactivado:** solicite al administrador que compruebe el estado de su cuenta.
- **Correo no reconocido:** confirme que utiliza la misma dirección guardada en su ficha de usuario.
- **Error de conexión o servidor no disponible:** compruebe la red y que el servidor KiwiK ERP esté disponible antes de reintentarlo. Si el servidor no responde, el portal muestra una pantalla corporativa de servicio no disponible.
- **Sesión en un equipo compartido:** cierre siempre la sesión desde la cabecera de la aplicación al finalizar.

## Capítulo 7. Panel de control y espacio de trabajo

El **Espacio de trabajo** es el punto de entrada después de iniciar sesión. Su encabezado muestra **Panel de control** y permite acceder a las áreas de KiwiK ERP.

### 7.1 Cabecera principal

La cabecera permanece disponible mientras se navega por la aplicación y contiene:

- Logotipo de KiwiK ERP, identificación del sistema y fecha actual.
- **Manual:** abre esta guía dentro del portal.
- **Notificaciones:** el icono de campana muestra un contador cuando existen mensajes nuevos.
- **Salir:** cierra la sesión y regresa a la pantalla de acceso.
- Nombre y fotografía del usuario conectado. Si no existe fotografía se muestran sus iniciales.

Al pulsar sobre el avatar se abre la ficha del usuario para consultar su perfil. Las opciones disponibles dependerán de sus permisos.

### 7.2 Tarjetas de módulos

La sección principal presenta una tarjeta por cada módulo visible. Cada tarjeta contiene su nombre, descripción, funciones principales y estado:

- **Disponible / Abrir módulo:** permite acceder haciendo clic en la tarjeta o pulsando Intro cuando tiene el foco.
- **Próximamente / En preparación:** identifica áreas todavía no habilitadas y no permite acceder a ellas.

La visibilidad depende de los permisos asignados:

- **Ventas:** disponible para administradores y usuarios con acceso al módulo de ventas. Incluye Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas, incluidas facturas manuales, cobros y rectificativas.
- **Configuración:** visible solamente para administradores. Permite gestionar empresa, usuarios, seguridad y datos maestros.
- **Compras** e **Informes:** aparecen como módulos en preparación mientras no estén habilitados.

Dos usuarios pueden ver un número diferente de tarjetas sin que exista un error de funcionamiento.

### 7.3 Navegación diaria

Para entrar en un área disponible, pulse cualquier punto de su tarjeta o la acción **Abrir módulo**. Dentro de los listados, los botones **Inicio** y **Ventas** permiten volver al Panel de control o al área comercial sin utilizar el botón Atrás del navegador.

El acceso **Indicadores comerciales** abre Ventas. Los widgets están disponibles en Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas; consulte el periodo seleccionado en cada panel. Los filtros de filas y el año de los indicadores no siempre representan la misma selección; antes de comparar importes, revise qué periodo y conjunto de documentos resume cada panel.

### 7.4 Pie corporativo

El pie fijo muestra la empresa activa, su CIF, el eslogan configurado, la ruta de GestDoc y la versión de KiwiK ERP. Esta información ayuda a confirmar que se está trabajando en la empresa y entorno correctos.

### 7.5 Encontrar un documento y trabajar con seguridad

1. Entre en **Ventas** y seleccione el módulo del documento que necesita.
2. Utilice la búsqueda y los filtros disponibles para localizarlo. Si no aparece, quite primero los filtros de estado y fechas: puede estar fuera del intervalo seleccionado.
3. Revise código, cliente y estado antes de abrir las acciones de la fila. Las acciones dependen del estado del documento.
4. Después de guardar, compruebe el resultado en el listado o vuelva a abrir el detalle. Un aviso de conexión no significa necesariamente que el servidor no haya guardado.
5. Si la pantalla ofrece una acción de reintento de la misma operación, utilícela antes de comenzar otra para evitar crear duplicados.

> **Nota:** las acciones críticas (emitir, enviar por correo, cancelar, cobrar, revertir) utilizan la sesión del portal y no vuelven a solicitar la contraseña, salvo la contraseña del certificado al emitir facturas.