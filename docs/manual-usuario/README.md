# Manual de usuario de KiwiK ERP

**Versión:** 2.1  
**Última actualización:** 30 de agosto de 2026

Este manual explica el funcionamiento de KiwiK ERP desde el punto de vista del usuario. Se actualizará conforme se incorporen nuevas funciones o cambien los procesos existentes.

## Introducción: qué es KiwiK ERP

KiwiK ERP es un sistema de gestión empresarial que reúne en un mismo entorno la información de clientes, artículos y operaciones comerciales. ERP significa planificación de recursos empresariales. En KiwiK, el trabajo disponible se centra en seguir una venta desde la propuesta inicial hasta la entrega, la factura y su cobro.

Su finalidad es evitar volver a introducir los mismos datos en cada documento y permitir consultar el origen de una operación. Un pedido puede proceder de un presupuesto; sus entregas se registran en albaranes; las facturas conservan las referencias correspondientes y los cobros se consultan en su historial.

### A quién va dirigido

- **Administración y ventas:** mantener clientes, preparar propuestas, confirmar pedidos y revisar la facturación.
- **Personal que gestiona entregas:** preparar albaranes, confirmar salidas y conservar justificantes de recogida.
- **Personal que registra cobros:** anotar pagos recibidos, consultar saldos y corregir movimientos mediante reversión.
- **Administradores:** configurar empresa, usuarios, datos maestros y parámetros de ventas. Estos perfiles describen tareas de trabajo; no equivalen a una matriz de permisos independiente para cada acción.

### Qué incluye y cuáles son sus límites

El manual describe las funciones implementadas en el proyecto a 30 de agosto de 2026. La instalación debe tener frontend, backend y actualizaciones de base de datos compatibles para utilizarlas. Compras e Informes siguen identificados como áreas en preparación; no debe interpretarse su tarjeta como una función disponible.

El circuito fiscal descrito está configurado para **PRUEBAS**. Esta guía explica botones y resultados de la aplicación; no acredita una puesta en producción ni sustituye la revisión de los requisitos de la empresa. Las rectificativas, remesas, conciliación y gestión de impagados no forman parte del flujo básico actualmente documentado.

### Cómo leer este manual

Empiece por acceso, clientes y artículos si es la primera vez que utiliza el sistema. Para una operación diaria, vaya directamente al apartado del documento que está gestionando. Antes de confirmar una entrega o emitir una factura, revise su efecto: **guardar un borrador no equivale a confirmar, emitir ni cobrar**. Las capturas son referencias visuales y pueden mostrar otra marca o configuración de empresa.

## Índice

Guía específica: [Requerimientos y documentación AEAT](requerimientos-aeat.md).

Guía específica: [Facturación desde pedido y cierre por línea](facturacion-desde-pedido.md).

Guía específica: [Crear una factura manual](factura-manual.md).

