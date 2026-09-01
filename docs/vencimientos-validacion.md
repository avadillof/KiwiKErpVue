# Vencimientos: validación e instalación

Implementación: condiciones con porcentaje, importe fijo y saldo; calendario conservado al emitir; cobros y reversiones vinculados a plazos. Ventana de próximos: siete días, incluyendo hoy como situación separada.

## Validación aislada

- Frontend: `npx vue-tsc -b`, `npm run build`, `node tmp/invoice-ui-regression.mjs`.
- Backend: compilar fuentes y pruebas con el POM de comprobación y JDK compatible.
- Ejecutar las clases main `SalesInvoiceDueCheck`, `SalesInvoicePaymentsCheck`, `SalesInvoiceDraftEditingCheck` y `SalesInvoiceFiscalCheck` con el classpath de pruebas.
- Se comprueban importes, redondeos, días desde factura, finales de mes, días de pago, estados temporales, selección de plazos, asignaciones automáticas, claves de reintento, reversiones y conservación del calendario emitido.
- Los dobles de persistencia no demuestran comportamiento de SQL, transacciones reales ni concurrencia en MySQL. La prueba de emisión utiliza certificados, PDF y cola simulados; no emite ni envía a la AEAT.

## Instalación pendiente en la base de datos

1. Preparar copia de seguridad y detener el backend.
2. Confirmar que la migración V13 de cobros está aplicada.
3. Revisar y ejecutar una sola vez `BackUpBBDD/sql/V22_20260830_sales_invoice_dues.sql` del backend. MySQL puede confirmar DDL por pasos: ante un error, inspeccionar qué pasos se aplicaron antes de cualquier reintento.
4. Comprobar que todas las facturas anteriores tienen un único plazo LEGACY y que los cobros anteriores (también revertidos) mantienen sus asignaciones. El indicador histórico PAY no genera cobros inventados.
5. Iniciar el backend actualizado y después el frontend. Sin V22 faltan columnas requeridas; no arrancar la versión nueva sobre el esquema anterior.

## Prueba funcional pendiente en entorno de pruebas

- Crear una condición 50 % a 30 días y saldo a 60; probar el reparto desde Ajustes.
- Abrir un borrador, seleccionar esa condición y consultar Vencimientos antes de guardarlo. Confirmar calendario y total.
- Validar fin de mes, día fijo 31, redondeos y fecha manual única con motivo.
- Emitir exclusivamente en un entorno fiscal de pruebas autorizado y verificar el calendario del PDF definitivo.
- Registrar parcialmente el primer plazo, cubrir varios con un pago y asignar explícitamente a un plazo posterior.
- Repetir la misma operación para confirmar que no se duplica; repetir con asignaciones distintas y comprobar el rechazo.
- Revertir y comprobar los mismos plazos y los totales de factura. Probar dos sesiones concurrentes contra la misma factura: nunca deben sobrecobrar.
- Cambiar la condición maestra y comprobar que las facturas emitidas mantienen sus plazos. Borradores sí se recalculan.
- Revisar el próximo vencimiento del listado y el contador de vencidas, excluyendo anuladas, borradores y plazos pagados.
- Comprobar visualmente diálogos y desplazamiento con muchos plazos; no se ha sustituido esta prueba por el build.

No se han aplicado migraciones ni realizado operaciones reales de cobro, correo o VeriFactu durante la validación aislada.
