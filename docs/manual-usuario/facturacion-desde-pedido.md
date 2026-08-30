# Facturación desde pedido y cierre por línea

**Actualizado:** 30 de agosto de 2026 · Manual 2.1

[Volver al manual de usuario](README.md)

1. Abra las acciones de un pedido **confirmado y desbloqueado** y seleccione **Facturar desde pedido**.
2. Revise las líneas que se ofrecen. Se incluyen las que no requieren albarán o se facturan por cantidades pedidas. Las de cantidades entregadas se facturan desde sus albaranes.
3. Compruebe las cantidades **Comprometidas**, que incluyen borradores y facturas emitidas no anuladas. Introduzca la cantidad a facturar sin superar el disponible; cero excluye la línea de este nuevo borrador.
4. Cree el borrador y revise en Facturas sus pedidos de origen, líneas, condiciones y vencimiento.
5. Guarde los ajustes y emita únicamente cuando haya verificado el documento completo. Se vuelve a comprobar el disponible al crear, editar y emitir.

Guardar reserva cantidades; emitir incrementa las facturadas. **Descartar borrador**, desde las acciones de Facturas, libera las reservas y conserva el documento anulado. Esta acción no sirve para anular una factura emitida. Si se pierde la respuesta de creación, reutilice la operación de reintento que presenta el formulario.

### Ejemplo de pedido mixto

Un pedido contiene 10 unidades por cantidades entregadas y 2 horas de servicio sin albarán. Si confirma una entrega de 6 unidades, podrá facturar esas 6 desde el albarán y las 2 horas desde el pedido. Las 4 unidades restantes siguen pendientes de entrega. Si otra línea física se factura por cantidades pedidas, su factura puede emitirse desde el pedido, pero seguirá pendiente su entrega hasta confirmar el albarán.

El albarán de una línea ya facturable desde pedido controla la entrega y no vuelve a ofrecerla para facturar. Así se evita facturar dos veces la misma cantidad.

## Instalación y comprobación

- Desplegar/reiniciar el backend actualizado y servir el frontend compilado conjuntamente.
- Las tablas `sales_order_invoice_requests` y `sales_invoice_payments` ya existentes no se recrean. Los scripts V13/V14 incluyen las FK para instalaciones nuevas. V15 añade únicamente las relaciones que falten en instalaciones existentes; debe revisarse y ejecutarse en la base seleccionada. No elimina huérfanos: una referencia inválida hará fallar el ALTER.
- La implementación se ha comprobado con pruebas Java aisladas y una vista Vue de prueba, sin emitir documentos fiscales ni modificar la base de datos real. La aceptación final debe probarse con los tres tipos de línea en un entorno de pruebas.
