# Manual de usuario de KiwiK ERP

**Versión 3.0 (borrador) · Septiembre 2026 · FreeLandSite**

Guía práctica del portal de gestión: acceso, configuración, datos maestros y el circuito comercial de ventas.

---

Este documento describe las funciones implementadas en el proyecto a 16 de septiembre de 2026. Las capturas proceden de formularios reales con datos ficticios en un entorno aislado. Los huecos de imagen se indican con la marca **[CAPTURA: descripción]** y se completarán en sucesivas revisiones.

---

# Parte I — Introducción

## Capítulo 1. Qué es KiwiK ERP y a quién va dirigido

KiwiK ERP es un sistema de gestión empresarial que reúne en un mismo entorno la información de clientes, artículos y operaciones comerciales. ERP significa planificación de recursos empresariales. En KiwiK, el trabajo disponible se centra en seguir una venta desde la propuesta inicial hasta la entrega, la factura y su cobro.

Su finalidad es evitar volver a introducir los mismos datos en cada documento y permitir consultar el origen de una operación. Un pedido puede proceder de un presupuesto; sus entregas se registran en albaranes; las facturas conservan las referencias correspondientes y los cobros se consultan en su historial.

KiwiK ERP es el ERP modular de FreeLandSite: parte de una base estándar para la gestión habitual y puede incorporar adaptaciones específicas cuando la operativa de una empresa lo necesita. La solución puede implantarse en la nube o en el servidor de la empresa, manteniendo un núcleo común que facilita las actualizaciones y el crecimiento por etapas.

### 1.1 A quién va dirigido

- **Administración y ventas:** mantener clientes, preparar propuestas, confirmar pedidos y revisar la facturación.
- **Personal que gestiona entregas:** preparar albaranes, confirmar salidas y conservar justificantes de recogida.
- **Personal que registra cobros:** anotar pagos recibidos, consultar saldos y corregir movimientos mediante reversión.
- **Administradores:** configurar empresa, usuarios, datos maestros y parámetros de ventas. Estos perfiles describen tareas de trabajo; no equivalen a una matriz de permisos independiente para cada acción.

### 1.2 Qué incluye y cuáles son sus límites

El manual describe las funciones implementadas en el proyecto a 16 de septiembre de 2026. La instalación debe tener frontend, backend y actualizaciones de base de datos compatibles para utilizarlas. Compras e Informes siguen identificados como áreas en preparación; no debe interpretarse su tarjeta como una función disponible.

El circuito fiscal descrito está configurado para **PRUEBAS**. Esta guía explica botones y resultados de la aplicación; no acredita una puesta en producción ni sustituye la revisión de los requisitos de la empresa.

### 1.3 Cómo se organiza el trabajo

El **Portal** es el punto de entrada y agrupa las áreas disponibles. En **Ventas** se mantienen los datos maestros y se sigue el flujo **Presupuesto → Pedido → Albarán → Factura → Cobro**. Cada documento conserva su origen, de modo que puede revisarse quién lo creó, qué cantidades se entregaron y qué importes siguen pendientes.

Los documentos se preparan primero como **borradores**. Guardar un borrador permite continuar más tarde, pero no lo convierte en una factura emitida. Al confirmar o emitir, el sistema valida los datos, asigna el código definitivo y bloquea los campos que deben conservar la integridad fiscal. Las rectificaciones se crean como documentos relacionados y dejan visible el importe abonado.

## Capítulo 2. Guía de inicio rápido (primeros pasos)

Esta guía resume los pasos para dejar KiwiK ERP operativo y comenzar a trabajar. Los apartados detallados se explican en las partes II a V.

1. **Instalación.** Despliegue del frontend y del backend y aplicación de las actualizaciones de base de datos. La primera vez que el servidor no encuentra una identidad de instalación, el portal abre el asistente de puesta en marcha (véase el capítulo 5).
2. **Datos de la empresa.** Revise los datos de empresa, logotipo y parámetros del repositorio documental en **Configuración / Ajustes** (capítulos 8 y 9).
3. **Usuarios y credenciales.** Cree los usuarios, asigne permisos y compruebe que las direcciones de correo son válidas (capítulos 6, 8 y 9).
4. **Datos maestros.** Revise impuestos, familias de productos, certificados digitales y cuentas bancarias (capítulo 8.6 y Parte IV).
5. **Certificados VeriFactu.** Configure los certificados digitales y su asignación a usuarios si se va a emitir facturación electrónica (capítulo 10).
6. **Parámetros comerciales.** En **Ventas → Ajustes de Ventas** revise condiciones generales, condiciones de pago y vencimientos, recordatorios y Parámetros VeriFactu (capítulo 23).
7. **Lista de precios.** Defina la moneda base, la tarifa predeterminada y las reglas de precio (capítulo 22).
8. **Entidades.** Dé de alta clientes y proveedores con sus condiciones comerciales (capítulo 14).
9. **Artículos y servicios.** Cree el catálogo y revise el flujo de venta de cada artículo (capítulo 11).
10. **Circuito de ventas.** Comience por un presupuesto y continúe con el pedido, el albarán, la factura y el cobro (Parte V).

### 2.1 Primer uso diario del portal

- Inicie sesión con su usuario y contraseña (capítulo 6.1).
- Desde el Panel de control acceda a **Ventas** para trabajar con presupuestos, pedidos, albaranes y facturas (capítulo 7).
- Utilice la Ayuda del portal y el Manual para resolver dudas sobre cada pantalla.
- Antes de confirmar una entrega o emitir una factura, revise su efecto: **guardar un borrador no equivale a confirmar, emitir ni cobrar**.

## Capítulo 3. Cómo leer este manual y límites actuales

El manual se organiza en cinco partes: Introducción; Puesta en marcha y acceso; Configuración; Datos maestros; y Circuito de ventas, seguidas de los apéndices. Cada capítulo describe una pantalla o un proceso del portal.

- Empiece por acceso, clientes y artículos si es la primera vez que utiliza el sistema.
- Para una operación diaria, vaya directamente al apartado del documento que está gestionando.
- Antes de confirmar una entrega o emitir una factura, revise su efecto: **guardar un borrador no equivale a confirmar, emitir ni cobrar**.
- Las capturas son referencias visuales y pueden mostrar otra marca o configuración de empresa.
- Los huecos de imagen todavía no incorporados se marcan como **[CAPTURA: descripción]**.

### 3.1 Alcance y limitaciones de la versión 3.0

- El circuito fiscal se documenta en **PRUEBAS**; el backend comprueba además que el destino sea el portal de preproducción de la AEAT.
- Compras e Informes permanecen identificados como áreas en preparación.
- Remesas, conciliación bancaria y gestión de impagados son ampliaciones previstas en fases posteriores.
- Los módulos nuevos se incorporan por etapas y pueden requerir aplicar migraciones de base de datos junto con el despliegue del backend.

### 3.2 Convenciones tipográficas

- Los elementos de la interfaz aparecen en **negrita**.
- Los nombres de menús y rutas de navegación se indican con **Menú → Submenú → Opción**.
- Los valores de ejemplo, códigos o rutas de datos se muestran en `código`.
- Los avisos de seguridad o restricciones se presentan como **Advertencias**.
- Las notas aclaratorias se presentan como **Notas**.

## Capítulo 4. Notas de seguridad

KiwiK ERP incorpora medidas de seguridad en el acceso, las sesiones, las credenciales y las contraseñas de los certificados.

### 4.1 Credenciales y contraseñas

- No comparta su contraseña ni la deje anotada en un lugar accesible a otras personas.
- No reenvíe el correo de recuperación de credenciales ni comparta su contenido.
- Cambie la contraseña después de recuperar el acceso y cierre la sesión al trabajar en un equipo compartido.
- Las contraseñas de los certificados VeriFactu se cifran antes de incorporarse a la cola de envío y no se devuelven al navegador ni aparecen en los listados.

### 4.2 Sesión y conexión

- Utilice siempre la dirección de acceso facilitada por su administrador con una conexión HTTPS válida.
- Los asistentes y acciones automáticas reutilizan la sesión iniciada en el portal, sin pedir de nuevo la contraseña ni guardarla.
- Si la sesión ha caducado o el servidor se ha reiniciado, vuelva a iniciar sesión desde la pantalla de acceso.
- Al salir del portal se revoca la autorización temporal utilizada por las tareas automáticas.

### 4.3 Claves de inteligencia artificial

- Las claves API de los asistentes se almacenan cifradas en la base de datos, protegidas con el mismo servicio de cifrado que los certificados.
- Solo se envía al proveedor de IA la pregunta formulada y, en su caso, la factura o el pedido seleccionado: nunca se envían los resultados de la consulta ni los historiales completos.
- Evite incluir información sensible innecesaria en las preguntas.
- **Eliminar clave** borra la copia local y desactiva la IA, pero no revoca la clave en el proveedor.

### 4.4 Instalación e identidad

- Los archivos `installation.properties` e `installation.key` deben conservarse juntos; no publique su contenido ni copie uno por separado.
- Los justificantes y evidencias fiscales se conservan en el repositorio documental; mantenga copias de seguridad administradas del servidor.

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

# Parte III — Configuración

## Capítulo 8. Configuración del sistema (Ajustes)

El módulo Ajustes organiza la configuración en pestañas, incluyendo **Datos de empresa**, **Usuarios**, **Preferencias**, **Seguridad**, **Inteligencia artificial** y **Datos maestros**. Al regresar a Ajustes desde cualquiera de las pantallas de Datos maestros, el sistema vuelve a abrir directamente la pestaña **Datos maestros**.

> **Nota:** la configuración completa sólo es visible para administradores.

### 8.1 Datos de empresa

En **Configuración / Ajustes → Datos de empresa** se mantienen los datos identificativos de la empresa: nombre o razón social, NIF/CIF, contacto, dirección, municipio, código postal, país y logotipo. Estos datos se utilizan como datos del emisor en los documentos fiscales y se comprueban al emitir facturas.

- Los datos de empresa deben estar completos y ser correctos antes de emitir el primer documento fiscal.
- El logotipo configurado se muestra en la pantalla de acceso, en la cabecera y en los documentos corporativos.
- La configuración actual del emisor documentada corresponde a España.

### 8.2 Usuarios

