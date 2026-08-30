# Factura manual sin pedido ni albarán

**Actualizado:** 30 de agosto de 2026 · Manual 2.1

[Volver al manual de usuario](README.md)

1. Entre en **Ventas → Facturas → Nueva factura manual**. Utilice esta opción únicamente si la venta no debe facturarse desde un pedido o albarán existente.
2. Seleccione un cliente activo con tarifa de venta configurada. Revise los datos propuestos antes de añadir líneas.
3. Indique fecha, referencia opcional y **motivo obligatorio**. El motivo explica por qué se crea una factura sin documentos de origen.
4. Añada artículos o servicios existentes y revise cantidades, precios y descuentos. El precio propuesto del artículo no garantiza que se haya aplicado una tarifa negociada.
5. Compruebe impuestos, posición fiscal, retención si corresponde, condiciones y total.
6. Guarde: se abre un **borrador Manual** en el detalle habitual. Guardar no asigna el número fiscal definitivo ni envía a VeriFactu.
7. Revise el vencimiento propuesto por la condición de cobro. Si necesita ajustarlo manualmente, indique el motivo desde el borrador. Después continúe con la emisión habitual.

La factura manual no registra entregas ni altera cantidades de pedidos o albaranes. Si la venta ya tiene origen, vuelva a su documento para facturar desde él y conservar el seguimiento.

Si se pierde la respuesta al guardar, conserve el formulario y pulse **Reintentar misma operación**. Los campos quedan bloqueados para repetir exactamente la solicitud y recuperar la misma factura si ya se creó. No abra otra factura para resolver una respuesta incierta.

## Instalación

El backend incorpora la tabla `sales_manual_invoice_requests`, con clave foránea a `sales_invoices`, para guardar la clave de reintento y el motivo/usuario/fecha de creación. El script es `BackUpBBDD/sql/V16_20260830_manual_invoice_requests.sql` en el proyecto backend. Ejecutarlo antes de usar la opción si la instalación no genera la tabla automáticamente. No contiene modificaciones a pedidos o documentos existentes.

Las pruebas de desarrollo son aisladas y no emiten facturas reales. La comprobación final debe realizarse con frontend y backend actualizados y la tabla disponible, en un entorno de pruebas.
