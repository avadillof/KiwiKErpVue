# Devoluciones de tickets con factura simplificada F2

En **Tickets cobrados → Devolver**, seleccionar devolución total o las cantidades
parciales, indicar motivo y elegir efectivo o tarjeta. Se necesita una caja abierta
y el permiso de devolución existente. El dinero se devuelve desde la caja actual,
aunque el ticket pertenezca a una apertura anterior.

Si el ticket no tiene factura ERP vinculada y tiene identidad fiscal F2:

1. Se registra la devolución y su importe positivo en el arqueo de caja.
2. Se emite una **R5 por diferencias**, con serie propia `RT-<prefijo>-<año>/0001`.
3. Se guardan las bases y cuotas negativas, conservando precios e impuestos del ticket.
4. Se incorpora a la cola VeriFactu. Si el F2 está pendiente, la R5 espera a su aceptación.
5. Se puede imprimir el justificante fiscal, con QR, motivo, referencia al F2 y total
   rectificado negativo. También se puede reimprimir desde la tarjeta del ticket.

El F2 conserva su numeración, importes y estado. No se crea una F3, no se borra el
ticket y no se registra un segundo movimiento de caja al reintentar el envío fiscal.
Los importes parciales se reparten sobre el acumulado: la última devolución completa
exactamente los céntimos y bases originales.

En la cola de Ventas aparecen las R5 pendientes o con incidencias, con reintento
técnico y preparación de subsanación sujetos al permiso VeriFactu. En el panel de
encadenamiento se muestra **Rectifica a**, separado del registro anterior de la cadena.
Una devolución en espera de envío todavía no está confirmada por la AEAT.

## Alcance

- Cuando existe una F3 vinculada al ticket, una nueva devolución también conserva
  la R5 y prepara su F3 negativa. El flujo anterior de borrador de rectificativa se
  mantiene para tickets históricos con factura F1 directa.
- Las devoluciones antiguas no se fiscalizan retroactivamente de forma automática.
- Si después de una R5 se solicita factura completa, se prepara una F3 del F2 y una
  F3 negativa por cada R5, con el mismo destinatario. En el diálogo se muestran las
  facturas y su importe conjunto. Se emiten con numeraciones independientes y no
  generan movimientos de caja. Se espera a que la R5 esté aceptada antes de emitir
  su canje. Los reintentos reutilizan los documentos ya preparados o emitidos.
- La descarga y el correo del TPV entregan el PDF conjunto únicamente cuando todas
  las F3 están aceptadas. El PDF conjunto es una copia para impresión: cada original
  fiscal conserva su propio archivo. Una devolución total produce un conjunto de
  importe cero (F3 positiva y F3 negativa), sin crear una factura de importe cero.
- Los tickets con varias líneas del mismo producto requieren revisión del desglose
  antes de devolver; no se mezclan precios o impuestos distintos por identificador de producto.

## Despliegue y comprobación

Aplicar las migraciones **V2026202840__tpv_refund_r5.sql** y
**V2026202841__tpv_refund_invoice_substitution.sql** con el backend actualizado
y publicar el frontend. No se modifican migraciones anteriores.

Antes de usarlo en producción, comprobar en el entorno de pruebas una devolución parcial
y una total; caja, numeración única entre terminales, original F2 conservado, aceptación
AEAT y siguiente registro encadenado a la R5. Probar también el justificante en la impresora
real y la recuperación de una petición cuya respuesta se pierda. Las pruebas locales
usan dobles de servicios: no equivalen a persistencia real ni a una presentación a AEAT.

Referencia fiscal: [AEAT — Procedimientos de facturación](https://sede.agenciatributaria.gob.es/Sede/iva/sistemas-informaticos-facturacion-verifactu/preguntas-frecuentes/procedimientos-facturacion.html).

## Consulta desde Ventas

Los tickets F2, devoluciones R5 y sus facturas de canje pueden incluirse en los expedientes de **Requerimientos y documentación AEAT**. La selección permite añadir sus documentos relacionados, también fuera del periodo, y copia los archivos existentes sin regenerarlos. Consulta el [flujo de expedientes AEAT](aeat-expedientes.md).

Las R5 del TPV aparecen en Facturas rectificativas con la etiqueta R5 · TPV, el ticket rectificado y el importe negativo. Participan en la búsqueda, filtros, paginación y resumen. Figuran como Devuelta en TPV: el abono ya se registró en caja. Su ficha permite consultar líneas, motivo e historial VeriFactu e imprimir el PDF con QR cuando están aceptadas. Esta consulta utiliza la R5 existente y no crea otro documento ni otro movimiento de caja. Las acciones de edición y pago del ERP no se ofrecen para estas filas.