En **Configuración / Ajustes → Usuarios** se crean y mantienen los usuarios del portal. Cada usuario dispone de un código, nombre, dirección de correo, contraseña y estado (activo o inactivo).

- La dirección de correo se utiliza para la recuperación de credenciales y para los recordatorios internos de presupuestos, entregas y vencimientos.
- Los usuarios inactivos no pueden iniciar sesión y se omiten de los recordatorios automáticos.
- El correo de recuperación **Acceso a KiwiKERP** se envía únicamente cuando la dirección pertenece a un usuario registrado con email configurado.

### 8.3 Preferencias: repositorio documental (GestDoc) y SMTP

En **Preferencias → Repositorio documental** un administrador puede revisar la carpeta raíz donde KiwiKERP conserva adjuntos, documentos históricos, facturas archivadas, imágenes de productos y usuarios y recursos corporativos como el logotipo.

- La ruta debe ser absoluta y accesible para el usuario que ejecuta el backend.
- Guardar una ruta nueva **no mueve ni copia los archivos existentes**.
- Antes del cambio, conserve una copia de la ruta anterior, prepare o traslade los documentos de forma controlada, compruebe permisos de lectura y escritura y reinicie el backend. Después valide la consulta de un documento histórico, la descarga de un adjunto y la generación de un PDF. Si cualquiera de estas comprobaciones falla, restaure la ruta anterior; no genere documentos duplicados para compensarlo.

La configuración **SMTP** permite indicar el servidor de correo saliente, las credenciales y el remitente. El botón **Verificar conexión** comprueba la conexión y autenticación SMTP sin enviar correo. Una verificación correcta no confirma la entrega de mensajes a destinatarios.

### 8.4 Cuentas bancarias

El mantenimiento de cuentas bancarias permite buscar, crear, editar y eliminar las cuentas compartidas utilizadas por clientes y proveedores. Introduzca una descripción, la sucursal (opcional) y el IBAN.

- El IBAN se guarda sin espacios y en mayúsculas; se comprueban su formato general y dígitos de control, y para España la longitud de 24 caracteres.
- Esta comprobación local no confirma existencia, titularidad ni disponibilidad, ni verifica todas las estructuras nacionales.
- No se pueden eliminar cuentas vinculadas a otros registros.
- Las cuentas ya existentes no se modifican automáticamente; se validan al guardarlas.

### 8.5 Inteligencia artificial (asistentes)

**Configuración / Ajustes → Inteligencia artificial** (también accesible desde los asistentes de Presupuestos, Pedidos y Facturas) permite configurar los asistentes de consulta:

- Elija el proveedor (**Groq** gratuito recomendado u **OpenAI**) y el modelo propuesto por defecto.
- Copie y pegue la clave API en el campo de contraseña, active la IA y guarde: se almacena cifrada en la base de datos.
- Dejar el campo vacío conserva la clave existente; pegar otra la sustituye.
- **Eliminar clave** pide confirmación, borra la copia y desactiva la IA, sin revocarla en el proveedor.
- **Probar conexión** pide confirmación y puede consumir cuota, sin consultar ni enviar documentos.
- Se necesita HTTPS (o conexión local de desarrollo). La clave se protege con el mismo servicio de cifrado que los certificados.
- Los ajustes guardados se aplican sin reiniciar.

> **Nota:** solo se envía al proveedor la pregunta formulada y, en su caso, el documento seleccionado; nunca los resultados de la consulta ni los historiales. Evite incluir información sensible innecesaria.

### 8.6 Datos maestros: impuestos, familias y certificados

Dentro de **Datos maestros** se encuentran, entre otras opciones:

- **Impuestos:** consulta, creación y edición de los impuestos utilizados en los documentos (incluido su tratamiento por posición fiscal; véase el capítulo 13).
- **Familias:** agrupaciones de productos utilizadas para clasificar el catálogo y para aplicar reglas de tarifa por familia (véase el capítulo 12).
- **Certificados digitales:** alta de los certificados utilizados para la firma y el envío a VeriFactu de las facturas (véase el capítulo 10).
- **Cuentas bancarias:** mantenimiento descrito en el punto 8.4.

## Capítulo 9. Seguridad y permisos

La visibilidad de las áreas del portal depende de los permisos asignados a cada usuario.

### 9.1 Módulos y permisos

- **Administradores**: acceso a Configuración y a todas las áreas de Ventas.
- **Usuarios de ventas**: acceso al módulo Ventas y a sus documentas, sin acceso a Configuración.
- Los perfiles descritos en este manual describen tareas de trabajo; no equivalen a una matriz de permisos independiente para cada acción.

### 9.2 Protección de las operaciones

- Las acciones automáticas (recordatorio de presupuestos, entregas y vencimientos, cancelación de presupuestos) reutilizan una autorización temporal de la sesión del portal, sin guardar la contraseña. Dura hasta ocho horas; al salir del portal se solicita su revocación.
- Las contraseñas de los certificados se cifran antes de incorporarse a la cola y no se devuelven al navegador.
- Las claves de los asistentes de IA se almacenan cifradas y no se configuran como variables en Jenkins.
- Una factura emitida nunca se renumera ni vuelve a borrador por un error de comunicación; las correcciones económicas deben realizarse mediante factura rectificativa.

### 9.3 Sesión y auditoría

- La sesión identifica al operador de las operaciones críticas. Los historiales de correo y las auditorías de emisión conservan el usuario conectado en el momento de la operación.
- Un usuario desactivado no puede iniciar sesión y se omite de los recordatorios internos.

## Capítulo 10. Certificados digitales (VeriFactu) y asignación a usuarios

### 10.1 Qué son y para qué se utilizan

Los certificados digitales se utilizan para firmar y remitir a VeriFactu los registros de las facturas. Su configuración se realiza en **Configuración / Ajustes → Datos maestros → Certificados**.

- El certificado se asigna al usuario conectado que va a realizar la emisión.
- Al emitir se solicita la contraseña del certificado; la credencial se cifra antes de incorporarse a la cola y no se devuelve al navegador ni aparece en los listados.
- La contraseña se consulta ante la AEAT en cada ocasión y no se conserva.

### 10.2 Asignación y consulta

- **Parámetros VeriFactu** permiten seleccionar el certificado del usuario y validar su contraseña (véase el capítulo 23.4).
- **Consultar AEAT** contrasta los registros existentes en el sistema de la Agencia Tributaria por año y mes, utilizando el certificado del usuario y solicitando su contraseña en cada ocasión.
- El entorno documentado permanece limitado a **PRUEBAS**; el backend comprueba que el destino sea el portal de preproducción de la AEAT.

### 10.3 Instalación técnica

El despliegue de la funcionalidad de certificados y emisión requiere aplicar las migraciones correspondientes y desplegar backend y frontend actualizados antes de utilizarla. Consulte con el administrador la relación de migraciones necesarias (por ejemplo, los scripts `V13`, `V20`, `V21` y `V22` documentados a lo largo de este manual).

> **Advertencia:** el alta del certificado y la guarda de su contraseña deben realizarse por un administrador en el entorno correspondiente. No comparta la contraseña del certificado.

# Parte IV — Datos maestros

## Capítulo 11. Artículos y servicios

El módulo **Artículos** contiene el catálogo de productos y servicios utilizados en los documentos comerciales. La información del artículo determina, entre otros datos, su descripción, precio, impuesto, unidad de medida y el recorrido que seguirá dentro de un pedido de venta.

### 11.1 Tipo logístico

El **tipo logístico** describe la naturaleza operativa del artículo:

- **Consumible:** producto físico cuyo stock no se controla de forma estricta. Puede venderse y entregarse mediante albarán, pero el sistema no lo trata como existencias gestionadas en almacén.
- **Almacenable:** producto físico cuyas existencias se gestionan en almacén. Su salida habitual se registra mediante un albarán.
- **Servicio:** trabajo, cuota, transporte u otro concepto no almacenable. Normalmente no necesita una salida física de mercancía.

Al seleccionar el tipo logístico, el campo **Tipo comercial** solo muestra las opciones compatibles con él.

### 11.2 Tipo comercial

El **tipo comercial** concreta cómo se vende el artículo dentro de su tipo logístico y proporciona los valores predeterminados de su **Flujo de venta**. La configuración inicial contempla:

| Tipo logístico | Tipo comercial | Requiere albarán | Política de facturación |
|---|---|---|---|
| Consumible | Producto | Sí | Por cantidades entregadas |
| Almacenable | Producto | Sí | Por cantidades entregadas |
| Servicio | Transporte | No | Por cantidades pedidas |
| Servicio | Servicio | No | Por cantidades pedidas |

Estos son valores predeterminados. La configuración de los tipos comerciales puede evolucionar y un artículo concreto puede personalizar su comportamiento cuando exista una excepción justificada.

### 11.3 Flujo de venta

El panel **Flujo de venta** determina si la línea debe pasar por un albarán y en qué momento queda disponible para facturar.

- Si no se activa **Personalizar para este producto**, el artículo hereda automáticamente la configuración de su tipo comercial. El formulario muestra el comportamiento heredado para que pueda revisarse antes de guardar.
- Al activar **Personalizar para este producto** pueden definirse **Requiere albarán** y la **Política de facturación**.

Conviene utilizar la personalización solo para excepciones. Mantener la regla en el tipo comercial facilita que todos los artículos equivalentes tengan el mismo comportamiento.

### 11.4 Políticas de facturación

**Por cantidades pedidas:** la cantidad facturable se basa en lo solicitado en el pedido, descontando las cantidades canceladas. Es el comportamiento habitual de servicios y transportes que no requieren albarán. Recorrido: **Presupuesto → Pedido confirmado → Facturación**.

**Por cantidades entregadas:** solo pueden facturarse las unidades que previamente se hayan entregado. Es el comportamiento habitual de productos físicos. Recorrido: **Presupuesto → Pedido confirmado → Albarán → Facturación**. Si se realiza una entrega parcial, únicamente esa parte queda disponible para facturar; el resto permanece pendiente para futuros albaranes, salvo que se cancelen las cantidades restantes.

### 11.5 Relación entre albarán y política de facturación

| Requiere albarán | Política | Resultado en el pedido |
|---|---|---|
| No | Por cantidades pedidas | La línea pasa directamente a facturación. |
| Sí | Por cantidades pedidas | Existe control de entrega, pero la facturación se basa en la cantidad pedida. |
| Sí | Por cantidades entregadas | La línea debe entregarse y solo se factura lo realmente entregado. |

