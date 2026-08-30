# Factura manual sin pedido ni albarán

**Actualizado:** 30 de agosto de 2026 · Manual 2.1

[Volver al manual de usuario](README.md)

1. Entre en **Ventas → Facturas → Nueva factura manual**. Utilice esta opción únicamente si la venta no debe facturarse desde un pedido o albarán existente.
2. Seleccione un cliente activo con tarifa de venta configurada. Puede cambiar la **tarifa** y la **forma de pago** propuestas; se guardan en la factura sin modificar la ficha del cliente.
3. Indique fecha, referencia opcional y **motivo obligatorio**. El motivo explica por qué se crea una factura sin documentos de origen.
4. Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto del artículo no garantiza que se haya aplicado una tarifa negociada.
5. Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.
6. Guarde: se abre un **borrador Manual** en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.
7. Revise el vencimiento propuesto por la condición de cobro. Si necesita ajustarlo manualmente, indique el motivo desde el borrador. Después continúe con la emisión habitual.

El formulario tiene desplazamiento vertical y conserva los botones de guardar/cancelar al pie. Al pulsar **Añadir línea**, se desplaza hasta la nueva fila y enfoca la selección de artículo. El cierre está en el extremo derecho de la cabecera. Al seleccionar cliente se propone también su forma de pago; si no tiene ninguna o está inactiva, el formulario lo indica para que seleccione una válida. Las condiciones generales y particulares ocupan la mitad del ancho cada una (una debajo de otra en pantallas pequeñas), con seis filas y altura ampliable. Se ha retirado Observaciones del alta; el motivo obligatorio sigue formando parte del historial. Los importes usan punto para miles y coma decimal, por ejemplo **1.234,56**.

Al reabrir un **borrador**, puede ajustar fecha, condiciones, tarifa, forma de pago y datos económicos de las líneas. Las descripciones y motivos de los conceptos manuales también son editables. Pulse **Guardar borrador** para conservar los cambios. La forma de pago recalcula el vencimiento, salvo que haya fijado uno manual con su motivo. En un borrador existente, las tarifas disponibles conservan la moneda del documento: cambiar tarifa no convierte monedas ni recalcula los precios ya escritos; revíselos antes de guardar. Una factura emitida, pendiente de VeriFactu o cuya emisión aún no se ha podido confirmar permanece protegida.

La factura manual no registra entregas ni altera cantidades de pedidos o albaranes. Si la venta ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.

Si se pierde la respuesta al guardar, conserve el formulario y pulse **Reintentar misma operación**. Los campos quedan bloqueados para repetir exactamente la solicitud y recuperar la misma factura si ya se creó. No abra otra factura para resolver una respuesta incierta.

## Instalación

El backend incorpora la tabla `sales_manual_invoice_requests`, con clave foránea a `sales_invoices`, para guardar la clave de reintento y el motivo/usuario/fecha de creación. El script es `BackUpBBDD/sql/V16_20260830_manual_invoice_requests.sql` en el proyecto backend. Ejecutarlo antes de usar la opción si la instalación no genera la tabla automáticamente. No contiene modificaciones a pedidos o documentos existentes.

La selección de forma de pago se guarda en `sales_invoices.SALES_TERM_PK_ID`. Antes de arrancar el backend actualizado, aplique `BackUpBBDD/sql/V17_20260830_invoice_payment_term.sql` si Hibernate no actualiza el esquema. La columna es opcional para documentos anteriores, que conservan la condición del cliente como respaldo hasta guardar una selección propia.

Las pruebas de desarrollo son aisladas y no emiten facturas reales. La comprobación final debe realizarse con frontend y backend actualizados y la tabla disponible, en un entorno de pruebas.