- [Introducción al sistema](#introducción-qué-es-kiwik-erp)

1. [Acceso al sistema](#1-acceso-al-sistema)
2. [Panel de control](#2-panel-de-control)
3. [Área comercial](#3-área-comercial)
4. [Entidades](#4-entidades)
5. [Artículos](#5-artículos)
6. [Presupuestos](#6-presupuestos)
7. [Pedidos de venta](#7-pedidos-de-venta)
8. [Albaranes y entregas](#8-albaranes-y-entregas)
9. [Facturas de venta](#9-facturas-de-venta)
10. [Facturas proforma](#10-facturas-proforma)
11. [Configuración del sistema](#11-configuración-del-sistema)
12. [Glosario de estados](#12-glosario-de-estados)

---

## 1. Acceso al sistema

La pantalla de acceso identifica visualmente la empresa y muestra el logotipo del cliente cuando está configurado.

### 1.1 Iniciar sesión

![Pantalla de inicio de sesión de KiwiK ERP](imagenes/iniciar-sesion.png)

Para acceder a KiwiK ERP:

1. Introduzca su nombre de usuario en el campo **Usuario**.
2. Escriba su clave de acceso en el campo **Contraseña**. Puede pulsar el icono con forma de ojo para mostrar u ocultar temporalmente la contraseña.
3. Pulse **Acceder a KiwiKERP**.
4. Una vez validadas las credenciales, el sistema abrirá el panel de control.

Si el sistema rechaza el acceso, compruebe que el usuario y la contraseña sean correctos y que no esté activado el bloqueo de mayúsculas. Los mensajes distinguen entre campos obligatorios, credenciales incorrectas y problemas de conexión.

Antes de introducir sus credenciales, compruebe que utiliza la dirección de acceso facilitada por su administrador y una conexión HTTPS válida. No comparta su contraseña ni la deje anotada en un lugar accesible a otras personas.

En la parte inferior se muestra el enlace del desarrollador, **FreeLandSite**.

### 1.2 Recuperar las credenciales

Si no recuerda su contraseña:

1. Pulse **¿La has olvidado?** junto al campo Contraseña.
2. Introduzca la dirección de correo asociada a su usuario.
3. Pulse **Enviar instrucciones**.
4. Cuando aparezca la confirmación, revise la bandeja de entrada de esa cuenta.
5. Abra el mensaje **Acceso a KiwiKERP** y utilice la contraseña indicada para iniciar sesión.

El correo se envía únicamente cuando la dirección pertenece a un usuario registrado y tiene un email configurado. Si la aplicación no puede procesar la solicitud, compruebe que la dirección esté escrita correctamente o contacte con el administrador del sistema.

Si el mensaje no aparece, revise las carpetas de correo no deseado, promociones o cuarentena. El tiempo de recepción también puede depender del servidor de correo de la empresa.

Por seguridad:

- No reenvíe el mensaje de recuperación ni comparta su contenido.
- Cambie la contraseña desde la configuración del usuario después de recuperar el acceso.
- Si no solicitó ese correo, comuníquelo al administrador.
- Cierre la sesión cuando utilice un equipo compartido.

### 1.3 Problemas frecuentes de acceso

- **Usuario o contraseña inválidos:** revise mayúsculas, minúsculas y espacios introducidos accidentalmente.
- **Usuario desactivado:** solicite al administrador que compruebe el estado de su cuenta.
- **Correo no reconocido:** confirme que utiliza la misma dirección guardada en su ficha de usuario.
- **Error de conexión:** compruebe la red y que el servidor KiwiK ERP esté disponible antes de reintentarlo.
- **Sesión en un equipo compartido:** cierre siempre la sesión desde la cabecera de la aplicación al finalizar.

## 2. Panel de control

El **Espacio de trabajo** es el punto de entrada después de iniciar sesión. Su encabezado muestra **Panel de control** y permite acceder a las áreas de KiwiK ERP para continuar con la gestión diaria.

### 2.1 Cabecera principal

La cabecera permanece disponible mientras se navega por la aplicación y contiene:

- Logotipo de KiwiK ERP, identificación del sistema y fecha actual.
- **Manual:** abre esta guía dentro del portal.
- **Notificaciones:** el icono de campana muestra un contador cuando existen mensajes nuevos.
- **Salir:** cierra la sesión y regresa a la pantalla de acceso.
- Nombre y fotografía del usuario conectado. Si no existe fotografía se muestran sus iniciales.

Al pulsar sobre el avatar se abre la ficha del usuario para consultar su perfil. Las opciones disponibles dependerán de sus permisos.

### 2.2 Tarjetas de módulos

La sección **¿Por dónde quieres empezar?** presenta una tarjeta por cada módulo visible. Cada tarjeta contiene su nombre, descripción, funciones principales y estado:

- **Disponible / Abrir módulo:** permite acceder haciendo clic en la tarjeta o pulsando Intro cuando tiene el foco.
- **Próximamente / En preparación:** identifica áreas todavía no habilitadas y no permite acceder a ellas.

El contador situado junto al título muestra cuántos módulos puede ver el usuario. La visibilidad depende de los permisos asignados:

- **Ventas:** disponible para administradores y usuarios con acceso al módulo de ventas. Incluye Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas, incluidas facturas manuales y cobros.
- **Configuración:** visible solamente para administradores. Permite gestionar empresa, usuarios, seguridad y datos maestros.
- **Compras** e **Informes:** aparecen como módulos en preparación mientras no estén habilitados.

Por esta razón, dos usuarios pueden ver un número diferente de tarjetas sin que exista un error de funcionamiento.

### 2.3 Navegación diaria

Para entrar en un área disponible, pulse cualquier punto de su tarjeta o la acción **Abrir módulo**. Dentro de los listados, los botones **Inicio** y **Ventas** permiten volver al Panel de control o al área comercial sin utilizar el botón Atrás del navegador.

El acceso **Indicadores comerciales** abre Ventas. Los widgets están disponibles en Entidades, Artículos, Presupuestos, Pedidos, Albaranes y Facturas; consulte el periodo seleccionado en cada panel.

### 2.4 Pie corporativo

El pie fijo muestra la empresa activa, su CIF, el eslogan configurado y la versión de KiwiK ERP. Esta información ayuda a confirmar que se está trabajando en la empresa y entorno correctos.

La interfaz utiliza el color corporativo de KiwiK ERP y adapta el espacio disponible a la resolución de la pantalla.

### 2.5 Encontrar un documento y trabajar con seguridad

1. Entre en **Ventas** y seleccione el módulo del documento que necesita.
2. Utilice la búsqueda y los filtros disponibles para localizarlo. Si no aparece, quite primero los filtros de estado y fechas: puede estar fuera del intervalo seleccionado.
3. Revise código, cliente y estado antes de abrir las acciones de la fila. Las acciones dependen del estado del documento.
4. Después de guardar, compruebe el resultado en el listado o vuelva a abrir el detalle. Un aviso de conexión no significa necesariamente que el servidor no haya guardado.
5. Si la pantalla ofrece una acción de reintento de la misma operación, utilícela antes de comenzar otra. Así evita crear duplicados.

Los filtros de filas y el año de los indicadores no siempre representan la misma selección. En Facturas, los filtros del listado no modifican los widgets anuales. Antes de comparar importes, revise qué periodo y conjunto de documentos resume cada panel.

## 3. Área comercial

El Área comercial agrupa el circuito de ventas:

**Presupuesto → Pedido de venta → Albarán → Facturación**

Cada documento conserva su trazabilidad. Esto permite conocer qué se ha solicitado, qué se ha entregado, qué se ha cancelado y qué queda pendiente de facturar.

## 4. Entidades

El módulo Entidades permite consultar y mantener los clientes, proveedores y demás terceros relacionados con la empresa.

El listado dispone de una altura adaptada a la pantalla para evitar que la tabla crezca indefinidamente. Desde la cabecera se accede a las acciones principales y a los filtros disponibles.

### 4.1 Condiciones comerciales del cliente

En la pestaña **Ventas** de la entidad pueden definirse las **Condiciones particulares de venta del cliente**. Este texto recoge acuerdos específicos que no forman parte de las condiciones generales de la empresa.

Al seleccionar el cliente en un nuevo presupuesto, el sistema copia sus condiciones particulares al documento. La copia puede ajustarse mientras el documento sea borrador sin modificar la ficha del cliente. Los cambios posteriores realizados en la entidad tampoco alteran documentos antiguos.

Este campo es independiente de la **Condición de cobro** y de los días fijos de pago. La condición de cobro continúa utilizándose para calcular el vencimiento; las condiciones particulares son texto comercial e informativo.

### 4.2 Preparar la ficha antes de vender

1. Localice la entidad en **Ventas → Entidades** y abra su ficha para evitar crear un cliente duplicado.
2. Revise identificación, datos fiscales y dirección. Estos datos se utilizan en los documentos posteriores.
3. Compruebe los contactos y su correo cuando vaya a enviar presupuestos o albaranes.
4. En los atributos de venta, revise tarifa, posición fiscal, condición de cobro y días de pago. La tarifa es obligatoria para la nueva factura manual.
5. Escriba los acuerdos particulares en las condiciones de venta y guarde la ficha.

Las condiciones particulares son texto comercial; no sustituyen la condición de cobro. Los documentos conservan una copia de las condiciones: cambiar después la ficha del cliente no actualiza automáticamente las operaciones anteriores. Revise el contenido del borrador si debe aplicar un acuerdo nuevo.

## 5. Artículos

El módulo Artículos contiene el catálogo de productos y servicios utilizados en los documentos comerciales.

La información del artículo determina, entre otros datos, su descripción, precio, impuesto, unidad de medida y el recorrido que seguirá dentro de un pedido de venta.

### 5.1 Tipo logístico

El **tipo logístico** describe la naturaleza operativa del artículo y cómo se gestiona internamente:

- **Consumible:** producto físico cuyo stock no se controla de forma estricta. Puede venderse y entregarse mediante albarán, pero el sistema no lo trata como existencias gestionadas en almacén.
- **Almacenable:** producto físico cuyas existencias se gestionan en almacén. Su salida habitual se registra mediante un albarán.
- **Servicio:** trabajo, cuota, transporte u otro concepto no almacenable. Normalmente no necesita una salida física de mercancía.

Al seleccionar el tipo logístico, el campo **Tipo comercial** solo muestra las opciones compatibles con él.

### 5.2 Tipo comercial

El **tipo comercial** concreta cómo se vende el artículo dentro de su tipo logístico. Además de clasificarlo, proporciona los valores predeterminados de su **Flujo de venta**.

La configuración inicial contempla los siguientes comportamientos:

| Tipo logístico | Tipo comercial | Requiere albarán | Política de facturación |
|---|---|---|---|
| Consumible | Producto | Sí | Por cantidades entregadas |
| Almacenable | Producto | Sí | Por cantidades entregadas |
| Servicio | Transporte | No | Por cantidades pedidas |
| Servicio | Servicio | No | Por cantidades pedidas |

Estos son valores predeterminados. La configuración de los tipos comerciales puede evolucionar y un artículo concreto puede personalizar su comportamiento cuando exista una excepción justificada.

### 5.3 Flujo de venta

El panel **Flujo de venta** determina si la línea debe pasar por un albarán y en qué momento queda disponible para facturar.

Si no se activa **Personalizar para este producto**, el artículo hereda automáticamente la configuración de su tipo comercial. El formulario muestra el comportamiento heredado para que pueda revisarse antes de guardar.

Al activar **Personalizar para este producto**, pueden definirse estas opciones:

- **Requiere albarán:** la línea representa una entrega que debe registrarse antes mediante uno o varios albaranes.
- **Política de facturación:** establece si se factura lo pedido o únicamente lo que ya se ha entregado.

Conviene utilizar la personalización solo para excepciones. Mantener la regla en el tipo comercial facilita que todos los artículos equivalentes tengan el mismo comportamiento.

### 5.4 Políticas de facturación

#### Por cantidades pedidas

La cantidad facturable se basa en lo solicitado en el pedido, descontando las cantidades canceladas. Es el comportamiento habitual de servicios y transportes que no requieren albarán.

El recorrido normal es:

**Presupuesto → Pedido confirmado → Facturación**

Estas líneas aparecen en el pedido como **Facturación directa**. Su avance se controla mediante la cantidad facturada y no mediante la cantidad entregada.

#### Por cantidades entregadas

Solo pueden facturarse las unidades que previamente se hayan entregado. Es el comportamiento habitual de productos físicos.

El recorrido normal es:

**Presupuesto → Pedido confirmado → Albarán → Facturación**

Si se realiza una entrega parcial, únicamente esa parte queda disponible para facturar. El resto permanece pendiente para futuros albaranes, salvo que el usuario cancele las cantidades restantes.

### 5.5 Relación entre albarán y política de facturación

| Requiere albarán | Política | Resultado en el pedido |
|---|---|---|
| No | Por cantidades pedidas | La línea pasa directamente a facturación. |
| Sí | Por cantidades pedidas | Existe control de entrega, pero la facturación se basa en la cantidad pedida. |
| Sí | Por cantidades entregadas | La línea debe entregarse y solo se factura lo realmente entregado. |

Cuando se desactiva **Requiere albarán**, el sistema establece automáticamente la política **Por cantidades pedidas**, ya que una línea sin entrega no puede depender de cantidades entregadas.

### 5.6 Ejemplo de pedido mixto

Un mismo pedido puede contener productos con recorridos distintos:

| Línea | Configuración | Funcionamiento |
|---|---|---|
| 10 unidades de un producto almacenable | Requiere albarán · Facturación por entregado | Si se entregan 6, se pueden facturar 6 y quedan 4 pendientes de entrega. |
| 2 horas de servicio | Sin albarán · Facturación por pedido | Las 2 horas pasan directamente al circuito de facturación. |

El pedido permanecerá **Parcialmente completado** mientras tenga alguna entrega o facturación ejecutada y queden cantidades por resolver. Estará **Entregado** cuando no quede mercancía física pendiente, aunque todavía falte facturar. Finalmente pasará a **Completado** cuando todo lo servido esté entregado y facturado, teniendo también en cuenta cualquier cantidad cancelada.

La configuración del flujo se copia a las líneas comerciales para conservar la trazabilidad del pedido. De este modo, modificar posteriormente la ficha del artículo no debe alterar el criterio con el que se creó una operación anterior.

### 5.7 Comprobación antes de utilizar un artículo

El artículo proporciona descripción, precio, impuesto y unidad de medida. Su configuración también decide si necesita entrega física y desde dónde se factura. Revísela antes de utilizarlo en una venta.

### Configurar el recorrido del artículo

1. Abra el artículo desde **Ventas → Artículos** y revise sus datos comerciales.
2. Seleccione el tipo logístico: **Almacenable**, **Consumible** o **Servicio**. Un consumible puede requerir albarán aunque no tenga control estricto de existencias.
3. Revise el tipo comercial compatible. Su configuración propone el flujo de venta.
4. En **Flujo de venta**, mantenga la herencia del tipo comercial salvo que exista una excepción. Active **Personalizar para este producto** únicamente para definir una regla propia.
5. Compruebe **Requiere albarán** y la política de facturación. Si no requiere albarán, la facturación se basa en cantidades pedidas.

| Configuración de la línea | Dónde se factura | Qué queda por completar |
| --- | --- | --- |
| Sin albarán, cantidades pedidas | Desde el pedido confirmado | Facturar la cantidad no cancelada |
| Con albarán, cantidades pedidas | Desde el pedido confirmado | Entregar y facturar; son controles separados |
| Con albarán, cantidades entregadas | Desde el albarán confirmado | Entregar y después facturar lo disponible |

Cambiar un artículo no debe reinterpretar una operación anterior: cada línea conserva su política. En un pedido mixto, consulte el comportamiento de cada línea antes de decidir desde dónde facturar.

## 6. Presupuestos

### 6.1 Crear o editar un presupuesto

En el formulario se indican los datos generales —fecha, cliente, tarifa y validez— y las líneas de productos o servicios.

La **fecha de validez** indica hasta cuándo se mantiene vigente la propuesta. Un presupuesto puede cancelarse manualmente o quedar fuera de vigencia cuando vence sin respuesta del cliente.

### 6.2 Estados del presupuesto

- **Pendiente de enviar:** todavía está en preparación.
- **Enviado:** se ha remitido al cliente.
- **Aprobado:** el cliente ha aceptado la propuesta.
- **Cancelado:** la propuesta ya no continúa en el circuito comercial.

Los presupuestos en borrador se identifican visualmente mediante el mismo estilo utilizado en los pedidos.

### 6.3 Acciones disponibles

Según su estado, un presupuesto puede:

- Abrirse y editarse.
- Visualizarse o imprimirse en PDF.
- Regenerar su PDF.
- Enviarse o reenviarse por correo electrónico.
- Aceptarse.
- Cancelarse.
- Reabrirse si estaba cancelado.
- Asociar notas y documentos.

Al aceptar un presupuesto, este queda aprobado y se crea un **pedido de venta en borrador**.

### 6.4 Preparar, enviar y aceptar una propuesta

1. Cree un presupuesto y seleccione el cliente. Compruebe la tarifa y las condiciones que se proponen.
2. Revise fecha y validez: la validez indica hasta cuándo mantiene su oferta, no una fecha prevista de entrega.
3. Añada los artículos o servicios, ajuste cantidades y revise precios, descuentos, impuestos y total.
4. Compruebe las condiciones generales y particulares. Guarde y revise el PDF antes de remitirlo al cliente.
5. Utilice la acción de envío cuando proceda y compruebe el estado del documento. Enviar una oferta no equivale a que el cliente la haya aceptado.
6. Cuando exista aceptación, utilice la acción de aceptar: el presupuesto queda aprobado y se genera un **pedido en borrador**. Abra ese pedido para revisar fecha prevista y cantidades antes de confirmarlo.

Si la propuesta no continúa, utilice la cancelación disponible según su estado. No cree una segunda operación sin comprobar antes si el presupuesto ya generó un pedido. Las notas y documentos adjuntos permiten conservar el contexto de la negociación.

## 7. Pedidos de venta

### 7.1 Fecha prevista de entrega

El pedido dispone de una **fecha prevista de entrega**. Esta fecha es informativa y sirve para planificar el compromiso adquirido con el cliente; no funciona como la fecha de caducidad de un presupuesto.

En la base de datos se almacena en el campo `SALES_ORDERS_DT_VALIDITY`. En la factura proforma se presenta como **Fecha prevista de entrega**.

### 7.2 Confirmación y modificación

Un pedido nuevo se crea en borrador. Al seleccionar **Confirmar pedido**, pasa a estar **En curso**.

La confirmación no cierra definitivamente el pedido. Mientras no esté bloqueado, puede modificarse de forma controlada para atender cambios solicitados por el cliente. El sistema protege las cantidades que ya hayan sido entregadas, facturadas o canceladas.

### 7.3 Seguimiento de cantidades

Cada línea muestra:

- **Cantidad:** unidades solicitadas.
- **Entregada:** unidades contabilizadas al confirmar albaranes; los borradores solo reservan cantidades.
- **Facturada:** unidades ya facturadas.
- **Cancelada:** unidades que finalmente no se servirán.
- **Pendiente:** unidades que aún deben resolverse.

El listado separa el **Estado** del pedido de su información de **Seguimiento**, para que el usuario pueda distinguir la situación general del detalle operativo.

### 7.4 Estados del pedido

- **Borrador:** pedido en preparación y todavía no confirmado.
- **En curso:** pedido confirmado sin entregas, facturas o cancelaciones ejecutadas.
- **Parcialmente completado:** existe alguna entrega, factura o cancelación, pero todavía queda trabajo pendiente.
- **Entregado:** ya no queda cantidad física por entregar, pero falta facturar alguna cantidad servida.
- **Completado:** todas las cantidades servidas están entregadas y facturadas; las cantidades canceladas también se consideran resueltas.
- **Cancelado:** todas las cantidades del pedido han sido canceladas.

Los filtros del listado utilizan estos mismos estados.

El filtro adicional **Pendiente de** permite localizar directamente:

- **Generar albarán:** pedidos con productos físicos todavía pendientes de entrega.
- **Facturación:** pedidos con cantidades entregadas que aún no han sido facturadas.

Este filtro puede combinarse con el estado, el intervalo de fechas y la búsqueda general.

El filtro **Plazo entrega** ayuda a planificar la preparación de albaranes y solo incluye pedidos confirmados que todavía tienen productos físicos pendientes. Los pedidos en **Borrador** no se tienen en cuenta, porque aún no representan un compromiso logístico. Permite consultar los pedidos **Vencidos**, los que **Vencen hoy**, los de los **Próximos 7 días**, los de los **Próximos 30 días** y los que están **Sin fecha prevista**. En la columna de entrega prevista, el rojo identifica retrasos, el ámbar fechas de los próximos siete días y el verde fechas posteriores.

### 7.5 Planificación de entregas y avisos

Cada mañana, a las **08:15**, el sistema envía a cada responsable un único correo con sus pedidos vencidos o próximos a vencer durante los siguientes siete días. Se considera responsable al usuario creador del pedido.

El aviso muestra:

- Código del pedido y cliente.
- Fecha prevista de entrega.
- Días de retraso o días restantes.
- Cantidad total que todavía está pendiente de entregar.

No se incluyen pedidos ya entregados, completados o cancelados, ni pedidos sin cantidades físicas pendientes. Los pedidos sin fecha prevista pueden localizarse mediante el filtro del listado, pero no se incluyen en el correo porque no existe una fecha con la que calcular el aviso.

Para recibir el recordatorio, el responsable debe estar activo y tener una dirección de correo configurada. El correo es informativo: no genera automáticamente el albarán ni modifica el pedido.

### 7.6 Bloquear un pedido

La acción **Bloquear pedido** protege el documento frente a modificaciones accidentales. No representa un estado comercial nuevo ni significa que el pedido esté completado.

Si fuera necesario realizar un cambio autorizado, puede utilizarse **Desbloquear pedido**. El bloqueo es independiente del seguimiento de entregas y facturación.

### 7.7 Cancelar cantidades pendientes

Esta acción se utiliza cuando el cliente ya no desea recibir la parte que falta de una o varias líneas.

El sistema:

1. Conserva las cantidades ya entregadas o facturadas.
2. Cancela únicamente la parte que todavía puede cancelarse.
3. Mantiene la trazabilidad de la cantidad solicitada originalmente.
4. Recalcula automáticamente el estado del pedido.

La opción no aparece si el pedido está bloqueado o si ya no queda ninguna cantidad cancelable. Por tanto, tampoco aparece cuando todo se ha entregado.

#### Ejemplo

| Producto | Pedido | Entregado | Cancelado | Pendiente de entrega |
|---|---:|---:|---:|---:|
| Producto A | 10 | 10 | 0 | 0 |
| Producto B | 10 | 5 | 5 | 0 |

El pedido queda **Entregado**, porque no falta mercancía por servir. Cuando se facturen las 15 unidades realmente entregadas, pasará a **Completado**. No es necesario facturar las 5 unidades canceladas.

### 7.8 Guía de confirmación y seguimiento

1. Abra el pedido en borrador y revise cliente, fecha prevista, condiciones y líneas.
2. Confirme el pedido cuando deba comenzar su ejecución. Un borrador todavía no constituye un compromiso logístico confirmado.
3. Para las líneas físicas, prepare el albarán con las cantidades que realmente vayan a salir. Una entrega parcial deja el resto pendiente.
4. Para facturar, siga la política de cada línea: pedido para cantidades pedidas; albarán confirmado para cantidades entregadas.
5. Consulte el seguimiento antes de reducir o cancelar pendientes. Las cantidades ya entregadas, facturadas o comprometidas en borradores están protegidas.

**Entregada** significa cantidad de albaranes confirmados, no de albaranes en preparación. **Reservada** es cantidad comprometida por un borrador. **Facturada** refleja la emisión; no significa que se haya recibido el dinero. **Cancelada** indica unidades que ya no se servirán.

Un pedido puede estar entregado y pendiente de factura, o tener una línea facturada por pedido que todavía espera su entrega. El estado **Completado** depende de resolver las entregas y facturación que corresponden a todas sus líneas; no depende de registrar el cobro.

## 8. Albaranes y entregas

### 8.1 Generar un albarán

La opción **Generar albarán** está disponible para pedidos en curso o parcialmente completados que tengan productos físicos pendientes.

1. Abra el menú de acciones del pedido.
2. Seleccione **Generar albarán**.
3. Revise las cantidades pedidas, entregadas y pendientes.
4. Indique la cantidad que se entrega ahora en cada línea.
5. Pulse **Generar albarán**.

Puede realizarse una entrega parcial. La cantidad restante continuará pendiente para un albarán posterior.

También pueden añadirse pedidos compatibles del mismo cliente cuando comparten tarifa y condiciones de envío, generando un único albarán agrupado.

### 8.2 Validación de cantidades

No se puede entregar una cantidad superior a la pendiente.

Si el usuario introduce un valor superior:

- El campo se marca como incorrecto.
- Se muestra la cantidad máxima permitida.
- Al intentar continuar aparece un mensaje de error.
- No se envía la operación ni se genera ningún albarán.

El servidor vuelve a comprobar las cantidades antes de guardar para evitar duplicidades o inconsistencias si otro proceso hubiese modificado el pedido.

### 8.3 Formulario y estados del albarán

El formulario permite modificar la fecha y las cantidades mientras el albarán está en **Borrador**. Al guardar correctamente, el diálogo se cierra y el listado se actualiza.

Los estados disponibles son:

- **Borrador:** documento editable que todavía no contabiliza cantidades entregadas.
- **Confirmado:** la salida de mercancía queda consolidada y sus cantidades se incorporan al seguimiento del pedido.
- **Anulado:** revierte las cantidades entregadas y permite que vuelvan a incluirse en un albarán posterior.

Las cantidades se contabilizan al **confirmar**, no al crear o guardar el borrador.

### 8.4 Pedidos de origen

Cada albarán conserva la relación con los pedidos que lo originaron. El listado muestra sus códigos y, cuando el documento agrupa varios pedidos, ofrece un indicador para abrir una consulta con la información esencial de todos ellos.

### 8.5 Impresión

El usuario puede generar el albarán en dos formatos:

- **Valorado:** incluye precios e importes.
- **No valorado:** muestra las cantidades entregadas sin información económica.

En los albaranes confirmados se conserva una copia histórica del documento. Si ya existe, una nueva impresión recupera esa versión para evitar que posteriores cambios de productos o precios alteren el albarán emitido. Los borradores pueden regenerarse y los albaranes anulados no pueden imprimirse.

### 8.6 Albaranes manuales sin pedido

Desde el listado puede utilizarse **Nuevo albarán manual** para documentar una entrega que no procede de un pedido de venta.

1. Seleccione el cliente y la fecha.
2. Indique obligatoriamente el motivo de la operación.
3. Añada los productos, cantidades, precios e impuestos.
4. Guarde el documento como borrador y revíselo antes de confirmar.

El listado identifica estos documentos como **Manual** en la columna Pedidos origen. Al no existir un pedido asociado, no se valida una cantidad pendiente ni se modifica el seguimiento de ningún pedido. La salida se hace efectiva al confirmar el albarán y puede anularse posteriormente, manteniendo el motivo y la auditoría del documento.

El filtro **Facturación** del listado permite mostrar todos los albaranes, únicamente los ya facturados o los confirmados que todavía están pendientes de facturar. Puede combinarse con el filtro de Estado y la búsqueda general.

### 8.7 Envío por correo al cliente

Los albaranes **Confirmados** pueden enviarse por correo desde el menú de acciones o desde el propio formulario. El sistema muestra los contactos activos del cliente que tienen una dirección de correo válida y selecciona inicialmente el contacto principal.

Antes de enviar puede elegirse entre:

- **Albarán no valorado:** muestra productos y cantidades sin precios.
- **Albarán valorado:** incorpora precios e importes.

El mensaje utiliza la plantilla e imagen corporativa y adjunta el PDF histórico del albarán. Si el documento ya había sido generado, se reutiliza la misma copia para conservar su integridad. La fecha de envío solo se registra cuando el servidor de correo confirma que el mensaje ha salido correctamente.

La columna **Enviado el** del listado muestra la fecha y hora del último envío con el formato `dd/MM/yyyy HH:mm:ss`. Si el albarán nunca se ha enviado, muestra `-`. La columna puede ordenarse para localizar fácilmente los envíos más recientes o los documentos todavía no comunicados.

Los borradores y los albaranes anulados no pueden enviarse.

### 8.8 Recogida por el transportista

1. Prepare el albarán y confirme la salida cuando el transportista retire la mercancía.
2. En el documento **Confirmado**, seleccione **Registrar recogida del transportista**.
3. Indique fecha y hora de recogida y el nombre de la persona o empresa transportista.
4. Incorpore el justificante firmado, fotografiado o escaneado desde **Fotografías y justificantes** si dispone de él.

Registrar la recogida no vuelve a contabilizar cantidades y no acredita por sí solo la entrega final al cliente. Una prueba posterior de entrega puede archivarse en el mismo gestor documental. No se exige dibujar una firma en pantalla para registrar la recogida.

### 8.9 Fotografías y justificantes

La acción **Fotografías y justificantes** está disponible desde el menú del listado y desde el formulario del albarán. Permite conservar documentación complementaria como:

- Fotografías de la mercancía entregada o de su estado.
- Justificantes de transporte o recepción.
- Documentos PDF y documentos de texto relacionados con la entrega.

Se admiten archivos PDF, JPG, JPEG, PNG, WEBP, DOC y DOCX, con un tamaño máximo de **15 MB por archivo**. El diálogo permite añadir varios documentos, previsualizar imágenes y PDF, descargarlos o eliminarlos.

Los archivos se almacenan en GestDoc y permanecen vinculados exclusivamente al albarán. No se mezclan con la firma del receptor ni con las copias históricas de impresión. El indicador de clip situado junto al código muestra cuántos justificantes tiene el documento. Los justificantes continúan disponibles aunque posteriormente el albarán sea anulado, preservando la trazabilidad.

### 8.10 Resumen logístico

Debajo del listado se encuentra el panel plegable **Resumen logístico de albaranes**. El selector de año permite consultar los cinco ejercicios más recientes y los indicadores se actualizan al confirmar, anular, enviar, facturar o registrar una recepción.

Los indicadores principales muestran albaranes generados, borradores pendientes, pendientes de facturar, entregas sin recepción, pendientes de enviar y anulados. Los gráficos comparan la evolución mensual de documentos generados y confirmados y presentan su distribución operativa.

La franja de calidad logística incluye:

- Porcentaje de entregas realizadas en plazo.
- Retraso medio de las entregas comparables.
- Porcentaje de albaranes confirmados con recepción registrada.
- Porcentaje enviado al cliente.
- Número de albaranes manuales.
- Cantidad total entregada.

Para calcular la puntualidad se compara la fecha prevista del pedido con la fecha real de entrega. Cuando un albarán agrupa varios pedidos se utiliza la fecha prevista más próxima. Los albaranes manuales no participan en este cálculo porque no tienen un compromiso previo de pedido.

El panel termina con el ranking de los cinco clientes con mayor importe entregado y las cinco entregas con mayor retraso.

### 8.11 Comprobar la salida y sus documentos

Antes de confirmar, contraste cantidades y destinatario con la mercancía preparada. Un borrador reserva cantidades, pero todavía no incrementa la entrega. Tras confirmar, compruebe el seguimiento del pedido y conserve la copia del albarán que acompaña a la salida.

El documento **valorado** muestra importes; el **no valorado** permite acompañar la mercancía sin mostrar precios. El correo de envío del albarán y la recogida son hechos distintos: enviar un PDF no registra una salida ni acredita que el cliente haya recibido la mercancía.

Registre la recogida cuando el transportista retire la mercancía, con fecha, hora y transportista. Añada el justificante en **Fotografías y justificantes**. Si posteriormente recibe una prueba de entrega al cliente, puede archivarla también, distinguiéndola de la recogida.

Si no puede generar otra entrega, revise las cantidades pendientes y los borradores existentes antes de crear un albarán manual. Un albarán manual sirve para una entrega sin pedido, no para superar cantidades comprometidas de un pedido.

## 9. Facturas de venta

### 9.1 Creación desde albaranes

Un albarán confirmado puede incorporarse a una factura cuando contiene cantidades pendientes de facturar. También pueden agruparse albaranes compatibles del mismo cliente y tarifa.

La factura se crea en **Borrador** y sus líneas mantienen el vínculo con cada línea de albarán. El albarán no se considera completamente facturado por el mero hecho de estar relacionado con una factura: el sistema compara las cantidades entregadas con la suma de las cantidades incluidas en facturas no canceladas.

### 9.2 Facturación parcial

En una factura borrador puede reducirse la cantidad procedente de un albarán, pero nunca superar la cantidad entregada que todavía esté disponible. La diferencia permanece pendiente y puede incluirse posteriormente en otra factura.

#### Ejemplo: entrega de 10 unidades facturada en dos partes

| Seguimiento | Primera factura | Segunda factura |
|---|---:|---:|
| Cantidad pedida | 10 | 10 |
| Cantidad entregada en el albarán | 10 | 10 |
| Cantidad incluida en la factura | 5 | 5 |
| Cantidad pendiente después de guardar | 5 | 0 |

Después de guardar la primera factura con 5 unidades, el albarán queda **Parcialmente facturado** y la acción pasa a ser **Facturar cantidad pendiente**. La siguiente factura se genera únicamente con las 5 unidades restantes. Si las 10 unidades están todavía en borradores, el estado es **En factura borrador**. Solo cuando esas cantidades están en facturas emitidas queda **Facturado**.

Las cantidades incluidas en facturas borrador también se consideran reservadas para evitar que dos borradores facturen simultáneamente las mismas unidades. Si una factura queda cancelada, sus cantidades dejan de computar y vuelven a estar disponibles.

### 9.3 Modificación del borrador

Mientras la factura continúe en borrador pueden modificarse cantidades, precios, descuentos, impuestos, condiciones y observaciones. Para las líneas procedentes de albaranes se aplican estas reglas:

- La línea de origen no puede eliminarse.
- La cantidad debe ser mayor que cero.
- No puede superar la cantidad entregada pendiente, teniendo en cuenta otras facturas.
- Reducir la cantidad no modifica el pedido ni el albarán: solamente deja una parte pendiente de facturar.

Después de emitir la factura no debe alterarse directamente. Las correcciones posteriores deben realizarse mediante el documento rectificativo correspondiente.

La factura presenta por separado:

- **Condiciones generales:** proceden de los parámetros generales de ventas.
- **Condiciones particulares del cliente:** se copiaron desde la ficha del cliente al iniciar el circuito comercial.
- **Condición de cobro y vencimiento:** datos estructurados utilizados para calcular cuándo debe pagarse.

Ambos textos pueden adaptarse en el borrador y quedan guardados como una copia histórica de la factura.

### 9.4 Trazabilidad del albarán

El listado de albaranes muestra la factura relacionada. Si un albarán participa en varias facturas, se presenta la primera y un indicador con las adicionales. El estado de facturación puede ser:

- **Pendiente:** todavía no se ha incluido ninguna cantidad en factura.
- **Parcialmente facturado:** existe cantidad facturada o reservada, pero aún queda una parte disponible.
- **En factura borrador:** toda la cantidad está incluida en una o varias facturas que todavía son borrador.
- **Facturado:** toda la cantidad entregada está incluida en facturas emitidas.

### 9.5 Fecha de factura y vencimiento

La fecha de vencimiento se calcula desde la fecha de factura utilizando la condición de cobro y los días de pago configurados en la ficha del cliente. Puede establecerse manualmente una fecha distinta en el borrador, indicando obligatoriamente el motivo para conservar la auditoría.

### 9.6 Emisión de la factura definitiva

La acción **Emitir factura** realiza una última validación y convierte el borrador en una factura definitiva. En ese momento el sistema:

1. Comprueba cliente, fecha, vencimiento, líneas, cantidades, precios, descuentos, impuestos y totales.
2. Verifica de nuevo que ninguna cantidad procedente de albarán supere la cantidad disponible.
3. Reserva de forma transaccional el siguiente número fiscal del ejercicio con la serie configurada; por ejemplo, `FC-KW-2026/0001` cuando el prefijo es `KW`.
4. Cambia el estado a **Confirmada** y bloquea la edición económica del documento.

La emisión es una operación irreversible dentro del circuito ordinario. El número del borrador no es un número fiscal y se sustituye al emitir. Una factura emitida no debe volver a borrador ni modificarse directamente; si se detecta un error, deberá crearse la correspondiente **factura rectificativa**, conservando el vínculo y la trazabilidad con la factura original.

La emisión definitiva no equivale al cobro ni a la aceptación por VeriFactu. El envío se inicia automáticamente, pero mantiene un estado independiente para distinguir claramente factura emitida, pendiente de envío, aceptada fiscalmente, pendiente de cobro y cobrada.

### 9.7 Envío automático a VeriFactu

Al emitir se solicita la contraseña del certificado VeriFactu asignado al usuario. Tras comprobar el certificado, el sistema genera el PDF definitivo con la plantilla corporativa del circuito de ventas, lo archiva en el repositorio documental de la factura, construye la representación Facturae utilizada por la integración y crea un único registro de cola por factura. La cola no duplica el PDF: lo recupera del repositorio cuando debe enviarlo. La credencial se almacena cifrada mientras el trabajo esté encolado.

El envío se realiza en segundo plano. El listado distingue **Pendiente de envío**, **Aceptada**, **Aceptada con errores**, **Requiere corrección** y **Error técnico**. Los reintentos dependen de los parámetros de VeriFactu. **Reintentar envío VeriFactu** reutiliza el registro y conserva número fiscal y documentos; no crea otra factura.

Una factura numerada nunca vuelve a borrador. Mientras esté **Pendiente de envío**, **Aceptada con errores**, **Requiere corrección** o **Error técnico**, permanece bloqueada y no puede enviarse al cliente. Únicamente **Aceptada** habilita ese envío.

Los fallos técnicos se reintentan conservando exactamente el mismo registro y con una espera predeterminada de 10 minutos. Un rechazo de datos detiene los reintentos y pasa a **Requiere corrección**. Después de corregir el dato maestro afectado —por ejemplo, el NIF del cliente—, la acción **Subsanar VeriFactu** exige motivo y certificado, conserva el PDF original, archiva una nueva versión corregida y genera un nuevo registro con el indicador de subsanación. Los importes o conceptos de una factura emitida no se modifican mediante esta acción; requieren el procedimiento de anulación o factura rectificativa que corresponda.

La opción **Ver / Imprimir factura** se habilita con VeriFactu en **Aceptada** y abre el PDF archivado. La respuesta de la AEAT es un registro independiente: no debe interpretarse como un PDF firmado devuelto por la AEAT.

### 9.8 Ajustes de Ventas y VeriFactu

**Ajustes de Ventas** se organiza en dos pestañas. **Parámetros generales** contiene las condiciones generales aplicables a los nuevos documentos y el cuerpo predeterminado del correo de presupuestos. **Parámetros VeriFactu** configura si VeriFactu está activo, el envío automático, los reintentos, la presentación del QR, los datos identificativos de KiwiKERP y el número de instalación. El entorno está limitado a **PRUEBAS** y el backend comprueba además que el destino sea el portal de preproducción de la AEAT.

En **Parámetros generales → Numeración de facturas** se define el prefijo de la serie. Con el valor `KW`, una factura emitida en 2026 se numera como `FC-KW-2026/0001`. La serie se aplica al emitir y queda incorporada al número fiscal, al PDF, a Facturae y al registro VeriFactu. Cambiarla no modifica facturas ya emitidas. En pruebas puede utilizarse una serie nueva para evitar colisiones con registros enviados anteriormente; no debe eliminarse ni renumerarse una factura definitiva en producción.

Si se desactiva el envío automático, las facturas emitidas permanecen en **Pendiente de envío** hasta reactivar el procesador. Las contraseñas y certificados no forman parte de estos ajustes y nunca se muestran en esta pantalla.

### 9.9 Cobros de la factura

Al abrir **Cobros de la factura**, se utiliza automáticamente el código del usuario conectado para identificar al autor de los cobros y reversiones, sin volver a pedir credenciales. El backend comprueba que el usuario existe y está habilitado; los permisos específicos de cobro quedan pendientes para una fase posterior. El diálogo muestra total, cobrado, pendiente e historial. Registre fecha, importe, medio de cobro, referencia y observaciones. Se admiten cobros totales o parciales en facturas emitidas no anuladas, con importe positivo de hasta dos decimales y fecha no futura. El importe no puede superar el saldo.

Ejemplo: factura de 1.000 €, cobro de 400 € → **Parcialmente cobrada**, pendiente 600 €. El filtro **Pendientes de cobro** incluye los parciales; **Parcialmente cobradas** permite consultarlos por separado.

Después de guardar, el clip del movimiento permite añadir justificantes opcionales. **Revertir cobro** exige un motivo y conserva importe, fecha y autor del movimiento original, además de autor y fecha de reversión. No se eliminan movimientos. Si la respuesta de guardado se pierde, pulse **Comprobar / reintentar**, que reutiliza la misma operación.

Las facturas antiguas marcadas como cobradas sin movimientos muestran **Saldo previo**, sin atribuirles fechas o medios inventados ni permitir revertir ese saldo desde el historial.

Los indicadores se calculan sobre las facturas del año seleccionado: **Importe cobrado** incluye parciales y saldos previos, y **Pendientes de cobro** suma sólo el saldo restante. No representan movimientos bancarios por fecha del cobro. El cobro no altera líneas, cantidades, número, PDF, pedidos, albaranes ni VeriFactu.

El flujo básico finaliza en el cobro. Siguen pendientes rectificativas/abonos, envío de facturas por correo, remesas, conciliación y gestión de impagados.

**Instalación:** antes de iniciar el backend actualizado, ejecutar `BackUpBBDD/sql/V13_20260830_invoice_payments.sql` en la base de datos correspondiente; después reiniciar Spring. La configuración actual no crea tablas automáticamente.

### 9.9.1 Procedimiento de cobros y correcciones

1. Localice la factura emitida y abra **Cobros de la factura**. Compruebe código, cliente, total y saldo pendiente.
2. Indique la fecha real del cobro, sin fecha futura, y el importe recibido, positivo y con un máximo de dos decimales. No puede superar el saldo pendiente.
3. Complete medio de cobro, referencia y observaciones según el movimiento que está registrando. El autor se obtiene del usuario conectado.
4. Guarde y compruebe que el movimiento aparece en el historial y que se ha reducido el pendiente.
5. Si tiene un justificante, adjúntelo desde el clip del movimiento ya guardado. No se exige adjunto para registrar el cobro.

Registrar un cobro deja constancia de un pago recibido; **no realiza una transferencia ni cobra dinero al cliente**. Por ejemplo, una factura de 1.000 € con pagos de 400 € y 600 € pasa de parcialmente cobrada a cobrada cuando su saldo llega a cero.

### Corregir un cobro o recuperar una respuesta

Si el movimiento es erróneo, seleccione **Revertir cobro** e indique el motivo. Compruebe después que aumenta el saldo pendiente. El movimiento original y su reversión permanecen en el historial; no se borra la evidencia. Si corresponde, registre a continuación el cobro correcto.

Ante una respuesta incierta, utilice **Comprobar / reintentar** y revise el historial antes de introducir otro pago. Un **Saldo previo** de una factura antigua no es un movimiento nuevo: no dispone de una fecha o medio reconstruidos y no puede revertirse desde este historial.

El cierre comercial del pedido, el resultado de VeriFactu y el cobro son seguimientos independientes. Cobrar o revertir no cambia el número fiscal, el PDF, las cantidades ni los documentos de origen.

### 9.10 Facturar desde pedido

1. Abra las acciones de un pedido **confirmado y desbloqueado** y seleccione **Facturar desde pedido**.
2. Revise las líneas que se ofrecen. Se incluyen las que no requieren albarán o se facturan por cantidades pedidas. Las de cantidades entregadas se facturan desde sus albaranes.
3. Compruebe las cantidades **Comprometidas**, que incluyen borradores y facturas emitidas no anuladas. Introduzca la cantidad a facturar sin superar el disponible; cero excluye la línea de este nuevo borrador.
4. Cree el borrador y revise en Facturas sus pedidos de origen, líneas, condiciones y vencimiento.
5. Guarde los ajustes y emita únicamente cuando haya verificado el documento completo. Se vuelve a comprobar el disponible al crear, editar y emitir.

Guardar reserva cantidades; emitir incrementa las facturadas. **Descartar borrador**, desde las acciones de Facturas, libera las reservas y conserva el documento anulado. Esta acción no sirve para anular una factura emitida. Si se pierde la respuesta de creación, reutilice la operación de reintento que presenta el formulario.

### Ejemplo de pedido mixto

Un pedido contiene 10 unidades por cantidades entregadas y 2 horas de servicio sin albarán. Si confirma una entrega de 6 unidades, podrá facturar esas 6 desde el albarán y las 2 horas desde el pedido. Las 4 unidades restantes siguen pendientes de entrega. Si otra línea física se factura por cantidades pedidas, su factura puede emitirse desde el pedido, pero seguirá pendiente su entrega hasta confirmar el albarán.

El albarán de una línea ya facturable desde pedido controla la entrega y no vuelve a ofrecerla para facturar. Así se evita facturar dos veces la misma cantidad.

### 9.11 Nueva factura manual

1. Entre en **Ventas → Facturas → Nueva factura manual**. Utilice esta opción únicamente si la venta no debe facturarse desde un pedido o albarán existente.
2. Seleccione un cliente activo con tarifa de venta configurada. Revise los datos propuestos antes de añadir líneas.
3. Indique fecha, referencia opcional y **motivo obligatorio**. El motivo explica por qué se crea una factura sin documentos de origen.
4. Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto del artículo no garantiza que se haya aplicado una tarifa negociada.
5. Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.
6. Guarde: se abre un **borrador Manual** en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.
7. Revise el vencimiento propuesto por la condición de cobro. Si necesita ajustarlo manualmente, indique el motivo desde el borrador. Después continúe con la emisión habitual.

La factura manual no registra entregas ni altera cantidades de pedidos o albaranes. Si la venta ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.

Si se pierde la respuesta al guardar, conserve el formulario y pulse **Reintentar misma operación**. Los campos quedan bloqueados para repetir exactamente la solicitud y recuperar la misma factura si ya se creó. No abra otra factura para resolver una respuesta incierta.

## 10. Facturas proforma

Desde un pedido confirmado puede generarse una factura proforma. La proforma refleja la **Fecha prevista de entrega** del pedido.

La opción **Ver proformas** solamente aparece cuando el pedido tiene al menos una proforma generada. Desde la ventana de consulta pueden revisarse sus datos y descargar el PDF correspondiente.

## 11. Configuración del sistema

El módulo Ajustes organiza la configuración en pestañas, incluyendo **Datos de empresa** y **Datos maestros**.

Dentro de Datos maestros se encuentran, entre otras opciones:

- Impuestos.
- Certificados digitales.
- Familias de productos.

Al regresar a Ajustes desde cualquiera de estas tres pantallas, el sistema vuelve a abrir directamente la pestaña **Datos maestros**.

### 11.1 Revisión inicial y proformas

Desde un pedido confirmado, genere la proforma cuando necesite presentar el contenido previsto de la operación. Si existen proformas, **Ver proformas** permite consultar y descargar sus PDF. Compruebe la **Fecha prevista de entrega** que se muestra.

La proforma no sustituye a la factura definitiva. Su generación no debe interpretarse como emisión fiscal, entrega de mercancía ni registro de cobro.

### Configuración antes de comenzar

1. Un administrador debe revisar los datos de empresa y usuarios en **Configuración / Ajustes**.
2. En **Datos maestros**, compruebe impuestos, familias de productos y certificados digitales. Al volver desde estas pantallas se mantiene la pestaña Datos maestros.
3. En **Ventas → Ajustes de Ventas → Parámetros generales**, revise condiciones de venta, correo de presupuestos y prefijo de numeración de facturas.
4. En **Parámetros VeriFactu**, revise activación, envío automático y reintentos. El entorno documentado permanece limitado a pruebas. Los certificados y contraseñas no se guardan en este formulario.
5. Si falta una opción recién incorporada o aparece un error de instalación, solicite al administrador que compruebe las versiones y actualizaciones de base de datos. No intente resolverlo duplicando documentos.

Un cambio de prefijo solo afecta a nuevas emisiones; no renumera documentos existentes. Las condiciones generales y las particulares del cliente se copian a los documentos para conservar el contenido utilizado en cada operación.

## 12. Glosario de estados

| Estado | Significado para el usuario |
|---|---|
| Borrador | Documento todavía en preparación. |
| En curso | Pedido confirmado que comienza su ejecución. |
| Parcialmente completado | Una parte ya se ha entregado, facturado o cancelado. |
| Entregado | No queda mercancía física pendiente; puede faltar facturación. |
| Completado | Todo lo servido está entregado y facturado. |
| Cancelado | No se servirá ninguna de las cantidades del pedido. |
| Bloqueado | Documento protegido frente a cambios; no es un estado comercial. |

### 12.1 Distinguir cada seguimiento

| Seguimiento | Pregunta que responde | Qué no significa |
| --- | --- | --- |
| Estado del pedido | ¿Queda entrega o facturación por resolver? | Completado no significa cobrado |
| Estado del albarán | ¿La salida está preparada, confirmada o anulada? | Borrador no equivale a entregado |
| Estado de la factura | ¿Es borrador o ya tiene emisión definitiva? | Emitida no equivale a aceptada en VeriFactu |
| Estado VeriFactu | ¿Qué resultado tiene el envío del registro? | Aceptada no equivale a cobrada |
| Situación de cobro | ¿Cuánto se ha recibido y cuánto falta? | Vencida no equivale a anulada |

Si hay un error de comunicación durante la emisión, consulte la factura y su cola antes de volver a actuar. No emita otra factura para sustituir una cuya respuesta sigue pendiente. Si necesita una corrección económica de una factura emitida, no la edite como borrador: consulte al responsable, ya que el circuito de rectificativas sigue pendiente.

---

## Historial del manual

### Versión 2.1 — 30 de agosto de 2026

- Introducción al sistema, destinatarios, alcance y límites de la versión.
- Pasos detallados para cada área de trabajo y ejemplos de pedidos mixtos.
- Facturación desde pedido, facturas manuales y reservas sin duplicados.
- Cobros parciales y totales, justificantes, reversiones y respuestas inciertas.
- Captura de acceso incorporada también al manual del portal, ampliable y adaptable.
- Corrección del seguimiento comercial: las cantidades se contabilizan al emitir, independientemente de la respuesta de VeriFactu.
- Índice ampliado y distinción entre estados comerciales, logísticos, fiscales y de cobro.

### Versión 1.11 — 29 de agosto de 2026

- Incorporación de la emisión irreversible desde factura borrador.
- Numeración fiscal anual protegida frente a emisiones simultáneas.
- Bloqueo de los datos económicos tras emitir y obligación de corregir mediante factura rectificativa.
- Separación explícita entre emisión, registro VeriFactu y cobro.
- Generación y archivo del PDF definitivo y del documento de intercambio Facturae.
- Cola automática e idempotente de altas VeriFactu, con credencial cifrada.
- Estados normalizados, reintentos automáticos y reintento manual sin renumeración.

### Versión 1.10 — 29 de agosto de 2026

- Separación entre condiciones generales y condiciones particulares del cliente.
- Nuevo campo de condiciones particulares en la pestaña Ventas de la entidad.
- Copia histórica de las condiciones particulares en presupuestos, pedidos, albaranes y facturas.
- Diferenciación respecto de la condición de cobro utilizada para calcular el vencimiento.

### Versión 1.9 — 28 de agosto de 2026

- Incorporación del módulo de Facturas de venta con apartados de creación, edición y vencimiento.
- Documentación de la facturación parcial por línea de albarán.
- Explicación de cantidades entregadas, facturadas, reservadas y pendientes.
- Incorporación del estado **Parcialmente facturado** y de la relación de un albarán con varias facturas.

### Versión 1.8 — 27 de agosto de 2026

- Documentación completa del Espacio de trabajo y Panel de control.
- Explicación de cabecera, perfil, manual, notificaciones y cierre de sesión.
- Descripción de tarjetas disponibles, módulos en preparación y visibilidad por permisos.
- Incorporación de navegación diaria y pie corporativo.

### Versión 1.7 — 27 de agosto de 2026

- Ampliación del procedimiento de inicio de sesión.
- Documentación completa de la recuperación de credenciales por correo.
- Incorporación de recomendaciones de seguridad y resolución de problemas de acceso.

### Versión 1.6 — 27 de agosto de 2026

- Incorporación del panel anual de resumen logístico de Albaranes.
- Nuevos indicadores de facturación, recepción, envío, puntualidad y retrasos.
- Gráficos de evolución mensual y distribución operativa.
- Rankings de clientes y entregas con mayor retraso.

### Versión 1.5 — 27 de agosto de 2026

- Incorporación del envío de albaranes confirmados por correo al contacto del cliente.
- Elección entre documento valorado y no valorado con plantilla corporativa.
- Incorporación de la columna ordenable **Enviado el** con fecha y hora del último envío.
- Registro de fecha y hora reales de entrega, persona receptora y firma manuscrita.
- Consulta y sustitución controlada de la firma vinculada al albarán.
- Incorporación de fotografías y justificantes documentales vinculados al albarán.

### Versión 1.4 — 27 de agosto de 2026

- Incorporación del filtro de pedidos por plazo previsto de entrega.
- Documentación del código de colores para entregas vencidas y próximas.
- Incorporación del recordatorio diario por correo a los responsables de los pedidos.
- Explicación de los requisitos y exclusiones del aviso automático.

### Versión 1.3 — 27 de agosto de 2026

- Ampliación del apartado de acceso con el procedimiento para iniciar sesión.
- Incorporación de una imagen de referencia de la pantalla de acceso.

### Versión 1.2 — 27 de agosto de 2026

- Incorporación del filtro operativo de pedidos pendientes de albarán o facturación.
- Documentación completa de los estados Borrador, Confirmado y Anulado del albarán.
- Explicación de la confirmación, trazabilidad, agrupación de pedidos e impresión histórica.
- Publicación del manual dentro del portal KiwiK ERP.

### Versión 1.1 — 27 de agosto de 2026

- Ampliación del apartado Artículos.
- Explicación de los tipos logísticos y comerciales.
- Documentación del flujo de venta heredado y personalizado.
- Incorporación de las políticas de facturación por pedido y por entrega.
- Ejemplos de productos físicos, servicios y pedidos mixtos.

### Versión 1.0 — 27 de agosto de 2026

- Creación inicial del manual.
- Incorporación de acceso, panel principal, entidades, artículos y configuración.
- Documentación del flujo de presupuestos.
- Documentación completa del ciclo de pedidos de venta.
- Explicación de estados, bloqueo y cancelación de pendientes.
- Documentación de generación y validación de albaranes.
- Incorporación del funcionamiento de facturas proforma.