Cuando se desactiva **Requiere albarán**, el sistema establece automáticamente la política **Por cantidades pedidas**, ya que una línea sin entrega no puede depender de cantidades entregadas.

### 11.6 Ejemplo de pedido mixto

| Línea | Configuración | Funcionamiento |
|---|---|---|
| 10 unidades de un producto almacenable | Requiere albarán · Facturación por entregado | Si se entregan 6, se pueden facturar 6 y quedan 4 pendientes de entrega. |
| 2 horas de servicio | Sin albarán · Facturación por pedido | Las 2 horas pasan directamente al circuito de facturación. |

El pedido permanecerá **Parcialmente completado** mientras tenga alguna entrega o facturación ejecutada y queden cantidades por resolver. Estará **Entregado** cuando no quede mercancía física pendiente, aunque todavía falte facturar. Finalmente pasará a **Completado** cuando todo lo servido esté entregado y facturado, teniendo también en cuenta cualquier cantidad cancelada.

### 11.7 Comprobación antes de utilizar un artículo

En Ventas y Compras, el selector **Unidad de medida** agrupa las opciones por su categoría (unidades, peso, tiempo, distancia o volumen). La selección de un artículo en un documento consulta su configuración actual antes de rellenar la nueva línea; las líneas ya guardadas no se actualizan automáticamente.

La configuración del flujo se copia a las líneas comerciales para conservar la trazabilidad del pedido: modificar posteriormente la ficha del artículo no altera el criterio con el que se creó una operación anterior. Cambiar un artículo no debe reinterpretar una operación anterior; en un pedido mixto, consulte el comportamiento de cada línea antes de decidir desde dónde facturar.

## Capítulo 12. Familias de productos

El módulo **Familias** permite agrupar los artículos del catálogo por categorías de productos o servicios. Las familias se utilizan para:

- Clasificar y buscar artículos de forma ágil.
- Aplicar **reglas de tarifa por familia exacta** en la lista de precios: una regla definida para una familia se aplica a todos los productos pertenecientes a esa familia, sin heredar subfamilias (véase el capítulo 22).
- Organizar los indicadores y resúmenes comerciales.

El mantenimiento de familias se realiza desde **Configuración / Ajustes → Datos maestros → Familias** y desde el módulo de artículos. Cada artículo se asigna a una familia mediante su ficha.

> **[CAPTURA: pantalla de mantenimiento de familias bajo Datos maestros]**

## Capítulo 13. Impuestos

El mantenimiento de **Impuestos** se encuentra en **Configuración / Ajustes → Datos maestros → Impuestos**. Los impuestos se asignan a los artículos y entidades y se aplican en los documentos comerciales (presupuestos, pedidos, albaranes y facturas).

- Cada impuesto define un porcentaje aplicable como IVA u otro impuesto sobre la base.
- La **posición fiscal** de la entidad puede fijar el impuesto aplicado en sus documentos.
- Los documentos pueden incluir **retenciones** cuando corresponde; la retención se calcula sobre la base y se presenta por separado en el desglose.
- Al emitir una factura se comprueban los impuestos y la coherencia de los totales; un error de validación fiscal conserva la factura en borrador.

> **[CAPTURA: pantalla de mantenimiento de impuestos bajo Datos maestros]**

## Capítulo 14. Entidades y contactos

El módulo **Entidades** permite consultar y mantener los clientes, proveedores y demás terceros relacionados con la empresa. El listado dispone de una altura adaptada a la pantalla para evitar que la tabla crezca indefinidamente.

### 14.1 Ficha de la entidad

La ficha centraliza los datos identificativos, fiscales, comerciales y de contacto utilizados posteriormente en presupuestos, pedidos, albaranes y facturas:

- **Identificación y datos fiscales:** nombre o razón social, NIF, domicilio, municipio, código postal y país. Estos datos se utilizan en los documentos y se validan antes de emitir.
- **Contactos y correo:** contactos activos con dirección de correo válida, utilizados al enviar presupuestos, albaranes o facturas.
- **Atributos de venta:** tarifa, posición fiscal, condición de cobro y hasta tres días habituales de pago.
- **Cuentas bancarias:** cuentas compartidas, descritas en el capítulo 8.4.

### 14.2 Condiciones comerciales del cliente

En la pestaña **Ventas** de la entidad puede definirse la **Condición de cobro** y, opcionalmente, hasta tres **días habituales de pago**. Esta información se utiliza para calcular automáticamente el vencimiento de las facturas:

- **Condición de cobro:** define uno o varios plazos, sus importes y las reglas para calcular sus fechas desde la fecha de factura.
- **Días de pago 1, 2 y 3:** ajustan el resultado al siguiente día de cobro admitido por el cliente.
- **Tarifa y posición fiscal:** condicionan precios e impuestos de los documentos comerciales.

Las **condiciones particulares de venta del cliente** son texto comercial que recoge acuerdos específicos. Al seleccionar el cliente en un nuevo presupuesto, el sistema copia sus condiciones particulares al documento; la copia puede ajustarse mientras el documento sea borrador sin modificar la ficha del cliente. Este campo es independiente de la condición de cobro.

### 14.3 Crear una condición de pago desde el cliente

Con permiso para guardar entidades, pulse **+ (Nueva condición de pago)** junto a **Condición de cobro**. Se abre el mismo editor de reglas y vista previa que en Ajustes de Ventas.

1. Indique la descripción y configure los plazos.
2. Compruebe el resultado mediante la vista previa.
3. Pulse **Guardar y seleccionar**: la condición se crea activa en el catálogo compartido y queda seleccionada en la ficha.
4. Guarde la entidad para confirmar su asignación al cliente.

Cancelar el diálogo no cambia la selección anterior. La condición creada está disponible para otros clientes y permanece en el catálogo aunque después cierre la entidad sin guardar. La gestión del catálogo continúa disponible en Ajustes de Ventas.

### 14.4 Preparar la ficha antes de vender

1. Localice la entidad en **Ventas → Entidades** y abra su ficha para evitar crear un cliente duplicado.
2. Revise identificación, datos fiscales y dirección. Estos datos se utilizan en los documentos posteriores.
3. Compruebe los contactos y su correo cuando vaya a enviar presupuestos o albaranes.
4. En los atributos de venta, revise tarifa, posición fiscal, condición de cobro y días de pago. La tarifa es opcional en la ficha del cliente, aunque deberá seleccionarla al crear una factura manual.
5. Escriba los acuerdos particulares en las condiciones de venta y guarde la ficha.

> **Advertencia:** revise las condiciones comerciales del cliente antes de iniciar el circuito. Una configuración incompleta puede impedir crear documentos o producir vencimientos incorrectos.

# Parte V — Circuito de ventas

## Capítulo 15. El flujo comercial y la trazabilidad

### 15.1 Visión general del circuito de ventas

El circuito de ventas comienza con el precio (precio base, tarifa del cliente, descuentos y tramos por cantidad) y recorre las etapas **Presupuesto → Pedido → Albarán → Factura → Cobro**, incluyendo emisión, VeriFactu, correo, vencimientos, recordatorios, cobros parciales y reversión. Las rectificativas se crean desde una factura emitida o desde otra rectificativa aceptada.

![Flujos de venta de KiwiKERP: pizarra negra con trazos de tiza, sin marco de madera](diagramas/flujo-ventas-pizarra-tiza-2026-08-31.png)

El mapa del 31/08/2026 distingue servicios sin albarán, productos facturados por pedido o por entrega y facturas manuales. Se conserva el PDF A1 del diseño anterior para impresión. La documentación y este diagrama se revisan juntos: los cambios en pasos, estados o reglas del circuito deben reflejarse también en la imagen.

### 15.2 Consultar la trazabilidad comercial

Desde el menú **…** de cualquier Presupuesto, Pedido, Albarán o Factura, seleccione **Trazabilidad comercial**. KiwiKERP reconstruye el recorrido completo hasta los cobros y resalta el documento desde el que se abrió la consulta.

La vista conserva las ramas reales: un presupuesto puede originar varios pedidos; un pedido puede tener varios albaranes o facturas; y una factura puede contener cobros parciales o movimientos revertidos. Cada tarjeta muestra código, estado, fecha e importe. **Ir al módulo** permite continuar la revisión en otro documento del recorrido y **Imprimir trazabilidad** abre una versión preparada para impresión.

Una etapa vacía indica que ese documento todavía no existe o que el circuito no pasa por ella. En particular, una factura o un albarán manual pueden carecer de presupuesto o pedido anterior. La consulta no inventa enlaces ni modifica estados, cantidades, facturas o cobros.

## Capítulo 16. Presupuestos

El presupuesto inicia el circuito comercial. En borrador pueden revisarse el cliente, las fechas, las condiciones comerciales y las líneas. Una vez aprobado puede generar el pedido manteniendo la relación entre ambos documentos.

### 16.1 Crear y editar un presupuesto

En el formulario se indican los datos generales —fecha, cliente, tarifa y validez— y las líneas de productos o servicios. Los borradores se identifican mediante su código provisional (`DRAFT_PRC-…`) y un estilo diferenciado.

- La **fecha de validez** indica hasta cuándo se mantiene vigente la propuesta, no una fecha prevista de entrega.
- Un presupuesto puede cancelarse manualmente o quedar fuera de vigencia cuando vence sin respuesta del cliente.
- Al añadir productos se propone el precio neto de tarifa; el descuento de línea es adicional.
- Los estados y las acciones disponibles evitan modificar como borrador un documento que ya ha avanzado en el circuito.

### 16.2 Estados y acciones disponibles

- **Pendiente de enviar:** todavía está en preparación.
- **Enviado:** se ha remitido al cliente.
- **Aprobado:** el cliente ha aceptado la propuesta.
- **Cancelado:** la propuesta ya no continúa en el circuito comercial.

Según su estado, un presupuesto puede abrirse y editarse, visualizarse o imprimirse en PDF, regenerar su PDF, enviarse o reenviarse por correo, aceptarse, cancelarse o reabrirse si estaba cancelado, y asociar notas y documentos.

### 16.3 Envío, PDF y aceptación

