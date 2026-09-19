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