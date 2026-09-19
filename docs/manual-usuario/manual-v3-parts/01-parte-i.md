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