1. Cree un presupuesto y seleccione el cliente. Compruebe la tarifa y las condiciones que se proponen.
2. Revise fecha y validez.
3. Añada los artículos o servicios, ajuste cantidades y revise precios, descuentos, impuestos y total.
4. Compruebe las condiciones generales y particulares. Guarde y revise el PDF antes de remitirlo al cliente.
5. Utilice la acción de envío cuando proceda y compruebe el estado del documento. Enviar una oferta no equivale a que el cliente la haya aceptado.
6. Cuando exista aceptación, utilice la acción de aceptar: el presupuesto queda aprobado y se genera un **pedido en borrador**. Abra ese pedido para revisar fecha prevista y cantidades antes de confirmarlo.

Si la propuesta no continúa, utilice la cancelación disponible según su estado. No cree una segunda operación sin comprobar antes si el presupuesto ya generó un pedido.

### 16.4 Recordatorio y cancelación por vencimiento

En **Ventas → Ajustes de Ventas → Parámetros generales** hay dos bloques independientes. El recordatorio informa al responsable antes del vencimiento; la cancelación cambia el estado después de terminar la validez.

| Parámetro | Recordatorio interno | Cancelación por vencimiento |
|---|---|---|
| Activación | Permite pausar el aviso automático. | Permite pausar la cancelación automática. |
| Hora de Madrid | Inicialmente **08:00**. | Inicialmente **00:10**. |
| Antelación | Inicialmente **7 días**, configurable de 0 a 365. Cero incluye solo hoy. | No hay antelación: solo fechas anteriores a hoy. |
| Incluir borradores DRAFT | Decide si entran los presupuestos pendientes de aprobar. | Decide si los borradores vencidos también se cancelan. |
| Destinatarios | Usuario creador activo con correo; un correo agrupado por dirección y día. | Avisos independientes al responsable y al contacto predeterminado activo del cliente. |

El recordatorio interno: pulse **Probar** para ver los destinatarios y sus presupuestos sin enviar correos ni comprobar SMTP; **Enviar ahora → Confirmar envío** envía correos reales con los ajustes guardados aunque el automático esté pausado. Manual y automático comparten el registro diario: no se reintenta ese día un destinatario ya reservado, incluso con resultado incierto.

La cancelación por vencimiento: **Probar** muestra presupuestos vencidos y destinatarios previstos sin cambiar estados, numerar, generar PDF ni enviar correos. **Cancelar vencidos ahora** exige **Confirmar cancelación**, afecta a todos los vencidos que cumplan los ajustes guardados y el servidor vuelve a comprobar cada documento antes de cancelarlo, bloquearlo y archivar su PDF.

![Confirmación de la cancelación manual de presupuestos vencidos](imagenes/presupuestos-confirmar-cancelacion.jpg)

Un presupuesto válido hasta el **27/07/2026** conserva su validez todo ese día y puede cancelarse desde el **28/07/2026**, a la hora configurada. El correo comunica una cancelación ya guardada; no solicita aprobación. Sin destinatario válido o con avisos desactivados, el presupuesto se cancela igualmente sin correo; si responsable y cliente comparten dirección solo se envía una vez.

### 16.5 Asistente de Presupuestos

El botón **Consultar presupuestos** abre un asistente de solo lectura. La **consulta guiada** no consume API; la **pregunta con IA** solamente traduce la frase a filtros y nunca recibe resultados del ERP. KiwiKERP calcula importes por periodo, pendientes, validez, estados, conversión y el detalle de un presupuesto (moneda, envío, validez y pedido asociado). Si el resultado tiene varias divisas, presenta un total independiente para cada una, sin convertirlas ni sumarlas. **Descargar respuesta en PDF** conserva la separación. El asistente no envía, aprueba, cancela ni convierte documentos en pedidos.

## Capítulo 17. Pedidos de venta

Cada línea del pedido muestra las cantidades **pedida, entregada, facturada, cancelada y pendiente**. Estos valores se actualizan automáticamente conforme avanza el pedido.

### 17.1 Crear y confirmar un pedido

Un pedido nuevo se crea en borrador. Revise cliente, fecha prevista de entrega, condiciones y líneas antes de confirmar. Al seleccionar **Confirmar pedido**, el pedido pasa a **En curso**. Un borrador todavía no constituye un compromiso logístico confirmado.

El botón **Asistente de Pedidos** abre consultas de solo lectura por periodo y cliente, pendientes de entregar o facturar, entregas previstas vencidas, pedidos completados y cancelados, y permite explicar un pedido línea por línea.

### 17.2 Seguimiento de cantidades y estados

El listado separa el **Estado** del pedido de su información de **Seguimiento**:

- **Estado del pedido:** Borrador, En curso, Parcialmente completado, Entregado, Completado o Cancelado.
- **Seguimiento de la línea:** Entregada (cantidad de albaranes confirmados), Reservada (comprometida por un borrador), Facturada (corresponde a la emisión, no al cobro), Cancelada, Pendiente.

El filtro **Pendiente de** permite localizar pedidos **pendientes de generar albarán** y **pendientes de facturación**. El filtro **Plazo entrega** muestra pedidos vencidos, que vencen hoy, en los dos plazos configurados (por defecto 7 y 30 días) y sin fecha prevista; solo incluye pedidos confirmados con productos físicos pendientes, con fecha prevista en rojo (vencida), ámbar (primer plazo) o verde (posteriores).

### 17.3 Recordatorio diario de entregas

Por defecto, cada mañana a las **08:15** (hora de Madrid), cada responsable recibe un único correo con los pedidos que creó y que están vencidos, vencen hoy o tienen entrega prevista hasta dentro de **7 días**. Se configura en **Ventas → Ajustes de Ventas → Parámetros generales → Recordatorio diario de entregas**.

![Parámetros del recordatorio diario y acciones Probar y Enviar ahora](imagenes/recordatorio-configuracion.jpg)

El aviso muestra pedido, cliente, fecha prevista, retraso o días restantes y cantidad pendiente. No incluye pedidos entregados, completados, cancelados ni sin cantidades físicas pendientes. El responsable debe ser un usuario activo con correo configurado.

1. Revise activación, hora y antelación. Si los modifica, pulse **Guardar cambios**.
2. Pulse **Probar**: utiliza la sesión iniciada, no envía correos, no comprueba SMTP ni consume el envío diario.
3. Despliegue cada responsable para ver código, cliente, fecha prevista y cantidad pendiente.
4. **Enviar ahora → Confirmar envío** envía correos reales con la configuración guardada, aunque el automático esté pausado.

![Prueba sin envío con los pedidos por destinatario](imagenes/recordatorio-prueba.jpg)

| Estado | Significado y siguiente paso |
|---|---|
| Disponible para enviar | No hay una reserva registrada para hoy. |
| Enviado | El servicio de correo terminó sin error; no acredita lectura ni entrega. |
| Reservado o en curso | En ejecución o sin resultado confirmado. No se repetirá hoy. |
| Resultado incierto o fallido | Puede haberse enviado; no se reintenta ese día para evitar duplicados. |
| Omitido: ya intentado hoy | Un envío manual o automático ya reservó esa dirección. |
| No se pudo reservar el envío | No se inició el correo en ese intento. Consulte la incidencia con el administrador. |

### 17.4 Bloquear, desbloquear y cancelar pendientes

**Bloquear pedido** protege el documento frente a modificaciones accidentales. No representa un estado comercial nuevo ni significa que el pedido esté completado. Si fuera necesario realizar un cambio autorizado, puede utilizarse **Desbloquear pedido**.

**Cancelar cantidades pendientes** se utiliza cuando el cliente ya no desea recibir la parte que falta de una o varias líneas. El sistema conserva las cantidades ya entregadas o facturadas, cancela únicamente la parte que todavía puede cancelarse, mantiene la trazabilidad de la cantidad solicite originalmente y recalcula automáticamente el estado del pedido. La opción no aparece si el pedido está bloqueado o si ya no queda ninguna cantidad cancelable.

### 17.5 Facturar desde pedido

En las acciones de un pedido **confirmado y desbloqueado**, **Facturar desde pedido** permite seleccionar cantidades de líneas sin albarán o con política **Cantidades pedidas**. Cero excluye una línea. Las líneas por cantidades entregadas continúan facturándose desde albaranes.

1. Abra las acciones de un pedido confirmado y desbloqueado y seleccione **Facturar desde pedido**.
2. Revise las líneas que se ofrecen (sin albarán o por cantidades pedidas).
3. Compruebe las cantidades **Comprometidas** (incluyen borradores y facturas emitidas no anuladas) e introduzca la cantidad a facturar sin superar el disponible.
4. Cree el borrador y revise en Facturas sus pedidos de origen, líneas, condiciones y vencimiento.
5. Guarde los ajustes y emita únicamente cuando haya verificado el documento completo. Se vuelve a comprobar el disponible al crear, editar y emitir.

Guardar reserva cantidades; emitir incrementa las facturadas. **Descartar borrador**, desde las acciones de Facturas, libera las reservas y conserva el documento anulado. Una línea sin albarán termina al facturarse completamente; si requiere albarán, debe estar entregada y facturada. En pedidos mixtos cada línea conserva su política.

### 17.6 Asistente de Pedidos

El **Asistente de Pedidos** (botón junto al listado) permite consultar pedidos por periodo y cliente, pendientes de entregar o facturar, entregas previstas vencidas, completados y cancelados, y explicar un pedido línea por línea. La consulta guiada no consume API; la pregunta con IA solo convierte la frase en filtros y KiwiKERP calcula cantidades e importes. El cliente se elige con el buscador habitual; si hay varias divisas los totales aparecen en bloques separados. El asistente no confirma, cancela, entrega ni factura pedidos.

## Capítulo 18. Albaranes y entregas

Un albarán puede incluir una entrega parcial o agrupar varios pedidos compatibles del mismo cliente (misma tarifa y condiciones de envío). Nunca se permite entregar más cantidad de la que permanece pendiente.

### 18.1 Generar albarán desde pedido

La opción **Generar albarán** está disponible para pedidos en curso o parcialmente completados con productos físicos pendientes.

