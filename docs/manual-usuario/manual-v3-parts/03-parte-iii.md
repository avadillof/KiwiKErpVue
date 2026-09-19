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