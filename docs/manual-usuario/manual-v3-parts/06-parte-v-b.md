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