1. Abra el menú de acciones del pedido y seleccione **Generar albarán**.
2. Revise las cantidades pedidas, entregadas y pendientes.
3. Indique la cantidad que se entrega ahora en cada línea (no puede superar la pendiente; el servidor vuelve a comprobarlo).
4. Si procede, incorpore otros pedidos compatibles.
5. Guarde el albarán como borrador y revíselo; **Confírmelo cuando la salida de mercancía sea efectiva**.

> **Advertencia:** las cantidades entregadas se contabilizan únicamente al **confirmar** el albarán, no al guardarlo como borrador. Un borrador reserva cantidades pero todavía no incrementa la entrega.

### 18.2 Albarán manual

**Nuevo albarán manual** permite documentar una entrega que no procede de un pedido de venta. Es obligatorio seleccionar el cliente, indicar el motivo y añadir los productos entregados. El listado identifica estos documentos como **Manual** y no modifican el seguimiento de ningún pedido. El filtro **Facturación** permite consultar todos los albaranes, los ya facturados o los confirmados pendientes de facturar.

### 18.3 Confirmar, anular e imprimir

- **Borrador:** documento editable que todavía no contabiliza cantidades entregadas.
- **Confirmado:** la salida queda consolidada y sus cantidades se incorporan al seguimiento del pedido.
- **Anulado:** revierte las cantidades entregadas y permite que vuelvan a incluirse en un albarán posterior.

La impresión puede obtenerse en versión **valorada** (con importes) o **no valorada** (sin información económica). En los confirmados se conserva una copia histórica del documento para que cambios posteriores de precios no alteren lo emitido; los borradores pueden regenerarse y los anulados no pueden imprimirse.

### 18.4 Envío por correo

Los albaranes **Confirmados** pueden enviarse por correo desde el menú de acciones o desde el formulario. El sistema muestra los contactos activos del cliente con correo válido y selecciona inicialmente el contacto principal. Antes de enviar se elige entre versión valorada o no valorada. Se utiliza la plantilla corporativa y el PDF histórico del documento.

La fecha de envío solo se registra cuando el servidor de correo confirma la salida. La columna **Enviado el** muestra la fecha y hora del último envío (`dd/MM/yyyy HH:mm:ss`) o `-` si nunca se ha enviado. Los borradores y los albaranes anulados no pueden enviarse.

### 18.5 Recogida por transportista y justificantes

1. Prepare el albarán y confírmelo cuando el transportista retire la mercancía.
2. En el documento **Confirmado** seleccione **Registrar recogida del transportista**.
3. Indique fecha y hora de recogida y el nombre de la persona o empresa transportista.
4. Incorpore el justificante firmado, fotografiado o escaneado desde **Fotografías y justificantes**.

Registrar la recogida no vuelve a contabilizar cantidades y no acredita por sí solo la entrega final al cliente; documenta quién retiró la mercancía y cuándo. Una prueba posterior de entrega puede archivarse en el mismo gestor documental.

**Fotografías y justificantes** permite conservar fotografías de la mercancía, justificantes de transporte o recepción y PDF o documentos de texto. Se admiten PDF, JPG, JPEG, PNG, WEBP, DOC y DOCX hasta **15 MB por archivo**, con previsualización, descarga y eliminación. El indicador de clip junto al código muestra cuántos documentos vinculados tiene el albarán; los justificantes se conservan aunque el albarán se anule.

### 18.6 Resumen logístico

El panel plegable **Resumen logístico de albaranes** presenta indicadores anuales: albaranes generados, borradores, pendientes de facturar, salidas sin recogida registrada, pendientes de enviar y anulados, con gráficos mensuales y distribución por estado.

La franja de calidad incluye puntualidad, retraso medio, porcentaje con recogida registrada, porcentaje enviado, albaranes manuales y cantidad entregada. Para calcular la puntualidad se compara la fecha prevista del pedido con la fecha real de entrega; en albaranes agrupados se usa el compromiso más próximo; los manuales quedan fuera del cálculo. El panel termina con el ranking de los cinco clientes con mayor importe entregado y las cinco entregas con mayor retraso.

## Capítulo 19. Facturas de venta

El módulo **Facturas** centraliza la emisión, el envío fiscal, los vencimientos, el correo al cliente y el historial de cobros. La tarjeta **Facturas de venta** abre el listado de facturas, donde los borradores se diferencian mediante su código provisional `DRAFT_FC-…` y un estilo visual propio.

### 19.1 Origen: desde albaranes, desde pedido o manual

Una factura puede crearse por tres vías:

1. **Desde albaranes confirmados:** cuando contienen cantidades pendientes de facturar. Pueden agruparse albaranes compatibles del mismo cliente y tarifa (véase el capítulo 18).
2. **Desde pedido:** facturando directamente cantidades de líneas sin albarán o con política de cantidades pedidas (véase el capítulo 17.5).
3. **Nueva factura manual:** cuando la venta no debe facturarse desde un pedido o albarán existente.

**Nueva factura manual** (en **Ventas → Facturas**):

![Nueva factura manual: cliente, tarifa, forma de pago y líneas](imagenes/factura-manual.jpg)

1. Seleccione un cliente activo con tarifa de venta configurada. Puede cambiar la tarifa y la forma de pago propuestas; se guardan en la factura sin modificar la ficha del cliente.
2. Indique fecha, referencia opcional y **motivo obligatorio**. El motivo explica por qué se crea una factura sin documentos de origen.
3. Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto aplica las reglas de la tarifa; el descuento de línea es adicional.
4. Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.
5. Guarde: se abre un **borrador Manual** en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.
6. Revise el vencimiento propuesto por la condición de cobro y continúe con la emisión habitual.

El listado muestra los **pedidos de origen** y los **albaranes de origen** de cada factura. Cuando existen varios albaranes, el indicador abre un diálogo con cliente, código, fecha e importe de todos los vinculados. La opción **Nueva factura manual** solo debe utilizarse cuando la venta no tiene un pedido o albarán anterior; si la operación ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.

### 19.2 Modificación del borrador

La acción **Abrir factura** permite editar un borrador. Pueden modificarse la fecha, las condiciones de pago, las cantidades, los precios, los descuentos, los impuestos y las notas. Los importes se recalculan en tiempo real y se consolidan con **Guardar borrador**.

Para las líneas procedentes de albaranes se aplican estas reglas:

- La línea de origen no puede eliminarse.
- La cantidad debe ser mayor que cero.
- No puede superar la cantidad entregada pendiente, teniendo en cuenta otras facturas.
- Reducir la cantidad no modifica el pedido ni el albarán: solamente deja una parte pendiente de facturar.

La factura presenta por separado las **condiciones generales** (procedentes de los parámetros generales de ventas), las **condiciones particulares del cliente** (copiadas de su ficha) y la **condición de cobro y vencimiento** (datos estructurados para calcular cuándo debe pagarse). Ambos textos pueden adaptarse en el borrador y quedan guardados como copia histórica.

![Borrador editable: tarifa, forma de pago y acciones de guardar y emitir](imagenes/factura-borrador.jpg)

**Añadir concepto** incorpora al borrador gastos o servicios que no representan mercancía entregada (portes, embalajes, seguros o gastos de gestión). Es obligatorio seleccionar un producto o servicio del catálogo, indicar la descripción y justificar el motivo. El concepto se identifica como **Concepto manual**, no modifica cantidades de pedidos ni albaranes y puede eliminarse mientras la factura permanezca en borrador.

![Condiciones generales y particulares, con importes y botones al pie](imagenes/factura-condiciones.jpg)

> **Advertencia:** no utilice un concepto manual para añadir mercancía física entregada. Esa mercancía debe proceder de un albarán o de una línea de facturación directa del pedido.

Cuando la factura está emitida, sus datos fiscales y económicos quedan bloqueados y se presentan únicamente en modo consulta. Después de emitir no debe alterarse directamente; las correcciones posteriores deben realizarse mediante **factura rectificativa**.

### 19.3 Vencimientos y condiciones de pago

En **Ajustes de Ventas → Parámetros generales → Condiciones de pago y vencimientos** puede seleccionarse una condición o crearse una nueva con plazos por porcentaje o importe fijo, sus días desde la fecha de factura y una opción de fin de mes. El último plazo siempre es **Saldo restante** y absorbe los redondeos. Use **Probar reparto** y **Guardar condición**.

Para el cálculo de cada plazo se suman sus días desde la fecha de factura, se ajusta al fin de mes si está indicado y, si el cliente tiene días habituales de pago, se selecciona el siguiente día configurado igual o posterior. El vencimiento se recalcula en pantalla al cambiar la fecha del borrador y el backend repite el cálculo al guardar; el calendario queda fijado al emitir.

En el listado, el selector **Vencimientos** permite ver **Vencidas** (rojo), **Vencen hoy** y **Próximas 7 días** (ámbar), **Posteriores a 7 días** (azul) y **Sin fecha de vencimiento** (gris), sobre los plazos pendientes. **Vencido** significa anterior a hoy con saldo pendiente; **Vence hoy** es una situación distinta. **Próx. vencimiento** muestra el primer plazo pendiente y cuántos quedan. La columna **Vencimientos** del listado muestra fecha, importe, cobrado, pendiente y situación de cada plazo, aunque no esté habilitado el registro de cobros.

**Modificar vencimiento** (solo en borrador) sustituye el reparto por **un único vencimiento por el total**; es obligatorio indicar la fecha y justificar el motivo, y la fecha no puede ser anterior a la fecha de factura. El backend registra en las notas la fecha manual, la fecha que habría correspondido y el motivo. **Usar vencimiento calculado** elimina la excepción y recupera la regla comercial.

### 19.4 Emisión y validación fiscal

Al pulsar **Emitir factura**, el sistema guarda el borrador y revisa los datos fiscales actuales:

![Validación fiscal: errores y ubicación donde corregirlos antes de emitir](imagenes/validacion-fiscal.jpg)

1. Si hay errores, se muestran juntos con su ubicación: **Configuración → Datos de empresa** para el emisor y **Ventas → Entidades → ficha del cliente** para el destinatario.
2. Revise NIF, nombre o razón social, domicilio, municipio, código postal y país del cliente. En España se comprueban también provincia y formato del código postal. El emisor está configurado para España.
3. Tras corregir las fichas, vuelva a abrir la emisión o pulse **Volver a comprobar**.
4. Cuando la comprobación sea correcta, introduzca la contraseña del certificado y pulse **Emitir y enviar**. El servidor repite la validación antes de reservar número.

Si faltan datos o son incorrectos, la factura sigue siendo borrador: **no se asigna número, no se genera el PDF definitivo ni se prepara el envío**. Se revisan también cantidades, descripciones, impuestos, descuentos y totales. La revisión comprueba NIF, NIE y NIF especiales K/L/M españoles y NIF-IVA franceses; no consulta el censo de la AEAT ni VIES ni decide el tratamiento fiscal de una operación internacional.

La emisión realiza una última validación: comprueba cliente, fechas, vencimientos, líneas y totales, verifica el disponible, reserva transaccionalmente el siguiente número fiscal del ejercicio con la serie configurada (por ejemplo `FC-KW-2026/0001` con prefijo `KW`), cambia el estado a **Confirmada** y bloquea la edición económica. Es una operación irreversible dentro del circuito ordinario: una factura emitida no vuelve a borrador ni se renumera.

### 19.5 VeriFactu: cola, estado y subsanaciones

Al pulsar **Emitir y enviar**, la confirmación queda desactivada mientras el servidor guarda y prepara la emisión. En cuanto confirma la emisión y su incorporación a la cola, se cierran los diálogos y puede seguir trabajando: **la aplicación no espera la respuesta de VeriFactu ni muestra un bloqueo general**. El listado y la **Cola VeriFactu** actualizan su estado periódicamente.

El listado distingue **Pendiente de envío**, **Aceptada**, **Aceptada con errores**, **Rechazada** y **Requiere corrección**. Los fallos técnicos se reintentan automáticamente con una espera predeterminada de 10 minutos. **Reintentar envío VeriFactu** vuelve a usar el mismo registro, la misma factura y el mismo número fiscal.

Una factura numerada nunca vuelve a borrador y solo puede enviarse al cliente cuando VeriFactu figure como **Aceptada**. Un rechazo de datos pasa a **Requiere corrección**; tras corregir el dato maestro (por ejemplo el NIF del cliente), **Subsanar VeriFactu** conserva el documento original, archiva una nueva versión corregida y genera un nuevo registro de subsanación con motivo obligatorio.

El panel plegable **Cola VeriFactu** muestra las facturas pendientes de envío, las que requieren atención y las últimas aceptadas (número configurable). **Consultar AEAT** contrasta los registros por año y mes utilizando el certificado del usuario y solicitando su contraseña en cada ocasión. **Encadenamiento VeriFactu** presenta las 8 últimas facturas con su huella y la del registro anterior; la primera se identifica con **PrimerRegistro = S**. Cada intento conserva la request y la response, incluso cuando el registro es rechazado.

### 19.6 Auditoría de emisión

Desde el menú de la factura, **Auditoría de emisión** muestra el **Estado actual de VeriFactu** (consultado al servidor) y una secuencia de filas históricas. Una fila **Emisión confirmada · envío encolado** a las 19:10 describe ese momento, no que la factura siga en cola; la respuesta de la AEAT añade una fila nueva **Resultado VeriFactu** atribuida a **Sistema · VeriFactu**. El historial se consulta en páginas de 50 registros con fechas en hora de Madrid y conserva el operador, el usuario del certificado, la fecha y el resultado. La ampliación no incluye cobros, ediciones ni anulaciones, y no se reconstruyen filas históricas para documentos anteriores.

### 19.7 Correo al cliente

El filtro **Correo al cliente** ofrece **Todas**, **Enviadas** y **No enviadas**, combinables con Situación, VeriFactu y búsqueda. Se basa en la fecha de correo registrada, no en la aceptación fiscal: **Enviadas** no acredita recepción ni lectura, y **No enviadas** puede incluir borradores o intentos inciertos.

En el menú de una factura, **Enviar por correo** (o **Reenviar por correo**) solo está disponible para facturas emitidas, no anuladas y aceptadas por VeriFactu, con su PDF fiscal archivado. Seleccione entre uno y diez **contactos activos del cliente con correo válido** (se propone el principal si está disponible), revise el asunto y mensaje editables y pulse **Preparar envío** y después **Confirmar envío**. Se envía un único correo con las direcciones seleccionadas y sin repetidas.

**Historial de correo** abre la tabla de registros con fecha de solicitud y resultado en hora de Madrid, usuario, destinatarios del momento, asunto, operación y estado. **Enviado** significa aceptación por el servidor de correo; solo entonces se actualiza el último envío. **Reenviar** prepara una nueva operación vinculada a la anterior. Ante una respuesta perdida, actualice el historial; **Reintentar la misma solicitud** no repite un envío ya registrado. Un resultado **Incierto** puede haber llegado al cliente: reenviarlo expresamente podría duplicarlo.

### 19.8 Asistente de Facturas

El botón **Asistente de Facturas** (piloto de solo lectura) permite consultar facturación por periodo y cliente, pendientes, vencidos y el detalle de una factura con sus cobros. No modifica documentos ni envía correos.

- Escriba la consulta con sus palabras y pulse **Interpretar pregunta**: si la entiende, lanza la consulta; si falta algún dato, indica qué ha entendido y qué necesita. **Descargar respuesta en PDF** conserva criterios, totales y documentos justificativos.
- Las fechas corresponden a la factura en Europe/Madrid, con extremos incluidos. Pendiente y vencido representan el **saldo actual**. La facturación excluye borradores, anuladas y la tabla de rectificativas. Máximo 366 días por periodo y 500 documentos.
- El asistente identifica la moneda y rechaza consultas que mezclen divisas. El cliente debe indicarse por código o nombre completo exacto.
- Solo se envía al proveedor (Groq u OpenAI) la pregunta y, en su caso, la factura seleccionada; evite incluir información sensible innecesaria.

### 19.9 Facturas proforma

Desde un pedido confirmado puede generarse una **factura proforma**, que refleja la **Fecha prevista de entrega** del pedido. La opción **Ver proformas** aparece cuando el pedido tiene al menos una proforma generada; desde la consulta pueden revisarse sus datos y descargar su PDF.

La proforma no sustituye a la factura definitiva. Su generación no debe interpretarse como emisión fiscal, entrega de mercancía ni registro de cobro.

## Capítulo 20. Cobros

### 20.1 Registrar cobros (totales y parciales)

**Cobros de la factura** solo aparece en facturas **emitidas, no anuladas y con VeriFactu en Aceptada**. No está disponible en borradores, no enviadas, pendientes o con incidencias fiscales. El servidor comprueba de nuevo esta condición antes de registrar un cobro. Ocultar la opción no elimina movimientos ni cambia saldos; una factura ya cobrada y aceptada conserva el acceso a su historial.

En las opciones de la factura, abra **Cobros de la factura**. Se utiliza automáticamente el código del usuario conectado como autor, sin pedir de nuevo la contraseña. El diálogo muestra total, importe cobrado, saldo pendiente e historial. Registre fecha, importe, medio, referencia y observaciones. Solo admite facturas emitidas no anuladas, importes positivos de hasta dos decimales y fechas no futuras: no puede superar el saldo.

Una factura de 1.000 € con un cobro de 400 € queda **Parcialmente cobrada**, con 600 € pendientes. Al registrar un cobro se asigna al primer plazo pendiente por defecto y se distribuye desde el más antiguo; **Cobrar saldo completo** cubre todos los plazos y **Elegir plazos e importes** permite repartir entre vencimientos concretos (la suma debe coincidir con el importe recibido). El historial conserva el reparto y una reversión devuelve el saldo a los mismos plazos originales.

El filtro **Parcialmente cobradas** permite localizar cobros incompletos. El widget **Importe cobrado** incluye cobros parciales y saldos previos de las facturas del año seleccionado; el pendiente muestra solo el saldo restante. Registrar o revertir un cobro no cambia líneas, cantidades, número, PDF, pedidos, albaranes ni VeriFactu.

1. Localice la factura emitida y abra **Cobros de la factura**. Compruebe código, cliente, total y saldo pendiente.
2. Indique la fecha real del cobro (sin fecha futura) y el importe recibido, positivo y con un máximo de dos decimales. No puede superar el saldo.
3. Complete medio de cobro, referencia y observaciones. El autor se obtiene del usuario conectado.
4. Guarde y compruebe que el movimiento aparece en el historial y que se ha reducido el pendiente.
5. Si tiene un justificante, adjúntelo desde el clip del movimiento ya guardado. No se exige adjunto.

Registrar un cobro deja constancia de un pago recibido; **no realiza una transferencia ni cobra dinero al cliente**.

### 20.2 Vencimientos y recordatorio diario interno

El **recordatorio diario de vencimientos** se configura en **Ajustes de Ventas → Parámetros generales → Recordatorio diario de vencimientos**: selección de usuarios internos destinatarios, hora de Madrid y antelación (0–365 días), guardado con **Guardar recordatorio** (independiente del guardado general). Inicialmente está desactivado, con hora 08:30 y antelación de 7 días.

Incluye todos los vencidos, los de hoy y los próximos hasta la antelación indicada, exclusivamente de facturas aceptadas por VeriFactu y no anuladas. Muestra cliente, factura, plazo, fecha, moneda e importe pendiente después de cobros parciales y reversiones. **No se envía a contactos de clientes**, solo a usuarios internos activos con correo válido.

**Enviar recordatorio de vencimientos** (junto a Nueva factura manual o desde Ajustes) muestra primero una consulta sin correos y después permite confirmar. Usa los parámetros guardados, no los filtros del listado; recalcula los saldos al confirmar y funciona aunque la programación esté pausada. Cada dirección recibe como máximo un correo por día; una reserva o un resultado incierto no se reintenta ese día.

### 20.3 Revertir cobros y recuperar respuestas

Si el movimiento es erróneo, seleccione **Revertir cobro** e indique el motivo. Compruebe después que aumenta el saldo pendiente. El movimiento original y su reversión permanecen en el historial: no se borra la evidencia. Si corresponde, registre a continuación el cobro correcto.

Ante una respuesta incierta, utilice **Comprobar / reintentar** y revise el historial antes de introducir otro pago. Un **Saldo previo** de una factura antigua no es un movimiento nuevo: no dispone de una fecha o medio reconstruidos y no puede revertirse desde este historial.

El cierre comercial del pedido, el resultado de VeriFactu y el cobro son seguimientos independientes. Cobrar o revertir no cambia el número fiscal, el PDF, las cantidades ni los documentos de origen.

## Capítulo 21. Rectificativas

Las **rectificativas** permiten registrar abonos vinculados a una factura emitida y conservar el recorrido comercial del documento. También pueden tomar como origen otra rectificativa aceptada cuando se corrige un abono anterior. Al emitir reciben numeración provisional RFC y quedan bloqueadas; conservan motivo, PDF, auditoría y estado VeriFactu.

### 21.1 Qué es una rectificativa y cuándo utilizarla

Se utiliza cuando debe corregirse o anularse total o parcialmente una factura ya emitida: errores en importes, cantidades o conceptos de la factura original. No debe editarse la factura emitida como borrador; la corrección se realiza con la rectificativa, que conserva la relación con el documento rectificado.

### 21.2 Modalidades: abono por cantidades y rectificación económica

- **Abono por cantidades:** se conservan el precio, descuento, incremento e IVA del documento de origen y se modifica la cantidad.
- **Rectificación económica:** se ajusta el valor económico de la línea; el documento refleja la diferencia frente al origen y los abonos se muestran con signo negativo.

### 21.3 Seleccionar el documento de origen

Al pulsar **Nueva rectificativa**, se busca por código o cliente y se selecciona una factura o rectificativa aceptada. El sistema muestra las líneas y las cantidades que todavía pueden abonarse, evitando superar el importe disponible.

### 21.4 Crear y editar una rectificativa

Se crea desde la factura o rectificativa de origen y se guarda inicialmente como borrador. Los borradores se muestran con el mismo distintivo visual que los borradores de Facturas y pueden editarse o cancelarse.

### 21.5 Disponibilidad de cantidades y totales

Los abonos son parciales y no pueden superar lo ya rectificado. Cuando se selecciona una rectificativa aceptada como origen, se utilizan sus propias líneas y se descuentan las cantidades reservadas por sus correcciones posteriores. Revertir un abono negativo produce un ajuste positivo; la corrección económica de una rectificativa calcula la diferencia frente a su importe.

### 21.6 Estados y acciones disponibles

Los borradores pueden editarse o cancelarse. Al emitir, la rectificativa recibe su numeración definitiva y queda bloqueada. Desde el menú de acciones de una rectificativa aceptada pueden abrirse el documento, descargarse su PDF, consultarse el correo y revisarse el historial fiscal.

### 21.7 Validación y emisión definitiva (certificado VeriFactu)

La emisión de la rectificativa requiere el certificado VeriFactu asignado al usuario, se registra en VeriFactu y conserva los valores de sus líneas y el motivo.

### 21.8 VeriFactu: cola, estado, reintento y subsanación

El estado VeriFactu de la rectificativa se consulta y controla de forma independiente desde la cola; se admiten reintentos del mismo registro y subsanaciones tras corregir los datos maestros afectados.

### 21.9 Auditoría de emisión

El documento registra motivo, PDF, auditoría y estado VeriFactu, siguiendo el mismo modelo de auditoría que las facturas de venta.

### 21.10 Envío de correo al cliente e historial

Desde el menú de una rectificativa aceptada puede enviarse por correo al cliente mediante el historial de correo, con el PDF archivado y la plantilla corporativa de Facturas.

### 21.11 Ver, imprimir y cancelar un borrador

El menú de tres puntos de una rectificativa aceptada incluye **Ver / Imprimir rectificativa**, que abre el PDF archivado. Los nuevos reportes usan la plantilla corporativa de Facturas y muestran el documento rectificado y el motivo; los PDF firmados anteriormente conservan su versión original. Un borrador puede cancelarse mientras permanezca en ese estado.

### 21.12 Rectificar una rectificativa (encadenamiento)

Puede seleccionarse una rectificativa aceptada como origen de otra rectificativa: se conservan el documento rectificado y la factura inicial, y se encadena la trazabilidad comercial.

### 21.13 Estadísticas y seguimiento automático

El listado de rectificativas conserva la relación con el documento rectificado anterior y el detalle guarda la factura inicial. En esta versión, el seguimiento de abonos y estadísticas se documenta junto con el recorrido comercial de la factura origen.

> **[CAPTURA: pantalla del listado de rectificativas y del formulario Nueva rectificativa]**

## Capítulo 22. Lista de precios y tarifas

**Ventas → Lista de precios** centraliza las tarifas. **Ajustes de ventas → Tarifas de venta** abre esa misma pantalla; no mantiene una configuración duplicada. En el panel inferior se eligen la **moneda base** del Precio de venta de los artículos y la **tarifa predeterminada**. Solo puede elegirse como predeterminada una tarifa de la moneda base. La moneda base se confirma una vez y queda protegida.

### 22.1 Reglas por producto, familia o catálogo

Cada tarifa admite precios fijos o descuentos sobre el **Precio de venta**, para todos los productos, una familia exacta o un producto. Pueden añadirse varios tramos por destino indicando una **Cantidad mínima**: se aplica el mínimo más alto alcanzado dentro del ámbito prioritario, a todas las unidades de la línea. Se aplica una sola regla (**producto → familia → general → precio base**), sin acumular descuentos ni heredar subfamilias. Un precio fijo de cero es válido. En otra moneda hace falta un precio fijo explícito; no se convierten importes.

| Elemento | Función |
|---|---|
| Precio de venta del artículo | Precio base en la moneda configurada. |
| Tarifa predeterminada | Referencia general cuando no existe otra tarifa aplicable. |
| Tarifa del cliente | Condiciones propuestas en sus nuevas ventas; varios clientes pueden compartirla. |
| Regla por producto, familia o todos | Precio fijo o descuento sobre el precio base; una única regla, sin acumulación. |
| Cantidad mínima | Selecciona el mayor tramo alcanzado dentro del ámbito aplicable, por línea. |
| Precio del documento | Importe acordado que se guarda; reabrir no lo recalcula. |

**Ejemplo:** el producto tiene un precio base de 5,00 EUR. El cliente utiliza una tarifa USD con 100,00 USD desde 0 unidades y 80,00 USD desde 101. Una línea de 120 unidades propone **80,00 USD por unidad**, con base de **9.600,00 USD**, antes de impuestos y descuentos adicionales. No son 80,00 USD por toda la línea ni una conversión de los 5,00 EUR.

Al añadir productos en documentos se propone el precio neto de tarifa; el descuento de línea es adicional. Al cambiar cantidades se recalculan los precios obtenidos de tarifa durante la edición, conservando el descuento adicional. Los precios manuales y guardados se mantienen hasta solicitar recalcular.

### 22.2 Simulación y aplicación de tarifas

**Simular precio** desde el formulario de tarifa utiliza sus reglas aunque no estén guardadas y no modifica la base de datos. Desde el artículo, **Consultar tarifas** consulta los precios guardados. **Aplicar tarifa** pide confirmación y sustituye los precios y descuentos existentes; conservar los importes solo está permitido si la moneda coincide. Reabrir o convertir documentos no recalcula lo pactado.

Las cantidades e importes usan **punto de miles y coma decimal**, por ejemplo **1.200,00**. La columna **Precio** muestra el origen del precio: **Precio manual** cuando se editó y **Precio guardado** para líneas antiguas sin evidencia. Reabrir nunca recalcula el importe. Esta función requiere las migraciones V25 y V27 y el backend actualizado; no incluye todavía vigencias ni fórmulas sobre coste.

## Capítulo 23. Ajustes de Ventas

**Ventas → Ajustes de Ventas** se organiza en dos pestañas: **Parámetros generales** y **Parámetros VeriFactu**.

### 23.1 Numeración y condiciones generales

En **Parámetros generales** se mantienen:

- Las **condiciones generales** aplicables a los nuevos documentos comerciales.
- El cuerpo predeterminado del **correo de presupuestos**.
- El **prefijo de numeración de facturas**: con el valor `KW`, una factura emitida en 2026 se numera como `FC-KW-2026/0001`. La serie se aplica al emitir y queda incorporada al número fiscal, al PDF, a Facturae y al registro VeriFactu. Cambiarla no renumbra facturas ya emitidas.
- El **recordatorio diario de entregas**, los **plazos del filtro de entrega** y el **recordatorio diario de vencimientos** (capítulos 17.3 y 20.2).

### 23.2 Condiciones de pago y vencimientos

Este bloque configura las condiciones de cobro (véase el capítulo 19.3): seleccione una condición o pulse **Nueva condición**, añada plazos por porcentaje o importe fijo con sus días desde la fecha de factura y opción de fin de mes. El último plazo siempre es **Saldo restante**. Use **Probar reparto** y **Guardar condición**; este bloque tiene su propio guardado.

Las condiciones generales y las particulares del cliente se copian a los documentos para conservar el contenido utilizado en cada operación.

### 23.3 Recordatorios automáticos

Desde Ajustes de Ventas pueden ejecutarse y probarse los recordatorios de presupuestos, entregas y vencimientos (capítulos 16.4, 17.3 y 20.2). Cada acceso muestra primero documentos y destinatarios, exige confirmación y comparte el registro diario anti-duplicados. Un correo por dirección y día entre los envíos manuales y automáticos.

### 23.4 Parámetros VeriFactu

**Parámetros VeriFactu** controlan:

- **Activación** de VeriFactu. Si está desactivado, sus campos quedan deshabilitados salvo el interruptor y no son obligatorios para guardar; se conserva la configuración guardada. Al activarlo se validan sus parámetros operativos.
- **Envío automático** y **reintentos** (espera predeterminada de 10 minutos).
- **Presentación del código QR** en los documentos.
- La **identificación del desarrollador** (ID 77, Andres Vadillo de la Fuente, NIF 50854156Y, KiwiKERP, versión V2), precargada y de solo lectura, también en el servidor.
- El **número de instalación** (las nuevas parten de 1; las existentes conservan el suyo). No se modifica desde esta pantalla.
- El **certificado** y la **contraseña** utilizados para la emisión y la consulta AEAT.

El entorno permanece limitado a **PRUEBAS** y el backend comprueba que el destino sea el portal de preproducción de la AEAT. Los certificados y sus contraseñas no se guardan en este formulario.

# Apéndices

## Apéndice A. Glosario de estados y términos

### Estados de los documentos

| Estado | Significado para el usuario |
|---|---|
| Borrador | Documento todavía en preparación; editable y todavía no efectivo. |
| Confirmado | Documento operativo consolidado (albarán confirmado = entrega contabilizada). |
| En curso | Pedido confirmado que comienza su ejecución. |
| Parcialmente completado | Una parte ya se ha entregado, facturado o cancelado. |
| Entregado | No queda mercancía física pendiente; puede faltar facturación. |
| Completado | Todo lo servido está entregado y facturado. |
| Cancelado | No se servirá ninguna de las cantidades del documento. |
| Anulado | Documento invalidad; revierte las cantidades que hubiera contabilizado. |
| Bloqueado | Documento protegido frente a cambios; no es un estado comercial. |

### Estados de facturación y cobro

| Estado | Significado |
|---|---|
| Parcialmente facturado | Existe cantidad facturada o reservada, pero queda parte disponible. |
| En factura borrador | Toda la cantidad está incluida en facturas que todavía son borrador. |
| Facturado | Toda la cantidad entregada está incluida en facturas emitidas. |
| Parcialmente cobrada | Existe cobro registrado, pero queda saldo pendiente. |
| Cobrada | El saldo pendiente llega a cero. |

### Distinguir cada seguimiento

| Seguimiento | Pregunta que responde | Qué no significa |
|---|---|---|
| Estado del pedido | ¿Queda entrega o facturación por resolver? | Completado no significa cobrado. |
| Estado del albarán | ¿La salida está preparada, confirmada o anulada? | Borrador no equivale a entregado. |
| Estado de la factura | ¿Es borrador o ya tiene emisión definitiva? | Emitida no equivale a aceptada en VeriFactu. |
| Estado VeriFactu | ¿Qué resultado tiene el envío del registro? | Aceptada no equivale a cobrada. |
| Situación de cobro | ¿Cuánto se ha recibido y cuánto falta? | Vencida no equivale a anulada. |

### Términos AEAT y VeriFactu

- **VeriFactu:** sistema de verificación de la facturación de la AEAT. Cada factura se registra con un hash encadenado al anterior, garantizando trazabilidad e inmutabilidad.
- **Facturae:** formato XML de intercambio de facturas electrónicas utilizado por la integración.
- **Cola VeriFactu:** panel que muestra las facturas pendientes de envío, las que requieren atención y las últimas aceptadas.
- **Huella / hash:** resultado criptográfico del registro de una factura; cada registro incluye la huella del anterior (encadenamiento).
- **PrimerRegistro = S:** marca que identifica la primera factura de una cadena VeriFactu.
- **Aceptada / Aceptada con errores / Rechazada / Requiere corrección:** estados del registro VeriFactu. Solo **Aceptada** habilita el envío del correo al cliente.
- **Subsanar:** corregir un registro rechazado tras ajustar el dato maestro afectado, conservando el documento original.
- **Requena de la solicitud AEAT:** consulta de los registros existentes en la AEAT por año y mes.
- **NIF, NIE, NIF-IVA, NIF especiales K/L/M:** identificadores fiscales validados localmente antes de emitir.
- **Expediente AEAT:** paquete documental (ZIP) preparado para responder a un requerimiento de la Agencia Tributaria (véase el Apéndice B).

## Apéndice B. Requerimientos AEAT y archivo de expedientes

Desde el menú general del listado de Facturas se abre **Requerimientos y documentación AEAT**. Esta herramienta **prepara documentación**: no envía información, no contesta automáticamente requerimientos y no implementa el servicio de remisión bajo requerimiento de sistemas NO VERI*FACTU.

### B.1 Preparar un expediente

1. Abra **Nuevo expediente**.
2. Indique la **referencia de la notificación**, el **periodo de fechas** de las facturas, el **plazo de respuesta** (opcional) y **observaciones**.
3. Busque las facturas y seleccione únicamente las solicitadas. Cambiar las fechas vacía la selección para evitar incluir facturas de otro periodo.
4. Pulse **Preparar y archivar expediente** y revise las advertencias.

Máximo: **500 facturas y 100 MB de contenido** por expediente. Para un volumen superior, divida el alcance en varios expedientes. La fecha final incluye el día completo.

### B.2 Contenido del ZIP

El expediente guarda en el repositorio documental un ZIP con:

- Los **PDF existentes** en el repositorio de informes (original, VeriFactu y subsanaciones disponibles), sin regenerarlos.
- La **request y la response** conservadas en el histórico, como texto XML UTF-8, identificadas por factura e ID de histórico.
- `indice.json`: selección, fechas, situación al preparar, registros, huellas leídas del XML, anterior relacionado y sumas de comprobación de los archivos de evidencia.
- `LEEME.txt`: alcance, limitaciones y advertencias.

No se consultan claves privadas ni contraseñas. No se recalculan las huellas fiscales. Las sumas SHA-256 del ZIP y de los archivos son controles del paquete documental y **no sustituyen** las huellas de VeriFactu. Si faltan PDF, request o response, o no puede interpretarse el encadenamiento, se informa. La ausencia de advertencias no certifica cumplimiento, conservación integral ni validez de la cadena.

### B.3 Consulta y presentación

En **Expedientes preparados** puede abrirse el expediente y descargar su ZIP. La descarga recupera la copia archivada; no vuelve a generar el paquete con datos posteriores. Si cambia su checksum, la descarga se bloquea con una advertencia.

Pueden adjuntarse por separado la **notificación recibida** y el **justificante de presentación**, en PDF de hasta 15 MB. No modifican el ZIP preparado ni se sustituyen desde Documentos. El estado **Justificante adjunto** significa únicamente que se archivó un documento local; no verifica su presentación ante Hacienda.

> **Advertencia:** **no se envía nada a la AEAT desde esta opción.** El expediente es una ayuda de preparación, no un formato oficial. Siga el alcance, plazo y procedimiento indicado en la notificación.

## Apéndice C. Casos prácticos y resolución de problemas

### C.1 Crear un producto

1. Entre en **Ventas → Artículos**.
2. Pulse **Nuevo artículo** y complete descripción, precio, impuesto, unidad de medida, tipo logístico y tipo comercial.
3. Revise el flujo de venta (requiere albarán y política de facturación).
4. Guarde y compruebe que aparece en el listado.

### C.2 Configurar un certificado VeriFactu

1. Abra **Ventas → Ajustes de Ventas → Parámetros VeriFactu**.
2. Seleccione el certificado y valide la contraseña.
3. Guarde la configuración y revise el estado de conexión.
4. Al emitir, introduzca la contraseña del certificado; el servidor cifra la credencial al encolar el envío.

### C.3 Preparar la primera venta

1. Revise los datos de empresa, usuarios y datos maestros (Parte III).
2. Dé de alta el cliente y el artículo (Parte IV).
3. Cree un presupuesto, envíelo y acéptelo: se genera el pedido en borrador (capítulo 16).
4. Confirme el pedido y genere el albarán cuando vaya a entregar (capítulos 17 y 18).
5. Emita la factura desde el albarán o desde el pedido, con el certificado VeriFactu (capítulo 19).
6. Registre el cobro cuando reciba el pago (capítulo 20).

### C.4 Resolución de problemas frecuentes

| Problema | Qué revisar |
|---|---|
| No puede iniciar sesión | Usuario y contraseña, bloqueo de mayúsculas, estado de la cuenta, red y disponibilidad del servidor. |
| El correo de recuperación no llega | Carpeta de no deseado/promociones, dirección registrada en la ficha del usuario. |
| Un documento no aparece en el listado | Quite los filtros de estado y fechas; compruebe el periodo y los filtros combinables (Situación, VeriFactu, Correo, Vencimientos). |
| Guardó y perdió la respuesta de conexión | Compruebe el resultado en el listado o vuelva a abrir el detalle; utilice la acción de reintento de la misma operación antes de crear otra. |
| Rechazo o error en la emisión | Revise el listado de errores de validación fiscal y los datos de la empresa/cliente; use **Subsanar VeriFactu** si procede. |
| Resultado incierto al enviar correo o registrar cobro | Consulte el historial o la prueba antes de repetir; no reenvíe a ciegas para evitar duplicados. |
| Una opción nueva no aparece | Compruebe con el administrador que las migraciones de base de datos y las versiones de backend y frontend están desplegadas. |

## Apéndice D. Historial del manual y versiones

### Versión 3.0 (borrador) — 16 de septiembre de 2026

- Reorganización del manual en cinco partes y apéndices según el índice 3.0.
- Ampliación de los capítulos de impuestos, familias, auditoría de emisión, rectificativas, lista de precios y Ajustes de Ventas.
- Añadida la guía de inicio rápido, las notas de seguridad y el glosario de términos AEAT y VeriFactu.
- Los huecos de imagen se marcan como **[CAPTURA: descripción]** para completar en revisiones posteriores.

### Versión 2.7 — 1 de septiembre de 2026

- Asistente de instalación, identidad externa y variables de ubicación.
- Configuración y validación de GestDoc, indicación en el pie y reinicio requerido al cambiar la ruta.
- Verificación SMTP con sesión administrativa y diseño pendiente de dump y recreación de la base.

### Versión 2.6 — 1 de septiembre de 2026

- Trazabilidad comercial visual e imprimible desde Presupuestos, Pedidos, Albaranes y Facturas.
- Asistente de Pedidos de solo lectura y totales de asistentes separados por moneda.

### Versión 2.4/2.3/2.2 — 30 de agosto de 2026

- Diagrama completo del circuito de ventas y regla de mantenimiento conjunto de texto e imagen.
- Parámetros independientes para recordatorio y cancelación por vencimiento de presupuestos.
- Factura manual, edición del borrador, validación fiscal, emisión sin bloqueo y recordatorio configurable con prueba sin envío.

### Versión 2.1 — 30 de agosto de 2026

- Introducción al sistema, destinatarios, alcance y límites.
- Facturación desde pedido, facturas manuales y reservas sin duplicados.
- Cobros parciales y totales, justificantes, reversiones y respuestas inciertas.

### Versión 1.x — 27 a 29 de agosto de 2026

- Creación inicial del manual y documentación progresiva de acceso, panel de control, entidades, artículos, presupuestos, pedidos, albaranes, facturas, proformas y configuración.
- Numeración fiscal anual, emisión irreversible, cola VeriFactu, estados normalizados y corrección de seguimientos separados.
